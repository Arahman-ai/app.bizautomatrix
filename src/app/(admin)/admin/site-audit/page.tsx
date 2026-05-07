"use client";

import { useEffect, useState } from "react";

type Client = { id: string; businessName: string };
type NapData = { businessName: string; address: string | null; phone: string | null; website: string | null; napConsistent: boolean; napNotes: string | null };
type PageSpeedResult = { id: string; url: string; mobileScore: number | null; desktopScore: number | null; fcp: number | null; lcp: number | null; cls: number | null; tbt: number | null; recordedAt: string };

function ScoreBar({ score, label }: { score: number | null; label: string }) {
  if (score === null) return null;
  const color = score >= 90 ? "bg-green-500" : score >= 50 ? "bg-yellow-400" : "bg-red-500";
  const textColor = score >= 90 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  return (
    <div>
      <div className="flex justify-between mb-1 text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-bold ${textColor}`}>{score}/100</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function AdminSiteAudit() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [nap, setNap] = useState<NapData | null>(null);
  const [napNotes, setNapNotes] = useState("");
  const [napConsistent, setNapConsistent] = useState(false);
  const [napSaving, setNapSaving] = useState(false);
  const [napSaved, setNapSaved] = useState(false);
  const [psResults, setPsResults] = useState<PageSpeedResult[]>([]);
  const [psUrl, setPsUrl] = useState("");
  const [psLoading, setPsLoading] = useState(false);
  const [psError, setPsError] = useState("");

  useEffect(() => {
    fetch("/api/admin/nap-check").then(r => r.json()).then(d => setClients(d.clients ?? []));
  }, []);

  useEffect(() => {
    if (!selectedClient) { setNap(null); setPsResults([]); return; }
    fetch(`/api/admin/nap-check?clientId=${selectedClient}`)
      .then(r => r.json()).then(d => {
        if (d.client) { setNap(d.client); setNapNotes(d.client.napNotes ?? ""); setNapConsistent(d.client.napConsistent); setPsUrl(d.client.website ?? ""); }
      });
    fetch(`/api/admin/pagespeed?clientId=${selectedClient}`)
      .then(r => r.json()).then(d => setPsResults(d.results ?? []));
  }, [selectedClient]);

  async function saveNap() {
    setNapSaving(true);
    await fetch("/api/admin/nap-check", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient, napConsistent, napNotes }),
    });
    setNapSaving(false);
    setNapSaved(true);
    setTimeout(() => setNapSaved(false), 2000);
  }

  async function runPageSpeed() {
    if (!psUrl.trim()) return;
    setPsLoading(true);
    setPsError("");
    const res = await fetch("/api/admin/pagespeed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient, url: psUrl.trim() }),
    });
    const d = await res.json();
    if (d.error) { setPsError(d.error); }
    else {
      const updated = await (await fetch(`/api/admin/pagespeed?clientId=${selectedClient}`)).json();
      setPsResults(updated.results ?? []);
    }
    setPsLoading(false);
  }

  const latestPs = psResults[0] ?? null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Site Audit</h1>
        <p className="text-gray-500 mt-1">NAP consistency check + PageSpeed performance scores</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">Select Client</label>
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Choose a client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
        </select>
      </div>

      {selectedClient && nap && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NAP Check */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">NAP Consistency</h2>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${napConsistent ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {napConsistent ? "✓ Consistent" : "✗ Inconsistent"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Name, Address & Phone must match exactly across all directories.</p>
            <div className="space-y-3 mb-5">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Name</p>
                <p className="text-sm text-gray-800 font-medium">{nap.businessName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Address</p>
                <p className="text-sm text-gray-800">{nap.address || "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Phone</p>
                <p className="text-sm text-gray-800">{nap.phone || "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Website</p>
                <p className="text-sm text-gray-800">{nap.website || "—"}</p>
              </div>
            </div>
            <label className="flex items-center gap-3 mb-3 cursor-pointer">
              <input type="checkbox" checked={napConsistent} onChange={e => setNapConsistent(e.target.checked)} className="w-4 h-4 rounded text-green-600" />
              <span className="text-sm text-gray-700">Mark NAP as consistent across all directories</span>
            </label>
            <textarea rows={2} placeholder="Notes about NAP issues..." value={napNotes}
              onChange={e => setNapNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3" />
            <div className="flex items-center gap-3">
              <button onClick={saveNap} disabled={napSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {napSaving ? "Saving..." : "Save"}
              </button>
              {napSaved && <span className="text-green-600 text-sm">✓ Saved!</span>}
            </div>
          </div>

          {/* PageSpeed */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">PageSpeed Score</h2>
            <div className="flex gap-2 mb-4">
              <input type="url" placeholder="https://..." value={psUrl}
                onChange={e => setPsUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={runPageSpeed} disabled={psLoading || !psUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap">
                {psLoading ? "Running..." : "Run Test"}
              </button>
            </div>
            {psError && <p className="text-red-500 text-sm mb-3">{psError}</p>}

            {latestPs ? (
              <div>
                <div className="space-y-3 mb-4">
                  <ScoreBar score={latestPs.mobileScore} label="Mobile Score" />
                  <ScoreBar score={latestPs.desktopScore} label="Desktop Score" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {latestPs.fcp !== null && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">First Contentful Paint</p>
                      <p className="font-semibold text-gray-800">{latestPs.fcp.toFixed(1)}s</p>
                    </div>
                  )}
                  {latestPs.lcp !== null && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Largest Contentful Paint</p>
                      <p className="font-semibold text-gray-800">{latestPs.lcp.toFixed(1)}s</p>
                    </div>
                  )}
                  {latestPs.cls !== null && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Layout Shift (CLS)</p>
                      <p className="font-semibold text-gray-800">{latestPs.cls.toFixed(3)}</p>
                    </div>
                  )}
                  {latestPs.tbt !== null && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Blocking Time (TBT)</p>
                      <p className="font-semibold text-gray-800">{Math.round(latestPs.tbt)}ms</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3">Last tested: {new Date(latestPs.recordedAt).toLocaleString()}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">⚡</p>
                <p className="text-sm">Run a test to see scores</p>
              </div>
            )}

            {psResults.length > 1 && (
              <div className="mt-4 border-t border-gray-100 pt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">History</p>
                <div className="space-y-1">
                  {psResults.slice(1).map(r => (
                    <div key={r.id} className="flex justify-between text-xs text-gray-500">
                      <span>{new Date(r.recordedAt).toLocaleDateString()}</span>
                      <span>📱 {r.mobileScore ?? "—"} &nbsp; 🖥 {r.desktopScore ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
