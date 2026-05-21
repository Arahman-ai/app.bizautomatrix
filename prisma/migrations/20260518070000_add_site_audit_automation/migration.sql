-- AlterTable
ALTER TABLE "SeoTask" ADD COLUMN     "issueType" TEXT,
ADD COLUMN     "pageUrl" TEXT,
ADD COLUMN     "recommendation" TEXT;

-- CreateTable
CREATE TABLE "SiteAuditRun" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "pagesCrawled" INTEGER NOT NULL DEFAULT 0,
    "issuesFound" INTEGER NOT NULL DEFAULT 0,
    "tasksCreated" INTEGER NOT NULL DEFAULT 0,
    "seoScore" INTEGER,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteAuditRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteAuditPage" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER,
    "title" TEXT,
    "metaDescription" TEXT,
    "h1" TEXT,
    "h1Count" INTEGER NOT NULL DEFAULT 0,
    "h2Count" INTEGER NOT NULL DEFAULT 0,
    "canonicalUrl" TEXT,
    "internalLinks" INTEGER NOT NULL DEFAULT 0,
    "externalLinks" INTEGER NOT NULL DEFAULT 0,
    "images" INTEGER NOT NULL DEFAULT 0,
    "imagesMissingAlt" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteAuditPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteAuditIssue" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "pageId" TEXT,
    "clientId" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "recommendation" TEXT NOT NULL,
    "taskCreated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteAuditIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteAuditPage_clientId_idx" ON "SiteAuditPage"("clientId");

-- CreateIndex
CREATE INDEX "SiteAuditPage_auditRunId_idx" ON "SiteAuditPage"("auditRunId");

-- CreateIndex
CREATE INDEX "SiteAuditIssue_clientId_idx" ON "SiteAuditIssue"("clientId");

-- CreateIndex
CREATE INDEX "SiteAuditIssue_auditRunId_idx" ON "SiteAuditIssue"("auditRunId");

-- CreateIndex
CREATE INDEX "SiteAuditIssue_pageId_idx" ON "SiteAuditIssue"("pageId");

-- AddForeignKey
ALTER TABLE "SiteAuditRun" ADD CONSTRAINT "SiteAuditRun_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteAuditPage" ADD CONSTRAINT "SiteAuditPage_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "SiteAuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteAuditIssue" ADD CONSTRAINT "SiteAuditIssue_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "SiteAuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteAuditIssue" ADD CONSTRAINT "SiteAuditIssue_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "SiteAuditPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
