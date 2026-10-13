# 👛 Mereva Wallet — Multi-tenant SaaS Expense Manager

> Part of my portfolio → **[nawarmeree.com](https://nawarmeree.com)** · by [Nawar Meree](https://www.linkedin.com/in/nawar-meree-036491164)

A modern, multi-user personal-finance web app, ready to deploy and sell as a
subscription service.

**Stack:** Next.js 14 (App Router) · React 18 · TailwindCSS 3 · PostgreSQL +
Prisma · NextAuth (Google + email/password) · Stripe · Chart.js · Google Drive
backup · i18n (EN / AR / DE).

---

## ✨ Features

**Money management**
- Income/expense transactions, global search, receipt image uploads.
- Custom categories with monthly **budget limits + alerts**.
- Multiple **wallets** with transfers.
- **Bills** (paid/unpaid per month), **subscriptions** (with reminders),
  **saving goals**.
- **Advanced analytics** + monthly **cash-flow forecast**.
- Smart categorization that learns from your notes.
- Light / dark theme, **PIN lock** with auto-lock.

**SaaS platform**
- 🔐 **Accounts**: email/password **and** Google sign-in.
- 💎 **Subscriptions/billing** via Stripe, with admin-defined **plans & offers**
  and a 14-day free trial. Falls back to admin-managed access if Stripe is off.
- 🛡️ **Admin dashboard**: manage users, roles, and grant/revoke subscriptions.
- 🌍 **Multi-language** EN / AR / DE (English default, full RTL for Arabic).
- ☁️ **Backup** to a file or straight to the user's **Google Drive** + restore.
- 📱 Fully **responsive** (desktop sidebar, mobile top-nav).
- ❓ Interactive **Help & Guide** page.

---

## 🚀 Local development

### 1. Start PostgreSQL (Docker)

Start a local PostgreSQL 16 in Docker:
```bash
docker run -d --name wallet-postgres --restart unless-stopped \
  -e POSTGRES_USER=wallet -e POSTGRES_PASSWORD=wallet -e POSTGRES_DB=wallet \
  -p 5432:5432 -v wallet_pgdata:/var/lib/postgresql/data postgres:16-alpine
```
(or `docker compose up -d db` with the compose file in this repo).

### 2. Configure environment
```bash
cp .env.example .env
# then edit .env — at minimum set NEXTAUTH_SECRET (generate one):
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
`DATABASE_URL` in `.env.example` already matches the Docker Postgres above.

### 3. Install, migrate, seed
```bash
npm install
npx prisma migrate deploy      # create the tables
npm run seed                   # admin account + default plans
```

### 4. Run
```bash
npm run dev
```
Open **http://localhost:3000** and sign in with the seeded admin:

| Email | Password |
| ----- | -------- |
| `SEED_ADMIN_EMAIL` (default `admin@wallet.app`) | `SEED_ADMIN_PASSWORD` (default `admin12345`) |

> ⚠️ **Change these in `.env` before going live.**

---

## 🔑 Connecting Google sign-in (+ Drive backup)

1. Google Cloud Console → **APIs & Services → Credentials → Create OAuth client →
   Web application**.
2. Authorized redirect URI: `https://YOUR_DOMAIN/api/auth/callback/google`
   (locally: `http://localhost:3000/api/auth/callback/google`).
3. Enable the **Google Drive API** (for backups).
4. Put the client id/secret in `.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

The Google button then appears automatically on login/register, and "Back up to
Google Drive" becomes available in Settings.

---

## 💳 Connecting Stripe (paid subscriptions)

1. Create products/prices in the Stripe dashboard (one **price** per plan).
2. Put the **Price ID** (`price_…`) into each plan in **Admin → Plans & Offers**.
3. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env`.
4. Add a webhook endpoint pointing to `https://YOUR_DOMAIN/api/stripe/webhook`
   for events `checkout.session.completed`, `customer.subscription.*`, and put
   its signing secret in `STRIPE_WEBHOOK_SECRET`.

Without Stripe keys the app still works — admins grant access manually from the
Admin dashboard.

---

## 🌐 Deploying to production (Docker on a VPS)

The repo ships a `Dockerfile` and `docker-compose.yml` (app + Postgres).

```bash
# On your server, with the repo + a filled-in .env:
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app node prisma/seed-saas.js   # first time only
```

Then point your domain at the server and put a reverse proxy (Caddy/Nginx) with
HTTPS in front of port 3000. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your
real `https://` domain.

> Prefer Vercel? It works too — just use a hosted Postgres (Neon/Supabase),
> set the same env vars in the Vercel dashboard, and add the Stripe webhook.

---

## 🧱 Data & migration notes

- All data is **scoped per user** (`userId` on every table). Users only ever see
  their own wallets, transactions, etc.
- The previous single-user SQLite data was exported to
  `prisma/backup-sqlite.json` and imported into the admin account by
  `prisma/seed-saas.js`, so **nothing was lost** in the upgrade.
- New sign-ups automatically get a default wallet, starter categories and a
  14-day trial.

---

## 📁 Key structure

```
app/
  (auth)          login/ , register/
  api/            auth, register, me, transactions, wallets, categories, bills,
                  subscriptions, goals, settings, security, upload,
                  plans, billing/checkout, billing/portal, stripe/webhook,
                  admin/users, admin/plans, backup/export|import|google
  admin/ billing/ help/ + all feature pages
components/       AppShell, Providers, Navbar, Sidebar, SecurityGate,
                  LanguageSelector, WalletSelector, charts, forms, tables…
lib/              auth, session, prisma, stripe, google, backup, i18n,
                  seed-user, format, constants, wallet
prisma/           schema.prisma, migrations, seed-saas.js
Dockerfile, docker-compose.yml, .env.example
```
