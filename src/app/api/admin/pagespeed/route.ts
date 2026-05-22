import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 120;

type Session = Awaited<ReturnType<typeof getServerSession>>;
type PerformanceResult = {
  score: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  tbt: number | null;
  source: "local-lighthouse" | "google-pagespeed";
};

const execFileAsync = promisify(execFile);

function isAdmin(session: Session) {
  return (session as { user?: { role?: string } } | null)?.user?.role === "ADMIN";
}

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol).toString();
}

function parseLighthouseResult(data: {
  lighthouseResult?: {
    categories?: { performance?: { score?: number | null } };
    audits?: Record<string, { numericValue?: number | null }>;
  };
}): Omit<PerformanceResult, "source"> {
  const cats = data?.lighthouseResult?.categories;
  const audits = data?.lighthouseResult?.audits;
  return {
    score: cats?.performance?.score != null ? Math.round(cats.performance.score * 100) : null,
    fcp: audits?.["first-contentful-paint"]?.numericValue ? audits["first-contentful-paint"].numericValue / 1000 : null,
    lcp: audits?.["largest-contentful-paint"]?.numericValue ? audits["largest-contentful-paint"].numericValue / 1000 : null,
    cls: audits?.["cumulative-layout-shift"]?.numericValue ?? null,
    tbt: audits?.["total-blocking-time"]?.numericValue ?? null,
  };
}

function parseLocalLighthouseStdout(stdout: string): PerformanceResult | null {
  try {
    const parsed = JSON.parse(stdout);
    return { ...parseLighthouseResult({ lighthouseResult: parsed }), source: "local-lighthouse" };
  } catch {
    return null;
  }
}

async function runLocalLighthouse(url: string, strategy: "mobile" | "desktop"): Promise<PerformanceResult | null> {
  if (process.env.VERCEL || process.env.DISABLE_LOCAL_LIGHTHOUSE === "true") {
    return null;
  }

  try {
    const lighthouseCli = path.join(
      process.cwd(),
      "node_modules",
      "lighthouse",
      "cli",
      "index.js"
    );
    const args = [
      lighthouseCli,
      url,
      "--output=json",
      "--quiet",
      "--only-categories=performance",
      "--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage",
    ];

    if (strategy === "desktop") args.push("--preset=desktop");

    const { stdout } = await execFileAsync(process.execPath, args, {
      timeout: 90000,
      maxBuffer: 20 * 1024 * 1024,
      windowsHide: true,
    });
    return parseLocalLighthouseStdout(stdout);
  } catch (error) {
    const stdout = (error as { stdout?: string }).stdout;
    if (stdout) return parseLocalLighthouseStdout(stdout);
    return null;
  }
}

async function fetchGooglePageSpeed(url: string, strategy: "mobile" | "desktop"): Promise<PerformanceResult | null> {
  const key = process.env.PAGESPEED_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY;
  const apiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  apiUrl.searchParams.set("url", url);
  apiUrl.searchParams.set("strategy", strategy);
  if (key) apiUrl.searchParams.set("key", key);

  const res = await fetch(apiUrl, { next: { revalidate: 0 } });
  if (!res.ok) return null;
  const data = await res.json();
  return { ...parseLighthouseResult(data), source: "google-pagespeed" };
}

async function runPerformanceTest(url: string, strategy: "mobile" | "desktop") {
  const local = await runLocalLighthouse(url, strategy);
  if (local) return local;
  return fetchGooglePageSpeed(url, strategy);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const results = await prisma.pageSpeedResult.findMany({
    where: { clientId },
    orderBy: { recordedAt: "desc" },
    take: 10,
  });
  return NextResponse.json({ results });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clientId, url } = await req.json();
  if (!clientId || !url) return NextResponse.json({ error: "clientId and url required" }, { status: 400 });

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrl(url);
  } catch {
    return NextResponse.json({ error: "Valid URL required" }, { status: 400 });
  }

  const [mobile, desktop] = await Promise.all([
    runPerformanceTest(normalizedUrl, "mobile"),
    runPerformanceTest(normalizedUrl, "desktop"),
  ]);

  if (!mobile && !desktop) {
    return NextResponse.json({
      error: "Performance test failed. Local Lighthouse could not launch Chrome, and Google PageSpeed quota/API was unavailable.",
    }, { status: 502 });
  }

  const result = await prisma.pageSpeedResult.create({
    data: {
      clientId,
      url: normalizedUrl,
      mobileScore: mobile?.score ?? null,
      desktopScore: desktop?.score ?? null,
      fcp: mobile?.fcp ?? null,
      lcp: mobile?.lcp ?? null,
      cls: mobile?.cls ?? null,
      tbt: mobile?.tbt ?? null,
    },
  });

  return NextResponse.json({
    result,
    source: {
      mobile: mobile?.source ?? null,
      desktop: desktop?.source ?? null,
    },
  });
}
