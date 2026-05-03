"use client";

import { useEffect, useRef, useState } from "react";

type Prospect = {
  id: string;
  businessName: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  category: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

type ProspectConfig = {
  city: string;
  category: string;
  maxReviews: number;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CONTACTED: "bg-blue-100 text-blue-700",
};

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [saving, setSaving] = useState<string | null>(null);

  // Settings panel state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [config, setConfig] = useState<ProspectConfig>({ city: "", category: "", maxReviews: 20 });
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings on mount
  useEffect(() => {
    setConfigLoading(true);
    fetch("/api/admin/prospect-config")
      .then((r) => r.json())
      .then((d) => {
        if (d.config) setConfig(d.config);
      })
      .finally(() => setConfigLoading(false));
  }, []);

  async function saveConfig() {
    setConfigSaving(true);
    await fetch("/api/admin/prospect-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setConfigSaving(false);

    // Show "Saved!" banner briefly
    setSavedBanner(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSavedBanner(false), 2500);
  }

  // Fetch prospects when filter changes
  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/prospects?status=${filter}`)
      .then((r) => r.json())
      .then((d) => { setProspects(d.prospects); setLoading(false); });
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    await fetch(`/api/admin/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setProspects((prev) => prev.filter((p) => p.id !== id));
    setSaving(null);
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-500 mt-1">Businesses found via Google Maps with low reviews</p>
        </div>
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Scraper Settings
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3 w-3 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* ── Settings panel ── */}
      {settingsOpen && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Google Maps Scraper Settings
            </h2>
            {savedBanner && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved!
              </span>
            )}
          </div>

          {configLoading ? (
            <p className="text-sm text-gray-400">Loading settings...</p>
          ) : (
            <div className="flex flex-wrap gap-4 items-end">
              {/* City */}
              <div className="flex flex-col gap-1.5 min-w-[160px]">
                <label className="text-xs font-medium text-gray-600" htmlFor="cfg-city">
                  City
                </label>
                <input
                  id="cfg-city"
                  type="text"
                  placeholder="e.g. Dhaka"
                  value={config.city}
                  onChange={(e) => setConfig((c) => ({ ...c, city: e.target.value }))}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <label className="text-xs font-medium text-gray-600" htmlFor="cfg-category">
                  Category
                </label>
                <input
                  id="cfg-category"
                  type="text"
                  placeholder="e.g. restaurant"
                  value={config.category}
                  onChange={(e) => setConfig((c) => ({ ...c, category: e.target.value }))}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Max Reviews */}
              <div className="flex flex-col gap-1.5 w-[140px]">
                <label className="text-xs font-medium text-gray-600" htmlFor="cfg-maxreviews">
                  Max Reviews
                </label>
                <input
                  id="cfg-maxreviews"
                  type="number"
                  min={0}
                  max={1000}
                  value={config.maxReviews}
                  onChange={(e) => setConfig((c) => ({ ...c, maxReviews: Number(e.target.value) }))}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Save button */}
              <button
                onClick={saveConfig}
                disabled={configSaving}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {configSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {["PENDING", "APPROVED", "CONTACTED", "REJECTED", "ALL"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Prospect table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400">Loading...</div>
        ) : prospects.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium text-gray-600">No prospects yet</p>
            <p className="text-sm mt-1">Run the Google Maps workflow in n8n to find prospects.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Business</th>
                  <th className="px-6 py-3 text-left">City</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Rating</th>
                  <th className="px-6 py-3 text-left">Reviews</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prospects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{p.businessName}</p>
                      {p.website && (
                        <a href={p.website} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                          {p.website.replace(/^https?:\/\//, "").slice(0, 30)}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.city || "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{p.category || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${(p.rating || 0) < 4 ? "text-red-600" : "text-yellow-600"}`}>
                        {p.rating ? `${p.rating}★` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.reviewCount ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{p.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {p.status === "PENDING" && (
                          <>
                            <button
                              disabled={saving === p.id}
                              onClick={() => updateStatus(p.id, "APPROVED")}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={saving === p.id}
                              onClick={() => updateStatus(p.id, "REJECTED")}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {p.status === "APPROVED" && (
                          <button
                            disabled={saving === p.id}
                            onClick={() => updateStatus(p.id, "CONTACTED")}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                            Mark Contacted
                          </button>
                        )}
                      </div>
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
