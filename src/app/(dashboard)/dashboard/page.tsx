import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    include: { client: true },
  });

  const client = user?.client;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-gray-500 mt-1">{client?.businessName} Dashboard</p>
      </div>

      {/* Upgrade banner for FREE plan */}
      {client?.plan === "FREE" && (
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">You&apos;re on the Free plan</p>
            <p className="text-blue-100 text-sm mt-1">Upgrade to unlock automation, review requests, and more.</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Google Reviews" value="—" sub="Connect to see data" color="yellow" />
        <StatCard title="Social Posts" value="0" sub="Drafts waiting" color="blue" />
        <StatCard title="Active Leads" value="0" sub="This month" color="green" />
        <StatCard title="Plan" value={client?.plan ?? "FREE"} sub="Upgrade anytime" color="purple" />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <ActionCard icon="⭐" title="Review Requests" desc="Send review requests to your customers via email or SMS." href="#" comingSoon />
        <ActionCard icon="📱" title="Social Media Drafts" desc="View and approve AI-generated posts for your business." href="#" comingSoon />
        <ActionCard icon="📊" title="Monthly Report" desc="See your latest performance report and insights." href="#" comingSoon />
        <ActionCard icon="📍" title="Google Business" desc="Optimize your Google Business Profile listing." href="#" comingSoon />
        <ActionCard icon="💳" title="Billing & Plan" desc="Manage your subscription and payment method." href="/dashboard/billing" />
        <ActionCard icon="⚙️" title="Business Settings" desc="Update your business info, hours, and contact details." href="/dashboard/settings" />
      </div>

      {/* Setup Checklist */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started Checklist</h2>
        <div className="space-y-3">
          <CheckItem done label="Create your account" />
          <CheckItem done={false} label="Complete your business profile" />
          <CheckItem done={false} label="Connect Google Business Profile" />
          <CheckItem done={false} label="Send your first review request" />
          <CheckItem done={false} label="Approve your first social post" />
          <CheckItem done={client?.plan !== "FREE"} label="Upgrade to a paid plan" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, color }: {
  title: string; value: string; sub: string; color: "yellow" | "blue" | "green" | "purple";
}) {
  const colors = {
    yellow: "text-yellow-600",
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function ActionCard({ icon, title, desc, href, comingSoon }: {
  icon: string; title: string; desc: string; href: string; comingSoon?: boolean;
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow block">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {comingSoon && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Coming soon</span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </Link>
  );
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
        done ? "bg-green-500 text-white" : "border-2 border-gray-300 text-transparent"
      }`}>✓</div>
      <span className={done ? "text-gray-400 line-through" : "text-gray-700"}>{label}</span>
    </div>
  );
}
