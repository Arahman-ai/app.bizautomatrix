"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const PLANS = [
  {
    key: "STARTER",
    name: "Starter",
    price: 49,
    features: [
      "Review request automation",
      "Google Business Profile tools",
      "Monthly report",
      "Up to 100 review requests/mo",
      "Email support",
    ],
  },
  {
    key: "GROWTH",
    name: "Growth",
    price: 99,
    highlight: true,
    features: [
      "Everything in Starter",
      "Social media post drafts",
      "Ad copy generation",
      "Up to 500 review requests/mo",
      "Competitor tracking",
      "Priority support",
    ],
  },
  {
    key: "PRO",
    name: "Pro",
    price: 199,
    features: [
      "Everything in Growth",
      "Full automation workflows",
      "Multi-location support",
      "Unlimited review requests",
      "Custom reporting",
      "Dedicated account manager",
    ],
  },
];

export default function BillingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(plan: string) {
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
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plan</h1>
        <p className="text-gray-500 mt-1">Choose the plan that fits your business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`bg-white rounded-2xl border p-6 flex flex-col ${
              plan.highlight ? "border-blue-500 shadow-lg" : "border-gray-200"
            }`}
          >
            {plan.highlight && (
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-4">
                Most Popular
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
            <div className="mt-2 mb-6">
              <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.key)}
              disabled={loading === plan.key}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                plan.highlight
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              } disabled:opacity-50`}
            >
              {loading === plan.key ? "Redirecting..." : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400 mt-8">
        Secure payment powered by Stripe. Cancel anytime.
      </p>
    </div>
  );
}
