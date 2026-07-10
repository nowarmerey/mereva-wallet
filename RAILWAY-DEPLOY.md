# Deploying Mereva Wallet to Railway

This app is Dockerized, so Railway can build and run it directly from GitHub.
Railway builds the `Dockerfile` (it ignores `docker-compose.yml`), so Postgres
runs as a separate Railway plugin and the hourly cron runs from GitHub Actions.

## 1. Create the project

1. Sign in at https://railway.com with GitHub.
2. **New Project → Deploy from GitHub repo →** `nowarmerey/mereva-wallet`
   (authorize Railway to access the repo if asked). Keep the default branch
   `main`.
3. Railway detects `railway.json` + `Dockerfile` and starts the first build.
   It will crash-loop until the database and variables below are set — that is
   expected; finish the next steps and it recovers.

## 2. Add PostgreSQL

- In the project: **New → Database → Add PostgreSQL.**
- This creates a `Postgres` service that exposes a `DATABASE_URL`.

## 3. Give the app a domain

- Open the **app service → Settings → Networking → Generate Domain**
  (port `3000`). You get a URL like
  `https://mereva-wallet-production.up.railway.app`. Copy it — you need it below.

## 4. Set the app's variables

App service → **Variables** → add these (Raw Editor makes it quick):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | `${{ Postgres.DATABASE_URL }}` ← reference, links to the DB |
| `NEXTAUTH_URL` | your Railway domain (from step 3) |
| `NEXT_PUBLIC_APP_URL` | same Railway domain |
| `NEXTAUTH_SECRET` | a fresh 64-char hex secret (see below) |
| `CRON_SECRET` | a fresh secret (see below) |
| `SEED_ADMIN_EMAIL` | your admin email |
| `SEED_ADMIN_PASSWORD` | a strong password (NOT the default) |
| `EMAIL_FROM` | `Mereva Wallet <noreply@yourdomain>` |

Optional (leave unset to keep the feature off): `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`,
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

Generate secrets locally with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Saving variables redeploys the app. The container runs `prisma migrate deploy`
on boot, so the tables are created automatically.

## 5. Persist uploaded receipts (recommended)

Railway's container filesystem resets on every deploy. To keep receipt images:

- App service → **Settings → Volumes → New Volume**, mount path
  `/app/public/uploads`.

## 6. Seed the admin account (first deploy only)

Once the app is green, open the app service → **⋯ → Shell** (or a local
`railway run`) and run:

```bash
node prisma/seed-saas.js
```

This creates the admin user and the default plans. Then sign in at your Railway
domain and immediately change the admin password in **Settings**.

## 7. Turn on the hourly scheduler

The salary auto-posting, subscription charges and reminders need `/api/cron/run`
to be hit periodically. A GitHub Actions workflow (`.github/workflows/cron.yml`)
already does this hourly. Enable it by adding two repository secrets in
**GitHub → repo → Settings → Secrets and variables → Actions**:

- `APP_URL` — your Railway domain
- `CRON_SECRET` — the same value you set in Railway

You can trigger a test run from the repo's **Actions → Scheduled tasks → Run
workflow**.

## Updating the app later

Push to `main` → Railway rebuilds and redeploys automatically. Your data in the
Postgres plugin and the uploads volume are untouched.
