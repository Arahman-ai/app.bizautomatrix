import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MarketingChannel, MarketingDraftStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

function cleanEmail(value: string | null) {
  const email = value?.trim() ?? "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function prospectSignal(prospect: {
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  category: string | null;
}) {
  if (!prospect.website) return "I could not find a clear website connected to the listing";
  if ((prospect.reviewCount ?? 0) < 25) return "the Google review count looks like it has room to grow";
  if ((prospect.rating ?? 5) < 4.4) return "the online reputation could probably use a stronger review flow";
  if (prospect.category) return `your ${prospect.category.toLowerCase()} listing has a useful starting point, but the follow-up path may still be manual`;
  return "there may be room to improve website conversion and follow-up";
}

function outreachDraft(prospect: {
  businessName: string;
  city: string | null;
  category: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
}) {
  const cityLine = prospect.city ? ` in ${prospect.city}` : "";
  const categoryLine = prospect.category ? ` for ${prospect.category.toLowerCase()} businesses` : "";
  const signal = prospectSignal(prospect);
  const subject = prospect.category?.toLowerCase().includes("manufact")
    ? "manufacturing workflow"
    : prospect.category?.toLowerCase().includes("rail")
      ? "railway workflow"
      : "website follow-up";

  const body = `Hi,

I was reviewing ${prospect.businessName}${cityLine} and noticed ${signal}.

For businesses${categoryLine}, small gaps in the website, quote process, email follow-up, reviews, or daily reporting can quietly cost real opportunities.

BizAutomatrix helps with practical upgrades: website and product/service pages, SEO, review collection, email automation, custom AI agents, reporting dashboards, maintenance and asset workflows, and manufacturing or railway support where needed.

Would it be useful if I reviewed your website/workflow and sent 3 practical improvement ideas?

Arifur
BizAutomatrix
https://bizautomatrix.com

If this is not relevant, no problem - reply "no" and I will not follow up.`;

  return { subject, body };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const rawIds = (body as { ids?: unknown }).ids;
  const ids = Array.isArray(rawIds)
    ? rawIds.filter((id: unknown): id is string => typeof id === "string" && id.trim().length > 0)
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "Select at least one prospect." }, { status: 400 });
  }

  await prisma.outreachEmailLog.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  const prospects = await prisma.prospect.findMany({
    where: { id: { in: ids } },
    orderBy: { createdAt: "desc" },
  });

  const existingDrafts = await prisma.marketingAgentDraft.findMany({
    where: {
      prospectId: { in: ids },
      channel: MarketingChannel.EMAIL,
      status: {
        in: [
          MarketingDraftStatus.DRAFT,
          MarketingDraftStatus.REVIEWED,
          MarketingDraftStatus.APPROVED,
        ],
      },
    },
    select: { prospectId: true },
  });
  const existingProspectIds = new Set(existingDrafts.map((draft) => draft.prospectId).filter(Boolean));

  const draftInputs = prospects.flatMap((prospect) => {
    const recipientEmail = cleanEmail(prospect.email);
    if (!recipientEmail || existingProspectIds.has(prospect.id)) return [];

    const draft = outreachDraft(prospect);
    return [{
      prospectId: prospect.id,
      recipientEmail,
      title: draft.subject,
      channel: MarketingChannel.EMAIL,
      audience: `${prospect.category ?? "Business"} prospects${prospect.city ? ` in ${prospect.city}` : ""}`,
      goal: "Get one paid BizAutomatrix client through reviewed, personalized cold outreach.",
      cadence: "one-time",
      content: draft.body,
      status: MarketingDraftStatus.DRAFT,
    }];
  });

  if (draftInputs.length > 0) {
    await prisma.marketingAgentDraft.createMany({ data: draftInputs });
  }

  return NextResponse.json({
    success: true,
    created: draftInputs.length,
    skipped: prospects.length - draftInputs.length,
    message: draftInputs.length > 0
      ? `Created ${draftInputs.length} personalized outreach draft(s). Review them in Marketing Agent before sending.`
      : "No new drafts created. Selected prospects may need emails or already have unsent drafts.",
  });
}
