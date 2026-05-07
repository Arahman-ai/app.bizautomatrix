import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user?.email! }, include: { client: true } });
  if (!user?.client) return NextResponse.json({ tasks: [] });

  const tasks = await prisma.seoTask.findMany({ where: { clientId: user.client.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ tasks });
}
