"use client";

import { useEffect, useState } from "react";
import PlanGate from "@/components/PlanGate";
import { usePlan } from "@/hooks/usePlan";

type SeoTask = { id: string; task: string; category: string; priority: string; completed: boolean; completedAt: string | null };

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-600",
};

export default function ClientSeoTasks() {
  const plan = usePlan();
  const [tasks, setTasks] = useState<SeoTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/seo-tasks")
      .then(r => r.json())
      .then(d => { setTasks(d.tasks ?? []); setLoading(false); });
  }, []);

  const completed = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const categories = [...new Set(tasks.map(t => t.category))];

  if (plan === null || loading) return <div className="text-gray-400 text-sm p-4">Loading...</div>;

  return (
    <PlanGate userPlan={plan} requiredPlan="STARTER" featureName="SEO Action Plan">
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SEO Action Plan</h1>
        <p className="text-gray-500 mt-1">Your personalized SEO improvement checklist</p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-medium text-gray-600">No tasks yet</p>
          <p className="text-sm mt-1">Your BizAutomatrix team will assign tasks shortly.</p>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold text-gray-900">Overall Progress</p>
                <p className="text-sm text-gray-500">{completed} of {tasks.length} tasks completed</p>
              </div>
              <span className={`text-3xl font-bold ${progress >= 80 ? "text-green-600" : progress >= 50 ? "text-yellow-600" : "text-blue-600"}`}>{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Tasks by category */}
          <div className="space-y-4">
            {categories.map(cat => {
              const catTasks = tasks.filter(t => t.category === cat);
              const catDone = catTasks.filter(t => t.completed).length;
              return (
                <div key={cat} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-700">{cat}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catDone === catTasks.length ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {catDone}/{catTasks.length}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {catTasks.map(t => (
                      <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                        <span className={`text-lg flex-shrink-0 ${t.completed ? "text-green-500" : "text-gray-300"}`}>{t.completed ? "✓" : "○"}</span>
                        <span className={`flex-1 text-sm ${t.completed ? "line-through text-gray-400" : "text-gray-700"}`}>{t.task}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_COLOR[t.priority] ?? "bg-gray-100 text-gray-500"}`}>
                          {t.priority}
                        </span>
                        {t.completedAt && (
                          <span className="text-xs text-gray-400 flex-shrink-0">{new Date(t.completedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
    </PlanGate>
  );
}
