import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: true },
  });

  const client = user?.client;
  if (!client) return NextResponse.json({ error: "No client found" }, { status: 404 });

  const { businessName, city, industry } = client;

  const prompt = `You are a social media manager for a local business. Generate 3 social media posts for the following business:

Business: ${businessName}
Industry: ${industry ?? "local business"}
City: ${city ?? "local area"}

Write one post for each platform:
1. Facebook (friendly, community-focused, 2-3 sentences, can include a call to action)
2. Instagram (energetic, visual-focused, use 5-8 relevant hashtags at the end)
3. LinkedIn (professional, business-focused, 2-3 sentences)

The posts should encourage customers to leave a Google review. Keep them natural and not overly salesy.

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
