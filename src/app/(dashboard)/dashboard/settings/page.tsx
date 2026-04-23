"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    businessName: "",
    website: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    industry: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/client/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.client) setForm(data.client);
      })
      .finally(() => setFetching(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-gray-500 mt-1">Update your business information.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Business Name" required>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="input"
              required
            />
          </Field>
          <Field label="Website">
            <input
              type="url"
              value={form.website ?? ""}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="input"
              placeholder="https://"
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Address">
            <input
              type="text"
              value={form.address ?? ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <input
                type="text"
                value={form.city ?? ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="State">
              <input
                type="text"
                value={form.state ?? ""}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="input"
              />
            </Field>
          </div>
          <Field label="Industry">
            <select
              value={form.industry ?? ""}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="input"
            >
              <option value="">Select industry</option>
              <option>Restaurant / Food</option>
              <option>Retail / E-commerce</option>
              <option>Healthcare / Wellness</option>
              <option>Home Services</option>
              <option>Auto / Automotive</option>
              <option>Professional Services</option>
              <option>Beauty / Salon</option>
              <option>Fitness / Gym</option>
              <option>Real Estate</option>
              <option>Other</option>
            </select>
          </Field>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            {saved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
          </div>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
