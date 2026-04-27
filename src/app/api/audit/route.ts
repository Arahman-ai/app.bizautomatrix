import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendNewLeadNotification, sendAuditConfirmation } from "@/lib/email";

const auditSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  ownerName: z.string().optional(),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  website: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = auditSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        website: data.website,
        city: data.city,
        industry: data.industry,
        source: "audit-funnel",
        status: "NEW",
      },
    });

    await prisma.audit.create({
      data: {
        leadId: lead.id,
        businessName: data.businessName,
        website: data.website,
        status: "PENDING",
      },
    });

    // Send emails in background (don't block the response)
    Promise.all([
      sendNewLeadNotification(data).catch(console.error),
      sendAuditConfirmation(data.email, data.businessName).catch(console.error),
    ]);

    // Trigger n8n lead follow-up workflow
    const n8nFollowupUrl = process.env.N8N_LEAD_FOLLOWUP_WEBHOOK_URL;
    if (n8nFollowupUrl) {
      fetch(n8nFollowupUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({
          leadId: lead.id,
          businessName: data.businessName,
          ownerName: data.ownerName || "",
          email: data.email,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.bizautomatrix.com",
        }),
      }).catch(console.error);
    }

    return NextResponse.json(
      { success: true, leadId: lead.id },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Audit submission error:", err);
    return NextResponse.json(
      { error: "Failed to submit audit. Please try again." },
      { status: 500 }
    );
  }
}
