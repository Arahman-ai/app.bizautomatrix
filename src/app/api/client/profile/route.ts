import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    include: { client: true },
  });

  return NextResponse.json({ client: user?.client });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { businessName, website, phone, address, city, state, industry, googleReviewLink } = body;

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    include: { client: true },
  });

  if (!user?.client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const updated = await prisma.client.update({
    where: { id: user.client.id },
    data: { businessName, website, phone, address, city, state, industry, googleReviewLink },
  });

  return NextResponse.json({ client: updated });
}
