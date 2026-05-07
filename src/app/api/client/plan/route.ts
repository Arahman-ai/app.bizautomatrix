import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ plan: "FREE" });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: { select: { plan: true } } },
  });

  return NextResponse.json({ plan: user?.client?.plan ?? "FREE" });
}
