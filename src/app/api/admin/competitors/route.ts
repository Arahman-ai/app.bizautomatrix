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

  const competitors = await prisma.competitor.findMany({ where: { clientId }, orderBy: { name: "asc" } });
  return NextResponse.json({ competitors });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clientId, name, website, mapRank, websiteRank, reviewCount, rating, notes } = await req.json();
  if (!clientId || !name) return NextResponse.json({ error: "clientId and name required" }, { status: 400 });

  const competitor = await prisma.competitor.create({
    data: {
      clientId, name,
      website: website || null,
      mapRank: mapRank !== "" && mapRank !== undefined ? Number(mapRank) : null,
      websiteRank: websiteRank !== "" && websiteRank !== undefined ? Number(websiteRank) : null,
      reviewCount: reviewCount !== "" && reviewCount !== undefined ? Number(reviewCount) : null,
      rating: rating !== "" && rating !== undefined ? Number(rating) : null,
      notes: notes || null,
    },
  });
  return NextResponse.json({ competitor });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, name, website, mapRank, websiteRank, reviewCount, rating, notes } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const competitor = await prisma.competitor.update({
    where: { id },
    data: {
      name,
      website: website || null,
      mapRank: mapRank !== "" && mapRank !== undefined ? Number(mapRank) : null,
      websiteRank: websiteRank !== "" && websiteRank !== undefined ? Number(websiteRank) : null,
      reviewCount: reviewCount !== "" && reviewCount !== undefined ? Number(reviewCount) : null,
      rating: rating !== "" && rating !== undefined ? Number(rating) : null,
      notes: notes || null,
    },
  });
  return NextResponse.json({ competitor });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.competitor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
