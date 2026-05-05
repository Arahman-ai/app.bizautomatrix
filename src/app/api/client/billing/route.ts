import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: true },
  });

  const client = user?.client;
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const subscription = await prisma.subscription.findUnique({ where: { userId: user!.id } });

  let portalUrl: string | null = null;
  if (client.stripeCustomerId) {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: client.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });
    portalUrl = portalSession.url;
  }

  return NextResponse.json({
    plan: client.plan,
    status: client.status,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    portalUrl,
  });
}
