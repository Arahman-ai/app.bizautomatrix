"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: string;
  businessName: string;
  ownerName: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  city: string | null;
  industry: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  QUALIFIED: "bg-purple-100 text-purple-700",
  CONVERTED: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
};

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [saving, setSaving] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((d) => { setLeads(d.leads ?? []); setLoading(false); });
  }, []);

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    setSaving(null);
  }

  async function saveNotes(id: string) {
    setSaving(id);
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesValue }),
    });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, notes: notesValue } : l));
    setEditNotes(null);
    setSaving(null);
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  const filtered = filter === "ALL" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">{leads.length} total leads</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {["ALL", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s} {s === "ALL" ? `(${leads.length})` : `(${leads.filter(l => l.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-medium text-gray-600">No leads yet</p>
            <p className="text-sm mt-1">Convert a contacted prospect to create a lead.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Business</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">City</th>
                  <th className="px-6 py-3 text-left">Source</th>
                  <th className="px-6 py-3 text-left">Notes</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{lead.businessName}</p>
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                          {lead.website.replace(/^https?:\/\//, "").slice(0, 25)}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.phone ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.city ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {lead.source ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[180px]">
                      {editNotes === lead.id ? (
                        <div className="flex gap-1">
                          <input autoFocus type="text" value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveNotes(lead.id); if (e.key === "Escape") setEditNotes(null); }}
                            className="w-full px-2 py-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                          <button onClick={() => saveNotes(lead.id)} className="text-green-600 text-xs px-1">✓</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditNotes(lead.id); setNotesValue(lead.notes ?? ""); }}
                          className="text-left text-xs text-gray-500 hover:text-blue-600 w-full truncate">
                          {lead.notes || <span className="text-gray-300">Add note...</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select value={lead.status} disabled={saving === lead.id}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer ${STATUS_COLORS[lead.status]}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => deleteLead(lead.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
