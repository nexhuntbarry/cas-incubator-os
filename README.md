# CAS Incubator OS

**Build Ideas. Shape Projects. Launch Impact.**

An AI-powered project-based learning platform that guides high school students through a structured 10-stage incubation method — from interest discovery to project showcase.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| i18n | next-intl (zh / en) |
| Email | Resend |
| File Storage | Vercel Blob |
| Hosting | Vercel |

---

## Status: Phases 1–5 Complete ✓

### Phase 1 — Foundation
- Next.js 16 App Router scaffold, Clerk auth, Supabase schema (24 tables), i18n (zh/en), landing page, seed data.

### Phase 2 — Core Dashboards
- Role-based dashboards for admin / teacher / mentor / student / parent. Student intake flow. Class code join. Method pipeline.

### Phase 3 — Worksheet + Rubric Engine
- AI-powered worksheet feedback (Claude Sonnet 4.6 / Haiku 4.5). Rubric evaluation. Checkpoint submission + review.

### Phase 4 — Communications, Risks, Showcase
- Parent update composer (AI-drafted). Risk flag detection (manual + AI suggest + auto-cron). Showcase publishing. Notification system. Resend email.

### Phase 5 — Polish (current)
- Notification bell (all role shells) with badge + dropdown + auto-refresh
- Mobile-responsive admin/teacher/mentor shells with hamburger sidebar
- Welcome email on `user.created` Clerk webhook
- First-run onboarding tour per role (3-step modal, gated by `onboarded_at`)
- AI Usage dashboard at `/admin/ai-usage` with daily trend chart, cost estimate, route + user breakdown
- Risk Flag modal wired into teacher/mentor project detail pages
- Global error boundary (`app/error.tsx`) + styled 404 (`app/not-found.tsx`)
- Vercel Cron config (`vercel.json`) for daily risk detection at 09:00
- Migration 0006: `onboarded_at` column + 8 performance indexes
- Cached static lookups (method stages, project types) via `unstable_cache`
- Loading skeletons for admin analytics + AI usage pages
- Smoke test script (`scripts/smoke-test.ts`)

---

## Local Setup

### Prerequisites

- Node.js 20+
- A Clerk account (https://clerk.com)
- A Supabase project (https://supabase.com)

### 1. Clone and install

```bash
git clone https://github.com/nexhuntbarry/cas-incubator-os
cd cas-incubator-os
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your actual keys:

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → your endpoint |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `BLOB_READ_WRITE_TOKEN` | Vercel Dashboard → Storage → Blob |
| `CRON_SECRET` | Any random string — `openssl rand -hex 32` |

### 3. Run database migrations

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

See [docs/RUN-MIGRATIONS.md](docs/RUN-MIGRATIONS.md) for the full migration guide.

### 4. Start development server

```bash
npm run dev
```

Open http://localhost:3000

### 5. Run smoke tests (optional)

```bash
BASE_URL=http://localhost:3000 npx tsx scripts/smoke-test.ts
```

See [docs/SMOKE-TEST.md](docs/SMOKE-TEST.md) for the manual checklist.

---

## Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nexhuntbarry/cas-incubator-os)

### Manual deploy

```bash
npm i -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
# ... add all other env vars
vercel --prod
```

---

## Project Structure

```
cas-incubator-os/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (Clerk + i18n + font)
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Tailwind v4 + brand theme
│   ├── sign-in/            # Clerk sign-in
│   └── sign-up/            # Clerk sign-up
├── components/             # Shared React components
│   ├── Logo.tsx            # SVG logo component
│   └── LanguageSwitcher.tsx
├── i18n/                   # next-intl configuration
│   ├── config.ts           # Locale list and defaults
│   └── request.ts          # Server-side locale resolution
├── messages/               # Translation files
│   ├── zh.json
│   └── en.json
├── lib/                    # Shared utilities
│   ├── supabase.ts         # Supabase client factory
│   └── clerk-helpers.ts    # Role-checking helpers
├── middleware.ts            # Clerk auth middleware
├── supabase/
│   ├── migrations/         # SQL migrations
│   └── seed/               # Seed data
├── docs/
│   └── LEGAL/              # Disclaimer, Terms, Privacy
└── public/
    └── logo.svg
```

---

## Brand

- **Primary**: Deep Navy `#0A1330`, Electric Blue `#2563EB`
- **Accent**: Vivid Teal `#00C2B8`, Violet `#7C3AED`, Gold `#FFB020`
- **Font**: Plus Jakarta Sans

---

## License

Private — all rights reserved. See docs/LEGAL/ for terms.
