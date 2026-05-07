import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { plan, status } = await req.json();

  const updated = await prisma.client.update({
    where: { id },
    data: {
      ...(plan && { plan }),
      ...(status && { status }),
    },
  });

  return NextResponse.json({ success: true, client: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id }, select: { userId: true } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { id: client.userId }, select: { isMaster: true } });
  if (user?.isMaster) return NextResponse.json({ error: "Cannot delete master account." }, { status: 403 });

  await prisma.client.delete({ where: { id } });
  await prisma.user.delete({ where: { id: client.userId } });

  return NextResponse.json({ success: true });
}
