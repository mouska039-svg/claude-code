import { ShoppingBag } from "lucide-react";

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-fraunces text-3xl font-semibold text-ink">Boutique</h1>

      <div className="max-w-lg mx-auto mt-16">
        <div className="rounded-2xl bg-card border border-border p-8 text-center space-y-5">
          {/* Badge */}
          <div className="flex justify-center">
            <span className="bg-terracotta/10 text-terracotta rounded-full px-3 py-1 text-xs font-medium">
              Q3 2025
            </span>
          </div>

          {/* Icon */}
          <ShoppingBag className="h-12 w-12 text-sage mx-auto" />

          {/* Heading */}
          <h2 className="font-fraunces text-2xl font-semibold text-ink">
            Bientôt disponible
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Créez et vendez vos produits bien-être (compléments, programmes en ligne,
            guides PDF) directement depuis votre espace Naya.
          </p>

          {/* Feature preview list */}
          <ul className="text-sm text-left space-y-2.5 text-foreground">
            {[
              "Produits physiques et numériques",
              "Paiement sécurisé via Stripe",
              "Recommandations automatiques sur les protocoles",
              "Gestion des stocks et commandes",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-sage/20 flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-sage"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            disabled
            className="w-full bg-sage text-white rounded-lg min-h-[44px] px-6 text-sm font-medium opacity-70 cursor-not-allowed"
          >
            M&apos;avertir à l&apos;ouverture
          </button>
        </div>
      </div>
    </div>
  );
}
