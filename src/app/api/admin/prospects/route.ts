import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  const session = await getServerSession(authOptions);
  if (secret !== process.env.N8N_WEBHOOK_SECRET && (!session || !isAdmin(session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";
  const noEmail = searchParams.get("noEmail") === "true";

  const prospects = await prisma.prospect.findMany({
    where: {
      ...(status !== "ALL" && { status: status as "PENDING" | "APPROVED" | "REJECTED" | "CONTACTED" }),
      ...(noEmail && { website: { not: null }, email: null }),
    },
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
        update: {
          rating: p.rating,
          reviewCount: p.reviewCount,
          ...(p.email !== undefined && p.email !== null && p.email !== "" && { email: p.email }),
          ...(p.phone !== undefined && p.phone !== null && p.phone !== "" && { phone: p.phone }),
          ...(p.website !== undefined && p.website !== null && p.website !== "" && { website: p.website }),
        },
        create: {
          placeId: p.placeId,
          businessName: p.businessName,
          address: p.address,
          city: p.city,
          phone: p.phone,
          website: p.website,
          email: p.email,
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
