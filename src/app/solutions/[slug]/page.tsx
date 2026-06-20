import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";

const SOLUTIONS = {
  "ai-automation": {
    eyebrow: "Software, AI, and workflow automation",
    title: "AI Automation for Daily Business Work",
    summary:
      "Custom AI agents, email automation, workflow systems, dashboards, and reporting flows that reduce manual work across sales, service, operations, and management.",
    mainWebsiteHref: "https://bizautomatrix.com/#software-ai",
    primaryUseCases: [
      "Email follow-up automation for leads, quotes, reviews, and client updates",
      "Custom AI agents for customer support, internal Q&A, document search, and team assistance",
      "AI workflows for daily, weekly, and monthly reports",
      "n8n, CRM, spreadsheet, email, database, and API integrations",
      "Dashboards for pipeline, tasks, operations, and client status",
      "Content, SEO, social, and review workflow support",
    ],
    auditChecks: [
      "Which repeated tasks happen every day or week",
      "Where leads or internal requests get delayed",
      "Which reports are created manually",
      "Which tools need to connect with each other",
      "What data should be searchable by an AI assistant",
    ],
    starterScopes: [
      "Lead and quote follow-up workflow",
      "Daily reporting dashboard",
      "Internal AI assistant for documents and FAQs",
      "Review request and customer email automation",
    ],
  },
  manufacturing: {
    eyebrow: "Manufacturing operations and digital systems",
    title: "Manufacturing Automation, Dashboards, and Asset Workflows",
    summary:
      "Practical software and AI support for manufacturers that need clearer product pages, quote capture, maintenance tracking, asset workflows, reporting, and production visibility.",
    mainWebsiteHref: "https://bizautomatrix.com/#engineering",
    primaryUseCases: [
      "Product catalog, RFQ, and service inquiry workflows",
      "Maintenance logs, work orders, asset registers, and inspection forms",
      "Production, downtime, quality, and OEE-style dashboards",
      "AI-assisted SOP, manual, and technical document search",
      "Inventory, spare parts, supplier, and purchase follow-up workflows",
      "Website and SEO upgrades for manufacturers and industrial suppliers",
    ],
    auditChecks: [
      "How prospects request quotes or technical information",
      "How maintenance and asset records are stored today",
      "Which reports take the most manual time",
      "Which product or service pages need better SEO",
      "Where a simple dashboard can create the fastest value",
    ],
    starterScopes: [
      "Industrial website and RFQ flow upgrade",
      "Asset and maintenance tracking dashboard",
      "Production or quality reporting workflow",
      "AI document assistant for SOPs and manuals",
    ],
  },
  railway: {
    eyebrow: "Railway suppliers, maintenance, and technical workflows",
    title: "Railway Business Support, Reporting, and AI Workflows",
    summary:
      "A focused upgrade path for railway suppliers, service teams, and technical businesses: better websites, tender support, asset records, maintenance workflows, and AI-assisted reporting.",
    mainWebsiteHref: "https://bizautomatrix.com/#engineering",
    primaryUseCases: [
      "Railway supplier websites with product, service, and project pages",
      "Tender, document, certificate, and compliance tracking",
      "Maintenance, inspection, and asset record workflows",
      "Project status dashboards for internal and client reporting",
      "AI knowledge bases for technical papers, manuals, and procedures",
      "Lead capture, quote follow-up, and customer communication workflows",
    ],
    auditChecks: [
      "Whether railway buyers can understand services quickly",
      "How documents, drawings, certificates, and reports are managed",
      "Where inspection or maintenance data is currently stored",
      "Which project updates are repeated manually",
      "Which pages and keywords can bring qualified inquiries",
    ],
    starterScopes: [
      "Railway supplier website upgrade",
      "Tender and document tracking workflow",
      "Inspection and maintenance reporting dashboard",
      "AI knowledge assistant for railway documents",
    ],
  },
} as const;

type SolutionSlug = keyof typeof SOLUTIONS;

export function generateStaticParams() {
  return Object.keys(SOLUTIONS).map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const solution = SOLUTIONS[slug as SolutionSlug];

  if (!solution) return {};

  return {
    title: `${solution.title} | BizAutomatrix`,
    description: solution.summary,
  };
}

export default async function SolutionPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const solution = SOLUTIONS[slug as SolutionSlug];

  if (!solution) notFound();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 px-4 py-20 text-white">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-200">
                {solution.eyebrow}
              </p>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
                {solution.title}
              </h1>
              <p className="mb-8 text-lg leading-8 text-blue-100 md:text-xl">
                {solution.summary}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/#audit"
                  className="rounded-full bg-white px-6 py-3 font-bold text-blue-700 transition-colors hover:bg-blue-50"
                >
                  Request Free Audit
                </Link>
                <a
                  href={solution.mainWebsiteHref}
                  className="rounded-full border border-blue-300 px-6 py-3 font-bold text-white transition-colors hover:bg-white hover:text-blue-700"
                >
                  View on Main Website
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
                What this can automate
              </p>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Practical systems before expensive complexity.
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {solution.primaryUseCases.map((item) => (
                  <div key={item} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="font-medium leading-7 text-gray-800">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-700">
                First audit checks
              </p>
              <ul className="space-y-3">
                {solution.auditChecks.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-gray-700">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
                Starter implementation ideas
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                Start with one useful workflow, then expand.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-4">
              {solution.starterScopes.map((item, index) => (
                <div key={item} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="font-semibold leading-7 text-gray-900">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl rounded-3xl bg-blue-600 p-8 text-center text-white md:p-12">
            <h2 className="mb-3 text-3xl font-bold">Need this connected to the live app?</h2>
            <p className="mx-auto mb-7 max-w-2xl text-blue-100">
              We can start with a free audit, then scope the first website, SEO, dashboard, email, AI agent, or reporting workflow that creates the fastest value.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/#audit"
                className="rounded-full bg-white px-6 py-3 font-bold text-blue-700 transition-colors hover:bg-blue-50"
              >
                Request Free Audit
              </Link>
              <a
                href="mailto:info@bizautomatrix.com"
                className="rounded-full border border-blue-200 px-6 py-3 font-bold text-white transition-colors hover:bg-white hover:text-blue-700"
              >
                Email info@bizautomatrix.com
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
