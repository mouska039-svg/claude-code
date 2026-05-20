import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Naya pour naturopathes — Structurez vos cures, fidélisez vos clients",
  description:
    "Naya vous aide à créer des protocoles de cure personnalisés, accompagner vos clients entre les séances et structurer votre activité de naturopathe.",
};

const VALUE_PROPS = [
  {
    icon: "🌿",
    title: "Protocoles de cure structurés",
    description:
      "Générez un protocole naturopathique complet en moins de 2 minutes : alimentation, plantes, hygiène de vie, chronobiologie.",
  },
  {
    icon: "📱",
    title: "Portail client intégré",
    description:
      "Vos clients accèdent à leur cure depuis leur téléphone. Rappels automatiques, check-ins et suivi de progression.",
  },
  {
    icon: "📋",
    title: "Modèles pré-rédigés",
    description:
      "Accédez à une bibliothèque de contextes de consultation : fatigue, digestion, hormones, immunité, et bien plus.",
  },
];

const FEATURES = [
  "Protocoles alimentation, microbiote, détox",
  "Fiches hygiène de vie personnalisées",
  "Chronobiologie et rythmes circadiens",
  "Suivi des cures en temps réel",
  "Rappels automatiques pour vos clients",
  "Export PDF à votre image",
];

export default function PourNaturopathesPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-3xl mx-auto text-center">
        {/* Eyebrow badge */}
        <span className="inline-block rounded-full bg-sage/10 text-sage text-xs font-medium px-4 py-1.5 mb-6 tracking-wide">
          Spécialement conçu pour les naturopathes
        </span>

        <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold text-ink leading-tight mb-5">
          Vos cures, vos clients, votre cabinet&nbsp;— centralisés.
        </h1>

        <p className="text-base sm:text-lg text-mist max-w-xl mx-auto mb-8 leading-relaxed">
          Naya vous aide à créer des protocoles de cure personnalisés, accompagner vos
          clients entre les séances et structurer votre activité de naturopathe.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-xl bg-sage text-white font-medium text-sm px-7 py-3 min-h-[44px] hover:bg-sage/90 transition-colors w-full sm:w-auto"
          >
            Essayer gratuitement
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-sage/30 text-sage font-medium text-sm px-7 py-3 min-h-[44px] hover:bg-sage/5 transition-colors w-full sm:w-auto"
          >
            Voir une démo
          </Link>
        </div>
      </section>

      {/* ── Value props ──────────────────────────────────────────── */}
      <section className="px-4 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {VALUE_PROPS.map((prop) => (
            <div
              key={prop.title}
              className="rounded-2xl bg-white border border-cream-300 p-6 space-y-3"
            >
              <span className="text-2xl" aria-hidden="true">
                {prop.icon}
              </span>
              <h2 className="font-fraunces text-lg font-semibold text-ink leading-snug">
                {prop.title}
              </h2>
              <p className="text-sm text-mist leading-relaxed">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social proof quote ───────────────────────────────────── */}
      <section className="px-4 pb-20 max-w-2xl mx-auto">
        <blockquote className="rounded-2xl bg-sage/8 border border-sage/15 p-8 text-center space-y-4">
          <p className="font-fraunces text-xl text-ink leading-relaxed italic">
            &ldquo;Naya m&apos;a permis de passer de 2h à 20 minutes pour créer mes
            protocoles de cure. Mes clientes reviennent plus fidèles et mieux
            accompagnées.&rdquo;
          </p>
          <footer className="text-sm text-mist font-medium">
            — Céline M., naturopathe à Lyon
          </footer>
        </blockquote>
      </section>

      {/* ── Specialty features list ──────────────────────────────── */}
      <section className="px-4 pb-20 max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white border border-cream-300 p-8">
          <h2 className="font-fraunces text-2xl font-semibold text-ink mb-6 text-center">
            Tout ce dont vous avez besoin, rien de superflu
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-ink">
                <span
                  className="mt-0.5 flex-shrink-0 text-sage font-bold text-base leading-none"
                  aria-hidden="true"
                >
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="px-4 pb-24 max-w-2xl mx-auto text-center">
        <div className="rounded-2xl bg-sage px-8 py-12 space-y-5">
          <h2 className="font-fraunces text-3xl font-semibold text-white leading-snug">
            Rejoignez les naturopathes qui font confiance à Naya
          </h2>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-xl bg-white text-sage font-medium text-sm px-8 py-3 min-h-[44px] hover:bg-cream transition-colors"
          >
            Créer mon espace gratuitement
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="px-4 pb-10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-mist hover:text-sage transition-colors min-h-[44px] py-2"
        >
          ← Retour à l&apos;accueil
        </Link>
      </footer>
    </main>
  );
}
