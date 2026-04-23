import { prisma } from "@/lib/prisma";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-500 mt-1">{clients.length} total clients</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {clients.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium text-gray-600">No clients yet</p>
            <p className="text-sm mt-1">Clients appear here when they sign up.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Business</th>
                  <th className="px-6 py-3 text-left">Owner</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Plan</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client: typeof clients[0]) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {client.businessName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {client.user.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {client.user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.plan === "PRO" ? "bg-purple-100 text-purple-700" :
                        client.plan === "GROWTH" ? "bg-blue-100 text-blue-700" :
                        client.plan === "STARTER" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {client.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(client.createdAt).toLocaleDateString()}
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
