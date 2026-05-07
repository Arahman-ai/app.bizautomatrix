import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: ReturnType<typeof getServerSession> extends Promise<infer T> ? T : never) {
  return (session as { user?: { role?: string } } | null)?.user?.role === "ADMIN";
}

const DEFAULT_TASKS = [
  { task: "Claim & verify Google Business Profile", category: "GBP", priority: "HIGH" },
  { task: "Add correct business category to GBP", category: "GBP", priority: "HIGH" },
  { task: "Write keyword-rich GBP description", category: "GBP", priority: "HIGH" },
  { task: "Add 10+ photos to GBP", category: "GBP", priority: "MEDIUM" },
  { task: "Set complete business hours on GBP", category: "GBP", priority: "HIGH" },
  { task: "Add services list to GBP", category: "GBP", priority: "MEDIUM" },
  { task: "Create first GBP post", category: "GBP", priority: "MEDIUM" },
  { task: "Submit sitemap to Google Search Console", category: "Technical", priority: "HIGH" },
  { task: "Add SSL certificate (HTTPS)", category: "Technical", priority: "HIGH" },
  { task: "Make website mobile-friendly", category: "Technical", priority: "HIGH" },
  { task: "Compress all images on website", category: "Technical", priority: "MEDIUM" },
  { task: "Add meta titles and descriptions to all pages", category: "Technical", priority: "HIGH" },
  { task: "Add schema markup to homepage", category: "Technical", priority: "MEDIUM" },
  { task: "Create product page with location keyword in title", category: "Content", priority: "HIGH" },
  { task: "Write FAQ page targeting common search questions", category: "Content", priority: "MEDIUM" },
  { task: "Publish first blog post targeting local keyword", category: "Content", priority: "MEDIUM" },
  { task: "List business on Google Maps", category: "Citations", priority: "HIGH" },
  { task: "List on Bangladesh Yellow Pages / local directory", category: "Citations", priority: "MEDIUM" },
  { task: "List on 10 major online directories", category: "Citations", priority: "MEDIUM" },
  { task: "Get first backlink from local partner/supplier", category: "Off-Page", priority: "MEDIUM" },
  { task: "Set up review request automation", category: "Reviews", priority: "HIGH" },
  { task: "Reach 20+ Google reviews", category: "Reviews", priority: "HIGH" },
];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) {
    const clients = await prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: "asc" } });
    return NextResponse.json({ clients });
  }

  const tasks = await prisma.seoTask.findMany({ where: { clientId }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  if (body.seedDefaults && body.clientId) {
    const existing = await prisma.seoTask.count({ where: { clientId: body.clientId } });
    if (existing === 0) {
      await prisma.seoTask.createMany({
        data: DEFAULT_TASKS.map(t => ({ ...t, clientId: body.clientId })),
      });
    }
    const tasks = await prisma.seoTask.findMany({ where: { clientId: body.clientId }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({ tasks });
  }

  const { clientId, task, category, priority } = body;
  if (!clientId || !task) return NextResponse.json({ error: "clientId and task required" }, { status: 400 });

  const created = await prisma.seoTask.create({ data: { clientId, task, category: category || "general", priority: priority || "MEDIUM" } });
  return NextResponse.json({ task: created });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, completed } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updated = await prisma.seoTask.update({
    where: { id },
    data: { completed: Boolean(completed), completedAt: completed ? new Date() : null },
  });
  return NextResponse.json({ task: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.seoTask.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
