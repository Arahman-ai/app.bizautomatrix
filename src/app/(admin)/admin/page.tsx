import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [
    totalLeads, newLeads, totalClients,
    totalProspects, pendingProspects, contactedProspects, rejectedProspects,
    emailsSent,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.client.count(),
    prisma.prospect.count(),
    prisma.prospect.count({ where: { status: "PENDING" } }),
    prisma.prospect.count({ where: { status: "CONTACTED" } }),
    prisma.prospect.count({ where: { status: "REJECTED" } }),
    prisma.prospect.count({ where: { emailSentAt: { not: null } } }),
  ]);

  const conversionRate = totalProspects > 0
    ? Math.round((contactedProspects / totalProspects) * 100)
    : 0;

  const recentContacted = await prisma.prospect.findMany({
    where: { emailSentAt: { not: null } },
    orderBy: { emailSentAt: "desc" },
    take: 5,
  });

  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all activity</p>
      </div>

      {/* ── Prospect Pipeline ── */}
      <div className="mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Prospect Pipeline</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Stat label="Total Prospects" value={totalProspects} color="gray" />
        <Stat label="Pending Review" value={pendingProspects} color="yellow" />
        <Stat label="Emails Sent" value={emailsSent} color="blue" />
        <Stat label="Contacted" value={contactedProspects} color="green" />
        <StatPercent label="Conversion Rate" value={conversionRate} />
      </div>

      {/* ── Platform Overview ── */}
      <div className="mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Platform Overview</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        <Stat label="Total Leads" value={totalLeads} color="blue" />
        <Stat label="New Leads" value={newLeads} color="green" />
        <Stat label="Active Clients" value={totalClients} color="purple" />
        <Stat label="Rejected Prospects" value={rejectedProspects} color="red" />
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Contacted */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recently Emailed</h2>
            <a href="/admin/prospects?status=CONTACTED" className="text-sm text-blue-600 hover:underline">View all →</a>
          </div>
          {recentContacted.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">No emails sent yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Business</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentContacted.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900 truncate max-w-[160px]">{p.businessName}</td>
                    <td className="px-6 py-3 text-gray-500 truncate max-w-[160px]">{p.email ?? "—"}</td>
                    <td className="px-6 py-3 text-gray-400 whitespace-nowrap">
                      {p.emailSentAt ? new Date(p.emailSentAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Leads</h2>
            <a href="/admin/leads" className="text-sm text-blue-600 hover:underline">View all →</a>
          </div>
          {recentLeads.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">No leads yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Business</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900 truncate max-w-[160px]">{lead.businessName}</td>
                    <td className="px-6 py-3 text-gray-500 truncate max-w-[160px]">{lead.email}</td>
                    <td className="px-6 py-3"><StatusBadge status={lead.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-600", green: "text-green-600", purple: "text-purple-600",
    yellow: "text-yellow-600", red: "text-red-500", gray: "text-gray-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function StatPercent({ label, value }: { label: string; value: number }) {
  const color = value >= 20 ? "text-green-600" : value >= 10 ? "text-yellow-600" : "text-gray-500";
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}%</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700", CONTACTED: "bg-yellow-100 text-yellow-700",
    QUALIFIED: "bg-purple-100 text-purple-700", CONVERTED: "bg-green-100 text-green-700",
    LOST: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
