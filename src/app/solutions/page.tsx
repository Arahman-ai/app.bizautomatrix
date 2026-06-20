import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Solutions | BizAutomatrix",
  description:
    "Explore BizAutomatrix solution paths for AI automation, manufacturing workflows, and railway business support.",
};

const SOLUTIONS = [
  {
    title: "AI Automation",
    href: "/solutions/ai-automation",
    desc: "Email automation, AI agents, workflow systems, reporting dashboards, and CRM integrations.",
  },
  {
    title: "Manufacturing",
    href: "/solutions/manufacturing",
    desc: "RFQ flows, maintenance tracking, asset records, production reporting, and AI document support.",
  },
  {
    title: "Railway",
    href: "/solutions/railway",
    desc: "Railway supplier websites, tender workflows, inspection reporting, project dashboards, and AI knowledge bases.",
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
              Solution views
            </p>
            <h1 className="mb-5 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
              Business automation paths for real operations.
            </h1>
            <p className="text-lg leading-8 text-gray-600">
              BizAutomatrix connects website upgrades, SEO, review workflows, AI agents, dashboards, reporting, and industrial support into one practical growth system.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {SOLUTIONS.map((solution) => (
              <Link
                key={solution.href}
                href={solution.href}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-7 transition-all hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50 hover:shadow-lg"
              >
                <h2 className="mb-3 text-2xl font-bold text-gray-900">{solution.title}</h2>
                <p className="mb-6 leading-7 text-gray-600">{solution.desc}</p>
                <span className="font-semibold text-blue-600">View solution -&gt;</span>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/#audit"
              className="rounded-full bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
            >
              Request Free Audit
            </Link>
            <a
              href="https://bizautomatrix.com"
              className="rounded-full border border-gray-300 px-6 py-3 font-bold text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-700"
            >
              Back to Main Website
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
