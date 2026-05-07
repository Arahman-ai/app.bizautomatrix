"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INDUSTRIES = [
  "Restaurant / Cafe", "Retail Shop", "Plumber / HVAC", "Electrician",
  "Landscaping / Lawn Care", "Auto Repair", "Salon / Barber", "Cleaning Service",
  "Dentist / Medical", "Law / Accounting", "Real Estate", "Gym / Fitness",
  "Pet Services", "Childcare", "Other",
];

const STEPS = ["Business Info", "Contact & Location", "Google Profile", "Done"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    website: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    googleReviewLink: "",
  });

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function finish() {
    setSaving(true);
    await fetch("/api/client/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, setupComplete: true }),
    });
    setSaving(false);
    router.push("/dashboard");
  }

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl mb-3">🚀</div>
          <h1 className="text-2xl font-bold text-gray-900">Let's set up your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Takes 2 minutes. You can update this anytime.</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= step ? "text-blue-600 font-medium" : ""}>{s}</span>
            ))}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Tell us about your business</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={e => update("businessName", e.target.value)}
                  placeholder="e.g. Smith's Plumbing"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry <span className="text-red-500">*</span></label>
                <select
                  value={form.industry}
                  onChange={e => update("industry", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => update("website", e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Contact & location</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => update("address", e.target.value)}
                  placeholder="123 Main St"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => update("city", e.target.value)}
                    placeholder="Austin"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => update("state", e.target.value)}
                    placeholder="TX"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Connect your Google profile</h2>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">How to get your Google Review link:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Go to <strong>business.google.com</strong></li>
                  <li>Click <strong>Get more reviews</strong></li>
                  <li>Copy the short link and paste it below</li>
                </ol>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Google Review Link <span className="text-gray-400 font-normal">(optional — add later in Settings)</span>
                </label>
                <input
                  type="url"
                  value={form.googleReviewLink}
                  onChange={e => update("googleReviewLink", e.target.value)}
                  placeholder="https://g.page/r/..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-500 text-sm mb-2">Your BizAutomatrix dashboard is ready.</p>
              <p className="text-gray-400 text-xs">Our team will reach out within 24 hours to get your SEO campaign started.</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {step > 0 && step < 3 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              ← Back
            </button>
          ) : <div />}

          {step < 2 && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={
                (step === 0 && (!form.businessName || !form.industry)) ||
                (step === 1 && (!form.phone || !form.city))
              }
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Continue →
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Continue →
            </button>
          )}

          {step === 3 && (
            <button
              onClick={finish}
              disabled={saving}
              className="bg-green-600 text-white px-8 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors mx-auto"
            >
              {saving ? "Saving..." : "Go to Dashboard →"}
            </button>
          )}
        </div>

        {step < 3 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            <button onClick={finish} className="hover:text-gray-600 underline">
              Skip for now
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
