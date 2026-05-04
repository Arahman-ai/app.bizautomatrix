import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SINGLETON_ID = "singleton";

function isAdmin(session: ReturnType<typeof getServerSession> extends Promise<infer T> ? T : never) {
  return (session as { user?: { role?: string } } | null)?.user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  const session = await getServerSession(authOptions);
  if (secret !== process.env.N8N_WEBHOOK_SECRET && (!session || !isAdmin(session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const config = await prisma.prospectConfig.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });

  return NextResponse.json({ config });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { country, state, city, category, maxReviews } = body as {
    country?: string;
    state?: string;
    city?: string;
    category?: string;
    maxReviews?: number;
  };

  const config = await prisma.prospectConfig.upsert({
    where: { id: SINGLETON_ID },
    update: {
      ...(country !== undefined && { country }),
      ...(state !== undefined && { state }),
      ...(city !== undefined && { city }),
      ...(category !== undefined && { category }),
      ...(maxReviews !== undefined && { maxReviews: Number(maxReviews) }),
    },
    create: {
      id: SINGLETON_ID,
      country: country ?? "",
      state: state ?? "",
      city: city ?? "",
      category: category ?? "",
      maxReviews: maxReviews !== undefined ? Number(maxReviews) : 20,
    },
  });

  return NextResponse.json({ config });
}
