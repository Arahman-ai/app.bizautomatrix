"use client";

import { useEffect, useState } from "react";

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
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-500 mt-1">Businesses found via Google Maps with low reviews</p>
        </div>
        <div className="flex gap-2">
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
      </div>

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
