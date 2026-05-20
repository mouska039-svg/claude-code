import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide envoyé ! | Naya",
  description: "Votre guide gratuit est en route. Vérifiez votre boîte email.",
  robots: { index: false },
};

export default function GuideMerciPage() {
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

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="mx-auto w-full max-w-sm text-center">
          {/* Icon */}
          <div
            className="text-5xl mb-6 select-none"
            role="img"
            aria-label="Boîte aux lettres"
          >
            📬
          </div>

          <h1 className="font-fraunces text-3xl font-semibold text-ink mb-3">
            C&rsquo;est dans votre boîte&nbsp;!
          </h1>

          <p className="text-base text-mist leading-relaxed mb-8">
            Vous recevrez le guide dans les prochaines minutes. Pendant que vous attendez…
          </p>

          {/* CTA card */}
          <div className="rounded-2xl border-2 border-sage/30 bg-white p-6 text-left shadow-sm mb-6">
            <p className="font-fraunces text-lg font-semibold text-ink mb-2">
              Essayez Naya gratuitement
            </p>
            <p className="text-sm text-mist leading-relaxed mb-5">
              Créez votre compte en 2 minutes et commencez à structurer vos cures dès
              aujourd&rsquo;hui.
            </p>
            <Link
              href="/sign-up"
              className="flex items-center justify-center w-full rounded-xl bg-sage text-white px-6 py-3 text-sm font-medium min-h-[48px] hover:bg-sage-600 transition-colors"
            >
              Créer mon espace →
            </Link>
          </div>

          {/* Back link */}
          <Link
            href="/"
            className="text-sm text-mist hover:text-ink transition-colors inline-flex items-center gap-1"
          >
            ← Retour à l&rsquo;accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
