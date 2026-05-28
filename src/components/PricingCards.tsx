"use client";

import { useRouter } from "next/navigation";

const PLANS = [
  {
    name: "Free Audit",
    price: 0,
    priceLabel: "No Cost",
    period: "first step",
    plan: "FREE",
    desc: "Find the best first upgrade before paying.",
    features: [
      "Website + SEO review",
      "Quote/contact flow check",
      "Review automation opportunity",
      "Top 5 quick wins",
    ],
    cta: "Request Free Audit",
    highlight: false,
  },
  {
    name: "BD Starter",
    price: 250,
    priceLabel: "Custom Quote",
    period: "after audit",
    plan: "STARTER",
    desc: "7-day implementation sprint scoped after audit.",
    features: [
      "SEO task setup",
      "Quote or WhatsApp inquiry flow",
      "Review link and QR setup",
      "Audit report and roadmap",
      "Dashboard setup",
      "Email/WhatsApp support",
    ],
    cta: "Book Demo Call",
    highlight: false,
  },
  {
    name: "US Starter",
    price: 500,
    priceLabel: "Custom Quote",
    period: "after audit",
    plan: "GROWTH",
    desc: "7-day implementation sprint scoped after audit.",
    features: [
      "Website and conversion fixes",
      "SEO and PageSpeed task plan",
      "Review request workflow",
      "Lead tracking dashboard",
      "PDF audit report",
      "Monthly support option",
    ],
    cta: "Book Demo Call",
    highlight: true,
  },
  {
    name: "Monthly Support",
    price: 150,
    priceLabel: "Call Us",
    period: "after setup",
    plan: "PRO",
    desc: "Ongoing SEO, reviews, reports, and automation support.",
    features: [
      "Monthly SEO report",
      "Review management",
      "SEO task follow-up",
      "Competitor checks",
      "Dashboard review call",
      "Automation improvement plan",
    ],
    cta: "Call Us for Pricing",
    highlight: false,
  },
];

export default function PricingCards() {
  const router = useRouter();

  const handleCheckout = async (plan: string) => {
    if (plan === "FREE") {
      router.push("/signup");
      return;
    }

    if (plan === "PRO") {
      window.location.href = "tel:+14042037674";
      return;
    }

    window.location.href =
      "mailto:info@bizautomatrix.com?subject=BizAutomatrix starter scope&body=Website:%0ABusiness type:%0AWhich package:%20" +
      encodeURIComponent(plan);
    return;

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
            <span className="text-3xl leading-tight font-bold text-gray-900">{plan.priceLabel}</span>
            <span className="text-gray-500 text-sm">/{plan.period}</span>
          </div>
          <ul className="space-y-2 mb-8 flex-1">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5">OK</span>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout(plan.plan)}
            className={`w-full py-3 rounded-xl font-semibold transition-colors ${
              plan.highlight
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-900 text-white hover:bg-gray-700"
            }`}
          >
            {plan.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
