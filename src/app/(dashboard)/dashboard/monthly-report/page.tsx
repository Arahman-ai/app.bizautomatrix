"use client";

import { useEffect, useState } from "react";

type MonthData = { label: string; sent: number; clicked: number };

type Report = {
  businessName: string;
  plan: string;
  monthlyData: MonthData[];
  allTimeSent: number;
  allTimeClicked: number;
};

export default function MonthlyReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/monthly-report")
      .then((r) => r.json())
      .then((d) => { setReport(d); setLoading(false); });
  }, []);

  if (loading) return <div className="text-gray-400 py-16 text-center">Loading report...</div>;
  if (!report) return null;

  const current = report.monthlyData[report.monthlyData.length - 1];
  const prev = report.monthlyData[report.monthlyData.length - 2];
  const clickRate = current.sent > 0 ? Math.round((current.clicked / current.sent) * 100) : 0;
  const allTimeRate = report.allTimeSent > 0 ? Math.round((report.allTimeClicked / report.allTimeSent) * 100) : 0;

  const maxSent = Math.max(...report.monthlyData.map((m) => m.sent), 1);

  function trend(current: number, prev: number) {
    if (prev === 0) return null;
    const pct = Math.round(((current - prev) / prev) * 100);
    if (pct === 0) return null;
    return { pct: Math.abs(pct), up: pct > 0 };
  }

  const sentTrend = trend(current.sent, prev?.sent ?? 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Monthly Report</h1>
        <p className="text-gray-500 mt-1">{report.businessName} · {current.label}</p>
      </div>

      {/* This month stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          label="Requests Sent"
          value={current.sent}
          sub={sentTrend ? `${sentTrend.up ? "▲" : "▼"} ${sentTrend.pct}% vs last month` : "This month"}
          color="blue"
          positive={sentTrend?.up}
        />
        <StatCard
          label="Links Clicked"
          value={current.clicked}
          sub="Customers engaged"
          color="green"
        />
        <StatCard
          label="Click Rate"
          value={`${clickRate}%`}
          sub="Of requests sent"
          color="purple"
        />
      </div>

      {/* All-time stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard label="All-Time Sent" value={report.allTimeSent} sub="Total requests" color="blue" />
        <StatCard label="All-Time Clicked" value={report.allTimeClicked} sub="Total engaged" color="green" />
        <StatCard label="All-Time Rate" value={`${allTimeRate}%`} sub="Overall click rate" color="purple" />
      </div>

      {/* Bar chart — last 6 months */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6">Review Requests — Last 6 Months</h2>
        <div className="flex items-end gap-3 h-40">
          {report.monthlyData.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">{m.sent}</span>
              <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: "112px" }}>
                <div
                  className="w-full bg-blue-500 rounded-t transition-all"
                  style={{ height: `${Math.round((m.sent / maxSent) * 100)}%`, minHeight: m.sent > 0 ? "4px" : "0" }}
                />
              </div>
              <span className="text-xs text-gray-400 text-center leading-tight">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Requests Sent
          </span>
        </div>
      </div>

      {/* Month breakdown table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Month-by-Month Breakdown</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Month</th>
              <th className="px-6 py-3 text-left">Sent</th>
              <th className="px-6 py-3 text-left">Clicked</th>
              <th className="px-6 py-3 text-left">Click Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...report.monthlyData].reverse().map((m) => {
              const rate = m.sent > 0 ? Math.round((m.clicked / m.sent) * 100) : 0;
              return (
                <tr key={m.label} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{m.label}</td>
                  <td className="px-6 py-3 text-gray-600">{m.sent}</td>
                  <td className="px-6 py-3 text-gray-600">{m.clicked}</td>
                  <td className="px-6 py-3">
                    <span className={`font-medium ${rate >= 30 ? "text-green-600" : rate >= 10 ? "text-yellow-600" : "text-gray-400"}`}>
                      {m.sent > 0 ? `${rate}%` : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, positive }: {
  label: string; value: string | number; sub: string; color: "blue" | "green" | "purple"; positive?: boolean;
}) {
  const colors = { blue: "text-blue-600", green: "text-green-600", purple: "text-purple-600" };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
      <p className={`text-xs mt-1 ${positive === true ? "text-green-500" : positive === false ? "text-red-400" : "text-gray-400"}`}>{sub}</p>
    </div>
  );
}
