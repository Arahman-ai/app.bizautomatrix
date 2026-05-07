"use client";

import { useEffect, useState } from "react";

type RankEntry = {
  id: string;
  keyword: string;
  mapRank: number | null;
  websiteRank: number | null;
  recordedAt: string;
};

function RankBadge({ rank, prev }: { rank: number | null; prev: number | null }) {
  if (rank === null) return <span className="text-gray-400">—</span>;
  const diff = prev !== null ? prev - rank : null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-semibold text-gray-900">#{rank}</span>
      {diff !== null && diff !== 0 && (
        <span className={`text-xs font-medium ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
          {diff > 0 ? `▲${diff}` : `▼${Math.abs(diff)}`}
        </span>
      )}
      {diff === 0 && <span className="text-xs text-gray-400">→</span>}
    </span>
  );
}

function LineChart({ entries, field, color }: { entries: RankEntry[]; field: "mapRank" | "websiteRank"; color: string }) {
  const valid = entries.filter(e => e[field] !== null);
  if (valid.length < 2) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
        Not enough data yet
      </div>
    );
  }

  const vals = valid.map(e => e[field] as number);
  const maxVal = Math.max(...vals) + 2;
  const minVal = Math.max(1, Math.min(...vals) - 2);
  const w = 300, h = 80;

  const toX = (i: number) => (i / (valid.length - 1)) * w;
  const toY = (v: number) => ((v - minVal) / (maxVal - minVal)) * h;

  const pts = valid.map((e, i) => `${toX(i)},${toY(e[field] as number)}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h + 20} viewBox={`0 0 ${w} ${h + 20}`} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1="0" y1={toY(minVal + t * (maxVal - minVal))} x2={w} y2={toY(minVal + t * (maxVal - minVal))}
            stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {/* Line */}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots + labels */}
        {valid.map((e, i) => {
          const x = toX(i);
          const y = toY(e[field] as number);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill={color} />
              <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#6b7280">
                #{e[field]}
              </text>
            </g>
          );
        })}
        {/* X-axis dates */}
        {valid.map((e, i) => (
          <text key={i} x={toX(i)} y={h + 16} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {new Date(e.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function RankTrackerPage() {
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/rank-tracker")
      .then(r => r.json())
      .then(d => { setEntries(d.entries ?? []); setLoading(false); });
  }, []);

  const keywords = [...new Set(entries.map(e => e.keyword))];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Rank Tracker</h1>
        <p className="text-gray-500 mt-1">Your Google Maps &amp; website position over time</p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : keywords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold text-gray-700">No ranking data yet</p>
          <p className="text-sm text-gray-400 mt-2">Your rankings will appear here once we start tracking. We update this weekly.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {keywords.map(kw => {
            const kwEntries = entries
              .filter(e => e.keyword === kw)
              .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
            const latest = kwEntries[kwEntries.length - 1];
            const prev = kwEntries.length >= 2 ? kwEntries[kwEntries.length - 2] : null;

            return (
              <div key={kw} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-lg">🔍</span>
                  <h2 className="font-semibold text-gray-900">{kw}</h2>
                  <span className="text-xs text-gray-400 ml-auto">Updated {new Date(latest.recordedAt).toLocaleDateString()}</span>
                </div>

                {/* Current rank cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-blue-600 mb-1">📍 Google Maps</p>
                    <div className="text-3xl font-bold text-blue-700 mb-1">
                      <RankBadge rank={latest.mapRank} prev={prev?.mapRank ?? null} />
                    </div>
                    <p className="text-xs text-blue-400">
                      {prev?.mapRank != null
                        ? prev.mapRank === latest.mapRank
                          ? "No change from last entry"
                          : prev.mapRank > (latest.mapRank ?? 0)
                            ? `Improved from #${prev.mapRank}`
                            : `Down from #${prev.mapRank}`
                        : "First entry"}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-purple-600 mb-1">🌐 Website</p>
                    <div className="text-3xl font-bold text-purple-700 mb-1">
                      <RankBadge rank={latest.websiteRank} prev={prev?.websiteRank ?? null} />
                    </div>
                    <p className="text-xs text-purple-400">
                      {prev?.websiteRank != null
                        ? prev.websiteRank === latest.websiteRank
                          ? "No change from last entry"
                          : prev.websiteRank > (latest.websiteRank ?? 0)
                            ? `Improved from #${prev.websiteRank}`
                            : `Down from #${prev.websiteRank}`
                        : "First entry"}
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-3">Google Maps rank over time</p>
                    <LineChart entries={kwEntries} field="mapRank" color="#3b82f6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-3">Website rank over time</p>
                    <LineChart entries={kwEntries} field="websiteRank" color="#8b5cf6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
