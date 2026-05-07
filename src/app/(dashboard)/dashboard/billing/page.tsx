"use client";

import { useState, useEffect } from "react";

const PLANS = [
  {
    key: "FREE",
    name: "Free",
    price: 0,
    features: [
      "Dashboard & settings access",
      "No review requests",
      "No SEO tools",
    ],
  },
  {
    key: "STARTER",
    name: "Starter",
    price: 49,
    features: [
      "100 review requests / month",
      "GBP audit & optimization checklist",
      "SEO task checklist",
      "Monthly performance report",
      "Next Best Action widget",
      "Email support",
    ],
  },
  {
    key: "GROWTH",
    name: "Growth",
    price: 99,
    highlight: true,
    features: [
      "500 review requests / month",
      "Everything in Starter",
      "Rank tracker (Maps & website)",
      "Citation tracker (30+ directories)",
      "Competitor analysis",
      "Site audit & PageSpeed scores",
      "Full SEO report",
      "AI social media drafts",
      "Priority support",
    ],
  },
  {
    key: "PRO",
    name: "Pro",
    price: 199,
    features: [
      "Unlimited review requests",
      "Everything in Growth",
      "Dedicated account manager",
      "Monthly strategy call",
      "White-label PDF reports",
      "Multi-location support",
    ],
  },
];

type BillingInfo = {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  portalUrl: string | null;
};

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/client/billing")
      .then((r) => r.json())
      .then((d) => { setBilling(d); setFetching(false); });
  }, []);

  async function handleUpgrade(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const currentPlan = billing?.plan ?? "FREE";
  const isActive = billing?.status === "ACTIVE";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plan</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and payment details.</p>
      </div>

      {/* Current plan banner */}
      {!fetching && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Plan</p>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-gray-900">{currentPlan}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {billing?.status ?? "FREE"}
              </span>
            </div>
            {billing?.currentPeriodEnd && (
              <p className="text-xs text-gray-400 mt-1">
                Renews {new Date(billing.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          {billing?.portalUrl && (
            <a
              href={billing.portalUrl}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Manage Subscription →
            </a>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          return (
            <div
              key={plan.key}
              className={`bg-white rounded-2xl border p-6 flex flex-col ${
                plan.highlight && !isCurrent ? "border-blue-500 shadow-lg" : isCurrent ? "border-green-400 shadow-md" : "border-gray-200"
              }`}
            >
              {isCurrent && (
                <div className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full w-fit mb-4">
                  Current Plan
                </div>
              )}
              {plan.highlight && !isCurrent && (
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-4">
                  Most Popular
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <div className="mt-2 mb-6">
                {plan.price === 0 ? (
                  <span className="text-4xl font-bold text-gray-900">Free</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </>
                )}
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
                onClick={() => plan.price > 0 && handleUpgrade(plan.key)}
                disabled={loading === plan.key || isCurrent || plan.price === 0}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                  isCurrent || plan.price === 0
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                } disabled:opacity-50`}
              >
                {loading === plan.key ? "Redirecting..." : isCurrent ? "Current Plan" : plan.price === 0 ? "Free Plan" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Full Feature Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500 w-1/3">Feature</th>
                {["Free", "Starter", "Growth", "Pro"].map(p => (
                  <th key={p} className={`px-4 py-3 text-center font-semibold ${p === "Growth" ? "text-blue-600" : "text-gray-700"}`}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ["Dashboard + Settings",     "✓", "✓",       "✓",       "✓"],
                ["Review Requests",          "—", "100/mo",  "500/mo",  "Unlimited"],
                ["GBP Audit",                "—", "✓",       "✓",       "✓"],
                ["SEO Task Checklist",       "—", "✓",       "✓",       "✓"],
                ["Monthly Report",           "—", "✓",       "✓",       "✓"],
                ["Next Best Action",         "—", "✓",       "✓",       "✓"],
                ["Rank Tracker",             "—", "—",       "✓",       "✓"],
                ["Citation Tracker",         "—", "—",       "✓",       "✓"],
                ["Competitor Analysis",      "—", "—",       "✓",       "✓"],
                ["Site Audit (PageSpeed)",   "—", "—",       "✓",       "✓"],
                ["SEO Report",               "—", "—",       "✓",       "✓"],
                ["Social Media Drafts",      "—", "—",       "✓",       "✓"],
                ["Dedicated Manager",        "—", "—",       "—",       "✓"],
                ["Monthly Strategy Call",    "—", "—",       "—",       "✓"],
              ].map(([feature, ...vals]) => (
                <tr key={feature} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-700">{feature}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`px-4 py-3 text-center ${v === "✓" ? "text-green-600 font-bold" : v === "—" ? "text-gray-300" : "text-blue-600 font-semibold"}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mt-8">
        Secure payment powered by Stripe. Cancel anytime.
      </p>
    </div>
  );
}
