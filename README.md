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

## Phase 1 Scope

Phase 1 establishes the foundation:

- Project scaffold with full TypeScript + Tailwind v4 setup
- Clerk authentication (sign-in, sign-up, middleware protection)
- Supabase schema: 24 tables covering all core entities
- i18n: Chinese (default) + English
- Landing page (dark theme, brand identity)
- Legal docs: Disclaimer, Terms of Service, Privacy Policy
- Seed data: 10 method stage definitions + 9 project type definitions

**Not in Phase 1:** Business logic, dashboard UI, AI features, real-time, parent consent flow, RLS policies.

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
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `BLOB_READ_WRITE_TOKEN` | Vercel Dashboard → Storage → Blob |

### 3. Run database migrations

In your Supabase SQL editor, run:

```
supabase/migrations/0001_init_schema.sql
supabase/seed/001_method_stages.sql
supabase/seed/002_project_types.sql
```

Or via Supabase CLI:

```bash
supabase db push
```

### 4. Start development server

```bash
npm run dev
```

Open http://localhost:3000

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
