import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const webhookUrl = process.env.N8N_OUTREACH_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const { id } = await params;

  const [prospect, template] = await Promise.all([
    prisma.prospect.findUnique({ where: { id } }),
    prisma.emailTemplate.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  if (!prospect.email) return NextResponse.json({ error: "No email" }, { status: 400 });

  const vars: Record<string, string> = {
    businessName: prospect.businessName,
    city: prospect.city ?? "",
    category: prospect.category ?? "",
    rating: prospect.rating?.toString() ?? "",
    reviewCount: prospect.reviewCount?.toString() ?? "",
    website: prospect.website ?? "",
    phone: prospect.phone ?? "",
    email: prospect.email,
  };

  function render(text: string) {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
  }

  const subject = render(template?.subject ?? "Grow Your Business with More 5-Star Reviews");
  const htmlBody = render(template?.body ?? "");

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessName: prospect.businessName,
      email: prospect.email,
      subject,
      htmlBody,
    }),
  });

  await prisma.prospect.update({
    where: { id },
    data: { emailSentAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
