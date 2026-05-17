import Link from "next/link";
import { Shield } from "lucide-react";

const PRODUCT_LINKS = [
  { label: "Fonctionnalités", href: "/#features" },
  { label: "Tarifs", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
];

const LEGAL_LINKS = [
  { label: "CGU", href: "/legal/terms" },
  { label: "Confidentialité", href: "/legal/privacy" },
  { label: "Cookies", href: "/legal/cookies" },
  { label: "Protection des données", href: "/legal/data-protection" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-1 mb-4">
              <span className="font-fraunces text-2xl font-semibold text-white">
                naya
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta mb-3 ml-0.5" />
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Le guide digital des praticiens du bien-être. Structurez vos cures,
              prolongez l&apos;effet de vos séances, développez votre activité.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Shield className="h-3.5 w-3.5 text-sage" />
              <span>Données hébergées en Europe • RGPD conforme</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Produit
            </h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Légal
            </h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2025 Naya. Tous droits réservés.</p>
          <p className="text-xs text-white/30">
            Ces recommandations ne se substituent pas à un avis médical.
          </p>
        </div>
      </div>
    </footer>
  );
}
