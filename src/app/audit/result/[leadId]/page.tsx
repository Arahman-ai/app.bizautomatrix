"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Issue = { title: string; impact: "Critical" | "High" | "Medium"; fix: string };
type Result = {
  businessName: string;
  city: string | null;
  industry: string | null;
  score: number;
  grade: string;
  label: string;
  issues: Issue[];
  wins: string[];
};

const IMPACT_COLOR: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const IMPACT_BAR: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-400",
  Medium: "bg-yellow-400",
};

function ScoreDial({ score }: { score: number }) {
  const color = score >= 70 ? "#16a34a" : score >= 50 ? "#d97706" : score >= 30 ? "#ea580c" : "#dc2626";
  const r = 70, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="168" height="168" viewBox="0 0 168 168">
      <circle cx="84" cy="84" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle cx="84" cy="84" r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 84 84)" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="84" y="80" textAnchor="middle" fontSize="36" fontWeight="bold" fill={color}>{score}</text>
      <text x="84" y="102" textAnchor="middle" fontSize="14" fill="#9ca3af">out of 100</text>
    </svg>
  );
}

export default function AuditResultPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leadId) return;
    fetch(`/api/audit/result/${leadId}`)
      .then(r => r.json())
      .then(d => { setResult(d); setLoading(false); });
  }, [leadId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🔍</div>
        <p className="text-gray-600 font-medium">Calculating your visibility score...</p>
      </div>
    </div>
  );

  if (!result) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Result not found.</p>
    </div>
  );

  const scoreColor = result.score >= 70 ? "text-green-600" : result.score >= 50 ? "text-yellow-600" : result.score >= 30 ? "text-orange-600" : "text-red-600";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-3">Free Business Audit</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{result.businessName}</h1>
          {result.city && <p className="text-blue-200">{result.city}{result.industry ? ` · ${result.industry}` : ""}</p>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Score card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">Your Visibility Score</p>
          <div className="flex justify-center mb-4">
            <ScoreDial score={result.score} />
          </div>
          <p className={`text-2xl font-bold ${scoreColor} mb-2`}>{result.label}</p>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            This score reflects your current online visibility based on the information you provided. The full audit will reveal more specific issues.
          </p>
          {result.wins.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {result.wins.map(w => (
                <span key={w} className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">✓ {w}</span>
              ))}
            </div>
          )}
        </div>

        {/* Issues */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
            <h2 className="font-bold text-gray-900">What&apos;s Costing You Customers</h2>
            <p className="text-sm text-gray-500 mt-0.5">{result.issues.length} issues found that are hurting your Google ranking</p>
          </div>
          <div className="divide-y divide-gray-50">
            {result.issues.map((issue, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex-shrink-0 text-xs font-semibold px-2 py-1 rounded border ${IMPACT_COLOR[issue.impact]}`}>
                    {issue.impact}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{issue.title}</p>
                    <p className="text-sm text-gray-600">{issue.fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How BizAutomatrix fixes it */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-xl mb-4">How BizAutomatrix Fixes This</h2>
          <div className="space-y-3">
            {[
              { icon: "📍", fix: "Claim & fully optimize your Google Business Profile — biggest single ranking factor" },
              { icon: "⭐", fix: "Automated review requests sent to every customer — 20+ new reviews within 30 days" },
              { icon: "📋", fix: "Build citations on 30+ directories with consistent NAP data" },
              { icon: "📈", fix: "Weekly rank tracking — you see exactly where you improve each week" },
              { icon: "📄", fix: "Monthly reports showing your rank movement, review growth, and citation progress" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <p className="text-blue-100 text-sm">{item.fix}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Realistic Timeline</h2>
          <div className="space-y-3">
            {[
              { time: "Week 1–2", result: "GBP fully optimized, review requests live, citations started" },
              { time: "Month 1", result: "10–20 new Google reviews, GBP complete, measurable rank movement begins" },
              { time: "Month 2", result: "Appear in top 10 for your target keywords" },
              { time: "Month 3", result: "Top 5 for primary keywords, consistent review flow, more calls and walk-ins" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-24 flex-shrink-0 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg px-2 py-1.5 text-center">{item.time}</div>
                <p className="text-sm text-gray-700 flex items-center">{item.result}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 text-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-xl font-bold mb-2">Ready to Fix This?</p>
          <p className="text-gray-400 text-sm mb-6">Our team will review your full audit and contact you within 24 hours with a personalized plan.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:info@bizautomatrix.com"
              className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Talk to Our Team →
            </a>
            <Link href="/#pricing"
              className="bg-gray-700 text-white font-semibold px-8 py-3 rounded-xl hover:bg-gray-600 transition-colors">
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
