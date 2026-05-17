# Naya — Progress Tracker

## Phase 1 — Fondations ✅

### Décisions d'architecture

- **Stack** : Next.js 16 (App Router) + TypeScript strict + Tailwind CSS v4 + Radix UI (composants shadcn-style manuels, car shadcn CLI inaccessible réseau)
- **Fonts** : Fraunces (titres, via next/font/google), Inter (UI), Geist Mono (chiffres)
- **Palette Naya** : sage #5C7A6B (primary), terracotta #D4876B (secondary), crème #F5EFE6 (background), brume #8B8A87 (muted), encre #2C2C2A (foreground)
- **Supabase** : 19 tables + RLS sur chaque table, trigger new_user → profile+subscription, vue matérialisée revenue_dashboard
- **Auth praticien** : email/password via @supabase/ssr (cookies). Middleware protège /dashboard/\*
- **Auth client** : magic link → /portal (implémenté en Phase 4)
- **i18n** : next-intl, locales fr (défaut) et en, messages complets dans /messages/

### Checklist

#### Setup ✅

- [x] Next.js 16 avec TypeScript strict, Tailwind CSS, App Router, ESLint
- [x] Palette Naya configurée dans tailwind.config.ts (couleurs sage, terracotta, cream, mist, ink)
- [x] CSS variables HSL dans globals.css (light mode chaleureux par défaut, dark mode prêt)
- [x] Fonts Fraunces + Inter + Geist Mono (next/font/google)
- [x] Structure dossiers : /app, /components/ui, /components/shared, /lib, /hooks, /types, /server/actions, /server/db, /messages, /supabase/migrations
- [x] ESLint strict + Prettier + Husky pre-commit (lint-staged)
- [x] Composants UI shadcn-style : button, input, label, card, badge, toast, dialog, dropdown-menu, select, accordion, separator, avatar, skeleton, tabs, textarea, progress, sheet, form

#### Supabase ✅

- [x] Migration 0001_init.sql : 19 tables avec RLS
  - profiles, subscriptions, usage_quotas, stripe_events, consent_records
  - clients, anamneses, protocols, sessions, session_audios, client_check_ins
  - products, product_recommendations, companies, company_programs, company_attendees
  - invoices, share_tokens, ai_usage_log
- [x] Trigger : new user → profile + subscription (plan free)
- [x] Vue matérialisée : revenue_dashboard
- [x] Index sur FK et champs fréquents
- [x] Types TypeScript complets : types/supabase.ts (Database interface, Row/Insert/Update par table)
- [x] types/index.ts : PlanType, SpecialtyType, QuotaResult, etc.
- [x] lib/supabase/client.ts (browser) + server.ts (SSR cookies) + createServiceClient

#### Auth ✅

- [x] Pages /sign-up, /sign-in, /forgot-password, /reset-password
- [x] Server actions avec validation Zod (server/actions/auth.ts)
- [x] Middleware middleware.ts protège /dashboard/\*, redirige vers /sign-in
- [x] Route /auth/callback (échange code OAuth)
- [x] Formulaires avec React Hook Form + Zod

#### Landing page ✅

- [x] Navbar transparente avec scroll detection + menu mobile
- [x] Hero : wordmark "naya" en Fraunces, sous-titre, CTA, trust signals, mockup dashboard
- [x] Pillars : 3 piliers (IA cure / portail client / entreprises QVCT)
- [x] Pricing : 3 tiers (Découverte 0€ / Cabinet 39€ / Cabinet+Entreprise 79€)
- [x] Testimonials : 3 témoignages
- [x] FAQ : accordion avec 6 questions/réponses
- [x] CTA final : section verte avec gradient subtil
- [x] Footer : liens produit/légal, mention RGPD, disclaimer médical

#### i18n ✅

- [x] next-intl configuré (i18n/request.ts)
- [x] messages/fr.json complet (nav, hero, pillars, pricing, testimonials, faq, auth, footer)
- [x] messages/en.json complet

#### Dashboard ✅

- [x] Layout dashboard avec sidebar desktop + drawer mobile
- [x] Header avec menu utilisateur (settings, billing, logout)
- [x] Nav 8 items : Aperçu, Clients, Cures, Séances, Boutique, Entreprises, Facturation, Paramètres
- [x] Page Aperçu : 4 stats cards, actions rapides, prochaines séances

#### Autres ✅

- [x] next.config.ts : next-intl, security headers (CSP, HSTS, X-Frame-Options), images Supabase
- [x] .env.local.example complet avec commentaires
- [x] lib/utils.ts : cn, formatCurrency, formatDate, slugify, getInitials, getCurrentYearMonth
- [x] lib/quotas.ts : checkQuota + incrementQuota

---

## Phase 2 — Dashboard praticien + Stripe + Quotas ⬜

### À implémenter

- [ ] Page Aperçu complète avec Recharts (CA 6 mois, check-ins alertes)
- [ ] Stripe : createCheckoutSession, createPortalSession
- [ ] Webhook Stripe : runtime Node.js, idempotence, handlers subscription events
- [ ] lib/subscription.ts + hooks/use-subscription.ts
- [ ] Page /dashboard/billing : plan actuel, comparatif, upgrade
- [ ] Page /dashboard/settings : profil, branding, sécurité, RGPD
- [ ] Quotas reset mensuel lazy

---

## Phase 3 — CRM clients + Anamnèse + IA protocoles ⬜

### À implémenter

- [ ] Liste clients avec filtres, alertes check-in
- [ ] Création/édition client
- [ ] Détail client avec 6 onglets
- [ ] Anamnèse multi-étapes avec versioning
- [ ] Mode envoi client (magic link) + signature canvas
- [ ] Chiffrement applicatif data jsonb (AES-256)
- [ ] Générateur protocoles IA (naturo/sophro/hypno) avec streaming
- [ ] Schémas Zod output IA par spécialité
- [ ] Gestion quota avant appel IA

---

## Phase 4 — Séances, audios IA, portail client mobile ⬜

### À implémenter

- [ ] Séances : création, résumé IA, upload audio
- [ ] Génération audio ElevenLabs
- [ ] Boutique produits
- [ ] Portail client /portal (magic link auth)
- [ ] Pages portail : dashboard, cure, audios, journal, messages, boutique, rdv, documents
- [ ] PWA manifest + service worker
- [ ] Génération PDF protocole avec @react-pdf/renderer

---

## Phase 5 — Volet entreprises QVCT ⬜

### À implémenter

- [ ] Liste et détail entreprises
- [ ] Programmes : création, formats, tarification
- [ ] Proposition commerciale IA QVCT
- [ ] PDF proposition (branding praticien)
- [ ] Inscription salariés, suivi présences
- [ ] Compte-rendu DRH anonymisé
- [ ] Facturation B2B multi-échéances

---

## Phase 6 — Production-ready ⬜

### À implémenter

- [ ] Rate limiting Upstash (routes IA, login, signup, portal)
- [ ] DOMPurify rich text
- [ ] Script RLS test (2 praticiens, vérif isolation)
- [ ] Sentry + PostHog events
- [ ] Vitest lib/ + Playwright e2e
- [ ] Pages /legal/\* (CGU, confidentialité, cookies, protection données)
- [ ] Banner cookies RGPD
- [ ] Export données RGPD
- [ ] vercel.json (region cdg1)
- [ ] README.md complet
- [ ] Script seed.ts
- [ ] Lighthouse > 90
