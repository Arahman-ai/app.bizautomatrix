"use client";

import { useEffect, useMemo, useState } from "react";

type Client = {
  id: string;
  businessName: string;
  website: string | null;
  city: string | null;
  state: string | null;
  industry: string | null;
  googleReviewLink: string | null;
  plan: string;
  _count?: { reviewRequests: number };
};

type Stats = {
  total: number;
  sent: number;
  clicked: number;
  pending: number;
  failed: number;
  sentThisMonth: number;
  clickedThisMonth: number;
  clickRate: number;
  monthlyClickRate: number;
};

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

type SeoTask = {
  id: string;
  task: string;
  priority: string;
  recommendation: string | null;
  createdAt: string;
};

type RecommendedTask = {
  task: string;
  priority: string;
  recommendation: string;
};

type ApiData = {
  clients: Client[];
  selectedClient: Client | null;
  stats?: Stats;
  requests?: ReviewRequest[];
  openReviewTasks?: SeoTask[];
  recommendedTasks?: RecommendedTask[];
};

const STATUS_STYLES: Record<ReviewRequest["status"], string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  SENT: "bg-blue-50 text-blue-700 border-blue-100",
  CLICKED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  FAILED: "bg-red-50 text-red-700 border-red-100",
};

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border-red-100",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
  LOW: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function ReviewManagementPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [clientId, setClientId] = useState("");
  const [reviewLink, setReviewLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingTasks, setCreatingTasks] = useState(false);
  const [message, setMessage] = useState("");

  async function load(nextClientId = clientId) {
    setLoading(true);
    setMessage("");
    const query = nextClientId ? `?clientId=${nextClientId}` : "";
    const res = await fetch(`/api/admin/review-management${query}`);
    const json = await res.json();
    setData(json);
    if (!nextClientId && json.selectedClient?.id) setClientId(json.selectedClient.id);
    setReviewLink(json.selectedClient?.googleReviewLink || "");
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleClientChange(nextClientId: string) {
    setClientId(nextClientId);
    await load(nextClientId);
  }

  async function saveReviewLink() {
    if (!data?.selectedClient) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/review-management", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: data.selectedClient.id, googleReviewLink: reviewLink }),
    });
    if (res.ok) {
      setMessage("Review link saved.");
      await load(data.selectedClient.id);
    } else {
      const json = await res.json();
      setMessage(json.error || "Could not save review link.");
    }
    setSaving(false);
  }

  async function createReviewTasks() {
    if (!data?.selectedClient) return;
    setCreatingTasks(true);
    setMessage("");
    const res = await fetch("/api/admin/review-management", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: data.selectedClient.id, action: "createReviewTasks" }),
    });
    const json = await res.json();
    if (res.ok) {
      setMessage(json.created ? `${json.created} review SEO tasks created.` : "Review SEO tasks already exist.");
      await load(data.selectedClient.id);
    } else {
      setMessage(json.error || "Could not create review tasks.");
    }
    setCreatingTasks(false);
  }

  const selectedClient = data?.selectedClient;
  const stats = data?.stats;
  const openTasks = data?.openReviewTasks || [];
  const recentRequests = data?.requests || [];
  const setupReady = Boolean(selectedClient?.googleReviewLink);
  const clickSummary = useMemo(() => {
    if (!stats) return "0 clicked from 0 sent";
    return `${stats.clicked} clicked from ${stats.sent} sent`;
  }, [stats]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <p className="text-gray-500 mt-1">Track Google review automation and create SEO review tasks per client.</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
        <select
          value={clientId}
          onChange={(event) => handleClientChange(event.target.value)}
          className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          {data?.clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.businessName}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-sm text-gray-500">Loading review data...</div>
      ) : !selectedClient ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-sm text-gray-500">No clients found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Total Requests" value={stats?.total ?? 0} tone="blue" />
            <MetricCard label="Review Clicks" value={stats?.clicked ?? 0} tone="green" helper={clickSummary} />
            <MetricCard label="Click Rate" value={`${stats?.clickRate ?? 0}%`} tone="amber" helper="All-time review link clicks" />
            <MetricCard label="Open Review Tasks" value={openTasks.length} tone="slate" helper="From SEO Tasks" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Review Automation Setup</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Save the direct Google review URL, then generate the tasks needed to run this as an SEO workflow.
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                    setupReady
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-amber-100 bg-amber-50 text-amber-700"
                  }`}
                >
                  {setupReady ? "Ready" : "Needs link"}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Review Link</label>
                  <input
                    type="url"
                    value={reviewLink}
                    onChange={(event) => setReviewLink(event.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="https://g.page/r/your-place/review"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={saveReviewLink}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Link"}
                  </button>
                  <button
                    type="button"
                    onClick={createReviewTasks}
                    disabled={creatingTasks}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
                  >
                    {creatingTasks ? "Creating..." : "Generate Review SEO Tasks"}
                  </button>
                  {message && <span className="text-sm text-gray-600">{message}</span>}
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-900">Admin Next Steps</h2>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Use these to move a client from basic setup to consistent review growth.
              </p>
              <div className="space-y-3">
                {(data?.recommendedTasks || []).map((task) => (
                  <div key={task.task} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{task.task}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{task.recommendation}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <section className="xl:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Review Requests</h2>
                  <p className="text-sm text-gray-500 mt-1">Latest customer review requests and tracking status.</p>
                </div>
                <span className="text-xs text-gray-500">
                  This month: {stats?.sentThisMonth ?? 0} sent, {stats?.clickedThisMonth ?? 0} clicked
                </span>
              </div>

              {recentRequests.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center text-sm text-gray-500">
                  No review requests yet. Ask the client to send requests from their dashboard, or import customers in a future automation step.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                        <th className="py-3 pr-4 font-semibold">Customer</th>
                        <th className="py-3 pr-4 font-semibold">Email</th>
                        <th className="py-3 pr-4 font-semibold">Status</th>
                        <th className="py-3 pr-4 font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((request) => (
                        <tr key={request.id} className="border-b border-gray-50">
                          <td className="py-3 pr-4 font-medium text-gray-900">{request.customerName}</td>
                          <td className="py-3 pr-4 text-gray-600">{request.customerEmail}</td>
                          <td className="py-3 pr-4">
                            <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_STYLES[request.status]}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-900">Open Review Tasks</h2>
              <p className="text-sm text-gray-500 mt-1 mb-4">Review-related tasks currently waiting in SEO Tasks.</p>
              {openTasks.length === 0 ? (
                <p className="text-sm text-gray-500">No open review tasks yet.</p>
              ) : (
                <div className="space-y-3">
                  {openTasks.map((task) => (
                    <div key={task.id} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{task.task}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.recommendation && <p className="text-xs text-gray-500 mt-1">{task.recommendation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
  helper,
}: {
  label: string;
  value: string | number;
  tone: "blue" | "green" | "amber" | "slate";
  helper?: string;
}) {
  const tones = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    green: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
  };

  return (
    <div className={`border rounded-lg p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {helper && <p className="text-xs mt-1 opacity-80">{helper}</p>}
    </div>
  );
}
