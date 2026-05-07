"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞", section: null },
  { href: "/dashboard/reviews", label: "Review Requests", icon: "⭐", section: null },
  { href: "/dashboard/monthly-report", label: "Monthly Report", icon: "📊", section: null },
  { href: "/dashboard/social-drafts", label: "Social Media Drafts", icon: "📱", section: null },
  { href: "/dashboard/rank-tracker", label: "Rank Tracker", icon: "📈", section: "SEO" },
  { href: "/dashboard/gbp-audit", label: "GBP Audit", icon: "📍", section: "SEO" },
  { href: "/dashboard/citations", label: "Citations", icon: "📋", section: "SEO" },
  { href: "/dashboard/seo-tasks", label: "SEO Action Plan", icon: "✅", section: "SEO" },
  { href: "/dashboard/competitors", label: "Competitors", icon: "🏆", section: "SEO" },
  { href: "/dashboard/site-audit", label: "Site Audit", icon: "⚡", section: "SEO" },
  { href: "/dashboard/seo-report", label: "SEO Report", icon: "📄", section: "SEO" },
  { href: "/dashboard/google-business", label: "Google Business", icon: "🔧", section: "Settings" },
  { href: "/dashboard/billing", label: "Billing & Plan", icon: "💳", section: "Settings" },
  { href: "/dashboard/settings", label: "Business Settings", icon: "⚙️", section: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/onboarding") return;
    fetch("/api/client/profile")
      .then(r => r.json())
      .then(d => {
        if (d.client && d.client.setupComplete === false) {
          router.replace("/onboarding");
        }
      });
  }, [pathname, router]);

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const showSection = item.section && (i === 0 || navItems[i - 1].section !== item.section);
          return (
            <div key={item.href}>
              {showSection && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 pt-4 pb-1">{item.section}</p>
              )}
              <Link
                href={item.href}
                onClick={onNav}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="text-lg font-bold">
          <span className="text-blue-600">Biz</span>
          <span className="text-gray-900">Automatrix</span>
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </header>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg z-20 fixed top-[57px] left-0 right-0">
          <SidebarContent onNav={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-10 bg-black/20 top-[57px]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col min-h-screen sticky top-0">
          <div className="px-6 py-5 border-b border-gray-200">
            <Link href="/" className="text-xl font-bold">
              <span className="text-blue-600">Biz</span>
              <span className="text-gray-900">Automatrix</span>
            </Link>
          </div>
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 overflow-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
        {[
          { href: "/dashboard", label: "Home", icon: "⊞" },
          { href: "/dashboard/reviews", label: "Reviews", icon: "⭐" },
          { href: "/dashboard/google-business", label: "Google", icon: "📍" },
          { href: "/dashboard/billing", label: "Billing", icon: "💳" },
          { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
              pathname === item.href ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
