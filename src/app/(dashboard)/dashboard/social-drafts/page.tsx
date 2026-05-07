"use client";

import { useState } from "react";
import PlanGate from "@/components/PlanGate";
import { usePlan } from "@/hooks/usePlan";

type Posts = { facebook: string; instagram: string; linkedin: string };

const PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: "📘", color: "blue" },
  { key: "instagram", label: "Instagram", icon: "📸", color: "pink" },
  { key: "linkedin", label: "LinkedIn", icon: "💼", color: "indigo" },
] as const;

export default function SocialDraftsPage() {
  const plan = usePlan();
  const [posts, setPosts] = useState<Posts | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("friendly");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/client/social-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to generate posts."); return; }
      setPosts(data.posts);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  if (plan === null) return <div className="text-gray-400 text-sm p-4">Loading...</div>;

  return (
    <PlanGate userPlan={plan} requiredPlan="GROWTH" featureName="Social Media Drafts">
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Social Media Drafts</h1>
        <p className="text-gray-500 mt-1">AI-generated posts for your business — ready to copy and post.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 max-w-xl">
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              What should the post be about? <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="e.g. We just launched a new menu, 20% off this weekend, celebrating 5 years in business..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
            >
              <option value="friendly">Friendly & Warm</option>
              <option value="professional">Professional</option>
              <option value="exciting">Exciting & Energetic</option>
              <option value="funny">Light & Humorous</option>
            </select>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generating...
            </>
          ) : (
            <>{posts ? "✨ Regenerate Posts" : "✨ Generate Posts"}</>
          )}
        </button>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {posts && (
        <div className="grid grid-cols-1 gap-5">
          {PLATFORMS.map(({ key, label, icon, color }) => {
            const text = posts[key];
            const colorMap: Record<string, string> = {
              blue: "border-blue-200 bg-blue-50",
              pink: "border-pink-200 bg-pink-50",
              indigo: "border-indigo-200 bg-indigo-50",
            };
            const badgeMap: Record<string, string> = {
              blue: "bg-blue-100 text-blue-700",
              pink: "bg-pink-100 text-pink-700",
              indigo: "bg-indigo-100 text-indigo-700",
            };
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className={`px-5 py-3 flex items-center justify-between border-b ${colorMap[color]}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeMap[color]}`}>{label}</span>
                  </div>
                  <button
                    onClick={() => copy(key, text)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {copied === key ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </PlanGate>
  );
}
