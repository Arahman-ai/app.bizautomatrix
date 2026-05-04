import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SINGLETON_ID = "singleton";

const DEFAULT_BODY = `<p>Hi {{businessName}} Team,</p>

<p>I came across your business in {{city}} and noticed you have {{reviewCount}} reviews on Google. Businesses with more reviews consistently rank higher and attract more customers.</p>

<p>At <strong>BizAutomatrix</strong>, we help local businesses like yours automatically collect 5-star Google reviews — without any manual effort.</p>

<p>Here's what we offer:</p>
<ul>
  <li>Automated review request emails & SMS</li>
  <li>Easy-to-use client dashboard</li>
  <li>Real results in 30 days or less</li>
</ul>

<p>We're offering a <strong>free 14-day trial</strong> — no credit card required.</p>

<p>👉 <a href="https://app.bizautomatrix.com/signup">Start your free trial here</a></p>

<p>Or reply to this email and I'll personally walk you through it.</p>

<p>Best regards,<br/>
Arifur Rahman<br/>
BizAutomatrix<br/>
+1(404) 203-7674<br/>
<a href="https://app.bizautomatrix.com">app.bizautomatrix.com</a></p>`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  const session = await getServerSession(authOptions);
  if (secret !== process.env.N8N_WEBHOOK_SECRET && (!session || !isAdmin(session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const template = await prisma.emailTemplate.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID, body: DEFAULT_BODY },
  });

  return NextResponse.json({ template });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { subject, body } = await req.json();

  const template = await prisma.emailTemplate.upsert({
    where: { id: SINGLETON_ID },
    update: {
      ...(subject !== undefined && { subject }),
      ...(body !== undefined && { body }),
    },
    create: { id: SINGLETON_ID, subject, body },
  });

  return NextResponse.json({ template });
}
