import Navbar from "@/components/Navbar";
import AuditForm from "@/components/AuditForm";
import Link from "next/link";

const FEATURES = [
  {
    icon: "⭐",
    title: "Automated Review Requests",
    desc: "Send review request emails and SMS to every customer automatically. More 5-star reviews = higher rank on Google Maps.",
  },
  {
    icon: "📍",
    title: "Google Business Profile Audit",
    desc: "We score your GBP across 10 ranking factors and fix every gap — category, description, photos, hours, and posts.",
  },
  {
    icon: "📈",
    title: "Rank Tracker",
    desc: "Weekly tracking of where your business ranks on Google Maps and web search for your target keywords.",
  },
  {
    icon: "📋",
    title: "Citation Building",
    desc: "Get listed on 30+ business directories with consistent NAP data — one of Google's strongest local trust signals.",
  },
  {
    icon: "🏆",
    title: "Competitor Analysis",
    desc: "See exactly how you compare against local competitors on reviews, rankings, and GBP optimization.",
  },
  {
    icon: "📄",
    title: "Monthly SEO Reports",
    desc: "Professional PDF reports showing rank movement, review growth, and citation progress — shareable with stakeholders.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Get Your Free Audit",
    desc: "Submit your business in 60 seconds. See your instant visibility score — and exactly what's hurting your ranking.",
  },
  {
    step: "2",
    title: "We Build Your SEO Foundation",
    desc: "We optimize your Google Business Profile, fix your NAP, build citations, and set up automated review requests.",
  },
  {
    step: "3",
    title: "Watch Your Ranking Climb",
    desc: "Weekly rank tracking shows your progress. More reviews flow in automatically. Clients see results in 60–90 days.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: 0,
    features: [
      "Dashboard & settings access",
      "No review requests",
      "No SEO tools",
      "Great for exploring the platform",
    ],
  },
  {
    name: "Starter",
    price: 49,
    features: [
      "100 review requests / month",
      "GBP audit & optimization checklist",
      "SEO task checklist",
      "Monthly performance report",
      "Next Best Action widget",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: 99,
    highlight: true,
    features: [
      "500 review requests / month",
      "Everything in Starter",
      "Rank tracker (Maps & website)",
      "Citation tracker (30+ directories)",
      "Competitor analysis",
      "Site audit & PageSpeed scores",
      "Full SEO report",
      "AI social media drafts",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: 199,
    features: [
      "Unlimited review requests",
      "Everything in Growth",
      "Dedicated account manager",
      "Monthly strategy call",
      "White-label PDF reports",
      "Multi-location support",
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
            For Local Business Owners
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Your Customers Are Searching.<br />Are They Finding You?
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Most local businesses are invisible on Google Maps and web search — while competitors with more reviews and better profiles take every customer. BizAutomatrix fixes that.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8 text-sm text-blue-100">
            <span className="bg-blue-500/40 px-4 py-2 rounded-full">✓ More Google reviews — automatically</span>
            <span className="bg-blue-500/40 px-4 py-2 rounded-full">✓ Higher rank on Google Maps</span>
            <span className="bg-blue-500/40 px-4 py-2 rounded-full">✓ See exactly where you're losing customers</span>
          </div>
          <a
            href="#audit"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Get Your Free Business Audit →
          </a>
          <p className="mt-4 text-blue-200 text-sm">
            Takes 60 seconds. Completely free. No credit card.
          </p>
        </div>
      </section>

      {/* Problem bar */}
      <section className="bg-blue-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-blue-300 text-sm font-medium uppercase tracking-widest mb-5">The problem most local businesses face</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-blue-800/60 rounded-xl p-5">
              <div className="text-3xl mb-2">😤</div>
              <p className="font-semibold text-white mb-1">Invisible on Google Maps</p>
              <p className="text-blue-300 text-sm">Competitors with more reviews rank higher and steal your customers — even if your business is better.</p>
            </div>
            <div className="bg-blue-800/60 rounded-xl p-5">
              <div className="text-3xl mb-2">⏰</div>
              <p className="font-semibold text-white mb-1">No Time for Marketing</p>
              <p className="text-blue-300 text-sm">You&apos;re running your business. Posting on social media, asking for reviews, optimizing your profile — it never gets done.</p>
            </div>
            <div className="bg-blue-800/60 rounded-xl p-5">
              <div className="text-3xl mb-2">📉</div>
              <p className="font-semibold text-white mb-1">Don&apos;t Know What&apos;s Wrong</p>
              <p className="text-blue-300 text-sm">Without a clear audit, you&apos;re guessing. You don&apos;t know which specific issues are costing you customers every day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600 text-lg">From invisible to ranking — in 3 steps.</p>
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
              Find Out Why You&apos;re Not Ranking
            </h2>
            <p className="text-gray-600 text-lg">
              Get your instant visibility score and a clear breakdown of what&apos;s stopping customers from finding you on Google.
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
              Everything Your Business Needs
            </h2>
            <p className="text-gray-600 text-lg">One platform to manage your entire online presence.</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Promise to You</h2>
            <p className="text-gray-600 text-lg">We stand behind everything we do.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">30-Day Money-Back Guarantee</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                If you don&apos;t see results in your first 30 days, we&apos;ll refund your first month — no questions asked.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-5xl mb-4">🚫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Long-Term Contracts</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Cancel anytime with one click. No cancellation fees, no fine print, no hassle. We earn your business every month.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-5xl mb-4">📞</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real Human Support</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                You get a real person — not a chatbot. Call or email us anytime and we&apos;ll respond within one business day.
              </p>
            </div>
          </div>
          <div className="mt-12 bg-blue-600 rounded-2xl p-8 text-center text-white">
            <p className="text-2xl font-bold mb-2">Start risk-free today</p>
            <p className="text-blue-100 mb-6">Get your free business audit — no credit card required.</p>
            <a
              href="#audit"
              className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-blue-50 transition-colors"
            >
              Get Your Free Audit →
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 text-lg">No contracts. No setup fees. Cancel anytime.</p>
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
                  <div className="flex items-end gap-1">
                    {plan.price === 0 ? (
                      <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-gray-900"}`}>Free</span>
                    ) : (
                      <>
                        <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-gray-900"}`}>${plan.price}</span>
                        <span className={`text-sm mb-1.5 ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>/mo</span>
                      </>
                    )}
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
                  href={plan.price === 0 ? "/signup" : "/signup"}
                  className={`w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.highlight
                      ? "bg-white text-blue-600 hover:bg-yellow-400 hover:text-yellow-900"
                      : plan.price === 0
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-900 text-white hover:bg-blue-600"
                  }`}
                >
                  {plan.price === 0 ? "Start for Free →" : "Get Started →"}
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

      {/* CTA */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Your Competitors Are Getting Found. You Should Be Too.</h2>
          <p className="text-blue-100 text-lg mb-8">
            Get your free audit in 60 seconds and see your exact visibility score.
          </p>
          <a
            href="#audit"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-blue-50 transition-colors"
          >
            Get My Free Audit Score →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="font-bold text-white text-xl">BizAutomatrix</p>
            <p className="text-sm mt-1">Grow your local business on autopilot.</p>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <a href="mailto:info@bizautomatrix.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} BizAutomatrix</p>
        </div>
      </footer>
    </div>
  );
}
