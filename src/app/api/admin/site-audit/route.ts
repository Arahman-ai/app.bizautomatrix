import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

type Session = Awaited<ReturnType<typeof getServerSession>>;
type CrawledPage = {
  url: string;
  statusCode: number | null;
  html: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  h1Count: number;
  h2Count: number;
  canonicalUrl: string | null;
  internalLinks: string[];
  externalLinks: string[];
  images: number;
  imagesMissingAlt: number;
};

type AuditIssue = {
  pageUrl: string;
  issueType: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  recommendation: string;
};

function isAdmin(session: Session) {
  return (session as { user?: { role?: string } } | null)?.user?.role === "ADMIN";
}

function normalizeStartUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  parsed.hash = "";
  return parsed.toString();
}

function normalizeInternalUrl(rawUrl: string, baseUrl: URL) {
  try {
    const url = new URL(rawUrl, baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.hostname.replace(/^www\./, "") !== baseUrl.hostname.replace(/^www\./, "")) return null;
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "/");
  } catch {
    return null;
  }
}

function shouldSkipUrl(url: string) {
  const lower = url.toLowerCase();
  const blocked = ["/admin", "/login", "/logout", "/cart", "/checkout", "/account", "/wp-admin"];
  const fileLike = /\.(pdf|zip|jpg|jpeg|png|gif|webp|svg|mp4|mp3|css|js|ico|xml)$/i;
  return blocked.some(part => lower.includes(part)) || fileLike.test(lower);
}

function stripTags(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function firstMatch(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  return match?.[1] ? decodeEntities(stripTags(match[1])) : null;
}

function attrValue(tag: string, name: string) {
  const pattern = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i");
  return tag.match(pattern)?.[1]?.trim() ?? "";
}

function parsePage(url: string, statusCode: number | null, html: string, rootUrl: URL): CrawledPage {
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaTag = html.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0]
    ?? html.match(/<meta[^>]+property=["']og:description["'][^>]*>/i)?.[0];
  const metaDescription = metaTag ? decodeEntities(attrValue(metaTag, "content")) || null : null;
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h2Matches = [...html.matchAll(/<h2[^>]*>/gi)];
  const canonicalTag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0];
  const canonicalHref = canonicalTag ? attrValue(canonicalTag, "href") : "";
  const canonicalUrl = canonicalHref ? new URL(canonicalHref, url).toString() : null;
  const linkTags = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)];
  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();

  for (const link of linkTags) {
    const href = link[1];
    const normalized = normalizeInternalUrl(href, rootUrl);
    if (normalized) internalLinks.add(normalized);
    else {
      try {
        const external = new URL(href, url);
        if (external.protocol === "http:" || external.protocol === "https:") externalLinks.add(external.toString());
      } catch {}
    }
  }

  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
  const imagesMissingAlt = imageTags.filter(tag => !attrValue(tag, "alt")).length;

  return {
    url,
    statusCode,
    html,
    title,
    metaDescription,
    h1: h1Matches[0]?.[1] ? decodeEntities(stripTags(h1Matches[0][1])) : null,
    h1Count: h1Matches.length,
    h2Count: h2Matches.length,
    canonicalUrl,
    internalLinks: [...internalLinks],
    externalLinks: [...externalLinks],
    images: imageTags.length,
    imagesMissingAlt,
  };
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": "BizAutomatrix SEO Audit Bot/1.0",
        accept: "text/html,application/xhtml+xml",
      },
    });
    const contentType = res.headers.get("content-type") ?? "";
    const text = contentType.includes("text/html") || contentType.includes("text/plain") ? await res.text() : "";
    return { statusCode: res.status, text };
  } catch {
    return { statusCode: null, text: "" };
  } finally {
    clearTimeout(timeout);
  }
}

function auditPage(page: CrawledPage): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const titleLength = page.title?.length ?? 0;
  const descLength = page.metaDescription?.length ?? 0;

  if (!page.statusCode || page.statusCode >= 400) {
    issues.push({
      pageUrl: page.url,
      issueType: "Non-200 status",
      priority: "HIGH",
      recommendation: "Fix the page response so important URLs return a clean 200 status.",
    });
  }

  if (!page.title) {
    issues.push({ pageUrl: page.url, issueType: "Missing title tag", priority: "HIGH", recommendation: "Add a unique 50-60 character title tag with the main keyword." });
  } else if (titleLength < 30 || titleLength > 65) {
    issues.push({ pageUrl: page.url, issueType: "Title length issue", priority: "MEDIUM", recommendation: "Rewrite the title tag to stay close to 50-60 characters." });
  }

  if (!page.metaDescription) {
    issues.push({ pageUrl: page.url, issueType: "Missing meta description", priority: "HIGH", recommendation: "Add a unique 150-160 character meta description with a clear reason to click." });
  } else if (descLength < 70 || descLength > 170) {
    issues.push({ pageUrl: page.url, issueType: "Meta description length issue", priority: "MEDIUM", recommendation: "Rewrite the meta description to stay close to 150-160 characters." });
  }

  if (page.h1Count === 0) {
    issues.push({ pageUrl: page.url, issueType: "Missing H1", priority: "HIGH", recommendation: "Add one clear H1 that describes the page topic or service." });
  } else if (page.h1Count > 1) {
    issues.push({ pageUrl: page.url, issueType: "Multiple H1 tags", priority: "MEDIUM", recommendation: "Keep one primary H1 and convert secondary headings to H2/H3." });
  }

  if (!page.canonicalUrl) {
    issues.push({ pageUrl: page.url, issueType: "Missing canonical tag", priority: "LOW", recommendation: "Add a self-referencing canonical tag to reduce duplicate URL confusion." });
  }

  if (page.imagesMissingAlt > 0) {
    issues.push({
      pageUrl: page.url,
      issueType: "Images missing alt text",
      priority: "MEDIUM",
      recommendation: `Add descriptive alt text to ${page.imagesMissingAlt} image${page.imagesMissingAlt === 1 ? "" : "s"}.`,
    });
  }

  return issues;
}

function auditDuplicates(pages: CrawledPage[]) {
  const issues: AuditIssue[] = [];
  const byTitle = new Map<string, CrawledPage[]>();
  const byDescription = new Map<string, CrawledPage[]>();

  for (const page of pages) {
    if (page.title) byTitle.set(page.title, [...(byTitle.get(page.title) ?? []), page]);
    if (page.metaDescription) byDescription.set(page.metaDescription, [...(byDescription.get(page.metaDescription) ?? []), page]);
  }

  for (const duplicates of byTitle.values()) {
    if (duplicates.length > 1) {
      for (const page of duplicates) {
        issues.push({ pageUrl: page.url, issueType: "Duplicate title tag", priority: "MEDIUM", recommendation: "Write a unique title tag for this page so it targets a distinct search intent." });
      }
    }
  }

  for (const duplicates of byDescription.values()) {
    if (duplicates.length > 1) {
      for (const page of duplicates) {
        issues.push({ pageUrl: page.url, issueType: "Duplicate meta description", priority: "LOW", recommendation: "Write a unique meta description for this page to improve search snippet quality." });
      }
    }
  }

  return issues;
}

async function crawlSite(startUrl: string, maxPages: number) {
  const rootUrl = new URL(startUrl);
  const queue = [startUrl];
  const visited = new Set<string>();
  const pages: CrawledPage[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const nextUrl = queue.shift();
    if (!nextUrl || visited.has(nextUrl) || shouldSkipUrl(nextUrl)) continue;
    visited.add(nextUrl);

    const response = await fetchText(nextUrl);
    const page = parsePage(nextUrl, response.statusCode, response.text, rootUrl);
    pages.push(page);

    for (const link of page.internalLinks) {
      if (!visited.has(link) && queue.length + pages.length < maxPages && !shouldSkipUrl(link)) queue.push(link);
    }
  }

  return pages;
}

async function checkSiteFiles(rootUrl: URL): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  const robotsUrl = new URL("/robots.txt", rootUrl).toString();
  const sitemapUrl = new URL("/sitemap.xml", rootUrl).toString();
  const [robots, sitemap] = await Promise.all([fetchText(robotsUrl), fetchText(sitemapUrl)]);

  if (!robots.statusCode || robots.statusCode >= 400) {
    issues.push({ pageUrl: rootUrl.toString(), issueType: "Missing robots.txt", priority: "LOW", recommendation: "Add a robots.txt file and include the XML sitemap location." });
  }

  if (!sitemap.statusCode || sitemap.statusCode >= 400) {
    issues.push({ pageUrl: rootUrl.toString(), issueType: "Missing sitemap.xml", priority: "HIGH", recommendation: "Create and submit an XML sitemap with canonical, indexable URLs." });
  }

  return issues;
}

function scoreAudit(pagesCount: number, issues: AuditIssue[]) {
  if (pagesCount === 0) return 0;
  const penalty = issues.reduce((total, issue) => {
    if (issue.priority === "HIGH") return total + 8;
    if (issue.priority === "MEDIUM") return total + 4;
    return total + 2;
  }, 0);
  return Math.max(0, Math.min(100, 100 - Math.round(penalty / Math.max(1, pagesCount / 4))));
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const run = await prisma.siteAuditRun.findFirst({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: {
      pages: { orderBy: { createdAt: "asc" } },
      issues: { orderBy: [{ priority: "asc" }, { createdAt: "asc" }] },
    },
  });

  return NextResponse.json({ run });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clientId, url, maxPages: requestedMaxPages } = await req.json();
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { website: true },
  });
  let startUrl: string;
  try {
    startUrl = normalizeStartUrl(url || client?.website || "");
  } catch {
    return NextResponse.json({ error: "Valid website URL required" }, { status: 400 });
  }
  const maxPages = Math.max(5, Math.min(Number(requestedMaxPages) || 40, 75));
  const rootUrl = new URL(startUrl);

  const pages = await crawlSite(startUrl, maxPages);
  const issues = [
    ...(await checkSiteFiles(rootUrl)),
    ...pages.flatMap(auditPage),
    ...auditDuplicates(pages),
  ];
  const seoScore = scoreAudit(pages.length, issues);

  const run = await prisma.siteAuditRun.create({
    data: {
      clientId,
      startUrl,
      pagesCrawled: pages.length,
      issuesFound: issues.length,
      seoScore,
      summary: `Crawled ${pages.length} page${pages.length === 1 ? "" : "s"} and found ${issues.length} SEO issue${issues.length === 1 ? "" : "s"}.`,
    },
  });

  const createdPages = await Promise.all(
    pages.map(page => prisma.siteAuditPage.create({
      data: {
        auditRunId: run.id,
        clientId,
        url: page.url,
        statusCode: page.statusCode,
        title: page.title,
        metaDescription: page.metaDescription,
        h1: page.h1,
        h1Count: page.h1Count,
        h2Count: page.h2Count,
        canonicalUrl: page.canonicalUrl,
        internalLinks: page.internalLinks.length,
        externalLinks: page.externalLinks.length,
        images: page.images,
        imagesMissingAlt: page.imagesMissingAlt,
      },
    }))
  );

  const pageIdsByUrl = new Map(createdPages.map(page => [page.url, page.id]));
  const createdIssues = await Promise.all(
    issues.map(issue => prisma.siteAuditIssue.create({
      data: {
        auditRunId: run.id,
        clientId,
        pageId: pageIdsByUrl.get(issue.pageUrl),
        pageUrl: issue.pageUrl,
        issueType: issue.issueType,
        priority: issue.priority,
        recommendation: issue.recommendation,
      },
    }))
  );

  const taskCandidates = createdIssues.map(issue => ({
    clientId,
    task: `${issue.issueType}: ${issue.pageUrl}`,
    category: "SEO Audit",
    priority: issue.priority,
    pageUrl: issue.pageUrl,
    issueType: issue.issueType,
    recommendation: issue.recommendation,
  }));
  const existingTasks = taskCandidates.length
    ? await prisma.seoTask.findMany({
      where: {
        clientId,
        completed: false,
        task: { in: taskCandidates.map(task => task.task) },
      },
      select: { task: true },
    })
    : [];
  const existingTaskNames = new Set(existingTasks.map(task => task.task));
  const tasksToCreate = taskCandidates.filter(task => !existingTaskNames.has(task.task));

  if (tasksToCreate.length > 0) {
    await prisma.seoTask.createMany({ data: tasksToCreate });
  }

  await prisma.siteAuditIssue.updateMany({
    where: { id: { in: createdIssues.map(issue => issue.id) } },
    data: { taskCreated: true },
  });

  const updatedRun = await prisma.siteAuditRun.update({
    where: { id: run.id },
    data: { tasksCreated: tasksToCreate.length },
    include: {
      pages: { orderBy: { createdAt: "asc" } },
      issues: { orderBy: [{ priority: "asc" }, { createdAt: "asc" }] },
    },
  });

  return NextResponse.json({ run: updatedRun });
}
