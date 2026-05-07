"use client";

import { useEffect, useState } from "react";

type Client = { id: string; businessName: string };
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
    </span>
  );
}

function MiniChart({ entries, field }: { entries: RankEntry[]; field: "mapRank" | "websiteRank" }) {
  const vals = entries.map(e => e[field]).filter((v): v is number => v !== null);
  if (vals.length < 2) return <span className="text-gray-400 text-xs">Not enough data</span>;

  const max = Math.max(...vals) + 2;
  const w = 160, h = 48;
  const pts = entries
    .filter(e => e[field] !== null)
    .map((e, i, arr) => {
      const x = (i / (arr.length - 1)) * w;
      const y = ((e[field] as number) / max) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
      {entries.filter(e => e[field] !== null).map((e, i, arr) => {
        const x = (i / (arr.length - 1)) * w;
        const y = ((e[field] as number) / max) * h;
        return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />;
      })}
    </svg>
  );
}

export default function AdminRankTracker() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ keyword: "", mapRank: "", websiteRank: "", recordedAt: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/rank-tracker").then(r => r.json()).then(d => setClients(d.clients ?? []));
  }, []);

  useEffect(() => {
    if (!selectedClient) { setEntries([]); return; }
    setLoading(true);
    fetch(`/api/admin/rank-tracker?clientId=${selectedClient}`)
      .then(r => r.json())
      .then(d => { setEntries(d.entries ?? []); setLoading(false); });
  }, [selectedClient]);

  async function addEntry() {
    if (!selectedClient || !form.keyword.trim()) return;
    setSaving(true);
    await fetch("/api/admin/rank-tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient, ...form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setForm(f => ({ ...f, keyword: "", mapRank: "", websiteRank: "" }));
    const d = await (await fetch(`/api/admin/rank-tracker?clientId=${selectedClient}`)).json();
    setEntries(d.entries ?? []);
  }

  async function deleteEntry(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/admin/rank-tracker?id=${id}`, { method: "DELETE" });
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  // Group entries by keyword
  const keywords = [...new Set(entries.map(e => e.keyword))];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Rank Tracker</h1>
        <p className="text-gray-500 mt-1">Track Google Maps &amp; website rankings per client</p>
      </div>

      {/* Client selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">Select Client</label>
        <select
          value={selectedClient}
          onChange={e => setSelectedClient(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
        </select>
      </div>

      {selectedClient && (
        <>
          {/* Add entry form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Add Rank Entry</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. restaurant Atlanta"
                  value={form.keyword}
                  onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Google Maps Rank</label>
                <input
                  type="number" min={1} placeholder="#"
                  value={form.mapRank}
                  onChange={e => setForm(f => ({ ...f, mapRank: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Website Rank</label>
                <input
                  type="number" min={1} placeholder="#"
                  value={form.websiteRank}
                  onChange={e => setForm(f => ({ ...f, websiteRank: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
                <input
                  type="date"
                  value={form.recordedAt}
                  onChange={e => setForm(f => ({ ...f, recordedAt: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end gap-3">
                <button
                  onClick={addEntry}
                  disabled={saving || !form.keyword.trim()}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : "Add Entry"}
                </button>
                {saved && <span className="text-green-600 text-sm font-medium">✓ Saved!</span>}
              </div>
            </div>
          </div>

          {/* Charts per keyword */}
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : keywords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
              <p className="text-3xl mb-2">📊</p>
              <p className="font-medium text-gray-600">No rank data yet</p>
              <p className="text-sm mt-1">Add the first entry above.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {keywords.map(kw => {
                const kwEntries = entries.filter(e => e.keyword === kw).sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
                const latest = kwEntries[kwEntries.length - 1];
                const prev = kwEntries[kwEntries.length - 2] ?? null;

                return (
                  <div key={kw} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">🔍 {kw}</h3>
                      <span className="text-xs text-gray-400">{kwEntries.length} entries</span>
                    </div>

                    {/* Current + change cards */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs font-medium text-blue-600 mb-1">📍 Google Maps Rank</p>
                        <div className="text-2xl font-bold text-blue-700">
                          <RankBadge rank={latest?.mapRank ?? null} prev={prev?.mapRank ?? null} />
                        </div>
                        {prev?.mapRank !== null && prev?.mapRank !== undefined && (
                          <p className="text-xs text-blue-400 mt-1">Last: #{prev.mapRank}</p>
                        )}
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4">
                        <p className="text-xs font-medium text-purple-600 mb-1">🌐 Website Rank</p>
                        <div className="text-2xl font-bold text-purple-700">
                          <RankBadge rank={latest?.websiteRank ?? null} prev={prev?.websiteRank ?? null} />
                        </div>
                        {prev?.websiteRank !== null && prev?.websiteRank !== undefined && (
                          <p className="text-xs text-purple-400 mt-1">Last: #{prev.websiteRank}</p>
                        )}
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Maps rank over time <span className="text-gray-400">(lower = better)</span></p>
                        <MiniChart entries={kwEntries} field="mapRank" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Website rank over time <span className="text-gray-400">(lower = better)</span></p>
                        <MiniChart entries={kwEntries} field="websiteRank" />
                      </div>
                    </div>

                    {/* History table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                            <th className="text-left py-2">Date</th>
                            <th className="text-left py-2">Maps Rank</th>
                            <th className="text-left py-2">Website Rank</th>
                            <th className="py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...kwEntries].reverse().map((e, i, arr) => {
                            const prevEntry = arr[i + 1] ?? null;
                            return (
                              <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="py-2 text-gray-600">{new Date(e.recordedAt).toLocaleDateString()}</td>
                                <td className="py-2"><RankBadge rank={e.mapRank} prev={prevEntry?.mapRank ?? null} /></td>
                                <td className="py-2"><RankBadge rank={e.websiteRank} prev={prevEntry?.websiteRank ?? null} /></td>
                                <td className="py-2 text-right">
                                  <button onClick={() => deleteEntry(e.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors">✕</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
