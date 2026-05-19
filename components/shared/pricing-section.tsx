"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const PLANS = [
  {
    name: "Découverte",
    price: "0",
    period: "gratuit",
    description: "Pour découvrir Naya et commencer à structurer votre activité.",
    features: [
      "5 clients maximum",
      "3 protocoles IA / mois",
      "2 audios générés / mois",
      "Portail client de base",
      "Anamnèse digitalisée",
      "Support email",
    ],
    cta: "Commencer gratuitement",
    href: "/sign-up",
    highlighted: false,
    annualBadge: false,
    cardClass: "bg-card border border-border",
    ctaClass: "bg-sage text-white hover:bg-sage-600",
  },
  {
    name: "Cabinet",
    price: "39",
    period: "/ mois",
    description: "Pour les praticiens qui veulent développer leur cabinet en solo.",
    features: [
      "Clients illimités",
      "30 protocoles IA / mois",
      "20 audios générés / mois",
      "Portail client complet avec PWA",
      "Branding personnalisé",
      "PDF protocoles à votre marque",
      "Boutique produits",
      "Support prioritaire",
    ],
    cta: "Choisir Cabinet",
    href: "/sign-up?plan=cabinet",
    highlighted: true,
    annualBadge: true,
    cardClass: "bg-sage text-white ring-2 ring-sage md:scale-105",
    ctaClass: "bg-white text-sage hover:bg-white/90",
  },
  {
    name: "Cabinet+",
    price: "79",
    period: "/ mois",
    description: "Pour les praticiens qui veulent développer le volet B2B QVCT.",
    features: [
      "Tout Cabinet, plus...",
      "Module entreprises QVCT",
      "Protocoles & audios illimités",
      "Clone vocal ElevenLabs",
      "Propositions commerciales IA",
      "Facturation multi-échéances",
      "Compte-rendu DRH automatisé",
      "Support dédié",
    ],
    cta: "Choisir Cabinet+",
    href: "/sign-up?plan=cabinet_plus",
    highlighted: false,
    annualBadge: false,
    cardClass: "bg-card border border-terracotta/30",
    ctaClass: "bg-terracotta text-white hover:bg-terracotta/90",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-fraunces text-3xl sm:text-4xl font-semibold text-ink mb-3"
          >
            Tarifs transparents
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-mist"
          >
            Commencez gratuitement, évoluez quand vous êtes prêt.
          </motion.p>
        </div>

        <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-6 md:items-center">
          {[PLANS[1], PLANS[0], PLANS[2]].map((plan, displayIdx) => {
            const animDelay = displayIdx * 0.1;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: animDelay }}
                className={`relative rounded-2xl p-8 flex flex-col ${plan.cardClass} ${plan.highlighted ? "order-first md:order-none" : ""}`}
              >
                {plan.annualBadge && (
                  <div className="absolute -top-3 right-4 rounded-full bg-terracotta px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    −20% annuel
                  </div>
                )}

                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white/20 border border-white/30 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                    Populaire
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`font-fraunces text-xl font-semibold mb-1 ${plan.highlighted ? "text-white" : "text-ink"}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${plan.highlighted ? "text-white/70" : "text-mist"}`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`font-mono text-4xl font-bold ${plan.highlighted ? "text-white" : "text-ink"}`}
                    >
                      {plan.price}€
                    </span>
                    <span
                      className={`text-sm ${plan.highlighted ? "text-white/70" : "text-mist"}`}
                    >
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-white/80" : "text-sage"}`}
                      />
                      <span
                        className={`text-sm ${plan.highlighted ? "text-white/90" : "text-ink/70"}`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block text-center rounded-xl py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 min-h-[44px] flex items-center justify-center ${plan.ctaClass}`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-mist mt-10"
        >
          Tous les prix sont HT. TVA applicable selon votre situation. Sans engagement —
          annulez à tout moment.
        </motion.p>
      </div>
    </section>
  );
}
