# Lot 1 — Repositionnement du wording

**Date :** 2026-05-20
**Commit :** refactor(v1.1): repositioning - remove "IA" from user-facing copy
**Skill utilisé :** `brand`

## Objectif

Supprimer toutes les mentions "IA / intelligence artificielle / AI / GPT / OpenAI / généré par IA"
des surfaces utilisateur. Remplacer par le vocabulaire de marque Naya.

## Substitutions approuvées

| Terme interdit                 | Remplacement                                           |
| ------------------------------ | ------------------------------------------------------ |
| "IA" / "AI"                    | "Naya" ou suppression                                  |
| "protocoles IA"                | "protocoles" ou "protocoles Naya"                      |
| "généré par IA"                | "généré par Naya" / "rédigé avec l'assistance de Naya" |
| "Propositions commerciales IA" | "Propositions commerciales assistées"                  |
| "Cures structurées par IA"     | "Protocoles guidés par Naya"                           |
| "Générer le protocole IA"      | "Générer avec Naya"                                    |
| "Quota IA"                     | "Quota Naya"                                           |

## Fichiers modifiés

- `messages/fr.json` — 7 occurrences
- `messages/en.json` — 7 occurrences
- `components/shared/hero-section.tsx` — 3 occurrences
- `components/shared/pillars-section.tsx` — 2 occurrences
- `components/shared/pricing-section.tsx` — 3 occurrences
- `components/shared/testimonials-section.tsx` — 1 occurrence
- `components/shared/faq-section.tsx` — 1 occurrence
- `app/dashboard/page.tsx` — 1 occurrence
- `app/dashboard/clients/[id]/page.tsx` — 2 occurrences
- `app/dashboard/clients/[id]/protocol/new/page.tsx` — 3 occurrences
- `app/dashboard/clients/[id]/protocol/[protocolId]/page.tsx` — 1 occurrence
- `app/dashboard/billing/page.tsx` — 2 occurrences
- `app/(legal)/cgv/page.tsx` — 3 occurrences

## Exceptions (non modifiées)

- `app/(legal)/politique-de-confidentialite/` — transparence RGPD obligatoire
- `server/actions/protocols.ts` — code interne
- Commentaires de code
- `CLAUDE.md`, `PROGRESS.md`, `AGENTS.md` — docs techniques

## Voix de marque Naya

- **Chaleureux** : s'adresse aux praticiens comme un collègue de confiance
- **Expert** : vocabulaire métier précis (naturo/sophro/hypno)
- **Rassurant** : RGPD, sécurité, disclaimer médical toujours présent
- **Jamais technologique pour la technologie** : on dit "Naya" pas "l'IA"
