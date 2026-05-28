import Navbar from "@/components/Navbar";
import AuditForm from "@/components/AuditForm";
import Link from "next/link";

const FEATURES = [
  {
    icon: "SEO",
    title: "Website + SEO Audits",
    desc: "Crawl client websites, find technical SEO issues, create tasks, and generate a practical report before paid work begins.",
  },
  {
    icon: "RFQ",
    title: "Quote & Inquiry Flow",
    desc: "Improve quote forms, WhatsApp/call/email CTAs, lead tracking, and follow-up so qualified inquiries do not get lost.",
  },
  {
    icon: "REV",
    title: "Review Management",
    desc: "Save Google review links, create QR codes, prepare request templates, and track review-request activity.",
  },
  {
    icon: "GBP",
    title: "Google Business & Citations",
    desc: "Audit GBP, NAP consistency, citations, and local trust signals for businesses that depend on search visibility.",
  },
  {
    icon: "CRM",
    title: "Task & Lead Dashboard",
    desc: "Turn audit issues into automated, semi-automated, and manual tasks that an admin can review and complete.",
  },
  {
    icon: "AI",
    title: "AI-Assisted Workflow Ideas",
    desc: "Plan next-step automations such as customer follow-up, service documentation, product catalogs, and reporting.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Run a Free Audit",
    desc: "Review the website, SEO, review flow, inquiry process, and automation opportunities before asking for payment.",
  },
  {
    step: "2",
    title: "Approve a 7-Day Scope",
    desc: "Choose the first paid upgrade: website fixes, product/service SEO, quote flow, review setup, or dashboard work.",
  },
  {
    step: "3",
    title: "Track Monthly Progress",
    desc: "Use the dashboard for SEO tasks, review requests, citations, competitors, reports, and next automation steps.",
  },
];

const PLANS = [
  {
    name: "Free Audit",
    price: 0,
    priceLabel: "No Cost",
    period: "first step",
    features: [
      "Website + SEO review",
      "Quote/contact flow check",
      "Review automation opportunity",
      "Top 5 quick wins",
    ],
  },
  {
    name: "BD Starter",
    price: 250,
    priceLabel: "Custom Quote",
    period: "after audit",
    features: [
      "Bangladesh starter scope after audit",
      "7-day implementation sprint",
      "SEO task setup",
      "Quote or WhatsApp inquiry flow",
      "Review link and QR setup",
      "Audit report and roadmap",
    ],
  },
  {
    name: "US Starter",
    price: 500,
    priceLabel: "Custom Quote",
    period: "after audit",
    highlight: true,
    features: [
      "USA starter scope after audit",
      "7-day implementation sprint",
      "Website and conversion fixes",
      "Review request workflow",
      "Lead tracking dashboard",
      "PDF audit report",
      "Monthly support option",
    ],
  },
  {
    name: "Monthly Support",
    price: 150,
    priceLabel: "Call Us",
    period: "after setup",
    features: [
      "Starts after setup",
      "Monthly SEO report",
      "Review management",
      "SEO task follow-up",
      "Competitor checks",
      "Dashboard review call",
    ],
  },
];


export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-200 font-medium mb-4 uppercase tracking-widest text-sm">
            For industrial, local, engineering, and product businesses
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Turn Your Website Into<br />A Sales + Automation System
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start with a free audit, then use BizAutomatrix to plan website upgrades, SEO tasks, review automation, quote capture, lead tracking, and AI-assisted follow-up.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8 text-sm text-blue-100">
            <span className="bg-blue-500/40 px-4 py-2 rounded-full">Website + SEO audit</span>
            <span className="bg-blue-500/40 px-4 py-2 rounded-full">Review + quote flow</span>
            <span className="bg-blue-500/40 px-4 py-2 rounded-full">7-day starter scope</span>
          </div>
          <a
            href="#audit"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Request Free Audit
          </a>
          <p className="mt-4 text-blue-200 text-sm">
            Free audit first. Paid implementation only after scope approval.
          </p>
        </div>
      </section>

      {/* Problem bar */}
      <section className="bg-blue-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-blue-300 text-sm font-medium uppercase tracking-widest mb-5">The problem most websites have</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-blue-800/60 rounded-xl p-5">
              <div className="text-3xl mb-2">😤</div>
              <p className="font-semibold text-white mb-1">Weak Buyer Path</p>
              <p className="text-blue-300 text-sm">Visitors cannot quickly find services, products, proof, quote options, or the right next step.</p>
            </div>
            <div className="bg-blue-800/60 rounded-xl p-5">
              <div className="text-3xl mb-2">⏰</div>
              <p className="font-semibold text-white mb-1">Manual Follow-Up</p>
              <p className="text-blue-300 text-sm">Quote requests, reviews, and leads are handled manually, so follow-up depends on memory instead of a system.</p>
            </div>
            <div className="bg-blue-800/60 rounded-xl p-5">
              <div className="text-3xl mb-2">📉</div>
              <p className="font-semibold text-white mb-1">No Clear Priority</p>
              <p className="text-blue-300 text-sm">Without an audit, it is hard to know whether to fix SEO, pages, reviews, quote flow, or automation first.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600 text-lg">From audit to first implementation scope in 3 steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-5">
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit Form */}
      <section id="audit" className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Find the First Upgrade Worth Doing
            </h2>
            <p className="text-gray-600 text-lg">
              Send the business details and website. We will review SEO, review flow, inquiry capture, and automation opportunities.
            </p>
            <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
              <a
                href="tel:+14042037674"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.13 12.8a19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                +1 (404) 203-7674
              </a>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <a
                href="mailto:info@bizautomatrix.com"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                info@bizautomatrix.com
              </a>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <AuditForm />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything Needed for the First Client Sprint
            </h2>
            <p className="text-gray-600 text-lg">One platform for audits, SEO tasks, review workflows, reports, and next actions.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple First Step</h2>
            <p className="text-gray-600 text-lg">Free audit first. Paid work only after the scope is clear.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Free Audit Before Payment</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We review the website, SEO, reviews, and inquiry flow before proposing paid implementation.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-5xl mb-4">🚫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">7-Day Starter Scope</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The first paid package stays focused on the highest-impact website, SEO, review, and inquiry fixes.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-5xl mb-4">📞</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Monthly Only If Useful</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ongoing SEO, review, report, and automation support can start after the first implementation is live.
              </p>
            </div>
          </div>
          <div className="mt-12 bg-blue-600 rounded-2xl p-8 text-center text-white">
            <p className="text-2xl font-bold mb-2">Start with the free audit</p>
            <p className="text-blue-100 mb-6">We will show the first upgrade worth doing before any paid implementation.</p>
            <a
              href="#audit"
              className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-blue-50 transition-colors"
            >
              Request Free Audit
            </a>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Packages</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Free Audit, Then Custom Scope</h2>
            <p className="text-gray-500 text-lg">We quote after reviewing the website, SEO, reviews, inquiry flow, and automation needs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 flex flex-col relative ${
                  plan.highlight
                    ? "bg-blue-600 shadow-2xl shadow-blue-200 scale-105"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full whitespace-nowrap">
                    ⭐ Most Popular
                  </span>
                )}
                <div className="mb-5">
                  <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="space-y-1">
                    <span className={`text-3xl leading-tight font-extrabold ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.priceLabel}</span>
                    <span className={`block text-sm ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.highlight ? "text-blue-100" : "text-gray-600"}`}>
                      <span className={`mt-0.5 flex-shrink-0 font-bold ${plan.highlight ? "text-yellow-300" : "text-blue-500"}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === "Monthly Support" ? "tel:+14042037674" : "/signup"}
                  className={`w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.highlight
                      ? "bg-white text-blue-600 hover:bg-yellow-400 hover:text-yellow-900"
                      : plan.price === 0
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-900 text-white hover:bg-blue-600"
                  }`}
                >
                  {plan.price === 0
                    ? "Request Free Audit ->"
                    : plan.name === "Monthly Support"
                    ? "Call Us for Pricing ->"
                    : "Book Demo Call ->"}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-10">
            Need a custom plan for multiple locations or agencies?{" "}
            <a href="mailto:info@bizautomatrix.com" className="text-blue-600 hover:underline font-medium">
              Contact us →
            </a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Common Questions</h2>
            <p className="text-gray-500 text-lg">Everything you need to know before getting started.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "What happens after the free audit?",
                a: "You receive the main issues, quick wins, and a recommended first scope. Paid work starts only if you approve that scope.",
              },
              {
                q: "How much does the first paid step cost?",
                a: "We do not publish fixed public pricing. After the free audit, we share a clear quote based on the website, SEO, review flow, inquiry path, and automation scope.",
              },
              {
                q: "What does the platform help manage?",
                a: "The app helps with site audits, SEO tasks, PageSpeed checks, review management, citations, competitors, rank tracking, and reports.",
              },
              {
                q: "How do review requests work?",
                a: "You enter a customer's name and email in your dashboard. We send them a branded email with a direct link to your Google review page. You can track who clicked and who left a review.",
              },
              {
                q: "Can this support industrial and engineering businesses?",
                a: "Yes. The workflow is designed for local businesses, engineering firms, manufacturers, railway suppliers, product catalogs, and service providers.",
              },
              {
                q: "Do you need website access immediately?",
                a: "No. We can start with a public audit. Access is needed only after a paid implementation scope is approved.",
              },
              {
                q: "Can we continue monthly after the starter?",
                a: "Yes. Monthly support can cover SEO tasks, reviews, reporting, content, citations, and automation improvements.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="bg-white border border-gray-200 rounded-2xl group">
                <summary className="flex justify-between items-center px-6 py-5 cursor-pointer font-semibold text-gray-900 list-none">
                  {q}
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Find the First Upgrade Worth Doing.</h2>
          <p className="text-blue-100 text-lg mb-8">
            Start with a free audit, then decide whether the 7-day implementation scope is worth paying for.
          </p>
          <a
            href="#audit"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-blue-50 transition-colors"
          >
            Request Free Audit
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="font-bold text-white text-xl">BizAutomatrix</p>
            <p className="text-sm mt-1">Website, SEO, review, and automation systems.</p>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Packages</a>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <a href="https://bizautomatrix.com" className="hover:text-white transition-colors">Main Website</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <a href="mailto:info@bizautomatrix.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} BizAutomatrix</p>
        </div>
      </footer>
    </div>
  );
}
