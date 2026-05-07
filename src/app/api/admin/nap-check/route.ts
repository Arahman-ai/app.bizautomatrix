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

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, businessName: true, address: true, phone: true, website: true, napConsistent: true, napNotes: true },
  });
  return NextResponse.json({ client });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clientId, napConsistent, napNotes } = await req.json();
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const client = await prisma.client.update({
    where: { id: clientId },
    data: { napConsistent: Boolean(napConsistent), napNotes: napNotes || null },
    select: { id: true, businessName: true, address: true, phone: true, website: true, napConsistent: true, napNotes: true },
  });
  return NextResponse.json({ client });
}
