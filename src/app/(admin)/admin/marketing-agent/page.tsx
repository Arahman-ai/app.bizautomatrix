"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Channel = "EMAIL" | "SMS" | "WHATSAPP" | "LINKEDIN" | "FACEBOOK" | "INSTAGRAM";
type DraftStatus = "DRAFT" | "REVIEWED" | "APPROVED" | "SENT" | "SKIPPED";

type Draft = {
  id: string;
  title: string;
  channel: Channel;
  audience: string;
  goal: string | null;
  cadence: string;
  content: string;
  status: DraftStatus;
  scheduledFor: string | null;
  sentAt: string | null;
  notes: string | null;
  createdAt: string;
};

const CHANNELS: { key: Channel; label: string; hint: string }[] = [
  { key: "EMAIL", label: "Email", hint: "Longer nurture or campaign copy" },
  { key: "SMS", label: "SMS", hint: "Short text message draft" },
  { key: "WHATSAPP", label: "WhatsApp", hint: "Manual follow-up message" },
  { key: "LINKEDIN", label: "LinkedIn", hint: "B2B thought leadership" },
  { key: "FACEBOOK", label: "Facebook", hint: "Local business audience" },
  { key: "INSTAGRAM", label: "Instagram", hint: "Caption and hashtags" },
];

const STATUS_OPTIONS: DraftStatus[] = ["DRAFT", "REVIEWED", "APPROVED", "SENT", "SKIPPED"];

const CHANNEL_STYLES: Record<Channel, string> = {
  EMAIL: "bg-blue-50 text-blue-700 border-blue-200",
  SMS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WHATSAPP: "bg-green-50 text-green-700 border-green-200",
  LINKEDIN: "bg-indigo-50 text-indigo-700 border-indigo-200",
  FACEBOOK: "bg-sky-50 text-sky-700 border-sky-200",
  INSTAGRAM: "bg-pink-50 text-pink-700 border-pink-200",
};

const STATUS_STYLES: Record<DraftStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  REVIEWED: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  SENT: "bg-green-100 text-green-700",
  SKIPPED: "bg-red-100 text-red-700",
};

export default function MarketingAgentPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);
  const [sendTo, setSendTo] = useState("");
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    goal: "Get one paid BizAutomatrix client by offering a free audit and a focused 7-day implementation plan.",
    audience: "USA and Bangladesh engineering, manufacturing, railway suppliers, industrial automation teams, and local service businesses",
    cadence: "weekly",
    tone: "professional",
    topic: "Website upgrade, SEO, review automation, email automation, AI agents, day-to-day reporting, maintenance workflows, asset management, optimization, manufacturing and railway support",
  });
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(["EMAIL", "WHATSAPP", "LINKEDIN", "FACEBOOK", "INSTAGRAM"]);

  const stats = useMemo(() => {
    const total = drafts.length;
    const draft = drafts.filter((item) => item.status === "DRAFT").length;
    const reviewed = drafts.filter((item) => item.status === "REVIEWED" || item.status === "APPROVED").length;
    const sent = drafts.filter((item) => item.status === "SENT").length;
    return { total, draft, reviewed, sent };
  }, [drafts]);

  useEffect(() => {
    refreshDrafts();
  }, []);

  function showBanner(ok: boolean, text: string) {
    setBanner({ ok, text });
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(null), 4500);
  }

  async function refreshDrafts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing-agent", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        showBanner(false, data.error ?? "Could not load marketing drafts.");
        return;
      }
      setDrafts(data.drafts ?? []);
    } catch {
      showBanner(false, "Could not reach the marketing agent.");
    } finally {
      setLoading(false);
    }
  }

  function toggleChannel(channel: Channel) {
    setSelectedChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel]
    );
  }

  async function generateDrafts() {
    if (selectedChannels.length === 0) {
      showBanner(false, "Select at least one channel.");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/admin/marketing-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, channels: selectedChannels }),
      });
      const data = await res.json();
      if (!res.ok) {
        showBanner(false, data.error ?? "Could not generate drafts.");
        return;
      }
      setDrafts(data.drafts ?? []);
      showBanner(true, data.message ?? "Drafts created.");
    } catch {
      showBanner(false, "Could not reach the marketing agent.");
    } finally {
      setGenerating(false);
    }
  }

  async function updateDraft(id: string, patch: Partial<Draft>) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/marketing-agent/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        showBanner(false, data.error ?? "Could not save draft.");
        return;
      }
      setDrafts((current) => current.map((item) => (item.id === id ? data.draft : item)));
      showBanner(true, "Draft saved.");
    } catch {
      showBanner(false, "Could not reach the marketing agent.");
    } finally {
      setSavingId(null);
    }
  }

  async function copyDraft(draft: Draft) {
    await navigator.clipboard.writeText(draft.content);
    setCopiedId(draft.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  async function sendEmailDraft(draft: Draft) {
    const to = window.prompt("Send this email draft to:", sendTo || "info@bizautomatrix.com");
    if (!to) return;
    setSendTo(to);
    setSavingId(draft.id);
    try {
      const res = await fetch(`/api/admin/marketing-agent/${draft.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      const data = await res.json();
      if (!res.ok) {
        showBanner(false, data.error ?? "Email could not be sent.");
        return;
      }
      setDrafts((current) => current.map((item) => (item.id === draft.id ? data.draft : item)));
      showBanner(true, "Email sent.");
    } catch {
      showBanner(false, "Could not reach the email sender.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Agent</h1>
          <p className="text-gray-500 mt-1">
            Free-first draft center for regular email, SMS, WhatsApp, and social posts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={refreshDrafts}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={generateDrafts}
            disabled={generating}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Draft Set"}
          </button>
        </div>
      </div>

      {banner && (
        <div className={`mb-5 rounded-lg px-4 py-3 text-sm ${banner.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {banner.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Total Drafts" value={stats.total} tone="blue" />
        <Stat label="Draft" value={stats.draft} tone="gray" />
        <Stat label="Reviewed" value={stats.reviewed} tone="amber" />
        <Stat label="Sent / Posted" value={stats.sent} tone="green" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goal</label>
            <textarea
              value={form.goal}
              onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cadence</label>
            <select
              value={form.cadence}
              onChange={(event) => setForm((current) => ({ ...current, cadence: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="twice-weekly">Twice weekly</option>
              <option value="monthly">Monthly</option>
              <option value="one-time">One-time campaign</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Tone</label>
            <select
              value={form.tone}
              onChange={(event) => setForm((current) => ({ ...current, tone: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="direct">Direct</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
            <input
              value={form.audience}
              onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Topics / Services To Mention</label>
            <textarea
              value={form.topic}
              onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-gray-700 mb-2">Channels</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {CHANNELS.map((channel) => (
              <label key={channel.key} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${selectedChannels.includes(channel.key) ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"}`}>
                <input
                  type="checkbox"
                  checked={selectedChannels.includes(channel.key)}
                  onChange={() => toggleChannel(channel.key)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{channel.label}</span>
                  <span className="block text-xs text-gray-500">{channel.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Free mode: email can be sent if Resend is configured. SMS, WhatsApp, LinkedIn, Facebook, and Instagram are draft/copy-first so you can use free native posting tools.
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 py-12 text-center text-gray-400">Loading drafts...</div>
      ) : drafts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-14 text-center">
          <p className="text-gray-900 font-semibold">No marketing drafts yet</p>
          <p className="text-gray-500 text-sm mt-1">Generate a draft set to start your weekly outreach plan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              saving={savingId === draft.id}
              copied={copiedId === draft.id}
              onCopy={() => copyDraft(draft)}
              onSave={(patch) => updateDraft(draft.id, patch)}
              onSendEmail={() => sendEmailDraft(draft)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "blue" | "gray" | "amber" | "green" }) {
  const tones = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    green: "bg-green-50 border-green-200 text-green-700",
  };
  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function DraftCard({
  draft,
  saving,
  copied,
  onCopy,
  onSave,
  onSendEmail,
}: {
  draft: Draft;
  saving: boolean;
  copied: boolean;
  onCopy: () => void;
  onSave: (patch: Partial<Draft>) => void;
  onSendEmail: () => void;
}) {
  const [title, setTitle] = useState(draft.title);
  const [content, setContent] = useState(draft.content);
  const [notes, setNotes] = useState(draft.notes ?? "");
  const [status, setStatus] = useState<DraftStatus>(draft.status);

  useEffect(() => {
    setTitle(draft.title);
    setContent(draft.content);
    setNotes(draft.notes ?? "");
    setStatus(draft.status);
  }, [draft]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${CHANNEL_STYLES[draft.channel]}`}>{draft.channel}</span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>{status}</span>
          <span className="text-xs text-gray-400">{new Date(draft.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onCopy} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => onSave({ title, content, notes, status })}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {draft.channel === "EMAIL" && (
            <button
              onClick={onSendEmail}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              Send Email
            </button>
          )}
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={draft.channel === "EMAIL" ? 10 : 6}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500 resize-y"
          />
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as DraftStatus)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Audience</label>
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">{draft.audience}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-y"
              placeholder="Where posted, result, follow-up idea..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
