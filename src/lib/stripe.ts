import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const PLANS = {
  STARTER: {
    name: "Starter",
    price: 49,
    priceId: "price_1TQTEhGd1AqVhyR5MosTPDwc",
    features: [
      "Review request automation",
      "Google Business Profile tools",
      "Monthly report",
      "Up to 100 review requests/mo",
      "Email support",
    ],
  },
  GROWTH: {
    name: "Growth",
    price: 99,
    priceId: "price_1TQTEfGd1AqVhyR5qGZUV55u",
    features: [
      "Everything in Starter",
      "Social media post drafts",
      "Ad copy generation",
      "Up to 500 review requests/mo",
      "Competitor tracking",
      "Priority support",
    ],
  },
  PRO: {
    name: "Pro",
    price: 199,
    priceId: "price_1TQTEfGd1AqVhyR5UqQ9eQTq",
    features: [
      "Everything in Growth",
      "Full automation workflows",
      "Multi-location support",
      "Unlimited review requests",
      "Custom reporting",
      "Dedicated account manager",
    ],
  },
};
