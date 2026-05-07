"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PlanGate from "@/components/PlanGate";
import { usePlan } from "@/hooks/usePlan";

type Competitor = { id: string; name: string; website: string | null; mapRank: number | null; websiteRank: number | null; reviewCount: number | null; rating: number | null; notes: string | null };

function RankCell({ rank }: { rank: number | null }) {
  if (rank === null) return <span className="text-gray-300">—</span>;
  const color = rank <= 3 ? "text-green-600" : rank <= 10 ? "text-yellow-600" : "text-red-500";
  return <span className={`font-bold ${color}`}>#{rank}</span>;
}

export default function ClientCompetitors() {
  const plan = usePlan();
  const { data: session } = useSession();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/competitors")
      .then(r => r.json())
      .then(d => { setCompetitors(d.competitors ?? []); setLoading(false); });
    if (session?.user?.name) setBusinessName(session.user.name);
  }, [session]);

  if (plan === null || loading) return <div className="text-gray-400 text-sm p-4">Loading...</div>;

  return (
    <PlanGate userPlan={plan} requiredPlan="GROWTH" featureName="Competitor Analysis">
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
        <p className="text-gray-500 mt-1">How you compare against local competitors</p>
      </div>

      {competitors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
          <p className="text-3xl mb-2">🏆</p>
          <p className="font-medium text-gray-600">No competitor data yet</p>
          <p className="text-sm mt-1">Your BizAutomatrix team will analyze your competitors soon.</p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-sm text-blue-800">
            <strong>How to read this:</strong> Lower rank number = better position. #1 is the top result. Green = top 3, Yellow = top 10, Red = outside top 10.
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3">Business</th>
                  <th className="text-center px-4 py-3">Maps Rank</th>
                  <th className="text-center px-4 py-3">Web Rank</th>
                  <th className="text-center px-4 py-3">Reviews</th>
                  <th className="text-center px-4 py-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 bg-blue-50">
                  <td className="px-5 py-3 font-semibold text-blue-700">
                    {businessName || "Your Business"} <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">YOU</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400">—</td>
                  <td className="px-4 py-3 text-center text-gray-400">—</td>
                  <td className="px-4 py-3 text-center text-gray-400">—</td>
                  <td className="px-4 py-3 text-center text-gray-400">—</td>
                </tr>
                {competitors.sort((a, b) => (a.mapRank ?? 999) - (b.mapRank ?? 999)).map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{c.name}</p>
                      {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">{c.website}</a>}
                    </td>
                    <td className="px-4 py-3 text-center"><RankCell rank={c.mapRank} /></td>
                    <td className="px-4 py-3 text-center"><RankCell rank={c.websiteRank} /></td>
                    <td className="px-4 py-3 text-center text-gray-700">{c.reviewCount ?? "—"}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{c.rating ? `⭐ ${c.rating}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {competitors.some(c => c.notes) && (
            <div className="mt-4 space-y-2">
              {competitors.filter(c => c.notes).map(c => (
                <div key={c.id} className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-sm">
                  <span className="font-medium text-yellow-800">{c.name}:</span> <span className="text-yellow-700">{c.notes}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
    </PlanGate>
  );
}
