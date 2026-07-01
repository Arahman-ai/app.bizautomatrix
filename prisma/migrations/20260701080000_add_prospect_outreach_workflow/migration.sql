ALTER TABLE "MarketingAgentDraft"
  ADD COLUMN IF NOT EXISTS "prospectId" TEXT,
  ADD COLUMN IF NOT EXISTS "recipientEmail" TEXT;

CREATE TABLE IF NOT EXISTS "OutreachEmailLog" (
  "id" TEXT NOT NULL,
  "prospectId" TEXT,
  "draftId" TEXT,
  "recipientEmail" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SENT',
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OutreachEmailLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MarketingAgentDraft_prospectId_idx" ON "MarketingAgentDraft"("prospectId");
CREATE INDEX IF NOT EXISTS "MarketingAgentDraft_recipientEmail_idx" ON "MarketingAgentDraft"("recipientEmail");
CREATE INDEX IF NOT EXISTS "OutreachEmailLog_prospectId_idx" ON "OutreachEmailLog"("prospectId");
CREATE INDEX IF NOT EXISTS "OutreachEmailLog_draftId_idx" ON "OutreachEmailLog"("draftId");
CREATE INDEX IF NOT EXISTS "OutreachEmailLog_recipientEmail_idx" ON "OutreachEmailLog"("recipientEmail");
CREATE INDEX IF NOT EXISTS "OutreachEmailLog_expiresAt_idx" ON "OutreachEmailLog"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MarketingAgentDraft_prospectId_fkey'
  ) THEN
    ALTER TABLE "MarketingAgentDraft"
      ADD CONSTRAINT "MarketingAgentDraft_prospectId_fkey"
      FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OutreachEmailLog_prospectId_fkey'
  ) THEN
    ALTER TABLE "OutreachEmailLog"
      ADD CONSTRAINT "OutreachEmailLog_prospectId_fkey"
      FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OutreachEmailLog_draftId_fkey'
  ) THEN
    ALTER TABLE "OutreachEmailLog"
      ADD CONSTRAINT "OutreachEmailLog_draftId_fkey"
      FOREIGN KEY ("draftId") REFERENCES "MarketingAgentDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
