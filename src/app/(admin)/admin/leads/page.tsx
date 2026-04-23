import { prisma } from "@/lib/prisma";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">{leads.length} total leads</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {leads.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-medium text-gray-600">No leads yet</p>
            <p className="text-sm mt-1">Leads will appear here when someone submits the audit form.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Business</th>
                  <th className="px-6 py-3 text-left">Owner</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Website</th>
                  <th className="px-6 py-3 text-left">City</th>
                  <th className="px-6 py-3 text-left">Industry</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead: typeof leads[0]) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{lead.businessName}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.ownerName ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.phone ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Visit
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{lead.city ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.industry ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.status === "NEW" ? "bg-blue-100 text-blue-700" :
                        lead.status === "CONTACTED" ? "bg-yellow-100 text-yellow-700" :
                        lead.status === "CONVERTED" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {lead.status}
                      </span>
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
