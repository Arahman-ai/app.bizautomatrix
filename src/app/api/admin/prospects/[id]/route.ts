import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = req.headers.get("x-webhook-secret");
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (secret !== process.env.N8N_WEBHOOK_SECRET && (!session || role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status, notes, email } = await req.json();

  const updated = await prisma.prospect.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(email !== undefined && { email }),
    },
  });

  return NextResponse.json({ success: true, prospect: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.prospect.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
