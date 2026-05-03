import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const webhookUrl = process.env.N8N_PROSPECT_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook URL not configured" }, { status: 500 });
  }

  const res = await fetch(webhookUrl, { method: "GET" });

  if (!res.ok) {
    return NextResponse.json({ error: `n8n returned ${res.status}` }, { status: 502 });
  }

  return NextResponse.json({ success: true, message: "Workflow triggered" });
}
