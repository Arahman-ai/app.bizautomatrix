import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MarketingChannel, MarketingDraftStatus } from "@prisma/client";
import { Resend } from "resend";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function textToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return NextResponse.json(
      { error: "Email sending is not configured. Add RESEND_API_KEY and EMAIL_FROM, or copy the draft manually." },
      { status: 400 }
    );
  }

  const { id } = await params;
  const requestBody = await req.json().catch(() => ({ to: "" }));
  const draft = await prisma.marketingAgentDraft.findUnique({ where: { id } });
  if (!draft) return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  if (draft.channel !== MarketingChannel.EMAIL) {
    return NextResponse.json({ error: "Only email drafts can be sent by this action." }, { status: 400 });
  }
  if (draft.prospectId && draft.status !== MarketingDraftStatus.APPROVED) {
    return NextResponse.json({ error: "Review and approve this prospect email before sending." }, { status: 400 });
  }

  const recipient = typeof requestBody.to === "string"
    ? requestBody.to.trim()
    : draft.recipientEmail?.trim() ?? "";
  if (!recipient || !isEmail(recipient)) {
    return NextResponse.json({ error: "Valid recipient email is required." }, { status: 400 });
  }

  const adminEmails = (process.env.EMAIL_ADMIN ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  const bccEmails = Array.from(new Set([
    ...adminEmails,
    "arifur03071@gmail.com",
    "info@bizautomatrix.com",
  ]));

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: recipient,
    bcc: bccEmails,
    subject: draft.title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827; line-height: 1.6;">
        ${textToHtml(draft.content)}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6b7280;">Sent by BizAutomatrix Marketing Agent. Reply to continue the conversation or email info@bizautomatrix.com.</p>
      </div>
    `,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 502 });
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.outreachEmailLog.create({
    data: {
      prospectId: draft.prospectId,
      draftId: draft.id,
      recipientEmail: recipient,
      subject: draft.title,
      body: draft.content,
      status: "SENT",
      sentAt: now,
      expiresAt,
    },
  });

  if (draft.prospectId) {
    await prisma.prospect.update({
      where: { id: draft.prospectId },
      data: { status: "CONTACTED", emailSentAt: now },
    });
  }

  const updated = await prisma.marketingAgentDraft.update({
    where: { id },
    data: { status: "SENT", sentAt: now, recipientEmail: recipient },
  });

  return NextResponse.json({ success: true, draft: updated });
}
