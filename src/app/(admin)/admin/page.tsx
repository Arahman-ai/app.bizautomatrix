import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [totalLeads, totalClients, pendingAudits, newLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.client.count(),
    prisma.audit.count({ where: { status: "PENDING" } }),
    prisma.lead.count({ where: { status: "NEW" } }),
  ]);

  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Stat label="Total Leads" value={totalLeads} color="blue" />
        <Stat label="New Leads" value={newLeads} color="green" />
        <Stat label="Active Clients" value={totalClients} color="purple" />
        <Stat label="Pending Audits" value={pendingAudits} color="yellow" />
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Recent Leads</h2>
          <a href="/admin/leads" className="text-sm text-blue-600 hover:underline">
            View all →
          </a>
        </div>

        {recentLeads.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            No leads yet. They will appear here when someone submits the audit form.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Business</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">City</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {lead.businessName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.city ?? "—"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
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

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    CONTACTED: "bg-yellow-100 text-yellow-700",
    QUALIFIED: "bg-purple-100 text-purple-700",
    CONVERTED: "bg-green-100 text-green-700",
    LOST: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
