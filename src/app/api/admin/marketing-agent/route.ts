import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MarketingChannel } from "@prisma/client";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

type DraftInput = {
  title: string;
  channel: MarketingChannel;
  content: string;
};

const CHANNEL_LABELS: Record<MarketingChannel, string> = {
  EMAIL: "Email",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  LINKEDIN: "LinkedIn",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
};

const DEFAULT_CHANNELS: MarketingChannel[] = [
  MarketingChannel.EMAIL,
  MarketingChannel.WHATSAPP,
  MarketingChannel.LINKEDIN,
  MarketingChannel.FACEBOOK,
  MarketingChannel.INSTAGRAM,
];

function toChannels(value: unknown): MarketingChannel[] {
  if (!Array.isArray(value)) return DEFAULT_CHANNELS;
  const valid = value.filter((item): item is MarketingChannel =>
    typeof item === "string" && item in MarketingChannel
  );
  return valid.length > 0 ? valid : DEFAULT_CHANNELS;
}

function clean(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function serviceSummary(topic: string) {
  return topic || [
    "website upgrades",
    "SEO and Google Maps visibility",
    "review and email automation",
    "custom AI agents",
    "day-to-day reporting workflows",
    "maintenance and asset management",
    "manufacturing and railway automation support",
  ].join(", ");
}

function fallbackDrafts({
  channels,
  goal,
  audience,
  cadence,
  tone,
  topic,
}: {
  channels: MarketingChannel[];
  goal: string;
  audience: string;
  cadence: string;
  tone: string;
  topic: string;
}): DraftInput[] {
  const services = serviceSummary(topic);
  const baseCta = "Reply to this message or book a free audit at https://bizautomatrix.com.";

  const drafts: Record<MarketingChannel, DraftInput> = {
    EMAIL: {
      channel: MarketingChannel.EMAIL,
      title: "Free automation audit for your business",
      content: `Hi,

I am reaching out from BizAutomatrix. We help businesses turn manual follow-up, website inquiries, reporting, reviews, and operational workflows into simple automation systems.

For companies in engineering, manufacturing, railway supply, industrial services, and local service businesses, we can review opportunities around ${services}.

The first step is free: we review your current website, lead flow, follow-up process, and automation gaps. Then we suggest one practical 7-day implementation scope before you spend anything.

Would you like me to review your website and send 3 practical automation opportunities?

${baseCta}`,
    },
    SMS: {
      channel: MarketingChannel.SMS,
      title: "Short SMS follow-up",
      content: `Hi, this is BizAutomatrix. We help businesses improve websites, SEO, reviews, email follow-up, reporting, and AI workflows. Want a free quick audit? ${baseCta}`,
    },
    WHATSAPP: {
      channel: MarketingChannel.WHATSAPP,
      title: "WhatsApp follow-up",
      content: `Hi, this is Arifur from BizAutomatrix. We help businesses upgrade websites and automate regular work like email follow-up, reports, reviews, maintenance/asset workflows, and AI assistant tasks.

We are offering a free audit first, then a small 7-day paid implementation only if the opportunity is clear. Would you like me to review your website or workflow and send a short improvement plan?`,
    },
    LINKEDIN: {
      channel: MarketingChannel.LINKEDIN,
      title: "LinkedIn weekly post",
      content: `Most businesses do not need "more software." They need fewer repeated manual steps.

At BizAutomatrix, we are focusing on practical automation for websites, SEO, review collection, email follow-up, daily reporting, maintenance workflows, asset tracking, and industrial operations.

The goal is simple: help owners and teams see what is happening, follow up faster, and stop losing opportunities in spreadsheets, inboxes, and memory.

We are currently offering free audits for businesses that want a clear first automation step.`,
    },
    FACEBOOK: {
      channel: MarketingChannel.FACEBOOK,
      title: "Facebook business post",
      content: `Running a business is hard when follow-ups, reviews, reports, and website inquiries are scattered everywhere.

BizAutomatrix helps small and industrial businesses improve websites, SEO, email follow-up, review requests, AI agents, and regular reporting workflows.

We are offering a free audit so you can see what can be automated first before paying for anything. Message us if you want a quick review.`,
    },
    INSTAGRAM: {
      channel: MarketingChannel.INSTAGRAM,
      title: "Instagram caption",
      content: `Manual follow-ups. Missed inquiries. No regular reports. Website visitors who never become leads.

These are fixable.

BizAutomatrix helps businesses build simple automation systems for websites, SEO, reviews, email follow-up, AI agents, reporting, maintenance, asset management, manufacturing, and railway workflows.

Start with a free audit.

#BusinessAutomation #AIAutomation #DigitalMarketing #SEO #ManufacturingAutomation #RailwayTechnology #WorkflowAutomation #BizAutomatrix`,
    },
  };

  return channels.map((channel) => ({
    ...drafts[channel],
    title: `${CHANNEL_LABELS[channel]} - ${drafts[channel].title}`,
    content: `${drafts[channel].content}

Campaign context: ${goal}
Audience: ${audience}
Cadence: ${cadence}
Tone: ${tone}`,
  }));
}

async function openAiDrafts(input: {
  channels: MarketingChannel[];
  goal: string;
  audience: string;
  cadence: string;
  tone: string;
  topic: string;
}) {
  if (!process.env.OPENAI_API_KEY) return null;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const channelList = input.channels.map((channel) => CHANNEL_LABELS[channel]).join(", ");
  const prompt = `Create marketing drafts for BizAutomatrix.

Company: BizAutomatrix
Offer: website upgrade, SEO, review automation, email automation, custom AI agents, day-to-day regular reporting, maintenance workflows, asset management, optimization, manufacturing workflows, railway workflow support.
Goal: ${input.goal}
Audience: ${input.audience}
Cadence: ${input.cadence}
Tone: ${input.tone}
Topic/context: ${input.topic}
Channels: ${channelList}

Rules:
- Make every draft practical and human.
- No exaggerated claims.
- Email should be 150-230 words with one CTA.
- SMS must be under 300 characters.
- WhatsApp should be friendly and concise.
- LinkedIn should be B2B and helpful.
- Facebook should be simple and local-business friendly.
- Instagram should include relevant hashtags.
- Do not say the post is AI-generated.

Respond as JSON only:
{
  "drafts": [
    { "channel": "EMAIL", "title": "Subject or post title", "content": "draft text" }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.75,
    });
    const content = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(content) as { drafts?: { channel?: string; title?: string; content?: string }[] };
    const drafts = (parsed.drafts ?? [])
      .filter((item): item is { channel: MarketingChannel; title: string; content: string } =>
        typeof item.channel === "string" &&
        item.channel in MarketingChannel &&
        typeof item.title === "string" &&
        typeof item.content === "string"
      )
      .filter((item) => input.channels.includes(item.channel));

    return drafts.length > 0 ? drafts : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const drafts = await prisma.marketingAgentDraft.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return NextResponse.json({ drafts });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const channels = toChannels(body.channels);
  const goal = clean(body.goal, "Get one paid client with a free audit and focused implementation scope.");
  const audience = clean(body.audience, "BizAutomatrix prospects");
  const cadence = clean(body.cadence, "weekly");
  const tone = clean(body.tone, "professional");
  const topic = clean(body.topic, "");

  const aiDrafts = await openAiDrafts({ channels, goal, audience, cadence, tone, topic });
  const draftInputs = aiDrafts ?? fallbackDrafts({ channels, goal, audience, cadence, tone, topic });

  await prisma.marketingAgentDraft.createMany({
    data: draftInputs.map((draft) => ({
      title: draft.title,
      channel: draft.channel,
      audience,
      goal,
      cadence,
      content: draft.content,
      status: "DRAFT",
    })),
  });

  const drafts = await prisma.marketingAgentDraft.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return NextResponse.json({
    success: true,
    mode: aiDrafts ? "ai" : "free-template",
    message: aiDrafts
      ? `Generated ${draftInputs.length} marketing draft(s).`
      : `Created ${draftInputs.length} free template draft(s). Add OPENAI_API_KEY for AI variation, or edit/copy these manually.`,
    drafts,
  });
}
