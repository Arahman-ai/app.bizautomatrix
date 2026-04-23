import Navbar from "@/components/Navbar";
import AuditForm from "@/components/AuditForm";
import Link from "next/link";

const FEATURES = [
  {
    icon: "⭐",
    title: "Review Management",
    desc: "Automatically request reviews, monitor feedback, and respond to protect your reputation.",
  },
  {
    icon: "📍",
    title: "Google Business Profile",
    desc: "Optimize your listing so local customers find you first on Google Maps and Search.",
  },
  {
    icon: "📱",
    title: "Social Media Automation",
    desc: "AI-generated weekly posts drafted and scheduled — you just approve and publish.",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    desc: "See all your marketing performance in one place with monthly automated reports.",
  },
  {
    icon: "💳",
    title: "Ad Campaign Assistance",
    desc: "Get AI-crafted Meta and TikTok ad copy with audience and budget suggestions.",
  },
  {
    icon: "🔔",
    title: "Lead Tracking",
    desc: "Never lose a lead. Every inquiry is captured, tracked, and followed up automatically.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Get Your Free Audit",
    desc: "Submit your business info and we analyze your entire online presence within 24 hours.",
  },
  {
    step: "2",
    title: "Review Your Report",
    desc: "See exactly where you're losing customers and what to fix — with a clear action plan.",
  },
  {
    step: "3",
    title: "We Handle Everything",
    desc: "Activate your plan and our automations take over — reviews, posts, reports, and more.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: 49,
    features: [
      "Review request automation",
      "Google Business Profile tools",
      "Monthly report",
      "Up to 100 review requests/mo",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: 99,
    highlight: true,
    features: [
      "Everything in Starter",
      "Social media post drafts",
      "Ad copy generation",
      "Up to 500 review requests/mo",
      "Competitor tracking",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: 199,
    features: [
      "Everything in Growth",
      "Full automation workflows",
      "Multi-location support",
      "Unlimited review requests",
      "Custom reporting",
      "Dedicated account manager",
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Maria Gonzalez",
    business: "Bella Hair Studio, Miami FL",
    text: "Within 3 months our Google reviews went from 12 to 87. We're now the top-rated salon in our area.",
    rating: 5,
  },
  {
    name: "James Parker",
    business: "Parker's Auto Repair, Houston TX",
    text: "I used to spend hours on social media. Now BizAutomatrix handles it and I just approve the posts.",
    rating: 5,
  },
  {
    name: "Linda Chen",
    business: "Green Leaf Restaurant, Atlanta GA",
    text: "The free audit showed us 3 things we were doing wrong on Google. Fixed them and bookings doubled.",
    rating: 5,
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
            Grow Your Business on Autopilot
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            BizAutomatrix handles your reviews, social media, Google profile, and ads
            — so you can focus on running your business.
          </p>
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

      {/* Stats Bar */}
      <section className="bg-blue-900 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">500+</div>
            <div className="text-blue-300 text-sm">Businesses Helped</div>
          </div>
          <div>
            <div className="text-2xl font-bold">4.9★</div>
            <div className="text-blue-300 text-sm">Average Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold">3x</div>
            <div className="text-blue-300 text-sm">More Online Visibility</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600 text-lg">Three steps to put your marketing on autopilot.</p>
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
              Get Your Free Business Audit
            </h2>
            <p className="text-gray-600 text-lg">
              We&apos;ll analyze your online presence and show you exactly what&apos;s
              costing you customers — for free.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
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

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What Business Owners Say</h2>
            <p className="text-gray-600 text-lg">Real results from real local businesses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="text-yellow-400 text-lg mb-3">{"★".repeat(t.rating)}</div>
                <p className="text-gray-700 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.business}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 text-lg">No contracts. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.highlight
                    ? "border-blue-500 shadow-xl bg-blue-600 text-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlight && (
                  <span className="text-xs font-semibold bg-white text-blue-600 px-3 py-1 rounded-full w-fit mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    ${plan.price}
                  </span>
                  <span className={plan.highlight ? "text-blue-200" : "text-gray-500"}>/month</span>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-blue-100" : "text-gray-600"}`}>
                      <span className={plan.highlight ? "text-white" : "text-green-500"}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="#audit"
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Put Your Marketing on Autopilot?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Start with a free audit — no credit card required.
          </p>
          <a
            href="#audit"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-blue-50 transition-colors"
          >
            Start With a Free Audit
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
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <a href="mailto:info@bizautomatrix.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} BizAutomatrix</p>
        </div>
      </footer>
    </div>
  );
}
