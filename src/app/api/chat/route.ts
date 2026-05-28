import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the BizAutomatrix AI assistant. BizAutomatrix is a USA-based company with three business lines:

1. Digital Marketing — Local SEO, Google Maps ranking, review automation, social media management, SEM. Public pricing is quote-based after the free audit.

2. Software, AI & Business Automation — Custom software development, AI tools, n8n workflow automation, CRM systems, API integrations. Scope and quote are shared after discovery.

3. Engineering & Industrial Innovation — Industry 4.0, predictive maintenance, manufacturing dashboards, railway systems, ERP software. Custom quote after technical review.

Contact: info@bizautomatrix.com | WhatsApp: +1 (404) 203-7674 | Platform: app.bizautomatrix.com

Be helpful, concise, and professional. Answer questions about services, packages, and how to get started. If someone asks for pricing, explain that BizAutomatrix starts with a free audit and then shares a custom quote. If someone wants to book a demo or contact sales, direct them to info@bizautomatrix.com or the Book a Demo section on the website. Keep replies under 120 words.`;

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

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "I'm having trouble responding. Please email info@bizautomatrix.com.";

    return NextResponse.json({ reply }, { headers });
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong. Please email info@bizautomatrix.com." },
      { status: 500, headers }
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
