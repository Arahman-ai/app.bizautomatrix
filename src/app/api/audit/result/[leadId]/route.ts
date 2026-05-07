import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function computeScore(lead: {
  website?: string | null;
  phone?: string | null;
  city?: string | null;
  industry?: string | null;
  ownerName?: string | null;
}) {
  let score = 15; // baseline

  const issues: { title: string; impact: "Critical" | "High" | "Medium"; fix: string }[] = [];
  const wins: string[] = [];

  if (lead.website) {
    score += 15;
    wins.push("Website present");
  } else {
    issues.push({ title: "No website found", impact: "Critical", fix: "A website is required for Google to rank your business on web search. Even a basic 3-page site helps." });
  }

  if (lead.phone) {
    score += 10;
    wins.push("Phone number provided");
  } else {
    issues.push({ title: "No phone number listed", impact: "High", fix: "Add your phone number to Google Business Profile and all directories. Customers can't call you if they can't find your number." });
  }

  if (lead.city) {
    score += 10;
    wins.push("Location identified");
  } else {
    issues.push({ title: "No location data", impact: "High", fix: "Google needs your city and address to show you in local search results. Missing location = invisible on Google Maps." });
  }

  if (lead.industry) {
    score += 5;
    wins.push("Industry identified");
  }

  // Assumed issues (almost always true for new leads)
  issues.push({ title: "Google Business Profile likely incomplete", impact: "Critical", fix: "Most businesses are missing category, description, photos, or have an unclaimed profile. This is the #1 reason you don't appear in Google Maps results." });
  issues.push({ title: "Low or no Google reviews", impact: "High", fix: "Google ranks businesses with more reviews higher. Competitors with 50+ reviews will beat you every time. Automated review requests fix this within 30 days." });
  issues.push({ title: "Not listed on key directories", impact: "High", fix: "Your business needs consistent Name, Address & Phone (NAP) across 30+ directories. Google uses these to verify your legitimacy." });
  issues.push({ title: "No keyword-optimized pages", impact: "Medium", fix: "Product/service pages need your target keyword + city in the title. 'Fan Model XR200' ranks for nothing. 'Energy Saving Fan Dhaka' ranks for buyers." });

  const grade = score >= 70 ? "B" : score >= 50 ? "C" : score >= 30 ? "D" : "F";
  const label = score >= 70 ? "Needs Improvement" : score >= 50 ? "Below Average" : score >= 30 ? "Poor Visibility" : "Critically Invisible";

  return { score, grade, label, issues, wins };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = computeScore(lead);
  return NextResponse.json({
    businessName: lead.businessName,
    city: lead.city,
    industry: lead.industry,
    ...result,
  });
}
