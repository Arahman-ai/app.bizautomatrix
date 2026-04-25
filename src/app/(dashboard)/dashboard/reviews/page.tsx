"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type ReviewRequest = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  status: "PENDING" | "SENT" | "CLICKED" | "FAILED";
  sentAt: string | null;
  clickedAt: string | null;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  SENT: "bg-blue-50 text-blue-700 border-blue-200",
  CLICKED: "bg-green-50 text-green-700 border-green-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Sending…",
  SENT: "Sent",
  CLICKED: "Link Clicked ✓",
  FAILED: "Failed",
};

export default function ReviewsPage() {
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  const fetchRequests = useCallback(async () => {
    const res = await fetch("/api/review-requests");
    const data = await res.json();
    if (data.requests) setRequests(data.requests);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/review-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send.");
      } else {
        setSuccess(`Review request sent to ${form.customerName}!`);
        setForm({ customerName: "", customerEmail: "", customerPhone: "" });
        fetchRequests();
      }
    } finally {
      setSending(false);
    }
  }

  const sentCount = requests.filter((r) => r.status === "SENT" || r.status === "CLICKED").length;
  const clickedCount = requests.filter((r) => r.status === "CLICKED").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Requests</h1>
        <p className="text-gray-500 mt-1">Send Google review requests to your customers.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Sent" value={sentCount} color="blue" />
        <StatCard label="Links Clicked" value={clickedCount} color="green" />
        <StatCard
          label="Click Rate"
          value={sentCount > 0 ? `${Math.round((clickedCount / sentCount) * 100)}%` : "—"}
          color="purple"
        />
      </div>

      {/* Send form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 max-w-xl">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Send New Request</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error.includes("Google Review link") ? (
              <>
                {error}{" "}
                <Link href="/dashboard/settings" className="underline font-medium">
                  Go to Settings →
                </Link>
              </>
            ) : (
              error
            )}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
              placeholder="John Smith"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Customer Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
              placeholder="john@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {sending ? "Sending…" : "Send Review Request →"}
          </button>
        </form>
      </div>

      {/* Request list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Sent Requests</h2>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-gray-400 text-sm">Loading…</div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400 text-sm">No requests sent yet. Send your first one above!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.customerName}</p>
                  <p className="text-xs text-gray-500 truncate">{r.customerEmail}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[r.status]}`}
                  >
                    {STATUS_LABELS[r.status]}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "blue" | "green" | "purple";
}) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${colors[color].split(" ")[0]}`}>{value}</p>
    </div>
  );
}
