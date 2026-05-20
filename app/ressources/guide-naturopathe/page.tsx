import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide gratuit : Structurez vos cures en 5 étapes | Naya",
  description:
    "Le guide pratique pour naturopathes qui veulent créer des protocoles cohérents, suivre leurs clients et développer leur cabinet.",
};

const BENEFITS = [
  "Créer un protocole de cure complet en moins de 30 minutes",
  "Les 5 erreurs qui éloignent vos clients entre les séances",
  "Comment structurer votre suivi sans y passer des heures",
  "Modèle de contexte pour vos premières consultations",
];

export default function GuideNaturopathePage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="py-5 px-6 border-b border-cream-300">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="font-fraunces text-2xl font-semibold text-ink">
              naya
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta mb-3 ml-0.5" />
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-2xl">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center rounded-full bg-sage/10 px-4 py-1.5 text-xs font-medium text-sage">
              Guide gratuit
            </span>
          </div>

          {/* Hero text */}
          <h1 className="font-fraunces text-3xl sm:text-5xl font-semibold text-ink text-center tracking-tight mb-4">
            Structurez vos cures en 5 étapes
          </h1>

          <p className="text-base sm:text-lg text-mist text-center leading-relaxed mb-10 max-w-xl mx-auto">
            Le guide pratique pour naturopathes qui veulent créer des protocoles
            cohérents, suivre leurs clients et développer leur cabinet.
          </p>

          {/* Two-column layout on desktop */}
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-start">
            {/* Benefits list */}
            <ul className="space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-sage/15 text-sage text-xs font-bold"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span className="text-sm sm:text-base text-ink leading-snug">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            {/* Email capture form */}
            <div className="bg-white rounded-2xl border border-cream-300 shadow-sm p-6 sm:p-7">
              <p className="font-fraunces text-lg font-semibold text-ink mb-1">
                Recevez le guide gratuit
              </p>
              <p className="text-sm text-mist mb-5">
                Entrez votre email et recevez le PDF instantanément.
              </p>

              <form method="POST" action="/api/lead-magnet/subscribe">
                <div className="space-y-3">
                  <label htmlFor="email" className="sr-only">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-sage text-white px-6 py-3 text-sm font-medium min-h-[48px] hover:bg-sage-600 transition-colors"
                  >
                    Recevoir le guide gratuit →
                  </button>
                </div>
              </form>

              <p className="mt-3 text-xs text-mist text-center">
                Aucun spam. Désabonnement en 1 clic.
              </p>
            </div>
          </div>

          {/* Testimonial */}
          <figure className="mt-12 rounded-2xl bg-sage/5 border border-sage/15 px-6 py-5 sm:px-8 sm:py-6">
            <blockquote className="text-sm sm:text-base text-ink leading-relaxed italic">
              &ldquo;Ce guide m&rsquo;a aidée à structurer mes premières consultations. En
              3 semaines, mes clients revenaient mieux préparés.&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-xs text-mist font-medium">
              — Marie-Claire T., naturopathe
            </figcaption>
          </figure>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-cream-300">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-mist">
          <Link href="/" className="hover:text-ink transition-colors">
            Accueil
          </Link>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <Link
            href="/politique-confidentialite"
            className="hover:text-ink transition-colors"
          >
            Politique de confidentialité
          </Link>
        </div>
      </footer>
    </div>
  );
}
