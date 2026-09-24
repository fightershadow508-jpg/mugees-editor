# Mughees Edtior — Creator Academy Demo

A premium static front-end prototype for a creator-training platform with:

- Public marketing website
- TikTok Growth and Hypic + CapCut course pages
- Student signup/login (browser-local demo)
- Separate student dashboard
- Today / 7-day / 30-day / total approved earnings cards
- Available balance + total paid
- Performance, courses, live classes, recordings and trends
- Withdrawal requests using JazzCash, Easypaisa, SadaPay, NayaPay or Bank Transfer
- Admin dashboard
- Admin-managed approved earning credits
- Admin withdrawal approval / rejection / payment reference
- Admin trends, class scheduling and notifications
- Draft legal pages (Terms, Privacy, Payout, Refund, Earnings Policy, Earnings Disclaimer, Community Guidelines)
- Responsive mobile layout inspired by modern learning dashboards, but with an original visual design

## Authentication

Authentication is now handled by Supabase Auth. Passwords are managed securely via Supabase and are not stored in source code.

## Important: what this ZIP is

This is a **fully interactive front-end prototype**. Data is stored in the browser using `localStorage` so you can review the complete flow immediately and deploy it to Vercel with no server setup.

It is **not yet a secure production financial backend**. Before real students, real payments, or real payout processing are enabled, connect a secure backend/database and authentication system.

Recommended production stack:

- Frontend: Next.js / React (or keep this UI and migrate it)
- Backend: Laravel or Node/NestJS
- Database: PostgreSQL / MySQL
- Authentication: secure hashed passwords + email/phone verification + 2FA for Admin
- Video/live classes: Zoom API / Google Meet integration / LiveKit
- Recordings: Bunny Stream / Cloudflare Stream / S3-compatible storage
- Notifications: in-app + email + web push; WhatsApp Business API later
- Audit logs for all Admin earning/balance edits
- Encryption for payout-account information
- Daily automated backups

## Financial/product wording

The prototype uses **Approved Earnings / Available Balance** as the student-visible concept. It does not expose internal partner/platform accounting.

Do not silently reduce a user-owned balance. If your commercial model includes a fee or deduction that changes what the user is entitled to receive, have a lawyer confirm the correct disclosure and show it before the user commits to the transaction.

## Local preview

Option 1: open `index.html` directly in a browser.

Option 2 (recommended):

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deploy to Vercel

### Easiest method — Vercel website

1. Extract this ZIP.
2. Create a free Vercel account at `vercel.com`.
3. From the Vercel dashboard click **Add New → Project**.
4. If the folder is in GitHub, import the repository. Otherwise install the Vercel CLI (method below).
5. Framework preset: choose **Other** / static site.
6. Build command: leave blank.
7. Output directory: leave blank / root.
8. Deploy.

### Vercel CLI method

Install Node.js, then run:

```bash
npm install -g vercel
```

Inside the extracted site folder:

```bash
vercel
```

Answer the prompts, then deploy production:

```bash
vercel --prod
```

The included `vercel.json` adds basic security headers.

## Before real launch

Replace these demo items:

- Brand spelling/name if needed (`Mughees Edtior` is used exactly as requested)
- Official domain
- Official support email and WhatsApp
- Founder/team photos and truthful job titles
- Course pricing/enrollment terms
- Real trainer/class links
- Legal entity/company details
- Final lawyer-reviewed legal policies
- Actual payout operations/API or secure manual workflow
- Production database and authentication
- Real notification delivery

Do not publish fake testimonials, fake earnings, fake student counts, fake company affiliations, or guaranteed-income claims.
