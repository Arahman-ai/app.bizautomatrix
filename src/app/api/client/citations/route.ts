import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user?.email! }, include: { client: true } });
  if (!user?.client) return NextResponse.json({ citations: [] });

  const citations = await prisma.citation.findMany({ where: { clientId: user.client.id }, orderBy: { directory: "asc" } });
  return NextResponse.json({ citations });
}
