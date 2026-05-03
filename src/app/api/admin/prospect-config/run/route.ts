import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function isAdmin(session: ReturnType<typeof getServerSession> extends Promise<infer T> ? T : never) {
  return (session as { user?: { role?: string } } | null)?.user?.role === "ADMIN";
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // TODO: integrate with N8N_PROSPECT_WEBHOOK_URL env var when ready
  // const webhookUrl = process.env.N8N_PROSPECT_WEBHOOK_URL;
  // if (webhookUrl) { await fetch(webhookUrl, { method: "POST", ... }); }

  return NextResponse.json({ success: true, message: "Workflow triggered" });
}
