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

  const { id } = await params;
  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.lead.findFirst({ where: { email: prospect.email ?? "" } });
  if (existing) return NextResponse.json({ error: "Lead with this email already exists", leadId: existing.id }, { status: 409 });

  const lead = await prisma.lead.create({
    data: {
      businessName: prospect.businessName,
      email: prospect.email ?? "",
      phone: prospect.phone,
      website: prospect.website,
      city: prospect.city,
      industry: prospect.category,
      source: "cold-outreach",
      status: "CONTACTED",
    },
  });

  return NextResponse.json({ success: true, lead });
}
