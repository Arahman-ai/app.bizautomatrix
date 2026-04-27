import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { prisma } = await import("@/lib/prisma");

  const lead = await prisma.lead.findUnique({
    where: { id },
    select: { id: true, status: true, email: true, businessName: true, ownerName: true },
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ lead });
}
