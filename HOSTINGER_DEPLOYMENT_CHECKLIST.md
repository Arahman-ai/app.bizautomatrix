# Hostinger Deployment Checklist

Use this when deploying `app.bizautomatrix.com` after code is pushed to GitHub.

## Current Status

- Public site `bizautomatrix.com` is already live with the new industrial automation positioning.
- App repo changes are pushed to GitHub.
- Production app still needs to pull, migrate, build, and restart.

## One-Time Server Check

Confirm the app directory:

```bash
cd /var/www/bizautomatrix
pwd
git remote -v
```

The remote should point to:

```text
https://github.com/Arahman-ai/app.bizautomatrix.git
```

## Standard Deployment

Run:

```bash
cd /var/www/bizautomatrix
git pull origin main
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart bizautomatrix
pm2 save
```

If the PM2 app is not found:

```bash
pm2 start npm --name bizautomatrix -- start
pm2 save
```

## Smoke Tests

After deployment, check these URLs:

```text
https://app.bizautomatrix.com/admin/site-audit
https://app.bizautomatrix.com/admin/seo-tasks
https://app.bizautomatrix.com/admin/review-management
```

Expected:

- Logged-out requests may redirect to login.
- They should not return `404`.
- Admin login should show the pages in the sidebar.

## Database Migration

The site-audit migration adds:

- `SiteAuditRun`
- `SiteAuditPage`
- `SiteAuditIssue`
- extra SEO task fields for page URL, issue type, and recommendation.

Run only:

```bash
npx prisma migrate deploy
```

Do not use destructive Prisma reset commands on production.

## First Client Test

1. Login as admin.
2. Open `Admin -> Site Audit`.
3. Select `Sustech Technology Ltd`.
4. Run full site audit.
5. Create PDF audit report.
6. Open `Admin -> Review Mgmt`.
7. Save the Google review link.
8. Generate review SEO tasks.
9. Confirm `Admin -> SEO Tasks` shows review tasks and audit tasks.
