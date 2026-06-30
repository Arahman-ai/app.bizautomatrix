DO $$ BEGIN
  CREATE TYPE "MarketingChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'LINKEDIN', 'FACEBOOK', 'INSTAGRAM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "MarketingDraftStatus" AS ENUM ('DRAFT', 'REVIEWED', 'APPROVED', 'SENT', 'SKIPPED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "MarketingAgentDraft" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "channel" "MarketingChannel" NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'BizAutomatrix prospects',
    "goal" TEXT,
    "cadence" TEXT NOT NULL DEFAULT 'weekly',
    "content" TEXT NOT NULL,
    "status" "MarketingDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingAgentDraft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MarketingAgentDraft_clientId_idx" ON "MarketingAgentDraft"("clientId");
CREATE INDEX IF NOT EXISTS "MarketingAgentDraft_channel_idx" ON "MarketingAgentDraft"("channel");
CREATE INDEX IF NOT EXISTS "MarketingAgentDraft_status_idx" ON "MarketingAgentDraft"("status");
CREATE INDEX IF NOT EXISTS "MarketingAgentDraft_createdAt_idx" ON "MarketingAgentDraft"("createdAt");

DO $$ BEGIN
  ALTER TABLE "MarketingAgentDraft"
  ADD CONSTRAINT "MarketingAgentDraft_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
