import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: true },
  });

  const client = user?.client;
  if (!client) return NextResponse.json({ error: "No client found" }, { status: 404 });

  const now = new Date();

  // Build last 6 months of data
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      label: d.toLocaleString("default", { month: "short", year: "numeric" }),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    };
  }).reverse();

  const monthlyData = await Promise.all(
    months.map(async ({ label, start, end }) => {
      const [sent, clicked] = await Promise.all([
        prisma.reviewRequest.count({ where: { clientId: client.id, createdAt: { gte: start, lte: end } } }),
        prisma.reviewRequest.count({ where: { clientId: client.id, status: "CLICKED", createdAt: { gte: start, lte: end } } }),
      ]);
      return { label, sent, clicked };
    })
  );

  const allTime = await Promise.all([
    prisma.reviewRequest.count({ where: { clientId: client.id } }),
    prisma.reviewRequest.count({ where: { clientId: client.id, status: "CLICKED" } }),
  ]);

  return NextResponse.json({
    businessName: client.businessName,
    plan: client.plan,
    monthlyData,
    allTimeSent: allTime[0],
    allTimeClicked: allTime[1],
  });
}
