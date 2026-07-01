"use client";

import { useEffect, useRef, useState } from "react";

type Prospect = {
  id: string;
  businessName: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  category: string | null;
  status: string;
  notes: string | null;
  emailSentAt: string | null;
  createdAt: string;
};

type ProspectConfig = {
  country: string;
  state: string;
  city: string;
  category: string;
  maxReviews: number;
  excludedCategories: string;
};

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

const COUNTRY_CITIES: Record<string, string[]> = {
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Atlanta", "Miami", "Dallas", "Seattle", "Boston", "Phoenix"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Edinburgh"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  "Bangladesh": ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"],
  "UAE": ["Dubai", "Abu Dhabi", "Sharjah"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata"],
  "Custom": [],
};

const COUNTRIES = Object.keys(COUNTRY_CITIES);

const CATEGORIES = [
  "Restaurant", "Hotel", "Spa & Wellness", "Dentist", "Hair Salon",
  "Auto Repair", "Gym & Fitness", "Real Estate", "Lawyer", "Plumber", "Custom",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CONTACTED: "bg-blue-100 text-blue-700",
};

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [saving, setSaving] = useState<string | null>(null);
  const [emailSaved, setEmailSaved] = useState<string | null>(null);
  const emailSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Table filters
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [minReviews, setMinReviews] = useState("");
  const [maxReviews, setMaxReviews] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [outreachDrafting, setOutreachDrafting] = useState(false);
  const [outreachBanner, setOutreachBanner] = useState<{ ok: boolean; msg: string } | null>(null);
  const outreachTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Settings panel state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [config, setConfig] = useState<ProspectConfig>({ country: "", state: "", city: "", category: "", maxReviews: 20, excludedCategories: "consultant,lawyer,accountant,insurance,real_estate_agency,finance,bank,government" });
  const [newExcludedCat, setNewExcludedCat] = useState("");
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [countrySearch, setCountrySearch] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [customCategory, setCustomCategory] = useState("");

  const [running, setRunning] = useState(false);
  const [runBanner, setRunBanner] = useState<{ ok: boolean; msg: string } | null>(null);
  const runTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [findingEmails, setFindingEmails] = useState(false);
  const [findEmailsBanner, setFindEmailsBanner] = useState<{ ok: boolean; msg: string } | null>(null);
  const findEmailsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // CSV export/import
  const [importing, setImporting] = useState(false);
  const [importBanner, setImportBanner] = useState<{ ok: boolean; msg: string } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  // Add prospect modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ businessName: "", city: "", category: "", phone: "", email: "", website: "", address: "", rating: "", reviewCount: "" });
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setConfigLoading(true);
    fetch("/api/admin/prospect-config")
      .then((r) => r.json())
      .then((d) => {
        if (d.config) {
          setConfig(d.config);
          if (d.config.category && !CATEGORIES.slice(0, -1).includes(d.config.category)) {
            setCustomCategory(d.config.category);
          }
        }
      })
      .finally(() => setConfigLoading(false));
  }, []);

  async function saveConfig() {
    const finalCategory = config.category === "Custom" ? customCategory : config.category;
    setConfigSaving(true);
    await fetch("/api/admin/prospect-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...config, category: finalCategory, excludedCategories: config.excludedCategories }),
    });
    setConfigSaving(false);
    setSavedBanner(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSavedBanner(false), 2500);
  }

  async function runNow() {
    setRunning(true);
    setRunBanner(null);
    try {
      const res = await fetch("/api/admin/prospect-config/run", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json().catch(() => ({}));
      setRunBanner(res.ok
        ? { ok: !!data.success, msg: data.message ?? "Workflow triggered!" }
        : { ok: false, msg: data.error ?? `Error ${res.status}` }
      );
    } catch {
      setRunBanner({ ok: false, msg: "Failed to reach server" });
    } finally {
      setRunning(false);
      if (runTimerRef.current) clearTimeout(runTimerRef.current);
      runTimerRef.current = setTimeout(() => setRunBanner(null), 4000);
    }
  }

  async function findEmails() {
    setFindingEmails(true);
    setFindEmailsBanner(null);
    try {
      const res = await fetch("/api/admin/prospect-config/find-emails", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setFindEmailsBanner(res.ok
        ? { ok: true, msg: data.message ?? "Email finder completed." }
        : { ok: false, msg: data.error ?? `Error ${res.status}` }
      );
      if (res.ok) {
        const refreshed = await (await fetch(`/api/admin/prospects?status=${filter}`)).json();
        setProspects(refreshed.prospects);
      }
    } catch {
      setFindEmailsBanner({ ok: false, msg: "Failed to reach server" });
    } finally {
      setFindingEmails(false);
      if (findEmailsTimerRef.current) clearTimeout(findEmailsTimerRef.current);
      findEmailsTimerRef.current = setTimeout(() => setFindEmailsBanner(null), 6000);
    }
  }

  const selectedCountryIsCustom = config.country === "Custom";
  const citiesForCountry = config.country ? (COUNTRY_CITIES[config.country] ?? []) : [];
  const filteredCountries = COUNTRIES.filter((c) => c.toLowerCase().includes(countrySearch.toLowerCase()));

  // Unique cities/categories from loaded prospects for filter dropdowns
  const uniqueCities = [...new Set(prospects.map(p => p.city).filter(Boolean))] as string[];
  const uniqueCategories = [...new Set(prospects.map(p => p.category).filter(Boolean))] as string[];

  const filteredProspects = prospects.filter((p) => {
    if (minRating && (p.rating ?? 0) < Number(minRating)) return false;
    if (maxRating && (p.rating ?? 0) > Number(maxRating)) return false;
    if (minReviews && (p.reviewCount ?? 0) < Number(minReviews)) return false;
    if (maxReviews && (p.reviewCount ?? 0) > Number(maxReviews)) return false;
    if (filterCity && p.city !== filterCity) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    return true;
  });

  useEffect(() => {
    setLoading(true);
    setSelectedIds(new Set());
    fetch(`/api/admin/prospects?status=${filter}`)
      .then((r) => r.json())
      .then((d) => { setProspects(d.prospects); setLoading(false); });
  }, [filter]);

  // Reset selection when filters change
  useEffect(() => { setSelectedIds(new Set()); }, [minRating, maxRating, minReviews, maxReviews, filterCity, filterCategory]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredProspects.length && filteredProspects.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProspects.map((p) => p.id)));
    }
  }

  async function bulkUpdateStatus(status: string) {
    setBulkSaving(true);
    const ids = [...selectedIds];
    await Promise.all(
      ids.map(async (id) => {
        await fetch(`/api/admin/prospects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
      })
    );
    setProspects((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setBulkSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    await fetch(`/api/admin/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setProspects((prev) => prev.filter((p) => p.id !== id));
    setSaving(null);
  }

  async function generateOutreachDrafts(ids: string[]) {
    if (ids.length === 0) return;
    setOutreachDrafting(true);
    setOutreachBanner(null);
    try {
      const res = await fetch("/api/admin/prospects/outreach-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      setOutreachBanner(res.ok
        ? { ok: true, msg: `${data.message ?? "Drafts created."} Go to Marketing Agent to review and approve before sending.` }
        : { ok: false, msg: data.error ?? `Error ${res.status}` }
      );
      if (res.ok) setSelectedIds(new Set());
    } catch {
      setOutreachBanner({ ok: false, msg: "Could not create outreach drafts." });
    } finally {
      setOutreachDrafting(false);
      if (outreachTimerRef.current) clearTimeout(outreachTimerRef.current);
      outreachTimerRef.current = setTimeout(() => setOutreachBanner(null), 9000);
    }
  }

  async function saveEmail(id: string, value: string) {
    await fetch(`/api/admin/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value }),
    });
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, email: value } : p)));
    setEmailSaved(id);
    if (emailSavedTimerRef.current) clearTimeout(emailSavedTimerRef.current);
    emailSavedTimerRef.current = setTimeout(() => setEmailSaved(null), 2000);
  }

  function exportCSV() {
    const all = prospects;
    const headers = ["placeId","businessName","city","category","phone","email","website","address","rating","reviewCount","status"];
    const rows = all.map((p) => headers.map((h) => {
      const val = (p as Record<string, unknown>)[h] ?? "";
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prospects_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current); current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  async function importCSV(file: File) {
    setImporting(true);
    setImportBanner(null);
    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
      const headers = parseCSVLine(lines[0]);
      const parsed = lines.slice(1).map((line) => {
        const vals = parseCSVLine(line);
        return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? "").trim()]));
      });
      const toImport = parsed
        .filter((r) => r.placeId && r.businessName)
        .map((r) => ({
          placeId: r.placeId,
          businessName: r.businessName,
          city: r.city || null,
          category: r.category || null,
          phone: r.phone || null,
          email: r.email || null,
          website: r.website || null,
          address: r.address || null,
          rating: r.rating ? Number(r.rating) : null,
          reviewCount: r.reviewCount ? Number(r.reviewCount) : null,
        }));
      if (toImport.length === 0) {
        setImportBanner({ ok: false, msg: "No valid rows found. Make sure the CSV has placeId and businessName columns." });
        return;
      }
      const res = await fetch("/api/admin/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospects: toImport }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportBanner({ ok: true, msg: `Imported ${toImport.length} rows successfully.` });
        const d = await (await fetch(`/api/admin/prospects?status=${filter}`)).json();
        setProspects(d.prospects);
      } else {
        setImportBanner({ ok: false, msg: data.error ?? "Import failed." });
      }
    } catch {
      setImportBanner({ ok: false, msg: "Failed to parse CSV file." });
    } finally {
      setImporting(false);
      setTimeout(() => setImportBanner(null), 5000);
    }
  }

  async function addProspect() {
    if (!addForm.businessName.trim()) return;
    setAddSaving(true);
    const placeId = `manual_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await fetch("/api/admin/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prospects: [{
          placeId,
          businessName: addForm.businessName.trim(),
          city: addForm.city.trim() || null,
          category: addForm.category.trim() || null,
          phone: addForm.phone.trim() || null,
          email: addForm.email.trim() || null,
          website: addForm.website.trim() || null,
          address: addForm.address.trim() || null,
          rating: addForm.rating ? Number(addForm.rating) : null,
          reviewCount: addForm.reviewCount ? Number(addForm.reviewCount) : null,
        }],
      }),
    });
    setAddSaving(false);
    setAddModalOpen(false);
    setAddForm({ businessName: "", city: "", category: "", phone: "", email: "", website: "", address: "", rating: "", reviewCount: "" });
    setFilter("PENDING");
    const res = await fetch("/api/admin/prospects?status=PENDING");
    const d = await res.json();
    setProspects(d.prospects);
  }

  const hasFilters = !!(minRating || maxRating || minReviews || maxReviews || filterCity || filterCategory);

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-500 mt-1">Businesses found via Google Maps with low reviews</p>
        </div>
        <div className="flex items-center gap-2">
        <button onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
        <input ref={importRef} type="file" accept=".csv" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) { importCSV(e.target.files[0]); e.target.value = ""; } }} />
        <button onClick={() => importRef.current?.click()} disabled={importing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
          </svg>
          {importing ? "Importing..." : "Import CSV"}
        </button>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Prospect
        </button>
        {importBanner && (
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${importBanner.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {importBanner.msg}
          </span>
        )}
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Scraper Settings
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        </div>
      </div>

      {/* ── Settings panel ── */}
      {settingsOpen && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Google Maps Scraper Settings</h2>
              <p className="text-xs text-gray-400 mt-0.5">All fields are optional — leave blank to scrape without filter</p>
            </div>
            <div className="flex items-center gap-3">
              {savedBanner && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Saved!
                </span>
              )}
              {runBanner && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${runBanner.ok ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                  {runBanner.ok ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414L9 11.172 7.707 9.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {runBanner.msg}
                </span>
              )}
            </div>
          </div>

          {configLoading ? (
            <p className="text-sm text-gray-400">Loading settings...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Country */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Country <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="relative" ref={countryDropdownRef}>
                  <button type="button" onClick={() => setCountryDropdownOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left">
                    <span className={config.country ? "text-gray-900" : "text-gray-400"}>{config.country || "Select country..."}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform duration-150 ${countryDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {countryDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <input autoFocus type="text" placeholder="Search country..." value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <ul className="max-h-52 overflow-y-auto">
                        <li>
                          <button type="button" onClick={() => { setConfig((c) => ({ ...c, country: "", city: "" })); setCountryDropdownOpen(false); setCountrySearch(""); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${!config.country ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-400"}`}>
                            Any country
                          </button>
                        </li>
                        {filteredCountries.length === 0 ? (
                          <li className="px-3 py-2 text-sm text-gray-400">No results</li>
                        ) : (
                          filteredCountries.map((country) => (
                            <li key={country}>
                              <button type="button"
                                onClick={() => { setConfig((c) => ({ ...c, country, city: "" })); setCountryDropdownOpen(false); setCountrySearch(""); }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${config.country === country ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}>
                                {country}
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* State */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">State / Province <span className="text-gray-400 font-normal">(optional)</span></label>
                {config.country === "United States" ? (
                  <select value={config.state}
                    onChange={(e) => setConfig((c) => ({ ...c, state: e.target.value }))}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Any state...</option>
                    {US_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                ) : (
                  <input type="text" placeholder="Any state/province..."
                    value={config.state}
                    onChange={(e) => setConfig((c) => ({ ...c, state: e.target.value }))}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                )}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">City <span className="text-gray-400 font-normal">(optional)</span></label>
                {selectedCountryIsCustom || citiesForCountry.length === 0 ? (
                  <input type="text" placeholder="Any city..." value={config.city}
                    onChange={(e) => setConfig((c) => ({ ...c, city: e.target.value }))}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                ) : (
                  <>
                    <select value={citiesForCountry.includes(config.city) ? config.city : config.city ? "custom" : ""}
                      onChange={(e) => {
                        if (e.target.value !== "custom") setConfig((c) => ({ ...c, city: e.target.value }));
                        else setConfig((c) => ({ ...c, city: "" }));
                      }}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Any city...</option>
                      {citiesForCountry.map((city) => (<option key={city} value={city}>{city}</option>))}
                      <option value="custom">Custom...</option>
                    </select>
                    {!citiesForCountry.includes(config.city) && config.city && (
                      <input type="text" placeholder="Type city name..." value={config.city}
                        onChange={(e) => setConfig((c) => ({ ...c, city: e.target.value }))}
                        className="mt-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    )}
                  </>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Category <span className="text-gray-400 font-normal">(optional)</span></label>
                <select
                  value={config.category === "Custom" || (config.category && !CATEGORIES.slice(0, -1).includes(config.category)) ? "Custom" : config.category}
                  onChange={(e) => { const val = e.target.value; setConfig((c) => ({ ...c, category: val })); if (val !== "Custom") setCustomCategory(""); }}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Any category...</option>
                  {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                {(config.category === "Custom" || (config.category && !CATEGORIES.slice(0, -1).includes(config.category))) && (
                  <input type="text" placeholder="Type custom category..." value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="mt-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                )}
              </div>

              {/* Max Reviews */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600" htmlFor="cfg-maxreviews">Max Reviews</label>
                <input id="cfg-maxreviews" type="number" min={0} max={1000} value={config.maxReviews}
                  onChange={(e) => setConfig((c) => ({ ...c, maxReviews: Number(e.target.value) }))}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              {/* Excluded Categories */}
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600">Excluded Categories <span className="text-gray-400 font-normal">(businesses in these categories will be skipped during scraping)</span></label>
                <div className="flex flex-wrap gap-2 min-h-[36px] p-2 rounded-lg border border-gray-200 bg-gray-50">
                  {config.excludedCategories.split(",").filter(Boolean).map((cat) => (
                    <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      {cat.trim()}
                      <button type="button" onClick={() => {
                        const updated = config.excludedCategories.split(",").filter((c) => c.trim() !== cat.trim()).join(",");
                        setConfig((c) => ({ ...c, excludedCategories: updated }));
                      }} className="ml-0.5 hover:text-red-900 leading-none">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. gym, pharmacy..." value={newExcludedCat}
                    onChange={(e) => setNewExcludedCat(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newExcludedCat.trim()) {
                        e.preventDefault();
                        const cat = newExcludedCat.trim().toLowerCase().replace(/\s+/g, "_");
                        const existing = config.excludedCategories.split(",").map((c) => c.trim()).filter(Boolean);
                        if (!existing.includes(cat)) {
                          setConfig((c) => ({ ...c, excludedCategories: [...existing, cat].join(",") }));
                        }
                        setNewExcludedCat("");
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <button type="button" onClick={() => {
                    if (!newExcludedCat.trim()) return;
                    const cat = newExcludedCat.trim().toLowerCase().replace(/\s+/g, "_");
                    const existing = config.excludedCategories.split(",").map((c) => c.trim()).filter(Boolean);
                    if (!existing.includes(cat)) {
                      setConfig((c) => ({ ...c, excludedCategories: [...existing, cat].join(",") }));
                    }
                    setNewExcludedCat("");
                  }} className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    Add
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-wrap items-center gap-3 pt-1">
                <button onClick={saveConfig} disabled={configSaving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {configSaving ? "Saving..." : "Save Settings"}
                </button>
                <button onClick={runNow} disabled={running}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {running ? (
                    <><svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>Running...</>
                  ) : (
                    <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>Run Now</>
                  )}
                </button>
                <button onClick={findEmails} disabled={findingEmails}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
                  {findingEmails ? (
                    <><svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>Finding...</>
                  ) : (
                    <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>Find Emails (Free)</>
                  )}
                </button>
                {findEmailsBanner && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${findEmailsBanner.ok ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700"}`}>
                    {findEmailsBanner.msg}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {["PENDING", "APPROVED", "CONTACTED", "REJECTED", "ALL"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* ── Table filters ── */}
      <div className="mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">City</label>
          <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}
            className="w-36 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All cities</option>
            {uniqueCities.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Category</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="w-40 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All categories</option>
            {uniqueCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Min Rating</label>
          <input type="number" min="0" max="5" step="0.1" placeholder="e.g. 3.0" value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-28 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Max Rating</label>
          <input type="number" min="0" max="5" step="0.1" placeholder="e.g. 4.5" value={maxRating}
            onChange={(e) => setMaxRating(e.target.value)}
            className="w-28 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Min Reviews</label>
          <input type="number" min="0" placeholder="e.g. 10" value={minReviews}
            onChange={(e) => setMinReviews(e.target.value)}
            className="w-28 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Max Reviews</label>
          <input type="number" min="0" placeholder="e.g. 200" value={maxReviews}
            onChange={(e) => setMaxReviews(e.target.value)}
            className="w-28 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {hasFilters && (
          <button onClick={() => { setMinRating(""); setMaxRating(""); setMinReviews(""); setMaxReviews(""); setFilterCity(""); setFilterCategory(""); }}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors self-end">
            Clear filters
          </button>
        )}
        {hasFilters && (
          <span className="text-xs text-gray-400 self-end pb-1.5">{filteredProspects.length} of {prospects.length} shown</span>
        )}
      </div>

      {/* ── Bulk action toolbar ── */}
      {outreachBanner && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm border ${outreachBanner.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {outreachBanner.msg}{" "}
          {outreachBanner.ok && <a href="/admin/marketing-agent" className="font-semibold underline">Open Marketing Agent</a>}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <div className="flex gap-2 ml-2">
            <button disabled={bulkSaving || outreachDrafting} onClick={() => generateOutreachDrafts([...selectedIds])}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {outreachDrafting ? "Creating..." : `Generate Email Drafts (${selectedIds.size})`}
            </button>
            {filter === "PENDING" && (
              <>
                <button disabled={bulkSaving} onClick={() => bulkUpdateStatus("APPROVED")}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {bulkSaving ? "..." : `Approve (${selectedIds.size})`}
                </button>
                <button disabled={bulkSaving} onClick={() => bulkUpdateStatus("REJECTED")}
                  className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50 transition-colors">
                  {bulkSaving ? "..." : `Reject (${selectedIds.size})`}
                </button>
              </>
            )}
            {filter === "APPROVED" && (
              <button disabled={bulkSaving} onClick={() => bulkUpdateStatus("CONTACTED")}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {bulkSaving ? "..." : `Mark Contacted (${selectedIds.size})`}
              </button>
            )}
            <button disabled={bulkSaving} onClick={async () => {
              if (!confirm(`Delete ${selectedIds.size} prospect(s)?`)) return;
              setBulkSaving(true);
              await Promise.all([...selectedIds].map((id) => fetch(`/api/admin/prospects/${id}`, { method: "DELETE" })));
              setProspects((prev) => prev.filter((p) => !selectedIds.has(p.id)));
              setSelectedIds(new Set());
              setBulkSaving(false);
            }}
              className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50 transition-colors">
              {bulkSaving ? "..." : `Delete (${selectedIds.size})`}
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 bg-white text-gray-500 rounded-lg text-xs font-medium hover:bg-gray-100 border border-gray-200 transition-colors">
              Deselect all
            </button>
          </div>
        </div>
      )}

      {/* ── Prospect table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400">Loading...</div>
        ) : filteredProspects.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium text-gray-600">{prospects.length === 0 ? "No prospects yet" : "No prospects match your filters"}</p>
            <p className="text-sm mt-1">{prospects.length === 0 ? "Run the Google Maps workflow to find prospects." : "Try adjusting the filters above."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox"
                      checked={selectedIds.size === filteredProspects.length && filteredProspects.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </th>
                  <th className="px-6 py-3 text-left">Business</th>
                  <th className="px-6 py-3 text-left">City</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Rating</th>
                  <th className="px-6 py-3 text-left">Reviews</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Email Sent</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProspects.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(p.id) ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{p.businessName}</p>
                      {p.website && (
                        <a href={p.website} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                          {p.website.replace(/^https?:\/\//, "").slice(0, 30)}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.city || "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{p.category || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${(p.rating || 0) < 4 ? "text-red-600" : "text-yellow-600"}`}>
                        {p.rating ? `${p.rating}★` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.reviewCount ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{p.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <input type="email" defaultValue={p.email ?? ""}
                          onBlur={(e) => { const val = e.target.value.trim(); if (val !== (p.email ?? "")) saveEmail(p.id, val); }}
                          placeholder="email@example.com"
                          className="w-44 px-2 py-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 placeholder-gray-300" />
                        {emailSaved === p.id && <span className="text-green-600 text-xs font-medium">✓</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {p.emailSentAt ? new Date(p.emailSentAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {p.status === "PENDING" && (
                          <>
                            <button disabled={saving === p.id} onClick={() => updateStatus(p.id, "APPROVED")}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50">
                              Approve
                            </button>
                            <button disabled={saving === p.id} onClick={() => updateStatus(p.id, "REJECTED")}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50">
                              Reject
                            </button>
                          </>
                        )}
                        {p.status === "APPROVED" && (
                          <button disabled={saving === p.id} onClick={() => updateStatus(p.id, "CONTACTED")}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                            Mark Contacted
                          </button>
                        )}
                        {p.status === "CONTACTED" && p.email && (
                          <button disabled={saving === p.id} onClick={async () => {
                            setSaving(p.id);
                            const res = await fetch(`/api/admin/prospects/${p.id}/convert`, { method: "POST" });
                            setSaving(null);
                            if (res.ok) alert("Converted to Lead successfully!");
                            else { const d = await res.json(); alert(d.error ?? "Failed to convert"); }
                          }}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50">
                            → Lead
                          </button>
                        )}
                        {(p.status === "APPROVED" || p.status === "CONTACTED") && p.email && (
                          <button disabled={saving === p.id} onClick={async () => {
                            setSaving(p.id);
                            await generateOutreachDrafts([p.id]);
                            setSaving(null);
                          }}
                            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 disabled:opacity-50">
                            Draft Email
                          </button>
                        )}
                        <button disabled={saving === p.id} onClick={async () => {
                          if (!confirm(`Delete "${p.businessName}"?`)) return;
                          setSaving(p.id);
                          await fetch(`/api/admin/prospects/${p.id}`, { method: "DELETE" });
                          setProspects((prev) => prev.filter((x) => x.id !== p.id));
                          setSaving(null);
                        }}
                          className="px-2 py-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs disabled:opacity-50 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Prospect Modal ── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Add Prospect Manually</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600">Business Name <span className="text-red-500">*</span></label>
                <input type="text" value={addForm.businessName} onChange={(e) => setAddForm((f) => ({ ...f, businessName: e.target.value }))}
                  placeholder="e.g. Joe's Pizza" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600">Website</label>
                <input type="url" value={addForm.website} onChange={(e) => setAddForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://example.com" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Email</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="info@example.com" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Phone</label>
                <input type="text" value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(555) 000-0000" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">City</label>
                <input type="text" value={addForm.city} onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Atlanta" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Category</label>
                <input type="text" value={addForm.category} onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Restaurant" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Rating</label>
                <input type="number" min="0" max="5" step="0.1" value={addForm.rating} onChange={(e) => setAddForm((f) => ({ ...f, rating: e.target.value }))}
                  placeholder="4.2" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Review Count</label>
                <input type="number" min="0" value={addForm.reviewCount} onChange={(e) => setAddForm((f) => ({ ...f, reviewCount: e.target.value }))}
                  placeholder="12" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600">Address</label>
                <input type="text" value={addForm.address} onChange={(e) => setAddForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="123 Main St" className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setAddModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={addProspect} disabled={addSaving || !addForm.businessName.trim()}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {addSaving ? "Adding..." : "Add Prospect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
