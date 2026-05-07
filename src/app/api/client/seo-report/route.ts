import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user?.email! }, include: { client: true } });
  if (!user?.client) return NextResponse.json({ report: null });

  const clientId = user.client.id;

  const [client, gbpAudit, citations, seoTasks, competitors, rankEntries, reviewRequests, pageSpeed] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId }, select: { businessName: true, website: true, city: true, industry: true, napConsistent: true } }),
    prisma.gbpAudit.findUnique({ where: { clientId } }),
    prisma.citation.findMany({ where: { clientId } }),
    prisma.seoTask.findMany({ where: { clientId } }),
    prisma.competitor.findMany({ where: { clientId } }),
    prisma.rankEntry.findMany({ where: { clientId }, orderBy: { recordedAt: "asc" } }),
    prisma.reviewRequest.findMany({ where: { clientId }, select: { status: true, createdAt: true } }),
    prisma.pageSpeedResult.findFirst({ where: { clientId }, orderBy: { recordedAt: "desc" } }),
  ]);

  return NextResponse.json({ report: { client, gbpAudit, citations, seoTasks, competitors, rankEntries, reviewRequests, pageSpeed } });
}
