import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MarketingDraftStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: {
    title?: string;
    content?: string;
    notes?: string | null;
    status?: MarketingDraftStatus;
    sentAt?: Date | null;
  } = {};

  const title = cleanString(body.title);
  if (title) data.title = title;

  const content = cleanString(body.content);
  if (content) data.content = content;

  if (typeof body.notes === "string") data.notes = body.notes.trim() || null;

  if (typeof body.status === "string" && body.status in MarketingDraftStatus) {
    data.status = body.status as MarketingDraftStatus;
    if (body.status === "SENT") data.sentAt = new Date();
  }

  const draft = await prisma.marketingAgentDraft.update({
    where: { id },
    data,
  });

  return NextResponse.json({ draft });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.marketingAgentDraft.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
