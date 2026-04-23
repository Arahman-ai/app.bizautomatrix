import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "STARTER" | "GROWTH" | "PRO";

        if (!userId || !plan) break;

        const client = await prisma.client.update({
          where: { userId },
          data: {
            plan,
            status: "ACTIVE",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan,
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          create: {
            userId,
            clientId: client.id,
            plan,
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;

        const existing = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
        });
        if (!existing) break;

        const status = sub.status === "active" ? "ACTIVE" : "PAST_DUE";
        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const existing = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
        });
        if (!existing) break;

        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELLED" },
        });

        await prisma.client.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "INACTIVE", plan: "FREE" },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

        if (!subId) break;

        const existing = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subId },
        });
        if (!existing) break;

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subId },
          data: { status: "PAST_DUE" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
