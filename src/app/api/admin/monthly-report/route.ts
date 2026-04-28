import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const monthName = startOfLastMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const clients = await prisma.client.findMany({
    where: { plan: { not: "FREE" }, status: "ACTIVE" },
    include: { user: { select: { name: true, email: true } } },
  });

  let sent = 0;

  for (const client of clients) {
    const [totalSent, totalClicked] = await Promise.all([
      prisma.reviewRequest.count({
        where: { clientId: client.id, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.reviewRequest.count({
        where: { clientId: client.id, status: "CLICKED", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
    ]);

    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
    const firstName = client.user.name?.split(" ")[0] || "there";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.bizautomatrix.com";

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: client.user.email,
      subject: `Your ${monthName} Marketing Report — ${client.businessName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
          <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px 24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;">Monthly Marketing Report</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:15px;">${monthName} · ${client.businessName}</p>
          </div>
          <div style="padding:32px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <p style="color:#374151;font-size:16px;">Hi <strong>${firstName}</strong>,</p>
            <p style="color:#374151;font-size:15px;">Here's your marketing summary for ${monthName}:</p>

            <div style="display:flex;gap:16px;margin:24px 0;">
              <div style="flex:1;background:#f0f9ff;border-radius:12px;padding:20px;text-align:center;">
                <p style="margin:0;font-size:36px;font-weight:bold;color:#2563eb;">${totalSent}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Review Requests Sent</p>
              </div>
              <div style="flex:1;background:#f0fdf4;border-radius:12px;padding:20px;text-align:center;">
                <p style="margin:0;font-size:36px;font-weight:bold;color:#16a34a;">${totalClicked}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Links Clicked</p>
              </div>
              <div style="flex:1;background:#fefce8;border-radius:12px;padding:20px;text-align:center;">
                <p style="margin:0;font-size:36px;font-weight:bold;color:#ca8a04;">${clickRate}%</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Click Rate</p>
              </div>
            </div>

            <p style="color:#374151;font-size:15px;line-height:1.6;">
              ${totalSent === 0
                ? "You haven't sent any review requests this month. Log in to start collecting more Google reviews!"
                : `Great work! You sent <strong>${totalSent} review requests</strong> and <strong>${totalClicked} customers clicked</strong> to leave a review.`
              }
            </p>

            <div style="text-align:center;margin:32px 0;">
              <a href="${appUrl}/dashboard" style="background:#2563eb;color:#fff;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                View Your Dashboard →
              </a>
            </div>

            <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;" />
            <p style="color:#9ca3af;font-size:12px;text-align:center;">
              BizAutomatrix · <a href="mailto:info@bizautomatrix.com" style="color:#6b7280;">info@bizautomatrix.com</a> · +1 (404) 203-7674
            </p>
          </div>
        </div>
      `,
    });

    sent++;
  }

  return NextResponse.json({ success: true, sent });
}
