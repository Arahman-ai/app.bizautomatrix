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
