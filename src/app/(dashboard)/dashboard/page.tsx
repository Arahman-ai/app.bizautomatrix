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

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const reviewRequestsThisMonth = client
    ? await prisma.reviewRequest.count({
        where: {
          clientId: client.id,
          createdAt: { gte: startOfMonth },
        },
      })
    : 0;

  const reviewRequestsClicked = client
    ? await prisma.reviewRequest.count({
        where: { clientId: client.id, status: "CLICKED" },
      })
    : 0;

  const hasGoogleLink = !!client?.googleReviewLink;
  const hasProfile = !!(client?.businessName && client?.phone && client?.city);

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
        <StatCard title="Review Requests" value={String(reviewRequestsThisMonth)} sub="Sent this month" color="yellow" />
        <StatCard title="Links Clicked" value={String(reviewRequestsClicked)} sub="Customers engaged" color="green" />
        <StatCard title="Click Rate" value={reviewRequestsThisMonth > 0 ? `${Math.round((reviewRequestsClicked / reviewRequestsThisMonth) * 100)}%` : "—"} sub="Of requests sent" color="blue" />
        <StatCard title="Plan" value={client?.plan ?? "FREE"} sub="Upgrade anytime" color="purple" />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <ActionCard icon="⭐" title="Review Requests" desc="Send review requests to your customers via email." href="/dashboard/reviews" />
        <ActionCard icon="📱" title="Social Media Drafts" desc="View and approve AI-generated posts for your business." href="/dashboard/social-drafts" />
        <ActionCard icon="📊" title="Monthly Report" desc="See your latest performance report and insights." href="/dashboard/monthly-report" />
        <ActionCard icon="📍" title="Google Business" desc="Optimize your Google Business Profile listing." href="/dashboard/google-business" />
        <ActionCard icon="💳" title="Billing & Plan" desc="Manage your subscription and payment method." href="/dashboard/billing" />
        <ActionCard icon="⚙️" title="Business Settings" desc="Update your business info, hours, and contact details." href="/dashboard/settings" />
      </div>

      {/* Setup Checklist */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started Checklist</h2>
        <div className="space-y-3">
          <CheckItem done label="Create your account" />
          <CheckItem done={hasProfile} label="Complete your business profile" href="/dashboard/settings" />
          <CheckItem done={hasGoogleLink} label="Add your Google Review link" href="/dashboard/settings" />
          <CheckItem done={reviewRequestsThisMonth > 0} label="Send your first review request" href="/dashboard/reviews" />
          <CheckItem done={client?.plan !== "FREE"} label="Upgrade to a paid plan" href="/dashboard/billing" />
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

function CheckItem({ done, label, href }: { done: boolean; label: string; href?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
        done ? "bg-green-500 text-white" : "border-2 border-gray-300 text-transparent"
      }`}>✓</div>
      {!done && href ? (
        <Link href={href} className="text-gray-700 hover:text-blue-600 hover:underline transition-colors">
          {label}
        </Link>
      ) : (
        <span className={done ? "text-gray-400 line-through" : "text-gray-700"}>{label}</span>
      )}
    </div>
  );
}
