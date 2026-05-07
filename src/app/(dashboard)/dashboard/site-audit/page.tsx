"use client";

import { useEffect, useState } from "react";

type NapData = { businessName: string; address: string | null; phone: string | null; website: string | null; napConsistent: boolean; napNotes: string | null };
type PageSpeedResult = { id: string; url: string; mobileScore: number | null; desktopScore: number | null; fcp: number | null; lcp: number | null; cls: number | null; tbt: number | null; recordedAt: string };

function ScoreCircle({ score, label }: { score: number | null; label: string }) {
  if (score === null) return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
        <span className="text-gray-400 font-bold">—</span>
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
  const color = score >= 90 ? "border-green-500 text-green-600" : score >= 50 ? "border-yellow-400 text-yellow-600" : "border-red-500 text-red-600";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-20 h-20 rounded-full border-4 ${color} flex items-center justify-center`}>
        <span className={`text-xl font-bold ${color.split(" ")[1]}`}>{score}</span>
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

export default function ClientSiteAudit() {
  const [nap, setNap] = useState<NapData | null>(null);
  const [pageSpeed, setPageSpeed] = useState<PageSpeedResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/client/nap-check").then(r => r.json()),
      fetch("/api/client/pagespeed").then(r => r.json()),
    ]).then(([napData, psData]) => {
      setNap(napData.client);
      setPageSpeed(psData.results?.[0] ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-400 text-sm p-4">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Site Audit</h1>
        <p className="text-gray-500 mt-1">Website speed and NAP consistency</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NAP */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">NAP Consistency</h2>
            {nap && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${nap.napConsistent ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {nap.napConsistent ? "✓ Consistent" : "⚠ Needs Review"}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-4">Your Name, Address & Phone (NAP) must match exactly across all directories for Google to trust your business location.</p>
          {nap ? (
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Business Name</p>
                <p className="text-sm font-medium text-gray-800">{nap.businessName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                <p className="text-sm text-gray-800">{nap.address || "Not set"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                <p className="text-sm text-gray-800">{nap.phone || "Not set"}</p>
              </div>
              {nap.napNotes && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                  <p className="text-xs text-yellow-700 font-medium mb-0.5">Note from your team</p>
                  <p className="text-sm text-yellow-800">{nap.napNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">NAP data not available yet.</p>
          )}
        </div>

        {/* PageSpeed */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Website Speed Score</h2>
          {pageSpeed ? (
            <>
              <div className="flex justify-center gap-8 mb-6">
                <ScoreCircle score={pageSpeed.mobileScore} label="Mobile" />
                <ScoreCircle score={pageSpeed.desktopScore} label="Desktop" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {pageSpeed.fcp !== null && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">First Contentful Paint</p>
                    <p className={`font-semibold mt-0.5 ${pageSpeed.fcp < 1.8 ? "text-green-600" : pageSpeed.fcp < 3 ? "text-yellow-600" : "text-red-600"}`}>
                      {pageSpeed.fcp.toFixed(1)}s {pageSpeed.fcp < 1.8 ? "✓" : pageSpeed.fcp < 3 ? "⚠" : "✗"}
                    </p>
                  </div>
                )}
                {pageSpeed.lcp !== null && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Largest Contentful Paint</p>
                    <p className={`font-semibold mt-0.5 ${pageSpeed.lcp < 2.5 ? "text-green-600" : pageSpeed.lcp < 4 ? "text-yellow-600" : "text-red-600"}`}>
                      {pageSpeed.lcp.toFixed(1)}s {pageSpeed.lcp < 2.5 ? "✓" : pageSpeed.lcp < 4 ? "⚠" : "✗"}
                    </p>
                  </div>
                )}
                {pageSpeed.cls !== null && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Layout Shift (CLS)</p>
                    <p className={`font-semibold mt-0.5 ${pageSpeed.cls < 0.1 ? "text-green-600" : pageSpeed.cls < 0.25 ? "text-yellow-600" : "text-red-600"}`}>
                      {pageSpeed.cls.toFixed(3)} {pageSpeed.cls < 0.1 ? "✓" : pageSpeed.cls < 0.25 ? "⚠" : "✗"}
                    </p>
                  </div>
                )}
                {pageSpeed.tbt !== null && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Blocking Time</p>
                    <p className={`font-semibold mt-0.5 ${pageSpeed.tbt < 200 ? "text-green-600" : pageSpeed.tbt < 600 ? "text-yellow-600" : "text-red-600"}`}>
                      {Math.round(pageSpeed.tbt)}ms {pageSpeed.tbt < 200 ? "✓" : pageSpeed.tbt < 600 ? "⚠" : "✗"}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">Tested: {new Date(pageSpeed.recordedAt).toLocaleDateString()}</p>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">⚡</p>
              <p className="text-sm">No speed test run yet</p>
              <p className="text-xs mt-1">Your team will test your site speed soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
