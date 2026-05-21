"use client";

import { useEffect, useState } from "react";

type Client = { id: string; businessName: string };
type NapData = {
  businessName: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  napConsistent: boolean;
  napNotes: string | null;
};
type PageSpeedResult = {
  id: string;
  url: string;
  mobileScore: number | null;
  desktopScore: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  tbt: number | null;
  recordedAt: string;
};
type SiteAuditIssue = {
  id: string;
  pageUrl: string;
  issueType: string;
  priority: string;
  recommendation: string;
  taskCreated: boolean;
};
type SiteAuditRun = {
  id: string;
  startUrl: string;
  pagesCrawled: number;
  issuesFound: number;
  tasksCreated: number;
  seoScore: number | null;
  summary: string | null;
  createdAt: string;
  issues: SiteAuditIssue[];
};

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

function SummaryCard({ label, value, tone }: { label: string; value: string | number; tone: "blue" | "green" | "amber" | "slate" }) {
  const styles = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    green: "bg-green-50 border-green-100 text-green-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function priorityStyle(priority: string) {
  if (priority === "HIGH") return "bg-red-50 text-red-700 border-red-100";
  if (priority === "MEDIUM") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  const [auditRun, setAuditRun] = useState<SiteAuditRun | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");

  useEffect(() => {
    fetch("/api/admin/nap-check").then(r => r.json()).then(d => setClients(d.clients ?? []));
  }, []);

  useEffect(() => {
    if (!selectedClient) return;

    fetch(`/api/admin/nap-check?clientId=${selectedClient}`)
      .then(r => r.json())
      .then(d => {
        if (d.client) {
          setNap(d.client);
          setNapNotes(d.client.napNotes ?? "");
          setNapConsistent(d.client.napConsistent);
          setPsUrl(d.client.website ?? "");
        }
      });
    fetch(`/api/admin/pagespeed?clientId=${selectedClient}`)
      .then(r => r.json())
      .then(d => setPsResults(d.results ?? []));
    fetch(`/api/admin/site-audit?clientId=${selectedClient}`)
      .then(r => r.json())
      .then(d => setAuditRun(d.run ?? null));
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
    if (d.error) {
      setPsError(d.error);
    } else {
      const updated = await (await fetch(`/api/admin/pagespeed?clientId=${selectedClient}`)).json();
      setPsResults(updated.results ?? []);
    }
    setPsLoading(false);
  }

  async function runFullAudit() {
    if (!selectedClient || !psUrl.trim()) return;
    setAuditLoading(true);
    setAuditError("");
    const res = await fetch("/api/admin/site-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient, url: psUrl.trim(), maxPages: 40 }),
    });
    const d = await res.json();
    if (!res.ok || d.error) setAuditError(d.error ?? "Site audit failed");
    else setAuditRun(d.run);
    setAuditLoading(false);
  }

  function handleClientChange(clientId: string) {
    setSelectedClient(clientId);
    setNap(null);
    setPsResults([]);
    setAuditRun(null);
    setAuditError("");
  }

  function createPdfReport() {
    if (!auditRun || !nap) return;

    const priorityCounts = auditRun.issues.reduce<Record<string, number>>((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] ?? 0) + 1;
      return acc;
    }, {});
    const issueTypeCounts = Object.entries(
      auditRun.issues.reduce<Record<string, number>>((acc, issue) => {
        acc[issue.issueType] = (acc[issue.issueType] ?? 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]);
    const issueRows = auditRun.issues.slice(0, 80).map(issue => `
      <tr>
        <td>${escapeHtml(issue.pageUrl)}</td>
        <td>${escapeHtml(issue.issueType)}</td>
        <td><span class="pill ${escapeHtml(issue.priority).toLowerCase()}">${escapeHtml(issue.priority)}</span></td>
        <td>${escapeHtml(issue.recommendation)}</td>
        <td>${issue.taskCreated ? "Created" : "Pending"}</td>
      </tr>
    `).join("");
    const issueSummaryRows = issueTypeCounts.slice(0, 12).map(([issueType, count]) => `
      <tr>
        <td>${escapeHtml(issueType)}</td>
        <td>${count}</td>
      </tr>
    `).join("");
    const pageSpeedHtml = latestPs ? `
      <div class="metric"><span>Mobile Score</span><strong>${escapeHtml(latestPs.mobileScore ?? "-")}/100</strong></div>
      <div class="metric"><span>Desktop Score</span><strong>${escapeHtml(latestPs.desktopScore ?? "-")}/100</strong></div>
      <div class="metric"><span>First Contentful Paint</span><strong>${latestPs.fcp !== null ? `${latestPs.fcp.toFixed(1)}s` : "-"}</strong></div>
      <div class="metric"><span>Largest Contentful Paint</span><strong>${latestPs.lcp !== null ? `${latestPs.lcp.toFixed(1)}s` : "-"}</strong></div>
      <div class="metric"><span>Layout Shift</span><strong>${latestPs.cls !== null ? latestPs.cls.toFixed(3) : "-"}</strong></div>
      <div class="metric"><span>Blocking Time</span><strong>${latestPs.tbt !== null ? `${Math.round(latestPs.tbt)}ms` : "-"}</strong></div>
    ` : `<p class="muted">No PageSpeed test has been saved yet.</p>`;

    const reportWindow = window.open("", "_blank", "width=1100,height=800");
    if (!reportWindow) {
      alert("Please allow popups to create the PDF report.");
      return;
    }

    reportWindow.document.open();
    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(nap.businessName)} Initial SEO Audit</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 32px; color: #0f172a; font-family: Arial, sans-serif; background: #f8fafc; }
            .report { max-width: 1100px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; padding: 32px; }
            .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
            h1 { margin: 0; font-size: 28px; }
            h2 { margin: 26px 0 12px; font-size: 17px; }
            p { margin: 4px 0; }
            .muted { color: #64748b; font-size: 13px; }
            .brand { color: #2563eb; font-weight: 700; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
            .card { border: 1px solid #dbeafe; background: #eff6ff; border-radius: 8px; padding: 14px; }
            .card.amber { border-color: #fde68a; background: #fffbeb; }
            .card.green { border-color: #bbf7d0; background: #f0fdf4; }
            .card.slate { border-color: #cbd5e1; background: #f8fafc; }
            .card span { display: block; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; }
            .card strong { display: block; margin-top: 5px; font-size: 24px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
            .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
            .metric { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 7px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; color: #475569; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding: 9px 8px; }
            td { vertical-align: top; border-bottom: 1px solid #f1f5f9; padding: 9px 8px; word-break: break-word; }
            .pill { display: inline-block; border-radius: 999px; padding: 3px 8px; font-size: 10px; font-weight: 700; }
            .pill.high { color: #b91c1c; background: #fee2e2; }
            .pill.medium { color: #b45309; background: #fef3c7; }
            .pill.low { color: #475569; background: #f1f5f9; }
            .footer { margin-top: 24px; color: #64748b; font-size: 11px; text-align: center; }
            @media print {
              body { background: white; padding: 0; }
              .report { border: 0; padding: 22px; }
              .no-print { display: none; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="top">
              <div>
                <p class="brand">BizAutomatrix</p>
                <h1>Initial SEO Audit Report</h1>
                <p>${escapeHtml(nap.businessName)}</p>
                <p class="muted">${escapeHtml(auditRun.startUrl)}</p>
              </div>
              <div>
                <p class="muted">Generated</p>
                <p>${escapeHtml(new Date().toLocaleString())}</p>
                <p class="muted">Latest audit</p>
                <p>${escapeHtml(new Date(auditRun.createdAt).toLocaleString())}</p>
              </div>
            </div>

            <div class="summary">
              <div class="card"><span>Pages Crawled</span><strong>${auditRun.pagesCrawled}</strong></div>
              <div class="card amber"><span>Issues Found</span><strong>${auditRun.issuesFound}</strong></div>
              <div class="card green"><span>Tasks Created</span><strong>${auditRun.tasksCreated}</strong></div>
              <div class="card slate"><span>SEO Score</span><strong>${auditRun.seoScore ?? 0}/100</strong></div>
            </div>

            <div class="grid">
              <div class="box">
                <h2>Business Information</h2>
                <div class="metric"><span>Name</span><strong>${escapeHtml(nap.businessName)}</strong></div>
                <div class="metric"><span>Address</span><strong>${escapeHtml(nap.address)}</strong></div>
                <div class="metric"><span>Phone</span><strong>${escapeHtml(nap.phone)}</strong></div>
                <div class="metric"><span>Website</span><strong>${escapeHtml(nap.website)}</strong></div>
                <div class="metric"><span>NAP Status</span><strong>${napConsistent ? "Consistent" : "Needs review"}</strong></div>
              </div>
              <div class="box">
                <h2>PageSpeed Summary</h2>
                ${pageSpeedHtml}
              </div>
            </div>

            <h2>Issue Summary</h2>
            <div class="summary">
              <div class="card amber"><span>High Priority</span><strong>${priorityCounts.HIGH ?? 0}</strong></div>
              <div class="card amber"><span>Medium Priority</span><strong>${priorityCounts.MEDIUM ?? 0}</strong></div>
              <div class="card slate"><span>Low Priority</span><strong>${priorityCounts.LOW ?? 0}</strong></div>
              <div class="card green"><span>Tasks Ready</span><strong>${auditRun.issues.filter(issue => issue.taskCreated).length}</strong></div>
            </div>
            <table>
              <thead><tr><th>Issue Type</th><th>Count</th></tr></thead>
              <tbody>${issueSummaryRows}</tbody>
            </table>

            <h2>Audit Issues</h2>
            <table>
              <thead>
                <tr><th>Page URL</th><th>Issue</th><th>Priority</th><th>Recommended Fix</th><th>Task</th></tr>
              </thead>
              <tbody>${issueRows}</tbody>
            </table>
            ${auditRun.issues.length > 80 ? `<p class="muted">Showing 80 of ${auditRun.issues.length} issues. Use the admin dashboard for the full issue list.</p>` : ""}

            <p class="footer">Report generated by BizAutomatrix</p>
          </div>
          <script>
            window.onload = () => setTimeout(() => window.print(), 300);
          </script>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
  }

  const latestPs = psResults[0] ?? null;
  const topIssues = auditRun?.issues?.slice(0, 10) ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Site Audit</h1>
        <p className="text-gray-500 mt-1">Full website crawl, NAP consistency, PageSpeed, and SEO task generation</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">Select Client</label>
        <select
          value={selectedClient}
          onChange={e => handleClientChange(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
        </select>
      </div>

      {selectedClient && nap && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">Website Audit Automation</h2>
                <p className="text-xs text-gray-500 mt-1">Crawl the client site, detect technical SEO issues, and create tasks automatically.</p>
                <label className="text-sm font-medium text-gray-700 block mt-4 mb-2">Website / Product URL</label>
                <input
                  type="url"
                  placeholder="https://clientsite.com"
                  value={psUrl}
                  onChange={e => setPsUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={runFullAudit}
                disabled={auditLoading || !psUrl.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {auditLoading ? "Running Audit..." : "Run Full Site Audit"}
              </button>
            </div>
            {auditError && <p className="text-red-500 text-sm mt-3">{auditError}</p>}
          </div>

          {auditRun && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard label="Pages Crawled" value={auditRun.pagesCrawled} tone="blue" />
              <SummaryCard label="Issues Found" value={auditRun.issuesFound} tone="amber" />
              <SummaryCard label="Tasks Created" value={auditRun.tasksCreated} tone="green" />
              <SummaryCard label="SEO Score" value={`${auditRun.seoScore ?? 0}/100`} tone="slate" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">NAP Consistency</h2>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${napConsistent ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {napConsistent ? "Consistent" : "Inconsistent"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Name, address, and phone should match exactly across directories.</p>
              <div className="space-y-3 mb-5">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Name</p>
                  <p className="text-sm text-gray-800 font-medium">{nap.businessName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Address</p>
                  <p className="text-sm text-gray-800">{nap.address || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Phone</p>
                  <p className="text-sm text-gray-800">{nap.phone || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Website</p>
                  <p className="text-sm text-gray-800 break-all">{nap.website || "-"}</p>
                </div>
              </div>
              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input type="checkbox" checked={napConsistent} onChange={e => setNapConsistent(e.target.checked)} className="w-4 h-4 rounded text-green-600" />
                <span className="text-sm text-gray-700">Mark NAP as consistent across all directories</span>
              </label>
              <textarea
                rows={2}
                placeholder="Notes about NAP issues..."
                value={napNotes}
                onChange={e => setNapNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
              />
              <div className="flex items-center gap-3">
                <button onClick={saveNap} disabled={napSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {napSaving ? "Saving..." : "Save"}
                </button>
                {napSaved && <span className="text-green-600 text-sm">Saved</span>}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">PageSpeed Score</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="url"
                  placeholder="https://..."
                  value={psUrl}
                  onChange={e => setPsUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={runPageSpeed} disabled={psLoading || !psUrl.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap">
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
                    {latestPs.fcp !== null && <Metric label="First Contentful Paint" value={`${latestPs.fcp.toFixed(1)}s`} />}
                    {latestPs.lcp !== null && <Metric label="Largest Contentful Paint" value={`${latestPs.lcp.toFixed(1)}s`} />}
                    {latestPs.cls !== null && <Metric label="Layout Shift (CLS)" value={latestPs.cls.toFixed(3)} />}
                    {latestPs.tbt !== null && <Metric label="Blocking Time (TBT)" value={`${Math.round(latestPs.tbt)}ms`} />}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Last tested: {new Date(latestPs.recordedAt).toLocaleString()}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Run a test to see scores</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Website Crawl Results</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {auditRun ? `Latest audit: ${new Date(auditRun.createdAt).toLocaleString()}` : "Run a full audit to generate crawl results."}
                </p>
              </div>
              {auditRun && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1">Report ready</span>
                  <button
                    onClick={createPdfReport}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Create PDF
                  </button>
                </div>
              )}
            </div>

            {auditRun ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-100">
                      <th className="py-3 pr-4 font-semibold">Page URL</th>
                      <th className="py-3 pr-4 font-semibold">Issue</th>
                      <th className="py-3 pr-4 font-semibold">Priority</th>
                      <th className="py-3 pr-4 font-semibold">Recommended Fix</th>
                      <th className="py-3 font-semibold">Task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topIssues.map(issue => (
                      <tr key={issue.id} className="border-b border-gray-50 align-top">
                        <td className="py-3 pr-4 text-gray-700 max-w-xs break-all">{issue.pageUrl}</td>
                        <td className="py-3 pr-4 font-medium text-gray-900">{issue.issueType}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${priorityStyle(issue.priority)}`}>{issue.priority}</span>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{issue.recommendation}</td>
                        <td className="py-3 text-green-700">{issue.taskCreated ? "Created" : "Pending"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {auditRun.issues.length > topIssues.length && (
                  <p className="text-xs text-gray-400 mt-3">Showing 10 of {auditRun.issues.length} issues. Full report integration comes next.</p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-gray-400">
                <p className="text-sm font-medium text-gray-600">No crawl results yet</p>
                <p className="text-xs mt-1">Select a client and run the full site audit.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2">
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}
