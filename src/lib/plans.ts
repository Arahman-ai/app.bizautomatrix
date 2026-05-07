export const PLAN_LEVEL: Record<string, number> = {
  FREE: 0,
  STARTER: 1,
  GROWTH: 2,
  PRO: 3,
};

export function canAccess(userPlan: string, requiredPlan: string): boolean {
  return (PLAN_LEVEL[userPlan] ?? 0) >= (PLAN_LEVEL[requiredPlan] ?? 0);
}

export const PLAN_FEATURES: Record<string, { label: string; min: string }[]> = {
  reviews: [{ label: "Review request automation", min: "STARTER" }],
  gbpAudit: [{ label: "GBP Audit & checklist", min: "STARTER" }],
  seoTasks: [{ label: "SEO Task checklist", min: "STARTER" }],
  monthlyReport: [{ label: "Monthly report", min: "STARTER" }],
  nextAction: [{ label: "Next Best Action", min: "STARTER" }],
  rankTracker: [{ label: "Rank Tracker", min: "GROWTH" }],
  citations: [{ label: "Citation Tracker", min: "GROWTH" }],
  competitors: [{ label: "Competitor Analysis", min: "GROWTH" }],
  siteAudit: [{ label: "Site Audit (PageSpeed + NAP)", min: "GROWTH" }],
  seoReport: [{ label: "SEO Report PDF", min: "GROWTH" }],
  socialDrafts: [{ label: "Social Media Drafts", min: "GROWTH" }],
};
