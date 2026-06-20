"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">Biz</span>
            <span className="text-2xl font-bold text-gray-900">Automatrix</span>
          </Link>

          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/solutions/ai-automation" className="text-gray-600 hover:text-blue-600 transition-colors">
              AI Automation
            </Link>
            <Link href="/solutions/manufacturing" className="text-gray-600 hover:text-blue-600 transition-colors">
              Manufacturing
            </Link>
            <Link href="/solutions/railway" className="text-gray-600 hover:text-blue-600 transition-colors">
              Railway
            </Link>
            <Link href="/#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
              Packages
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">
              Blog
            </Link>
            <a href="https://bizautomatrix.com" className="text-gray-600 hover:text-blue-600 transition-colors">
              Main Website
            </a>
            <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
              Login
            </Link>
            <Link
              href="/#audit"
              className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
            >
              Free Audit
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-6 h-0.5 bg-gray-900 mb-1.5" />
            <div className="w-6 h-0.5 bg-gray-900 mb-1.5" />
            <div className="w-6 h-0.5 bg-gray-900" />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 flex flex-col gap-4 border-t border-gray-100">
            <Link href="/" className="text-gray-600">Home</Link>
            <Link href="/solutions/ai-automation" className="text-gray-600">AI Automation</Link>
            <Link href="/solutions/manufacturing" className="text-gray-600">Manufacturing</Link>
            <Link href="/solutions/railway" className="text-gray-600">Railway</Link>
            <Link href="/#pricing" className="text-gray-600">Packages</Link>
            <Link href="/blog" className="text-gray-600">Blog</Link>
            <a href="https://bizautomatrix.com" className="text-gray-600">Main Website</a>
            <Link href="/login" className="text-gray-600">Login</Link>
            <Link href="/#audit" className="text-blue-600 font-medium">Free Audit</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
