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

  const audit = await prisma.gbpAudit.findUnique({ where: { clientId } });
  return NextResponse.json({ audit });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { clientId, ...data } = body;
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const boolFields = ["hasClaimed","hasCorrectName","hasCategory","hasDescription","hasPhotos","hasHours","hasPosts","hasServices","hasWebsite","hasPhone"];
  const updateData: Record<string, unknown> = {};
  for (const f of boolFields) if (f in data) updateData[f] = Boolean(data[f]);
  if ("reviewCount" in data) updateData.reviewCount = data.reviewCount !== "" ? Number(data.reviewCount) : null;
  if ("rating" in data) updateData.rating = data.rating !== "" ? Number(data.rating) : null;
  if ("notes" in data) updateData.notes = data.notes || null;

  const checked = boolFields.filter(f => updateData[f]).length;
  updateData.score = Math.round((checked / boolFields.length) * 100);

  const audit = await prisma.gbpAudit.upsert({
    where: { clientId },
    update: updateData,
    create: { clientId, ...updateData },
  });

  return NextResponse.json({ audit });
}
