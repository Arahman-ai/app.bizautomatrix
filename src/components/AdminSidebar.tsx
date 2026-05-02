"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/prospects", label: "Prospects", icon: "🔍" },
  { href: "/admin/leads", label: "Leads", icon: "🎯" },
  { href: "/admin/clients", label: "Clients", icon: "👥" },
];

export default function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const path = usePathname();

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <Link href="/admin" className="text-xl font-bold">
          <span className="text-blue-400">Biz</span>Automatrix
        </Link>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map((item) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate">{user?.name}</p>
        <Link
          href="/api/auth/signout"
          className="text-xs text-red-400 hover:text-red-300 mt-1 block"
        >
          Sign out
        </Link>
      </div>
    </aside>
  );
}
