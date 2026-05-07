"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Action = {
  icon: string;
  title: string;
  why: string;
  cta: string;
  href: string;
  color: string;
};

const COLOR_MAP: Record<string, { border: string; bg: string; badge: string; btn: string }> = {
  red: { border: "border-red-200", bg: "bg-red-50", badge: "bg-red-100 text-red-700", btn: "bg-red-600 hover:bg-red-700 text-white" },
  yellow: { border: "border-yellow-200", bg: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-700", btn: "bg-yellow-500 hover:bg-yellow-600 text-white" },
  orange: { border: "border-orange-200", bg: "bg-orange-50", badge: "bg-orange-100 text-orange-700", btn: "bg-orange-500 hover:bg-orange-600 text-white" },
  blue: { border: "border-blue-200", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700", btn: "bg-blue-600 hover:bg-blue-700 text-white" },
  purple: { border: "border-purple-200", bg: "bg-purple-50", badge: "bg-purple-100 text-purple-700", btn: "bg-purple-600 hover:bg-purple-700 text-white" },
  gray: { border: "border-gray-200", bg: "bg-gray-50", badge: "bg-gray-100 text-gray-700", btn: "bg-gray-700 hover:bg-gray-800 text-white" },
};

export default function NextBestAction() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/next-action")
      .then(r => r.json())
      .then(d => { setActions(d.actions ?? []); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-40 mb-4" />
      <div className="space-y-3">
        <div className="h-16 bg-gray-100 rounded-xl" />
        <div className="h-16 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );

  if (actions.length === 0) return null;

  const top = actions[0];
  const rest = actions.slice(1);
  const topColors = COLOR_MAP[top.color] ?? COLOR_MAP.blue;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Best Actions</h2>
      <div className="space-y-3">
        {/* Top priority — expanded */}
        <div className={`rounded-2xl border-2 ${topColors.border} ${topColors.bg} p-5`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl flex-shrink-0 mt-0.5">{top.icon}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900">{top.title}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${topColors.badge}`}>#1 Priority</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{top.why}</p>
                <Link href={top.href}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${topColors.btn}`}>
                  {top.cta} →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Other actions — compact */}
        {rest.map((action, i) => {
          const c = COLOR_MAP[action.color] ?? COLOR_MAP.blue;
          return (
            <div key={i} className={`rounded-2xl border ${c.border} bg-white p-4 flex items-center gap-3`}>
              <span className="text-xl flex-shrink-0">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{action.title}</p>
                <p className="text-xs text-gray-500 truncate">{action.why}</p>
              </div>
              <Link href={action.href}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${c.btn}`}>
                {action.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
