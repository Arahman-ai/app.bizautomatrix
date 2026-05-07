"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  industry: string;
}

const INDUSTRIES = [
  "Restaurant / Food",
  "Retail / Shop",
  "Medical / Dental",
  "Legal / Law Firm",
  "Real Estate",
  "Auto / Car Repair",
  "Beauty / Salon",
  "Fitness / Gym",
  "Home Services",
  "Other",
];

export default function AuditForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    website: "",
    city: "",
    industry: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      router.push(`/audit/result/${data.leadId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name *
          </label>
          <input
            type="text"
            name="businessName"
            required
            value={form.businessName}
            onChange={handleChange}
            placeholder="e.g. Joe's Pizza"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            placeholder="e.g. John Smith"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@business.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="(555) 000-0000"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website URL
          </label>
          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://yourbusiness.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="e.g. Miami, FL"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Industry
        </label>
        <select
          name="industry"
          value={form.industry}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select your industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Get My Free Audit Report →"}
      </button>

      <p className="text-center text-sm text-gray-500">
        100% free. No credit card. Results in 24 hours.
      </p>
    </form>
  );
}
