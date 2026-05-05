"use client";

import { useState } from "react";
import Link from "next/link";

const CHECKLIST = [
  {
    category: "Basic Info",
    icon: "📋",
    items: [
      { id: "name", label: "Business name is accurate and consistent" },
      { id: "category", label: "Primary category is correctly set" },
      { id: "address", label: "Address is correct and matches your website" },
      { id: "phone", label: "Phone number is up to date" },
      { id: "website", label: "Website URL is added and working" },
      { id: "hours", label: "Business hours are set (including holidays)" },
    ],
  },
  {
    category: "Photos & Media",
    icon: "📸",
    items: [
      { id: "logo", label: "Logo photo is uploaded" },
      { id: "cover", label: "Cover photo is high quality and on-brand" },
      { id: "interior", label: "Interior photos added (at least 3)" },
      { id: "exterior", label: "Exterior photo added so customers can find you" },
      { id: "team", label: "Team or product photos added" },
    ],
  },
  {
    category: "Description & Services",
    icon: "✍️",
    items: [
      { id: "description", label: "Business description is written (750 chars max)" },
      { id: "services", label: "Services or products are listed" },
      { id: "attributes", label: "Attributes set (e.g. wheelchair accessible, free wifi)" },
    ],
  },
  {
    category: "Reviews",
    icon: "⭐",
    items: [
      { id: "review_link", label: "Google Review link is saved in BizAutomatrix settings" },
      { id: "respond", label: "All existing reviews have a response" },
      { id: "requests", label: "Sending review requests to customers regularly" },
    ],
  },
  {
    category: "Posts & Updates",
    icon: "📢",
    items: [
      { id: "posts", label: "At least one Google Post published this month" },
      { id: "offers", label: "Any current offers or promotions posted" },
      { id: "events", label: "Upcoming events added (if applicable)" },
    ],
  },
];

const TIPS = [
  {
    icon: "🎯",
    title: "Use your exact business name",
    body: "Don't add keywords to your name (e.g. 'Joe's Plumbing - Best Plumber Atlanta'). It violates Google's guidelines and can get your listing suspended.",
  },
  {
    icon: "📍",
    title: "Keep your NAP consistent",
    body: "Name, Address, Phone must be identical across Google, your website, Yelp, Facebook, and all directories. Inconsistencies hurt your local ranking.",
  },
  {
    icon: "📸",
    title: "Add photos every week",
    body: "Businesses with more than 100 photos get 520% more calls than average. Even phone photos of your work, team, or products help.",
  },
  {
    icon: "⭐",
    title: "Respond to every review",
    body: "Google rewards businesses that engage. Reply to 5-star reviews with a thank you, and address 1-star reviews professionally — it shows future customers you care.",
  },
  {
    icon: "📝",
    title: "Post weekly updates",
    body: "Google Posts appear in search results and Maps. Share offers, news, or tips weekly to stay active and improve visibility.",
  },
  {
    icon: "🔑",
    title: "Use keywords in your description",
    body: "Write naturally but include your city, industry, and main services. Example: 'Family-owned Italian restaurant in downtown Atlanta serving fresh pasta since 2005.'",
  },
];

export default function GoogleBusinessPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const totalItems = CHECKLIST.reduce((sum, c) => sum + c.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((checkedCount / totalItems) * 100);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Google Business Profile</h1>
        <p className="text-gray-500 mt-1">Optimize your listing to rank higher in local search and Maps.</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Profile Optimization Score</p>
          <span className={`text-sm font-bold ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-500"}`}>
            {pct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{checkedCount} of {totalItems} items completed</p>
      </div>

      {/* Checklist */}
      <div className="space-y-5 mb-10">
        {CHECKLIST.map((section) => (
          <div key={section.category} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="text-lg">{section.icon}</span>
              <h2 className="text-sm font-semibold text-gray-900">{section.category}</h2>
              <span className="ml-auto text-xs text-gray-400">
                {section.items.filter((i) => checked[i.id]).length}/{section.items.length}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {section.items.map((item) => (
                <label key={item.id} className="flex items-center gap-3 px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!checked[item.id]}
                    onChange={() => toggle(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checked[item.id] ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Optimization Tips</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {TIPS.map((tip) => (
          <div key={tip.title} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{tip.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{tip.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-semibold text-gray-900">Ready to collect more reviews?</p>
          <p className="text-sm text-gray-500 mt-1">Send review requests to your customers directly from BizAutomatrix.</p>
        </div>
        <Link href="/dashboard/reviews" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
          Send Review Requests →
        </Link>
      </div>
    </div>
  );
}
