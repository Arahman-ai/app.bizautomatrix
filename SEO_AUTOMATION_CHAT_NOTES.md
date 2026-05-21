# BizAutomatrix SEO Automation Notes

Date: 2026-05-18

## Project Folders

- App dashboard: `C:\Users\arifm\projects\bizautomatrix`
- Codex local test copy: `C:\Users\arifm\projects\bizautomatrix-seo-automation-codex-test`
- Public marketing site: `C:\Users\arifm\bridgebay-digital`

The SEO automation work is being tested in the Codex local test copy first.

## Goal

Build a low-cost SEO/SEM automation system inside BizAutomatrix where an admin can:

1. Select a client.
2. Run a website/site audit.
3. Crawl pages and product/service links.
4. Detect SEO issues.
5. Generate SEO tasks.
6. Track local SEO modules.
7. Create client reports.

The preferred approach is automation with admin approval, not unsafe full hands-off SEO.

## Sidebar Order Decision

The SEO Tools sidebar order was changed to match the real workflow:

1. Site Audit
2. SEO Tasks
3. Rank Tracker
4. GBP Audit
5. Citations
6. Competitors
7. SEO Report

Updated file:

- `src/components/AdminSidebar.tsx`

## Site Audit Automation Built

Added a new Site Audit automation flow:

- Select client.
- Use website/product URL.
- Click `Run Full Site Audit`.
- Crawl same-domain pages.
- Detect SEO issues.
- Save audit run/page/issue data.
- Auto-create SEO tasks.
- Show crawl results on the Site Audit page.

Files changed:

- `src/app/(admin)/admin/site-audit/page.tsx`
- `src/app/api/admin/site-audit/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260518070000_add_site_audit_automation/migration.sql`

Database additions:

- `SiteAuditRun`
- `SiteAuditPage`
- `SiteAuditIssue`
- Extra optional fields on `SeoTask`:
  - `pageUrl`
  - `issueType`
  - `recommendation`

Test result from Sustech audit:

- Pages crawled: 24-25
- Issues found: 143-150
- Tasks created: 143-150
- SEO score: 0/100

Important next improvement:

- Do not create one task for every repeated issue.
- Group repeated issues into cleaner tasks, such as:
  - Add missing meta descriptions to 37 pages.
  - Add missing H1 tags to 22 pages.
  - Fix sitemap.xml.
  - Add alt text to images.

## PageSpeed Issue And Fix

Original issue:

- The existing PageSpeed test showed `PageSpeed API failed`.
- Google returned quota error:
  - `429 Too Many Requests`
  - `Quota exceeded`
  - `quota_limit_value: 0`

Decision:

- Use Local Lighthouse first.
- Fall back to Google PageSpeed only if Local Lighthouse fails.

Files changed:

- `src/app/api/admin/pagespeed/route.ts`
- `package.json`
- `package-lock.json`

Packages added:

- `lighthouse`
- `chrome-launcher`

Verification:

- Local Lighthouse CLI smoke test worked.
- Build passed.

## Current Local Test URL

Local test server:

```text
http://localhost:3001/admin/site-audit
```

Run command:

```bash
npm run dev -- -p 3001
```

## SEO Tool Automation Plan

### Dashboard

Turn into a command center:

- Client SEO score
- Last audit date
- Open high-priority tasks
- Rank movement
- GBP score
- Citation completion
- Next best action

### Prospects

Already partly automated with prospect scraping/n8n.

Future improvements:

- Auto-find businesses by city/category.
- Auto-detect website, phone, reviews.
- Auto-score lead quality.
- Auto-create outreach drafts.

### Leads

Future improvements:

- Convert approved prospects into leads.
- Auto-fill business name, website, phone, city, industry.
- Auto-create first audit record.
- Auto-suggest follow-up email.

### Clients

Future improvements:

- On client creation/conversion, auto-create:
  - SEO task list
  - Citation checklist
  - GBP checklist
  - First site audit
  - Starter rank keywords

### Email Template

Future improvements:

- Generate custom outreach/report copy based on audit issues.
- Use client industry, city, and website problems.
- Keep admin approval before sending.

### Rank Tracker

Current state:

- Mostly manual rank entries.

Best automation:

- Auto-generate starter keywords from client name, city, industry, and crawled service/product pages.
- Auto-add product/service URLs from Site Audit.
- Provide `Check Google` and `Check Maps` links for manual verification.
- Later connect Google Search Console API for real website query data.

Note:

- Reliable Google SERP rank tracking at scale usually needs paid APIs/proxies.

### GBP Audit

Current state:

- Manual checklist.

Best automation:

- Pre-fill from client NAP data.
- Auto-score profile.
- Auto-create tasks for missing checklist items.
- Later connect Google Business Profile API if clients authorize access.

### Citations

Current state:

- Manual directory tracker.

Best automation:

- Auto-add default directories.
- Auto-create tasks for missing listings.
- Add search/listing buttons.
- If listing URL exists, scan page for NAP match.

Note:

- Full auto-submission is not realistic because directories often require login, CAPTCHA, email verification, or phone verification.

### SEO Tasks

Should become the central output from all tools:

- Site Audit creates technical SEO tasks.
- GBP Audit creates GBP tasks.
- Citations creates listing tasks.
- Rank Tracker creates ranking improvement tasks.
- Competitors creates content gap tasks.

Next improvement:

- Group duplicate/repeated tasks.
- Add filters by priority/status/category.
- Show page URL, issue type, and recommendation clearly.

### Competitors

Current state:

- Manual competitor tracker.

Best automation:

- Generate competitor search links from city and industry.
- Admin selects top competitors.
- Store competitor websites.
- Later crawl competitor websites and compare:
  - titles
  - meta descriptions
  - service pages
  - headings
  - content gaps
  - review/rating data if available

### SEO Report

Current state:

- Pulls summary from existing tools.

Best automation:

- Add Site Audit summary.
- Add issues by priority.
- Add latest SEO score.
- Add completed vs open tasks.
- Add client-friendly recommendations.
- Support print/save PDF.

## Admin Guideline For Starting A New Client

1. Go to `Clients`.
2. Add or convert the client.
3. Fill:
   - business name
   - website
   - phone
   - address
   - city
   - state
   - industry
4. Go to `Site Audit`.
5. Select the client.
6. Use the homepage URL for a full audit, not a tracked product/category URL.
7. Click `Run Full Site Audit`.
8. Review:
   - pages crawled
   - issues found
   - SEO score
   - crawl results
9. Go to `SEO Tasks`.
10. Review generated tasks.
11. Start with high-priority tasks.
12. Go to `GBP Audit`.
13. Complete and save the checklist.
14. Go to `Citations`.
15. Add default directories and mark listing/NAP status.
16. Go to `Rank Tracker`.
17. Add target keywords and product/service URLs.
18. Go to `Competitors`.
19. Add 3-5 top competitors.
20. Go to `SEO Report`.
21. Generate/print the client report.

## Best Client Promise

Use this language:

```text
Automated SEO audit, task generation, tracking, and reporting with human approval for Google, GBP, citation, and ad-platform actions.
```

Avoid promising:

```text
Everything is 100% automatic with no manual review.
```

That is not realistic because Google, GBP, directories, and ad platforms have authentication, rate limits, API restrictions, and verification steps.

## Verification Already Done

- `npm install` completed in the test folder.
- `npx prisma generate` completed.
- `npm run build` passed after Site Audit changes.
- New Site Audit route/page lint clean.
- Sidebar component lint clean.
- PageSpeed route lint clean.
- Local Lighthouse smoke test worked.

## Known Warnings / Notes

- Full project `npm run lint` has older pre-existing lint errors unrelated to the new work.
- `npm install` reports existing package vulnerabilities; review separately before production.
- Next.js warns about multiple lockfiles and inferred workspace root.
- The test copy `.env` points to Neon database `neondb`.
- The new additive schema was applied to that configured database.
