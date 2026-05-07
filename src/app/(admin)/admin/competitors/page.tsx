"use client";

import { useEffect, useState } from "react";

type Client = { id: string; businessName: string };
type Competitor = { id: string; name: string; website: string | null; mapRank: number | null; websiteRank: number | null; reviewCount: number | null; rating: number | null; notes: string | null };

export default function AdminCompetitors() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientName, setClientName] = useState("");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", website: "", mapRank: "", websiteRank: "", reviewCount: "", rating: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/competitors").then(r => r.json()).then(d => setClients(d.clients ?? []));
  }, []);

  useEffect(() => {
    if (!selectedClient) { setCompetitors([]); return; }
    const client = clients.find(c => c.id === selectedClient);
    setClientName(client?.businessName ?? "");
    setLoading(true);
    fetch(`/api/admin/competitors?clientId=${selectedClient}`)
      .then(r => r.json()).then(d => { setCompetitors(d.competitors ?? []); setLoading(false); });
  }, [selectedClient, clients]);

  async function save() {
    setSaving(true);
    if (editId) {
      await fetch("/api/admin/competitors", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...form }) });
    } else {
      await fetch("/api/admin/competitors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId: selectedClient, ...form }) });
    }
    setForm({ name: "", website: "", mapRank: "", websiteRank: "", reviewCount: "", rating: "", notes: "" });
    setEditId(null);
    const d = await (await fetch(`/api/admin/competitors?clientId=${selectedClient}`)).json();
    setCompetitors(d.competitors ?? []);
    setSaving(false);
  }

  function startEdit(c: Competitor) {
    setEditId(c.id);
    setForm({ name: c.name, website: c.website ?? "", mapRank: c.mapRank?.toString() ?? "", websiteRank: c.websiteRank?.toString() ?? "", reviewCount: c.reviewCount?.toString() ?? "", rating: c.rating?.toString() ?? "", notes: c.notes ?? "" });
  }

  async function deleteComp(id: string) {
    if (!confirm("Delete competitor?")) return;
    await fetch(`/api/admin/competitors?id=${id}`, { method: "DELETE" });
    setCompetitors(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Competitor Tracker</h1>
        <p className="text-gray-500 mt-1">Compare client rankings against competitors</p>
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
        <>
          {/* Add/Edit form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              {editId ? "Edit Competitor" : "Add Competitor"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Name *</label>
                <input type="text" placeholder="Competitor name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Website</label>
                <input type="url" placeholder="https://..." value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Maps Rank</label>
                <input type="number" min={1} placeholder="#" value={form.mapRank}
                  onChange={e => setForm(f => ({ ...f, mapRank: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Web Rank</label>
                <input type="number" min={1} placeholder="#" value={form.websiteRank}
                  onChange={e => setForm(f => ({ ...f, websiteRank: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Review Count</label>
                <input type="number" min={0} placeholder="e.g. 145" value={form.reviewCount}
                  onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Rating</label>
                <input type="number" min={1} max={5} step={0.1} placeholder="e.g. 4.2" value={form.rating}
                  onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
                <input type="text" placeholder="Optional notes" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={save} disabled={saving || !form.name.trim()}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : editId ? "Update" : "Add Competitor"}
              </button>
              {editId && (
                <button onClick={() => { setEditId(null); setForm({ name: "", website: "", mapRank: "", websiteRank: "", reviewCount: "", rating: "", notes: "" }); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Comparison table */}
          {loading ? <p className="text-gray-400 text-sm">Loading...</p> : competitors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
              <p className="text-3xl mb-2">🏆</p>
              <p className="font-medium text-gray-600">No competitors yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3">Business</th>
                    <th className="text-left px-5 py-3">Website</th>
                    <th className="text-center px-4 py-3">Maps #</th>
                    <th className="text-center px-4 py-3">Web #</th>
                    <th className="text-center px-4 py-3">Reviews</th>
                    <th className="text-center px-4 py-3">Rating</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Client row (highlighted) */}
                  <tr className="border-b border-gray-100 bg-blue-50">
                    <td className="px-5 py-3 font-semibold text-blue-700">{clientName} <span className="text-xs font-normal bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded ml-1">YOU</span></td>
                    <td className="px-5 py-3 text-gray-400 text-xs">—</td>
                    <td className="px-4 py-3 text-center text-gray-400">—</td>
                    <td className="px-4 py-3 text-center text-gray-400">—</td>
                    <td className="px-4 py-3 text-center text-gray-400">—</td>
                    <td className="px-4 py-3 text-center text-gray-400">—</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                  {competitors.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                      <td className="px-5 py-3 text-xs max-w-[150px] truncate">
                        {c.website ? <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{c.website}</a> : "—"}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-700">{c.mapRank ? `#${c.mapRank}` : "—"}</td>
                      <td className="px-4 py-3 text-center font-medium text-gray-700">{c.websiteRank ? `#${c.websiteRank}` : "—"}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{c.reviewCount ?? "—"}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{c.rating ? `⭐ ${c.rating}` : "—"}</td>
                      <td className="px-4 py-3 text-right flex gap-1 justify-end">
                        <button onClick={() => startEdit(c)} className="text-blue-400 hover:text-blue-600 text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors">Edit</button>
                        <button onClick={() => deleteComp(c.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
