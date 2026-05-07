"use client";

import { useEffect, useState } from "react";

type Report = {
  client: { businessName: string; website: string | null; city: string | null; industry: string | null; napConsistent: boolean };
  gbpAudit: { score: number | null; reviewCount: number | null; rating: number | null; hasClaimed: boolean } | null;
  citations: { listed: boolean; napCorrect: boolean }[];
  seoTasks: { completed: boolean; category: string; priority: string }[];
  competitors: { name: string; mapRank: number | null; websiteRank: number | null; reviewCount: number | null; rating: number | null }[];
  rankEntries: { keyword: string; mapRank: number | null; websiteRank: number | null; recordedAt: string }[];
  reviewRequests: { status: string; createdAt: string }[];
  pageSpeed: { mobileScore: number | null; desktopScore: number | null; recordedAt: string } | null;
};

export default function ClientSeoReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/seo-report")
      .then(r => r.json())
      .then(d => { setReport(d.report); setLoading(false); });
  }, []);

  if (loading) return <div className="text-gray-400 text-sm p-4">Generating report...</div>;
  if (!report) return <div className="text-gray-400 text-sm p-4">Report not available.</div>;

  const keywords = [...new Set(report.rankEntries.map(e => e.keyword))];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Report</h1>
          <p className="text-gray-500 mt-1">Your complete SEO performance summary</p>
        </div>
        <button onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          🖨 Save as PDF
        </button>
      </div>

      <div className="space-y-6 print:space-y-4">
        {/* Header */}
        <div className="bg-blue-600 text-white rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-200 text-sm">SEO Performance Report</p>
              <h2 className="text-2xl font-bold mt-1">{report.client.businessName}</h2>
              {report.client.city && <p className="text-blue-200 text-sm mt-1">{report.client.city} · {report.client.industry}</p>}
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs">Powered by</p>
              <p className="font-bold">BizAutomatrix</p>
              <p className="text-blue-200 text-xs mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Score summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-blue-600 mb-1">GBP Score</p>
            <p className="text-2xl font-bold text-blue-700">{report.gbpAudit?.score != null ? `${report.gbpAudit.score}%` : "—"}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-yellow-600 mb-1">Reviews</p>
            <p className="text-2xl font-bold text-yellow-700">{report.gbpAudit?.reviewCount ?? "—"}</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-green-600 mb-1">Citations</p>
            <p className="text-2xl font-bold text-green-700">{report.citations.filter(c => c.listed).length}/{report.citations.length}</p>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-purple-600 mb-1">Tasks Done</p>
            <p className="text-2xl font-bold text-purple-700">{report.seoTasks.filter(t => t.completed).length}/{report.seoTasks.length}</p>
          </div>
        </div>

        {/* Rankings */}
        {keywords.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Keyword Rankings</h3>
            <div className="space-y-3">
              {keywords.map(kw => {
                const kwEntries = report.rankEntries.filter(e => e.keyword === kw).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
                const latest = kwEntries[0];
                return (
                  <div key={kw} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">{kw}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-600">📍 {latest.mapRank ? `#${latest.mapRank}` : "—"}</span>
                      <span className="text-purple-600">🌐 {latest.websiteRank ? `#${latest.websiteRank}` : "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PageSpeed + NAP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {report.pageSpeed && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Site Speed</h3>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Mobile</p>
                  <p className={`text-2xl font-bold ${report.pageSpeed.mobileScore != null && report.pageSpeed.mobileScore >= 90 ? "text-green-600" : "text-yellow-600"}`}>{report.pageSpeed.mobileScore ?? "—"}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Desktop</p>
                  <p className={`text-2xl font-bold ${report.pageSpeed.desktopScore != null && report.pageSpeed.desktopScore >= 90 ? "text-green-600" : "text-yellow-600"}`}>{report.pageSpeed.desktopScore ?? "—"}</p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">NAP Consistency</h3>
            <p className={`text-sm font-medium ${report.client.napConsistent ? "text-green-600" : "text-red-600"}`}>
              {report.client.napConsistent ? "✓ NAP is consistent across directories" : "⚠ NAP needs to be fixed across directories"}
            </p>
          </div>
        </div>

        {/* Reviews */}
        {report.reviewRequests.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Review Campaign</h3>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-2xl font-bold text-gray-900">{report.reviewRequests.filter(r => r.status === "SENT" || r.status === "CLICKED").length}</p>
                <p className="text-xs text-gray-500">Requests Sent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{report.reviewRequests.filter(r => r.status === "CLICKED").length}</p>
                <p className="text-xs text-gray-500">Clicked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {report.reviewRequests.length > 0 ? Math.round((report.reviewRequests.filter(r => r.status === "CLICKED").length / report.reviewRequests.length) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">Click Rate</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 py-4">
          Powered by BizAutomatrix &mdash; {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
