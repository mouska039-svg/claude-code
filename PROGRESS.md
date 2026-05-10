# FitCoach AI — Progress Tracker

## Phase 1 — Fondations ✅

**Status:** Complété

### Checklist
- [x] Next.js 15+ avec TypeScript strict, Tailwind CSS v4, App Router
- [x] shadcn/ui composants créés manuellement (sans registre)
  - Button, Card, Input, Label, Textarea, Badge, Avatar
  - DropdownMenu, Sheet, Dialog, Accordion, Tabs
  - Skeleton, Separator, Progress, Select, Toast/Toaster
- [x] ESLint strict + Prettier + Husky pre-commit
- [x] Supabase migration `0001_init.sql` :
  - Tables : profiles, subscriptions, usage_quotas, stripe_events, ai_usage_log, workout_programs, nutrition_plans, social_contents, clients, client_assignments, client_measurements, client_files, client_notes, share_tokens
  - RLS sur toutes les tables
  - Trigger auto-création profile + subscription au signup
  - Triggers updated_at
  - Index de performance
- [x] Supabase client SSR (browser + server + admin)
- [x] Auth : sign-in, sign-up, forgot-password, reset-password
  - Server actions avec validation Zod
  - Gestion des erreurs propre
  - Callback route `/auth/callback`
- [x] middleware.ts : protection `/dashboard/*`, redirect auth
- [x] next-intl : fr (défaut) + en, messages complets
- [x] Landing page responsive :
  - Navbar (desktop + mobile drawer)
  - Hero avec mockup dashboard
  - Features (6 cards avec animations Framer Motion)
  - Pricing (3 tiers : Free/Pro/Premium)
  - FAQ (Accordion)
  - CTA final
  - Footer
- [x] Pages légales : /legal/terms, /legal/privacy, /legal/cookies
- [x] .env.local.example complet avec commentaires
- [x] Types TypeScript pour toutes les tables DB

### Décisions d'architecture

- **Tailwind v4** : pas de `tailwind.config.ts`, utilise `@theme inline` dans CSS
- **shadcn/ui** : composants créés manuellement (registre non accessible en local)
- **Dark mode** : forcé via classe `dark` sur `<html>` (pas de toggle système)
- **next-intl** : configuré sans préfixe de locale dans l'URL (locale détectée auto)
- **Middleware** : Supabase SSR + protection routes, pas d'intl middleware pour simplifier

---

## Phase 2 — Dashboard + Stripe + Quotas 🔄

**Status:** À faire

### Checklist
- [ ] Layout dashboard : sidebar responsive + header
- [ ] Page Overview avec stats, graphs Recharts, quick actions
- [ ] Stripe : produits, checkout session, customer portal
- [ ] Webhook Stripe : Node.js runtime, idempotence, handlers
- [ ] lib/subscription.ts + hooks/use-subscription.ts
- [ ] lib/quotas.ts : checkQuota par type et plan
- [ ] Settings : profil, branding, sécurité, préférences, suppression compte

---

## Phase 3 — Générateurs IA 🔄

**Status:** À faire

### Checklist
- [ ] Architecture IA : client, quota-guard, cost-tracker, prompts, schémas
- [ ] Générateur programmes : form + streaming + sauvegarde
- [ ] Générateur nutrition : form + TDEE + sauvegarde
- [ ] Générateur contenus social : 5 variantes + copie
- [ ] Pages liste + détail pour chaque type
- [ ] Gestion erreurs : quota dépassé, OpenAI error, timeout

---

## Phase 4 — CRM + PDF + Partage 🔄

**Status:** À faire

### Checklist
- [ ] CRM clients : liste, création, détail avec onglets
- [ ] Suivi : mensurations + graph Recharts
- [ ] Fichiers clients : upload Supabase Storage
- [ ] PDF : templates ProgramPDF + NutritionPDF avec branding
- [ ] Route API PDF : streaming, cache Storage
- [ ] Share tokens : génération, page publique, révocation

---

## Phase 5 — Production-ready 🔄

**Status:** À faire

### Checklist
- [ ] Rate limiting Upstash : routes IA, login, signup, forgot-password
- [ ] Headers sécurité : CSP, HSTS, X-Frame-Options
- [ ] DOMPurify pour rich text
- [ ] Script test-rls.ts
- [ ] Sentry : client + serveur + source maps
- [ ] PostHog : events tracking
- [ ] Tests Vitest (lib/)
- [ ] Tests Playwright (E2E)
- [ ] RGPD : export données, suppression cascade
- [ ] README.md complet
- [ ] Script seed.ts
- [ ] Performance Lighthouse > 90
