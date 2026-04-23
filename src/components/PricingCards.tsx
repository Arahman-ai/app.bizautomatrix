"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    name: "Free",
    price: 0,
    plan: "FREE",
    desc: "Get started and explore the platform.",
    features: [
      "Free business audit report",
      "Basic client dashboard",
      "Up to 10 review requests/mo",
      "Email support",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Starter",
    price: 49,
    plan: "STARTER",
    desc: "Perfect for new businesses.",
    features: [
      "Google Business Profile optimization",
      "Photos, posts, categories & Q&A",
      "Review generation system",
      "Templates to get 5★ reviews fast",
      "Monthly performance report",
      "Client dashboard access 24/7",
    ],
    cta: "Start Starter Plan",
    highlight: false,
  },
  {
    name: "Growth",
    price: 99,
    plan: "GROWTH",
    desc: "For businesses serious about ranking.",
    features: [
      "Everything in Starter",
      "Local SEO & citations (50+ directories)",
      "Social media management (8 posts/mo)",
      "Competitor tracking & comparison",
      "Bi-weekly performance reports",
      "Priority WhatsApp support",
    ],
    cta: "Start Growth Plan",
    highlight: true,
  },
  {
    name: "Pro",
    price: 199,
    plan: "PRO",
    desc: "Full-service digital domination.",
    features: [
      "Everything in Growth",
      "Google Ads management & optimization",
      "Backlink building (high-authority)",
      "Dedicated account manager",
      "Weekly reports + monthly strategy call",
      "Priority onboarding (results in 7 days)",
    ],
    cta: "Start Pro Plan",
    highlight: false,
  },
];

export default function PricingCards() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    if (plan === "FREE") {
      router.push("/signup");
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          className={`rounded-2xl border p-6 flex flex-col ${
            plan.highlight
              ? "border-blue-500 shadow-lg shadow-blue-100 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
        >
          {plan.highlight && (
            <div className="text-center mb-3">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
          <p className="text-gray-500 text-sm mt-1 mb-4">{plan.desc}</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
            {plan.price > 0 && (
              <span className="text-gray-500 text-sm">/month</span>
            )}
          </div>
          <ul className="space-y-2 mb-8 flex-1">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout(plan.plan)}
            disabled={loading === plan.plan}
            className={`w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 ${
              plan.highlight
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-900 text-white hover:bg-gray-700"
            }`}
          >
            {loading === plan.plan ? "Loading..." : plan.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
