"use client";

import { useEffect, useState } from "react";

type Client = { id: string; businessName: string };
type Citation = { id: string; directory: string; url: string | null; listed: boolean; napCorrect: boolean };

const DEFAULT_DIRS = [
  "Google Business Profile", "Google Maps", "Bing Places", "Apple Maps",
  "Facebook", "Instagram", "LinkedIn", "Yellow Pages",
  "Yelp", "Foursquare", "TripAdvisor", "BBB",
  "Hotfrog", "Cylex", "EZlocal", "Manta",
  "Local.com", "Superpages", "Whitepages", "MapQuest",
  "OpenStreetMap", "Waze", "HERE Maps", "TomTom",
  "Bing Maps", "Yahoo Local", "Chamber of Commerce", "Alignable",
  "Nextdoor", "eLocal",
];

export default function AdminCitations() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);
  const [newDir, setNewDir] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetch("/api/admin/citations").then(r => r.json()).then(d => setClients(d.clients ?? []));
  }, []);

  useEffect(() => {
    if (!selectedClient) { setCitations([]); return; }
    setLoading(true);
    fetch(`/api/admin/citations?clientId=${selectedClient}`)
      .then(r => r.json()).then(d => { setCitations(d.citations ?? []); setLoading(false); });
  }, [selectedClient]);

  async function seedDefaults() {
    setSeeding(true);
    const existing = citations.map(c => c.directory);
    const toAdd = DEFAULT_DIRS.filter(d => !existing.includes(d));
    for (const dir of toAdd) {
      await fetch("/api/admin/citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient, directory: dir }),
      });
    }
    const d = await (await fetch(`/api/admin/citations?clientId=${selectedClient}`)).json();
    setCitations(d.citations ?? []);
    setSeeding(false);
  }

  async function addCitation() {
    if (!newDir.trim()) return;
    await fetch("/api/admin/citations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient, directory: newDir.trim(), url: newUrl.trim() || null }),
    });
    setNewDir(""); setNewUrl("");
    const d = await (await fetch(`/api/admin/citations?clientId=${selectedClient}`)).json();
    setCitations(d.citations ?? []);
  }

  async function toggle(id: string, field: "listed" | "napCorrect", val: boolean) {
    await fetch("/api/admin/citations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: val }),
    });
    setCitations(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  }

  async function deleteCitation(id: string) {
    await fetch(`/api/admin/citations?id=${id}`, { method: "DELETE" });
    setCitations(prev => prev.filter(c => c.id !== id));
  }

  const listed = citations.filter(c => c.listed).length;
  const napOk = citations.filter(c => c.napCorrect).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Citation Tracker</h1>
        <p className="text-gray-500 mt-1">Track business directory listings per client</p>
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
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Directories</p>
              <p className="text-2xl font-bold text-gray-900">{citations.length}</p>
            </div>
            <div className="bg-green-50 rounded-2xl border border-green-100 p-4 text-center">
              <p className="text-xs text-green-600 mb-1">Listed</p>
              <p className="text-2xl font-bold text-green-700">{listed}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 text-center">
              <p className="text-xs text-blue-600 mb-1">NAP Correct</p>
              <p className="text-2xl font-bold text-blue-700">{napOk}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={seedDefaults} disabled={seeding}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors">
                {seeding ? "Adding..." : "Add 30 Default Directories"}
              </button>
            </div>
            <div className="flex gap-3">
              <input type="text" placeholder="Directory name" value={newDir}
                onChange={e => setNewDir(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="url" placeholder="URL (optional)" value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addCitation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3">Directory</th>
                    <th className="text-left px-5 py-3">URL</th>
                    <th className="text-center px-4 py-3">Listed</th>
                    <th className="text-center px-4 py-3">NAP Correct</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {citations.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{c.directory}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs max-w-[200px] truncate">
                        {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{c.url}</a> : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" checked={c.listed} onChange={e => toggle(c.id, "listed", e.target.checked)}
                          className="w-4 h-4 rounded text-green-600" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" checked={c.napCorrect} onChange={e => toggle(c.id, "napCorrect", e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteCitation(c.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {citations.length === 0 && (
                <div className="px-5 py-10 text-center text-gray-400 text-sm">No citations yet. Add defaults above.</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
