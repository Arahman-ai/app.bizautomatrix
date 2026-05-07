"use client";

import { useEffect, useState } from "react";

type Citation = { id: string; directory: string; url: string | null; listed: boolean; napCorrect: boolean };

export default function ClientCitations() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/citations")
      .then(r => r.json())
      .then(d => { setCitations(d.citations ?? []); setLoading(false); });
  }, []);

  const listed = citations.filter(c => c.listed).length;
  const napOk = citations.filter(c => c.napCorrect).length;
  const progress = citations.length > 0 ? Math.round((listed / citations.length) * 100) : 0;

  if (loading) return <div className="text-gray-400 text-sm p-4">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Business Directory Citations</h1>
        <p className="text-gray-500 mt-1">Your business listing status across the web</p>
      </div>

      {citations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
          <p className="text-3xl mb-2">📋</p>
          <p className="font-medium text-gray-600">No citations tracked yet</p>
          <p className="text-sm mt-1">Your BizAutomatrix team will start building your citations soon.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 mb-1">Coverage</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-gray-900">{listed}</p>
                <p className="text-sm text-gray-500 mb-1">of {citations.length}</p>
              </div>
              <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
              <p className="text-xs text-green-600 mb-1">Listed</p>
              <p className="text-3xl font-bold text-green-700">{listed}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <p className="text-xs text-blue-600 mb-1">NAP Correct</p>
              <p className="text-3xl font-bold text-blue-700">{napOk}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3">Directory</th>
                  <th className="text-center px-4 py-3">Listed</th>
                  <th className="text-center px-4 py-3">NAP Correct</th>
                  <th className="text-left px-5 py-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {citations.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{c.directory}</td>
                    <td className="px-4 py-3 text-center">
                      {c.listed ? <span className="text-green-600 text-base">✓</span> : <span className="text-red-400 text-base">✗</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.napCorrect ? <span className="text-green-600 text-base">✓</span> : <span className="text-gray-300 text-base">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">View listing →</a> : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
