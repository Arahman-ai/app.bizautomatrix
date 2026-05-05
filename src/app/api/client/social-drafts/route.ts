import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: true },
  });

  const client = user?.client;
  if (!client) return NextResponse.json({ error: "No client found" }, { status: 404 });

  const { topic, tone } = await req.json().catch(() => ({ topic: "", tone: "friendly" }));
  const { businessName, city, industry } = client;

  const toneMap: Record<string, string> = {
    friendly: "friendly and warm",
    professional: "professional and polished",
    exciting: "exciting and energetic",
    funny: "light and humorous",
  };

  const prompt = `You are a social media manager for a local business. Generate 3 social media posts for the following business:

Business: ${businessName}
Industry: ${industry ?? "local business"}
City: ${city ?? "local area"}
Tone: ${toneMap[tone] ?? "friendly and warm"}
${topic ? `Topic / Context: ${topic}` : "Topic: encourage customers to leave a Google review"}

Write one post for each platform:
1. Facebook (community-focused, 2-3 sentences, include a call to action)
2. Instagram (visual-focused, use 5-8 relevant hashtags at the end)
3. LinkedIn (business-focused, 2-3 sentences)

Keep them natural and not overly salesy.

Respond in this exact JSON format:
{
  "facebook": "post text here",
  "instagram": "post text here",
  "linkedin": "post text here"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = completion.choices[0].message.content ?? "{}";
  const posts = JSON.parse(content);

  return NextResponse.json({ posts, businessName, industry, city });
}
