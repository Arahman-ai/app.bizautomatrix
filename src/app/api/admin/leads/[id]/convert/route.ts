import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

function isAdmin(session: any) { return session?.user?.role === "ADMIN"; } // eslint-disable-line @typescript-eslint/no-explicit-any

function generatePassword(length = 12) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const existing = await prisma.user.findUnique({ where: { email: lead.email } });
  if (existing) return NextResponse.json({ error: "A client account with this email already exists" }, { status: 409 });

  const tempPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  await prisma.user.create({
    data: {
      name: lead.ownerName ?? lead.businessName,
      email: lead.email,
      password: hashedPassword,
      role: "CLIENT",
      client: {
        create: {
          businessName: lead.businessName,
          website: lead.website,
          phone: lead.phone,
          city: lead.city,
          industry: lead.industry,
        },
      },
    },
  });

  await prisma.lead.update({ where: { id }, data: { status: "CONVERTED" } });

  await sendWelcomeEmail(lead.ownerName ?? lead.businessName, lead.email, lead.businessName);

  return NextResponse.json({ success: true, tempPassword });
}
