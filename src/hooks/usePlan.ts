"use client";

import { useEffect, useState } from "react";

export function usePlan() {
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/client/plan")
      .then(r => r.json())
      .then(d => setPlan(d.plan ?? "FREE"));
  }, []);

  return plan;
}
