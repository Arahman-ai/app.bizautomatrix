import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the BizAutomatrix AI assistant. BizAutomatrix is a USA-based company with three business lines:

1. Digital Marketing — Local SEO, Google Maps ranking, review automation, social media management, SEM. Public pricing is quote-based after the free audit.

2. Software, AI & Business Automation — Custom software development, AI tools, n8n workflow automation, CRM systems, API integrations. Scope and quote are shared after discovery.

3. Engineering & Industrial Innovation — Industry 4.0, predictive maintenance, manufacturing dashboards, railway systems, ERP software. Custom quote after technical review.

Contact: info@bizautomatrix.com | WhatsApp: +1 (404) 203-7674 | Platform: app.bizautomatrix.com
Social: LinkedIn https://linkedin.com/company/bizautomatrix | Facebook https://facebook.com/bizautomatrix

Be helpful, concise, and professional. Answer questions about services, packages, and how to get started. If someone asks for pricing, explain that BizAutomatrix starts with a free audit and then shares a custom quote. If someone wants to book a demo or contact sales, direct them to info@bizautomatrix.com or the Book a Demo section on the website. Keep replies under 120 words.`;

const FALLBACK_REPLIES = {
  services:
    "BizAutomatrix helps with three areas: Digital Marketing (SEO, Google Maps, reviews, SEM), Software & AI (custom tools, AI agents, email automation, CRM, n8n workflows), and Engineering/Industrial workflows (manufacturing dashboards, maintenance, assets, railway and reporting systems). A good first step is a free audit.",
  pricing:
    "Pricing is quote-based because each business needs a different mix of website, SEO, automation, and AI workflow work. We usually start with a free audit, then share a practical scope and fixed quote. Email info@bizautomatrix.com or use the free audit form.",
  contact:
    "You can contact BizAutomatrix at info@bizautomatrix.com or WhatsApp +1 (404) 203-7674. You can also start with the free audit form on bizautomatrix.com.",
  social:
    "BizAutomatrix on LinkedIn: https://linkedin.com/company/bizautomatrix. You can also find us on Facebook: https://facebook.com/bizautomatrix. For direct contact, email info@bizautomatrix.com or WhatsApp +1 (404) 203-7674.",
  default:
    "I can help with BizAutomatrix services: website upgrades, SEO, review automation, email automation, custom AI agents, dashboards, maintenance/asset workflows, and industrial reporting. For a quick review, email info@bizautomatrix.com or request a free audit.",
};

function getFallbackReply(messages: unknown): string {
  if (!Array.isArray(messages)) return FALLBACK_REPLIES.default;

  const lastUserMessage = [...messages]
    .reverse()
    .find(
      (message): message is { role: string; content: string } =>
        typeof message === "object" &&
        message !== null &&
        "role" in message &&
        "content" in message &&
        (message as { role?: unknown }).role === "user" &&
        typeof (message as { content?: unknown }).content === "string"
    );

  const text = lastUserMessage?.content.toLowerCase() || "";

  if (text.includes("price") || text.includes("pricing") || text.includes("cost") || text.includes("package")) {
    return FALLBACK_REPLIES.pricing;
  }

  if (
    text.includes("linkedin") ||
    text.includes("linked in") ||
    text.includes("facebook") ||
    text.includes("social") ||
    text.includes("profile")
  ) {
    return FALLBACK_REPLIES.social;
  }

  if (text.includes("contact") || text.includes("email") || text.includes("call") || text.includes("whatsapp") || text.includes("demo")) {
    return FALLBACK_REPLIES.contact;
  }

  if (text.includes("service") || text.includes("what do you do") || text.includes("help") || text.includes("automation") || text.includes("seo")) {
    return FALLBACK_REPLIES.services;
  }

  return FALLBACK_REPLIES.default;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const allowed = ["https://bizautomatrix.com", "https://www.bizautomatrix.com", "https://app.bizautomatrix.com"];

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : "https://bizautomatrix.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400, headers });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ reply: getFallbackReply(messages), mode: "fallback" }, { headers });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-6),
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI chat API failed", { status: res.status });
      return NextResponse.json({ reply: getFallbackReply(messages), mode: "fallback" }, { headers });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || getFallbackReply(messages);

    return NextResponse.json({ reply }, { headers });
  } catch {
    return NextResponse.json(
      { reply: getFallbackReply([]), mode: "fallback" },
      { headers }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const allowed = ["https://bizautomatrix.com", "https://www.bizautomatrix.com", "https://app.bizautomatrix.com"];
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : "https://bizautomatrix.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
