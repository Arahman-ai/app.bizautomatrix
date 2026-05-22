# Free Standby Plan

Use this plan if there is no paying client yet and you do not want to keep paying for a VPS.

## Recommendation

Do not keep paying for an idle VPS.

Keep:

- `bizautomatrix.com` live on GitHub Pages.
- GitHub repos as the source of truth.
- Database credentials and `.env` backed up locally.
- App runnable locally for demos.

Optional:

- Deploy `app.bizautomatrix.com` or a preview URL to Vercel/Render free tier for demos.

## What Goes Offline If VPS Expires

Only the hosted app may go offline:

```text
https://app.bizautomatrix.com
```

The public website can stay live:

```text
https://bizautomatrix.com
```

## Before Letting VPS Expire

Make sure these are safe:

- Latest code is pushed to GitHub.
- `.env.local` is saved locally.
- Database is external/managed, not only stored on the VPS.
- No uploaded files exist only on the VPS.
- You have the deploy checklist saved.

Already saved in repo:

- `HOSTINGER_DEPLOYMENT_CHECKLIST.md`
- `WEEK1_CLIENT_ONBOARDING_GUIDE.md`
- `sales/week1-prospects.csv`
- `sales/week1-outreach-playbook.md`
- `sales/week1-social-launch-pack.md`
- `sales/audit-delivery-template.md`

## Free Deployment Option: Vercel

Good for:

- Demo.
- Admin testing.
- Low-traffic staging.
- Showing prospects screenshots/workflows.

Tradeoffs:

- Local Lighthouse/Chrome cannot run reliably in serverless, so the app skips local Lighthouse on Vercel and falls back to Google PageSpeed API.
- Long crawls should stay small.
- If this becomes active client/commercial use, upgrade or move back to paid hosting.

Required environment variables:

```text
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL
RESEND_API_KEY
EMAIL_FROM
EMAIL_ADMIN
OPENAI_API_KEY
PAGESPEED_API_KEY
N8N_REVIEW_WEBHOOK_URL
N8N_WEBHOOK_SECRET
```

Minimum demo variables:

```text
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL
RESEND_API_KEY
EMAIL_FROM
```

## Local Demo Option

Run locally when needed:

```bash
cd C:\Users\arifm\projects\bizautomatrix
npm install
npx prisma generate
npm run dev -- -p 3001
```

Open:

```text
http://localhost:3001
```

## When To Pay Again

Pay for hosting only when at least one of these is true:

- A client needs reliable access.
- You are sending real review requests.
- You are running scheduled automation.
- You need uptime for demos/outreach.
- The app is generating or supporting revenue.

## Cheapest Practical Strategy

1. Let the paid VPS stop if no client is paying.
2. Keep `bizautomatrix.com` live as the sales site.
3. Use the local app for demo/report generation.
4. Use Vercel free/preview for lightweight online demos.
5. When a client signs, reactivate paid hosting or move to a low-cost managed host.
