# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run typecheck    # TypeScript check (no emit)
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier
npm run test         # Vitest (run once)
```

No vitest config file exists yet — tests live alongside source when added. Husky runs lint-staged on commit (ESLint + Prettier on `.ts/.tsx`, Prettier on `.json/.css/.md`).

## Stack

- **Next.js 16** (App Router) — `AGENTS.md` warns this version has breaking API changes; read `node_modules/next/dist/docs/` before writing Next.js-specific code
- **TypeScript strict** — `noEmit`, no `any`, `@/*` alias maps to repo root
- **Tailwind CSS v4** — config is almost entirely in `app/globals.css` via `@theme`; `tailwind.config.ts` only handles `content` paths
- **Supabase** via `@supabase/ssr` for auth + DB
- **next-intl v4** — locale detected from cookie `NEXT_LOCALE` then `accept-language`; default `fr`
- **Vercel** target — region `cdg1`; `vercel.json` at root

## Architecture

### Route layout

```
app/
  page.tsx                  — Public landing (marketing)
  layout.tsx                — Root layout (fonts, toaster, PostHog)
  (legal)/                  — CGV, mentions légales, politique confidentialité
  sign-in/ sign-up/ …       — Auth pages (unauthenticated)
  auth/callback/            — Supabase OAuth exchange
  dashboard/                — Protected by middleware; Server Components + Server Actions
    layout.tsx              — Fetches profile, renders sidebar/header/mobile nav
    clients/[id]/protocol/  — AI protocol generator
  portal/[token]/           — Public client portal via share token (no auth required)
  invoice-print/[id]/       — Print-only invoice view
  api/
    webhooks/stripe/        — runtime: nodejs; validates Stripe signature, idempotent
    rgpd/export/            — GDPR data export
  manifest.ts               — PWA manifest
```

Middleware (`middleware.ts`) guards `/dashboard/*` → redirects to `/sign-in`. In-memory token-bucket rate limiter (60 req/min per IP) on all `/api/*` routes.

### Server Actions pattern

All mutations live in `server/actions/*.ts` — each file uses `"use server"`, validates with Zod, calls `createClient()` (cookie-based SSR client), and redirects on auth failure. Never call these from other server actions; call them from Client Components via form actions or `useTransition`.

### Supabase clients

| Export                  | File                     | Use case                                           |
| ----------------------- | ------------------------ | -------------------------------------------------- |
| `createClient()`        | `lib/supabase/client.ts` | Browser components                                 |
| `createClient()`        | `lib/supabase/server.ts` | Server Components / Actions (cookie-based)         |
| `createServiceClient()` | `lib/supabase/server.ts` | Server-side with service role (cookie thread-safe) |
| `createAdminClient()`   | `lib/supabase/server.ts` | One-off admin ops (no session)                     |

RLS is enabled on every table. Use `createAdminClient()` only when RLS must be bypassed (e.g., portal share-token lookup).

### Data model (19 tables)

Core: `profiles` (1-1 with auth.users), `subscriptions`, `usage_quotas`, `clients`, `anamneses`, `protocols`, `sessions`, `session_audios`, `client_check_ins`, `products`, `product_recommendations`, `companies`, `company_programs`, `company_attendees`, `invoices`, `share_tokens`, `ai_usage_log`, `consent_records`, `stripe_events`

Plans: `free` | `cabinet` | `cabinet_plus` — enforced via `lib/quotas.ts` (`checkQuota` / `incrementQuota`) before any AI call.

### Anamnese encryption

`server/actions/anamnese.ts` encrypts health data with AES-256-GCM using `ANAMNESE_MASTER_KEY` env var (64 hex chars). IV stored alongside ciphertext.

### AI protocol generation

`server/actions/protocols.ts` — uses Vercel AI SDK (`generateObject`) with `@ai-sdk/openai`. Output validated against a Zod schema. Always check quota before calling.

### Client portal

Accessed via `/portal/[token]` — token is a `share_tokens` row (`resource_type = 'client_portal'`). Uses `createAdminClient()` (bypasses RLS since the client isn't authenticated). No session required.

## Design system

### Palette (Tailwind v4 `@theme` in `globals.css`)

| Token        | Hex       | Semantic use       |
| ------------ | --------- | ------------------ |
| `sage`       | `#5C7A6B` | Primary / brand    |
| `terracotta` | `#D4876B` | Secondary / accent |
| `cream`      | `#F5EFE6` | Background         |
| `mist`       | `#8B8A87` | Muted text         |
| `ink`        | `#2C2C2A` | Foreground         |

All colors have 50–900 shades. Semantic tokens (`--color-background`, `--color-primary`, etc.) map to these. Dark mode via `.dark` class.

### Fonts

Loaded via `next/font/google`: **Fraunces** (display/headings), **Inter** (UI), **Geist Mono** (numbers/code). Applied as CSS variables `--font-fraunces`, `--font-inter`, `--font-geist-mono`.

### Components

`components/ui/` — Radix UI primitives wrapped as shadcn-style components (manual, no shadcn CLI). `components/shared/` — layout and page section components.

## i18n

Messages in `messages/fr.json` (default) and `messages/en.json`. Use `useTranslations()` in Client Components; `getTranslations()` in Server Components. The `next-intl` plugin is applied in `next.config.ts`.

## Security notes

- CSP defined in `next.config.ts` headers — update if adding new external domains
- Stripe webhook at `/api/webhooks/stripe` requires `runtime = "nodejs"` and validates signature before any processing; idempotence checked via `stripe_events` table
- Anamnese data encrypted at application layer; `ANAMNESE_MASTER_KEY` must be a 64-char hex string
- `SUPABASE_SERVICE_ROLE_KEY` used only in `createServiceClient` / `createAdminClient` — never expose to the browser
