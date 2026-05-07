"use client";

import { useEffect, useState } from "react";

type Client = { id: string; businessName: string };
type SeoTask = { id: string; task: string; category: string; priority: string; completed: boolean; completedAt: string | null };

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-600",
};

const CATEGORIES = ["GBP", "Technical", "Content", "Citations", "Off-Page", "Reviews", "general"];

export default function AdminSeoTasks() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [tasks, setTasks] = useState<SeoTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newCat, setNewCat] = useState("general");
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetch("/api/admin/seo-tasks").then(r => r.json()).then(d => setClients(d.clients ?? []));
  }, []);

  useEffect(() => {
    if (!selectedClient) { setTasks([]); return; }
    setLoading(true);
    fetch(`/api/admin/seo-tasks?clientId=${selectedClient}`)
      .then(r => r.json()).then(d => { setTasks(d.tasks ?? []); setLoading(false); });
  }, [selectedClient]);

  async function seedDefaults() {
    setSeeding(true);
    const d = await (await fetch("/api/admin/seo-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient, seedDefaults: true }),
    })).json();
    setTasks(d.tasks ?? []);
    setSeeding(false);
  }

  async function addTask() {
    if (!newTask.trim()) return;
    await fetch("/api/admin/seo-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient, task: newTask.trim(), category: newCat, priority: newPriority }),
    });
    setNewTask("");
    const d = await (await fetch(`/api/admin/seo-tasks?clientId=${selectedClient}`)).json();
    setTasks(d.tasks ?? []);
  }

  async function toggleTask(id: string, completed: boolean) {
    await fetch("/api/admin/seo-tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed }),
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed, completedAt: completed ? new Date().toISOString() : null } : t));
  }

  async function deleteTask(id: string) {
    await fetch(`/api/admin/seo-tasks?id=${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const categories = [...new Set(tasks.map(t => t.category))];
  const completed = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SEO Task Checklist</h1>
        <p className="text-gray-500 mt-1">Track action items per client</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">Select Client</label>
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Choose a client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
        </select>
      </div>

      {selectedClient && (
        <>
          {/* Progress */}
          {tasks.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-gray-900">{completed}/{tasks.length} ({progress}%)</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Add task form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <div className="flex flex-wrap gap-3 mb-3">
              <button onClick={seedDefaults} disabled={seeding}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors">
                {seeding ? "Loading..." : "Load 22 Default SEO Tasks"}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Custom task..." value={newTask}
                onChange={e => setNewTask(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={newCat} onChange={e => setNewCat(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
              <button onClick={addTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Add Task
              </button>
            </div>
          </div>

          {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <div className="space-y-6">
              {categories.map(cat => {
                const catTasks = tasks.filter(t => t.category === cat);
                return (
                  <div key={cat} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-700">{cat}</h3>
                      <span className="text-xs text-gray-500">{catTasks.filter(t => t.completed).length}/{catTasks.length} done</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {catTasks.map(t => (
                        <div key={t.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50">
                          <input type="checkbox" checked={t.completed}
                            onChange={e => toggleTask(t.id, e.target.checked)}
                            className="w-4 h-4 rounded text-green-600 flex-shrink-0" />
                          <span className={`flex-1 text-sm ${t.completed ? "line-through text-gray-400" : "text-gray-700"}`}>{t.task}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLOR[t.priority] ?? "bg-gray-100 text-gray-500"}`}>
                            {t.priority}
                          </span>
                          {t.completedAt && (
                            <span className="text-xs text-gray-400">{new Date(t.completedAt).toLocaleDateString()}</span>
                          )}
                          <button onClick={() => deleteTask(t.id)} className="text-red-400 hover:text-red-600 text-xs px-1.5 py-1 rounded hover:bg-red-50 transition-colors">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {tasks.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="font-medium text-gray-600">No tasks yet</p>
                  <p className="text-sm mt-1">Load defaults or add custom tasks above.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
