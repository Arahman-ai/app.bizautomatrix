"use client";

import { useEffect, useState } from "react";

type GbpAudit = {
  hasClaimed: boolean; hasCorrectName: boolean; hasCategory: boolean; hasDescription: boolean;
  hasPhotos: boolean; hasHours: boolean; hasPosts: boolean; hasServices: boolean;
  hasWebsite: boolean; hasPhone: boolean; reviewCount: number | null; rating: number | null;
  score: number | null; notes: string | null;
};

const CHECKS: { key: keyof GbpAudit; label: string; tip: string }[] = [
  { key: "hasClaimed", label: "Profile claimed & verified", tip: "Claim your profile at business.google.com" },
  { key: "hasCorrectName", label: "Business name is correct", tip: "Ensure name matches your signage exactly" },
  { key: "hasCategory", label: "Correct category set", tip: "Choose the most specific category for your business" },
  { key: "hasDescription", label: "Keyword-rich description", tip: "Include your main services and city in description" },
  { key: "hasPhotos", label: "10+ photos uploaded", tip: "Add storefront, products, team, and interior photos" },
  { key: "hasHours", label: "Business hours complete", tip: "Set hours for all days including holidays" },
  { key: "hasPosts", label: "Regular GBP posts", tip: "Post updates, offers, and news weekly" },
  { key: "hasServices", label: "Services list added", tip: "List every service you offer with descriptions" },
  { key: "hasWebsite", label: "Website linked", tip: "Link your business website to your profile" },
  { key: "hasPhone", label: "Phone number added", tip: "Add a local phone number for better trust" },
];

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const r = 52, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 64 64)" />
      <text x="64" y="62" textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>{score}</text>
      <text x="64" y="80" textAnchor="middle" fontSize="12" fill="#9ca3af">/ 100</text>
    </svg>
  );
}

export default function ClientGbpAudit() {
  const [audit, setAudit] = useState<GbpAudit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/gbp-audit")
      .then(r => r.json())
      .then(d => { setAudit(d.audit); setLoading(false); });
  }, []);

  if (loading) return <div className="text-gray-400 text-sm p-4">Loading...</div>;

  const score = audit?.score ?? 0;
  const done = audit ? CHECKS.filter(c => audit[c.key]).length : 0;
  const total = CHECKS.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Google Business Profile Audit</h1>
        <p className="text-gray-500 mt-1">How well your Google profile is optimized</p>
      </div>

      {!audit ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
          <p className="text-3xl mb-2">📍</p>
          <p className="font-medium text-gray-600">Audit not run yet</p>
          <p className="text-sm mt-1">Your BizAutomatrix team will complete this soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center gap-4">
            <ScoreRing score={score} />
            <div className="text-center">
              <p className={`text-lg font-bold ${score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                {score >= 80 ? "Well Optimized" : score >= 50 ? "Needs Improvement" : "Critical Issues"}
              </p>
              <p className="text-sm text-gray-500 mt-1">{done} of {total} items complete</p>
            </div>
            {audit.reviewCount !== null && (
              <div className="w-full grid grid-cols-2 gap-2 text-center text-sm border-t border-gray-100 pt-4">
                <div>
                  <p className="text-gray-500 text-xs">Reviews</p>
                  <p className="font-bold text-gray-900">{audit.reviewCount}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Rating</p>
                  <p className="font-bold text-gray-900">{audit.rating ? `⭐ ${audit.rating}` : "—"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Optimization Checklist</h2>
            <div className="space-y-3">
              {CHECKS.map(c => {
                const done = Boolean(audit[c.key]);
                return (
                  <div key={c.key} className={`flex items-start gap-3 p-3 rounded-xl ${done ? "bg-green-50" : "bg-red-50"}`}>
                    <span className={`mt-0.5 text-lg flex-shrink-0 ${done ? "text-green-500" : "text-red-400"}`}>
                      {done ? "✓" : "✗"}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${done ? "text-green-800" : "text-red-800"}`}>{c.label}</p>
                      {!done && <p className="text-xs text-red-600 mt-0.5">{c.tip}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            {audit.notes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs font-medium text-blue-700 mb-1">Notes from your team</p>
                <p className="text-sm text-blue-800">{audit.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
