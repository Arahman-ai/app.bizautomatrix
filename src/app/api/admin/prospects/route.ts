import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";

  const prospects = await prisma.prospect.findMany({
    where: status === "ALL" ? {} : { status: status as "PENDING" | "APPROVED" | "REJECTED" | "CONTACTED" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ prospects });
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  const session = await getServerSession(authOptions);

  if (secret !== process.env.N8N_WEBHOOK_SECRET && (!session || !isAdmin(session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { prospects } = body;

  if (!Array.isArray(prospects)) {
    return NextResponse.json({ error: "prospects array required" }, { status: 400 });
  }

  let added = 0;
  for (const p of prospects) {
    try {
      await prisma.prospect.upsert({
        where: { placeId: p.placeId },
        update: { rating: p.rating, reviewCount: p.reviewCount },
        create: {
          placeId: p.placeId,
          businessName: p.businessName,
          address: p.address,
          city: p.city,
          phone: p.phone,
          website: p.website,
          rating: p.rating,
          reviewCount: p.reviewCount,
          category: p.category,
        },
      });
      added++;
    } catch {
      // skip duplicates
    }
  }

  return NextResponse.json({ success: true, added });
}
