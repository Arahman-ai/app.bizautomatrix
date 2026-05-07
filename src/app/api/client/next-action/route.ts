import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Action = {
  priority: number;
  icon: string;
  title: string;
  why: string;
  cta: string;
  href: string;
  color: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    include: { client: true },
  });
  if (!user?.client) return NextResponse.json({ actions: [] });

  const clientId = user.client.id;

  const [gbpAudit, reviewRequests, citations, seoTasks, rankEntries] = await Promise.all([
    prisma.gbpAudit.findUnique({ where: { clientId } }),
    prisma.reviewRequest.findMany({ where: { clientId } }),
    prisma.citation.findMany({ where: { clientId } }),
    prisma.seoTask.findMany({ where: { clientId } }),
    prisma.rankEntry.findMany({ where: { clientId } }),
  ]);

  const actions: Action[] = [];

  // Rule 1: GBP not claimed
  if (!gbpAudit || !gbpAudit.hasClaimed) {
    actions.push({ priority: 1, icon: "📍", title: "Claim Your Google Business Profile", why: "This is the single biggest factor for appearing on Google Maps. Every day without it = lost customers.", cta: "View GBP Audit", href: "/dashboard/gbp-audit", color: "red" });
  }

  // Rule 2: Low reviews
  const clickedReviews = reviewRequests.filter(r => r.status === "CLICKED").length;
  if (clickedReviews < 10) {
    actions.push({ priority: 2, icon: "⭐", title: "Get More Google Reviews", why: `You currently have ${clickedReviews} review clicks. Competitors with 20+ reviews outrank you every time.`, cta: "Send Review Requests", href: "/dashboard/reviews", color: "yellow" });
  }

  // Rule 3: GBP score low
  if (gbpAudit && (gbpAudit.score ?? 0) < 60) {
    actions.push({ priority: 3, icon: "🔧", title: "Complete Your GBP Profile", why: `Your GBP score is ${gbpAudit.score ?? 0}%. Missing items are hiding you from local searches.`, cta: "See What's Missing", href: "/dashboard/gbp-audit", color: "orange" });
  }

  // Rule 4: No citations
  const listedCitations = citations.filter(c => c.listed).length;
  if (listedCitations < 10) {
    actions.push({ priority: 4, icon: "📋", title: "Build Your Directory Listings", why: `You're listed on ${listedCitations} directories. Google needs 20+ consistent citations to trust your business location.`, cta: "View Citations", href: "/dashboard/citations", color: "blue" });
  }

  // Rule 5: Pending SEO tasks
  const pendingHighPriority = seoTasks.filter(t => !t.completed && t.priority === "HIGH").length;
  if (pendingHighPriority > 0) {
    actions.push({ priority: 5, icon: "✅", title: `${pendingHighPriority} High-Priority SEO Tasks Pending`, why: "Your action plan has unfinished high-priority tasks that directly impact your search ranking.", cta: "View Action Plan", href: "/dashboard/seo-tasks", color: "purple" });
  }

  // Rule 6: No rank tracking
  if (rankEntries.length === 0) {
    actions.push({ priority: 6, icon: "📈", title: "Start Tracking Your Rankings", why: "You can't improve what you don't measure. Ask your BizAutomatrix team to set up keyword tracking for your business.", cta: "View Rank Tracker", href: "/dashboard/rank-tracker", color: "gray" });
  }

  // Sort by priority, return top 3
  const top = actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  return NextResponse.json({ actions: top });
}
