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

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    const clients = await prisma.client.findMany({
      select: { id: true, businessName: true },
      orderBy: { businessName: "asc" },
    });
    return NextResponse.json({ clients });
  }

  const entries = await prisma.rankEntry.findMany({
    where: { clientId },
    orderBy: { recordedAt: "asc" },
  });

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clientId, keyword, productUrl, mapRank, websiteRank, recordedAt } = await req.json();
  if (!clientId || !keyword) return NextResponse.json({ error: "clientId and keyword required" }, { status: 400 });

  const entry = await prisma.rankEntry.create({
    data: {
      clientId,
      keyword,
      productUrl: productUrl || null,
      mapRank: mapRank !== undefined && mapRank !== "" ? Number(mapRank) : null,
      websiteRank: websiteRank !== undefined && websiteRank !== "" ? Number(websiteRank) : null,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    },
  });

  return NextResponse.json({ entry });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.rankEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
