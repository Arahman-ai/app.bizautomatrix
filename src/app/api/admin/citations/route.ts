import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: ReturnType<typeof getServerSession> extends Promise<infer T> ? T : never) {
  return (session as { user?: { role?: string } } | null)?.user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) {
    const clients = await prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: "asc" } });
    return NextResponse.json({ clients });
  }

  const citations = await prisma.citation.findMany({ where: { clientId }, orderBy: { directory: "asc" } });
  return NextResponse.json({ citations });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clientId, directory, url } = await req.json();
  if (!clientId || !directory) return NextResponse.json({ error: "clientId and directory required" }, { status: 400 });

  const citation = await prisma.citation.create({ data: { clientId, directory, url: url || null } });
  return NextResponse.json({ citation });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, listed, napCorrect, url } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (listed !== undefined) update.listed = Boolean(listed);
  if (napCorrect !== undefined) update.napCorrect = Boolean(napCorrect);
  if (url !== undefined) update.url = url || null;

  const citation = await prisma.citation.update({ where: { id }, data: update });
  return NextResponse.json({ citation });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.citation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
