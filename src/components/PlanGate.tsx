"use client";

import Link from "next/link";
import { canAccess } from "@/lib/plans";

const PLAN_LABEL: Record<string, string> = {
  STARTER: "Starter ($49/mo)",
  GROWTH: "Growth ($99/mo)",
  PRO: "Pro ($199/mo)",
};

const PLAN_COLOR: Record<string, { bg: string; border: string; badge: string; btn: string }> = {
  STARTER: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", btn: "bg-blue-600 hover:bg-blue-700 text-white" },
  GROWTH: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700", btn: "bg-purple-600 hover:bg-purple-700 text-white" },
  PRO: { bg: "bg-gray-900", border: "border-gray-700", badge: "bg-yellow-100 text-yellow-800", btn: "bg-yellow-500 hover:bg-yellow-600 text-gray-900" },
};

interface PlanGateProps {
  userPlan: string;
  requiredPlan: string;
  featureName: string;
  children: React.ReactNode;
}

export default function PlanGate({ userPlan, requiredPlan, featureName, children }: PlanGateProps) {
  if (canAccess(userPlan, requiredPlan)) return <>{children}</>;

  const colors = PLAN_COLOR[requiredPlan] ?? PLAN_COLOR.GROWTH;

  return (
    <div className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-10 text-center`}>
      <div className="text-4xl mb-4">🔒</div>
      <p className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3 ${colors.badge}`}>
        Requires {PLAN_LABEL[requiredPlan]}
      </p>
      <h2 className={`text-xl font-bold mb-2 ${requiredPlan === "PRO" ? "text-white" : "text-gray-900"}`}>
        {featureName}
      </h2>
      <p className={`text-sm mb-6 max-w-md mx-auto ${requiredPlan === "PRO" ? "text-gray-400" : "text-gray-500"}`}>
        Upgrade to {PLAN_LABEL[requiredPlan]} to unlock {featureName.toLowerCase()} and all features in this plan.
      </p>
      <Link href="/dashboard/billing"
        className={`inline-block px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${colors.btn}`}>
        Upgrade Now →
      </Link>
    </div>
  );
}
