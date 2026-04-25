import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, status } = await req.json();
  if (!requestId) return NextResponse.json({ error: "Missing requestId" }, { status: 400 });

  const normalizedStatus = (status || "SENT").toUpperCase();
  const validStatuses = ["SENT", "FAILED"];
  if (!validStatuses.includes(normalizedStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await prisma.reviewRequest.update({
    where: { id: requestId },
    data: {
      status: normalizedStatus as "SENT" | "FAILED",
      sentAt: normalizedStatus === "SENT" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ success: true });
}
