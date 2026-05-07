import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: ReturnType<typeof getServerSession> extends Promise<infer T> ? T : never) {
  return (session as { user?: { role?: string } } | null)?.user?.role === "ADMIN";
}

async function fetchPageSpeed(url: string, strategy: "mobile" | "desktop") {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}`;
  const res = await fetch(apiUrl, { next: { revalidate: 0 } });
  if (!res.ok) return null;
  const data = await res.json();
  const cats = data?.lighthouseResult?.categories;
  const audits = data?.lighthouseResult?.audits;
  return {
    score: Math.round((cats?.performance?.score ?? 0) * 100),
    fcp: audits?.["first-contentful-paint"]?.numericValue ? audits["first-contentful-paint"].numericValue / 1000 : null,
    lcp: audits?.["largest-contentful-paint"]?.numericValue ? audits["largest-contentful-paint"].numericValue / 1000 : null,
    cls: audits?.["cumulative-layout-shift"]?.numericValue ?? null,
    tbt: audits?.["total-blocking-time"]?.numericValue ?? null,
  };
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

  const [mobile, desktop] = await Promise.all([
    fetchPageSpeed(url, "mobile"),
    fetchPageSpeed(url, "desktop"),
  ]);

  if (!mobile && !desktop) return NextResponse.json({ error: "PageSpeed API failed" }, { status: 502 });

  const result = await prisma.pageSpeedResult.create({
    data: {
      clientId, url,
      mobileScore: mobile?.score ?? null,
      desktopScore: desktop?.score ?? null,
      fcp: mobile?.fcp ?? null,
      lcp: mobile?.lcp ?? null,
      cls: mobile?.cls ?? null,
      tbt: mobile?.tbt ?? null,
    },
  });

  return NextResponse.json({ result });
}
