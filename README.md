# FitCoach AI

SaaS platform for fitness coaches — generate workout programs, nutrition plans, and social media content powered by AI. Includes a CRM for client management, branded PDF exports, and shareable client links.

## Stack

- **Framework**: Next.js 16 (App Router, Server Components, Server Actions)
- **Language**: TypeScript strict mode
- **Styling**: Tailwind CSS v4 + shadcn/ui (dark mode)
- **Database**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **AI**: Vercel AI SDK + OpenAI `gpt-4o` via `generateObject`
- **Payments**: Stripe (subscriptions + webhooks)
- **Rate limiting**: Upstash Redis
- **PDF**: @react-pdf/renderer
- **Monitoring**: Sentry + PostHog

## Getting Started

### 1. Clone & install

```bash
git clone <repo-url>
cd fitcoach-ai
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in all variables in `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_PRICE_PRO` | Stripe price ID for Pro plan |
| `STRIPE_PRICE_PREMIUM` | Stripe price ID for Premium plan |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL (optional — disables rate limiting if absent) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (optional) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog key (optional) |
| `NEXT_PUBLIC_SITE_URL` | Your production URL |

### 3. Set up Supabase

1. Create a new Supabase project
2. Run the migration:

```bash
# Via Supabase CLI
supabase db push

# Or paste supabase/migrations/0001_init.sql directly in the SQL editor
```

### 4. Set up Stripe

1. Create two products in Stripe: **Pro** and **Premium**
2. Copy the price IDs to `STRIPE_PRICE_PRO` and `STRIPE_PRICE_PREMIUM`
3. Add a webhook endpoint pointing to `https://yourdomain.com/api/webhooks/stripe` with these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 5. Seed demo data (optional)

```bash
npx tsx scripts/seed.ts
```

This creates a demo user `demo@fitcoach.ai` / `demo123456` with sample clients, measurements, and a workout program.

### 6. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (auth)/           # Sign in, sign up, forgot/reset password
  (dashboard)/      # Protected dashboard routes
    dashboard/
      billing/      # Stripe plans & portal
      clients/      # CRM — list, create, detail with tabs
      content/      # Social media content generator
      nutrition/    # Nutrition plan generator
      programs/     # Workout program generator
      settings/     # Profile, branding, security, danger zone
  api/
    generate/       # AI generation endpoints (workout, nutrition, content)
    pdf/            # PDF export endpoints
    share/          # Share token CRUD
    webhooks/stripe # Stripe webhook handler
  share/[token]/    # Public share page (no auth)

lib/
  ai/               # Schemas, prompts, quota guard, cost tracker
  pdf/              # React-PDF templates + styles
  supabase/         # Server/admin/client Supabase instances
  quotas.ts         # Quota check + increment
  rate-limit.ts     # Upstash rate limiters
  subscription.ts   # Subscription helpers

components/
  shared/           # Dashboard sidebar, header, PostHog, share button...
  ui/               # shadcn/ui components

server/actions/     # Server Actions (auth, clients, settings, Stripe)
supabase/
  migrations/       # SQL migration files
tests/
  unit/             # Vitest unit tests
scripts/
  seed.ts           # Demo data seeder
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npx tsx scripts/seed.ts` | Seed demo data |

## Plans & Quotas

| Feature | Free | Pro | Premium |
|---|---|---|---|
| AI generations/month | 3 | 50 | Unlimited |
| Clients | 1 | Unlimited | Unlimited |
| Branded PDF | — | ✓ | ✓ |
| Share links | — | ✓ | ✓ |

## License

Private — all rights reserved.
