"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊", section: null },
  { href: "/admin/prospects", label: "Prospects", icon: "🔍", section: null },
  { href: "/admin/leads", label: "Leads", icon: "🎯", section: null },
  { href: "/admin/clients", label: "Clients", icon: "👥", section: null },
  { href: "/admin/email-template", label: "Email Template", icon: "✉️", section: null },
  { href: "/admin/rank-tracker", label: "Rank Tracker", icon: "📈", section: "SEO Tools" },
  { href: "/admin/gbp-audit", label: "GBP Audit", icon: "📍", section: "SEO Tools" },
  { href: "/admin/citations", label: "Citations", icon: "📋", section: "SEO Tools" },
  { href: "/admin/seo-tasks", label: "SEO Tasks", icon: "✅", section: "SEO Tools" },
  { href: "/admin/competitors", label: "Competitors", icon: "🏆", section: "SEO Tools" },
  { href: "/admin/site-audit", label: "Site Audit", icon: "⚡", section: "SEO Tools" },
  { href: "/admin/seo-report", label: "SEO Report", icon: "📄", section: "SEO Tools" },
];

export default function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <aside className="w-60 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <Link href="/admin" className="text-xl font-bold" onClick={() => setOpen(false)}>
          <span className="text-blue-400">Biz</span>Automatrix
        </Link>
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setOpen(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="px-6 text-xs text-gray-400 pt-2">Admin Panel</p>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map((item, i) => {
          const active = path === item.href;
          const showSection = item.section && (i === 0 || NAV[i - 1].section !== item.section);
          return (
            <div key={item.href}>
              {showSection && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-4 pt-4 pb-1">{item.section}</p>
              )}
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate">{user?.name || user?.email}</p>
        <Link
          href="/dashboard"
          className="text-xs text-blue-400 hover:text-blue-300 mt-2 block"
        >
          🔀 Switch to Client View
        </Link>
        <Link
          href="/api/auth/signout"
          className="text-xs text-red-400 hover:text-red-300 mt-1 block"
        >
          Sign out
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
        onClick={() => setOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="flex">{sidebar}</div>
          <div className="flex-1 bg-black bg-opacity-50" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
