import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

function cleanEmail(email: string) {
  return email
    .replace(/^mailto:/i, "")
    .replace(/[.,;:)>\]"']+$/g, "")
    .trim()
    .toLowerCase();
}

function findEmails(html: string) {
  const matches = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  const blocked = [
    "example.com",
    "domain.com",
    "email.com",
    "yourdomain.com",
    "sentry.io",
    "wixpress.com",
    "schema.org",
  ];
  const assetExtensions = /\.(png|jpe?g|gif|webp|svg|ico|css|js|pdf)$/i;

  return [...new Set(matches.map(cleanEmail))]
    .filter((email) => !blocked.some((domain) => email.endsWith(`@${domain}`) || email.includes(domain)))
    .filter((email) => !assetExtensions.test(email));
}

async function fetchText(url: URL) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "BizAutomatrix prospect email finder (+https://bizautomatrix.com)",
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return "";
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return "";
  return res.text();
}

async function findEmailForWebsite(website: string) {
  const base = normalizeUrl(website);
  if (!base) return null;

  const paths = ["/", "/contact", "/contact-us", "/about", "/about-us"];

  for (const path of paths) {
    try {
      const url = new URL(path, base.origin);
      const html = await fetchText(url);
      const [email] = findEmails(html);
      if (email) return email;
    } catch {
      // Some sites block bots or time out. Keep going through the next path.
    }
  }

  return null;
}

async function runBuiltInEmailFinder() {
  const prospects = await prisma.prospect.findMany({
    where: {
      email: null,
      website: { not: null },
      status: { in: ["PENDING", "APPROVED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  let checked = 0;
  let updated = 0;

  for (const prospect of prospects) {
    if (!prospect.website) continue;
    checked++;
    const email = await findEmailForWebsite(prospect.website);
    if (!email) continue;

    await prisma.prospect.update({
      where: { id: prospect.id },
      data: {
        email,
        notes: [
          prospect.notes,
          `Auto-found email from website: ${email}`,
        ].filter(Boolean).join("\n"),
      },
    });
    updated++;
  }

  return { checked, updated, remaining: Math.max(prospects.length - checked, 0) };
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const webhookUrl = process.env.N8N_FIND_EMAILS_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        return NextResponse.json({
          success: true,
          mode: "n8n",
          message: "Email finder workflow triggered.",
        });
      }
    } catch {
      // Fall back to the built-in finder below.
    }
  }

  const result = await runBuiltInEmailFinder();

  return NextResponse.json({
    success: true,
    mode: "built-in",
    ...result,
    message:
      result.updated > 0
        ? `Built-in finder checked ${result.checked} prospect website(s) and saved ${result.updated} email(s).`
        : `Built-in finder checked ${result.checked} prospect website(s), but did not find public emails. Try adding more websites or importing a CSV with emails.`,
  });
}
