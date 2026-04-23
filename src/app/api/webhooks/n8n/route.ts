import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint receives data back from n8n workflows
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret");
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, data } = body;

    switch (action) {
      case "audit_completed": {
        await prisma.audit.update({
          where: { id: data.auditId },
          data: {
            status: "COMPLETED",
            score: data.score,
            summary: data.summary,
            details: data.details,
            emailSent: true,
          },
        });
        break;
      }

      case "lead_status_update": {
        await prisma.lead.update({
          where: { id: data.leadId },
          data: { status: data.status },
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("n8n webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
