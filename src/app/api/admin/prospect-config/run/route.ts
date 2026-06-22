import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SINGLETON_ID = "singleton";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

function buildSearchQuery(config: {
  country: string;
  state: string;
  city: string;
  category: string;
}) {
  const parts = [
    config.category || "business",
    config.city,
    config.state,
    config.country,
  ].filter(Boolean);

  return parts.join(" in ");
}

function shouldExclude(place: GooglePlace, excludedCategories: string) {
  const excluded = excludedCategories
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (excluded.length === 0) return false;

  const categoryText = [
    place.primaryTypeDisplayName?.text,
    ...(place.types ?? []),
  ].filter(Boolean).join(" ").toLowerCase();

  return excluded.some((item) => categoryText.includes(item.replace(/_/g, " ")));
}

async function importFromGooglePlaces() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const config = await prisma.prospectConfig.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });

  const query = buildSearchQuery(config);

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.websiteUri",
        "places.rating",
        "places.userRatingCount",
        "places.primaryTypeDisplayName",
        "places.types",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: query,
      pageSize: 20,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return {
      success: false,
      mode: "google-places",
      message: `Google Places returned ${res.status}. Check your API key, billing, and Places API access.${detail ? ` ${detail.slice(0, 180)}` : ""}`,
    };
  }

  const data = await res.json() as { places?: GooglePlace[] };
  const places = data.places ?? [];
  let added = 0;
  let skipped = 0;

  for (const place of places) {
    const reviewCount = place.userRatingCount ?? null;

    if (!place.id || !place.displayName?.text) {
      skipped++;
      continue;
    }

    if (reviewCount !== null && reviewCount > config.maxReviews) {
      skipped++;
      continue;
    }

    if (shouldExclude(place, config.excludedCategories)) {
      skipped++;
      continue;
    }

    await prisma.prospect.upsert({
      where: { placeId: place.id },
      update: {
        businessName: place.displayName.text,
        address: place.formattedAddress ?? null,
        city: config.city || null,
        phone: place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? null,
        website: place.websiteUri ?? null,
        rating: place.rating ?? null,
        reviewCount,
        category: place.primaryTypeDisplayName?.text ?? config.category ?? null,
      },
      create: {
        placeId: place.id,
        businessName: place.displayName.text,
        address: place.formattedAddress ?? null,
        city: config.city || null,
        phone: place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? null,
        website: place.websiteUri ?? null,
        rating: place.rating ?? null,
        reviewCount,
        category: place.primaryTypeDisplayName?.text ?? config.category ?? null,
      },
    });

    added++;
  }

  return {
    success: true,
    mode: "google-places",
    added,
    skipped,
    message: `Google Places search completed for "${query}". Added/updated ${added} prospect(s); skipped ${skipped}.`,
  };
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const googleResult = await importFromGooglePlaces();
  if (googleResult) {
    return NextResponse.json(googleResult, { status: googleResult.success ? 200 : 502 });
  }

  const webhookUrl = process.env.N8N_PROSPECT_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({
      success: false,
      mode: "manual",
      message: "Google Maps automation is not connected. For local automatic import, add GOOGLE_PLACES_API_KEY to .env.local, or use Import CSV/Add Prospect.",
    });
  }

  let res: Response;
  try {
    res = await fetch(webhookUrl, { method: "GET" });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the prospect scraper webhook." },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json({ error: `n8n returned ${res.status}` }, { status: 502 });
  }

  return NextResponse.json({ success: true, message: "Workflow triggered" });
}
