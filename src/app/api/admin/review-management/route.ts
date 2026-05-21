import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session as { user?: { role?: string } } | null)?.user?.role === "ADMIN";
}

const REVIEW_TASKS = [
  {
    task: "Add Google review link to client profile",
    priority: "HIGH",
    recommendation: "Save the client's direct Google review URL so every review request redirects to the right profile.",
  },
  {
    task: "Send the first 10 review requests",
    priority: "HIGH",
    recommendation: "Start with recent happy customers and monitor click rate before scaling the sequence.",
  },
  {
    task: "Create QR review card for offline customers",
    priority: "MEDIUM",
    recommendation: "Use the same review tracking link on invoices, packaging, counters, and service handover documents.",
  },
  {
    task: "Prepare review follow-up sequence",
    priority: "MEDIUM",
    recommendation: "Create a polite reminder flow for customers who do not click the first request.",
  },
  {
    task: "Respond to recent Google reviews",
    priority: "MEDIUM",
    recommendation: "Reply to positive and negative reviews to improve trust and Google Business Profile engagement.",
  },
  {
    task: "Reach 20+ Google reviews",
    priority: "HIGH",
    recommendation: "Use consistent review requests until the business has enough social proof to compete locally.",
  },
];

function startOfThisMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clientId = new URL(req.url).searchParams.get("clientId");
  const clients = await prisma.client.findMany({
    where: { user: { isMaster: false } },
    select: {
      id: true,
      businessName: true,
      website: true,
      city: true,
      state: true,
      industry: true,
      googleReviewLink: true,
      plan: true,
      _count: { select: { reviewRequests: true } },
    },
    orderBy: { businessName: "asc" },
  });

  const selectedClientId = clientId || clients[0]?.id;
  if (!selectedClientId) return NextResponse.json({ clients, selectedClient: null });

  const selectedClient = await prisma.client.findUnique({
    where: { id: selectedClientId },
    select: {
      id: true,
      businessName: true,
      website: true,
      city: true,
      state: true,
      industry: true,
      googleReviewLink: true,
      plan: true,
    },
  });

  if (!selectedClient) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const monthStart = startOfThisMonth();
  const [total, sent, clicked, pending, failed, sentThisMonth, clickedThisMonth, requests, openReviewTasks] =
    await Promise.all([
      prisma.reviewRequest.count({ where: { clientId: selectedClientId } }),
      prisma.reviewRequest.count({ where: { clientId: selectedClientId, status: { in: ["SENT", "CLICKED"] } } }),
      prisma.reviewRequest.count({ where: { clientId: selectedClientId, status: "CLICKED" } }),
      prisma.reviewRequest.count({ where: { clientId: selectedClientId, status: "PENDING" } }),
      prisma.reviewRequest.count({ where: { clientId: selectedClientId, status: "FAILED" } }),
      prisma.reviewRequest.count({
        where: {
          clientId: selectedClientId,
          status: { in: ["SENT", "CLICKED"] },
          sentAt: { gte: monthStart },
        },
      }),
      prisma.reviewRequest.count({
        where: {
          clientId: selectedClientId,
          status: "CLICKED",
          clickedAt: { gte: monthStart },
        },
      }),
      prisma.reviewRequest.findMany({
        where: { clientId: selectedClientId },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
      prisma.seoTask.findMany({
        where: { clientId: selectedClientId, category: "Reviews", completed: false },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  return NextResponse.json({
    clients,
    selectedClient,
    stats: {
      total,
      sent,
      clicked,
      pending,
      failed,
      sentThisMonth,
      clickedThisMonth,
      clickRate: percent(clicked, sent),
      monthlyClickRate: percent(clickedThisMonth, sentThisMonth),
    },
    requests,
    openReviewTasks,
    recommendedTasks: REVIEW_TASKS,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { clientId, action } = body;
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  if (action !== "createReviewTasks") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  const existing = await prisma.seoTask.findMany({
    where: { clientId, category: "Reviews" },
    select: { task: true },
  });
  const existingTasks = new Set(existing.map((item) => item.task.toLowerCase()));
  const missingTasks = REVIEW_TASKS.filter((item) => !existingTasks.has(item.task.toLowerCase()));

  if (missingTasks.length) {
    await prisma.seoTask.createMany({
      data: missingTasks.map((item) => ({
        clientId,
        task: item.task,
        category: "Reviews",
        priority: item.priority,
        issueType: "Review management",
        recommendation: item.recommendation,
      })),
    });
  }

  const tasks = await prisma.seoTask.findMany({
    where: { clientId, category: "Reviews", completed: false },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ created: missingTasks.length, tasks });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clientId, googleReviewLink } = await req.json();
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const client = await prisma.client.update({
    where: { id: clientId },
    data: { googleReviewLink: googleReviewLink || null },
    select: {
      id: true,
      businessName: true,
      googleReviewLink: true,
    },
  });

  return NextResponse.json({ client });
}
