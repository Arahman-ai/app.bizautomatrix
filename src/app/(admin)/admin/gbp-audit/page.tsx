"use client";

import { useEffect, useState } from "react";

type Client = { id: string; businessName: string };
type GbpAudit = {
  hasClaimed: boolean; hasCorrectName: boolean; hasCategory: boolean; hasDescription: boolean;
  hasPhotos: boolean; hasHours: boolean; hasPosts: boolean; hasServices: boolean;
  hasWebsite: boolean; hasPhone: boolean; reviewCount: number | null; rating: number | null;
  score: number | null; notes: string | null;
};

const CHECKS: { key: keyof GbpAudit; label: string; impact: string }[] = [
  { key: "hasClaimed", label: "Profile is claimed & verified", impact: "Critical" },
  { key: "hasCorrectName", label: "Business name is correct", impact: "High" },
  { key: "hasCategory", label: "Correct primary category set", impact: "High" },
  { key: "hasDescription", label: "Keyword-rich description added", impact: "High" },
  { key: "hasPhotos", label: "10+ photos uploaded", impact: "Medium" },
  { key: "hasHours", label: "Business hours complete", impact: "High" },
  { key: "hasPosts", label: "At least 1 GBP post published", impact: "Medium" },
  { key: "hasServices", label: "Services list added", impact: "Medium" },
  { key: "hasWebsite", label: "Website linked", impact: "Medium" },
  { key: "hasPhone", label: "Phone number added", impact: "High" },
];

const IMPACT_COLOR: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 48 48)" />
      <text x="48" y="53" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>{score}</text>
    </svg>
  );
}

export default function AdminGbpAudit() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [audit, setAudit] = useState<GbpAudit | null>(null);
  const [form, setForm] = useState<Record<string, boolean | string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/gbp-audit").then(r => r.json()).then(d => setClients(d.clients ?? []));
  }, []);

  useEffect(() => {
    if (!selectedClient) { setAudit(null); setForm({}); return; }
    fetch(`/api/admin/gbp-audit?clientId=${selectedClient}`)
      .then(r => r.json())
      .then(d => {
        const a = d.audit ?? {};
        setAudit(a);
        const f: Record<string, boolean | string> = {};
        CHECKS.forEach(c => f[c.key] = a[c.key] ?? false);
        f.reviewCount = a.reviewCount ?? "";
        f.rating = a.rating ?? "";
        f.notes = a.notes ?? "";
        setForm(f);
      });
  }, [selectedClient]);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/gbp-audit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient, ...form }),
    });
    const d = await res.json();
    setAudit(d.audit);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const score = audit?.score ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">GBP Audit</h1>
        <p className="text-gray-500 mt-1">Google Business Profile health check per client</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">Select Client</label>
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Choose a client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
        </select>
      </div>

      {selectedClient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center justify-center gap-3">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">GBP Score</p>
            <ScoreRing score={score} />
            <p className={`text-sm font-medium ${score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
              {score >= 80 ? "Well Optimized" : score >= 50 ? "Needs Improvement" : "Critical Issues"}
            </p>
            <div className="w-full mt-2 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Reviews</span>
                <span className="font-medium">{form.reviewCount || "—"}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Rating</span>
                <span className="font-medium">{form.rating ? `⭐ ${form.rating}` : "—"}</span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Checklist</h2>
            <div className="space-y-3 mb-6">
              {CHECKS.map(c => (
                <label key={c.key} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={Boolean(form[c.key])}
                    onChange={e => setForm(f => ({ ...f, [c.key]: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600" />
                  <span className={`flex-1 text-sm ${form[c.key] ? "line-through text-gray-400" : "text-gray-700"}`}>{c.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${IMPACT_COLOR[c.impact]}`}>{c.impact}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Review Count</label>
                <input type="number" min={0} placeholder="e.g. 45"
                  value={String(form.reviewCount ?? "")}
                  onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Rating (1–5)</label>
                <input type="number" min={1} max={5} step={0.1} placeholder="e.g. 4.3"
                  value={String(form.rating ?? "")}
                  onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
              <textarea rows={2} placeholder="Any notes about this audit..."
                value={String(form.notes ?? "")}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div className="flex items-center gap-3">
              <button onClick={save} disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Save Audit"}
              </button>
              {saved && <span className="text-green-600 text-sm font-medium">✓ Saved!</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
