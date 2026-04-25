import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewRequest } from "@/lib/email";

const PLAN_LIMITS: Record<string, number> = {
  FREE: 0,
  STARTER: 100,
  GROWTH: 500,
  PRO: Infinity,
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    include: { client: true },
  });
  if (!user?.client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const requests = await prisma.reviewRequest.findMany({
    where: { clientId: user.client.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    include: { client: true },
  });
  if (!user?.client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const client = user.client;

  if (!client.googleReviewLink) {
    return NextResponse.json(
      { error: "Add your Google Review link in Business Settings first." },
      { status: 400 }
    );
  }

  // Check monthly limit
  const limit = PLAN_LIMITS[client.plan] ?? 0;
  if (limit === 0) {
    return NextResponse.json(
      { error: "Upgrade to a paid plan to send review requests." },
      { status: 403 }
    );
  }

  if (limit !== Infinity) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sentThisMonth = await prisma.reviewRequest.count({
      where: {
        clientId: client.id,
        status: { in: ["SENT", "CLICKED"] },
        sentAt: { gte: startOfMonth },
      },
    });

    if (sentThisMonth >= limit) {
      return NextResponse.json(
        { error: `Monthly limit of ${limit} requests reached. Upgrade your plan for more.` },
        { status: 403 }
      );
    }
  }

  const body = await req.json();
  const { customerName, customerEmail, customerPhone } = body;

  if (!customerName || !customerEmail) {
    return NextResponse.json({ error: "Customer name and email are required." }, { status: 400 });
  }

  const request = await prisma.reviewRequest.create({
    data: {
      clientId: client.id,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.bizautomatrix.com";
  const trackingUrl = `${appUrl}/r/${request.trackingToken}`;

  // Try n8n first, fall back to direct email
  const n8nUrl = process.env.N8N_REVIEW_WEBHOOK_URL;
  let sent = false;

  if (n8nUrl) {
    try {
      const res = await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({
          requestId: request.id,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          businessName: client.businessName,
          reviewLink: trackingUrl,
          callbackUrl: `${appUrl}/api/n8n/review-callback`,
        }),
      });
      sent = res.ok;
    } catch {
      // fall through to direct send
    }
  }

  if (!sent) {
    // Send directly via Resend
    try {
      await sendReviewRequest({
        customerName,
        customerEmail,
        businessName: client.businessName,
        reviewLink: trackingUrl,
      });
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (err) {
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "FAILED" },
      });
      console.error("Review request send failed:", err);
      return NextResponse.json({ error: "Failed to send review request." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, requestId: request.id }, { status: 201 });
}
