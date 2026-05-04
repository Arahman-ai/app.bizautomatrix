"use client";

import { useEffect, useRef, useState } from "react";

const VARIABLES = [
  { key: "{{businessName}}", desc: "Business name" },
  { key: "{{city}}", desc: "City" },
  { key: "{{category}}", desc: "Category" },
  { key: "{{rating}}", desc: "Google rating" },
  { key: "{{reviewCount}}", desc: "Number of reviews" },
  { key: "{{website}}", desc: "Website URL" },
  { key: "{{phone}}", desc: "Phone number" },
];

export default function EmailTemplatePage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/admin/email-template")
      .then((r) => r.json())
      .then((d) => {
        if (d.template) {
          setSubject(d.template.subject);
          setBody(d.template.body);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/email-template", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    setSaving(false);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2500);
  }

  function insertVariable(v: string) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newBody = body.slice(0, start) + v + body.slice(end);
    setBody(newBody);
    setTimeout(() => { el.selectionStart = el.selectionEnd = start + v.length; el.focus(); }, 0);
  }

  const previewBody = body.replace(/\{\{businessName\}\}/g, "Joe's Pizza")
    .replace(/\{\{city\}\}/g, "Atlanta")
    .replace(/\{\{category\}\}/g, "Restaurant")
    .replace(/\{\{rating\}\}/g, "3.8")
    .replace(/\{\{reviewCount\}\}/g, "12")
    .replace(/\{\{website\}\}/g, "joespizza.com")
    .replace(/\{\{phone\}\}/g, "(404) 555-0000");

  const previewSubject = subject.replace(/\{\{businessName\}\}/g, "Joe's Pizza")
    .replace(/\{\{city\}\}/g, "Atlanta");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Template</h1>
          <p className="text-gray-500 mt-1">Customize the cold outreach email sent to prospects</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Saved!
            </span>
          )}
          <button onClick={() => setPreview((v) => !v)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            {preview ? "Edit" : "Preview"}
          </button>
          <button onClick={save} disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 py-12 text-center">Loading...</div>
      ) : preview ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Subject</p>
          <p className="text-gray-900 font-medium mb-6">{previewSubject}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Body</p>
          <div className="prose prose-sm max-w-none text-gray-700 border-t pt-4"
            dangerouslySetInnerHTML={{ __html: previewBody }} />
          <p className="text-xs text-gray-400 mt-6">* Preview uses sample data: Joe&apos;s Pizza, Atlanta</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Subject Line</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Email Body (HTML)</label>
              <textarea ref={bodyRef} value={body} onChange={(e) => setBody(e.target.value)}
                rows={20}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-y" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Insert Variable</p>
              <div className="space-y-2">
                {VARIABLES.map((v) => (
                  <button key={v.key} onClick={() => insertVariable(v.key)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                    <code className="text-xs text-blue-600 font-mono group-hover:text-blue-700">{v.key}</code>
                    <p className="text-xs text-gray-400 mt-0.5">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">n8n Update Required</p>
              <p className="text-xs text-amber-600">After saving, update the Resend node in n8n to use <code className="font-mono bg-amber-100 px-1 rounded">{"{{$json.body.subject}}"}</code> and <code className="font-mono bg-amber-100 px-1 rounded">{"{{$json.body.htmlBody}}"}</code> for the subject and body fields.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
