"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Découverte",
    price: "0",
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
  },
  {
    name: "Cabinet",
    price: "39",
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
  },
  {
    name: "Cabinet + Entreprise",
    price: "79",
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
    cta: "Choisir Cabinet + Entreprise",
    href: "/sign-up?plan=cabinet_plus",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-sage uppercase tracking-widest mb-3"
          >
            Tarifs
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-fraunces text-4xl sm:text-5xl font-semibold text-ink mb-4"
          >
            Des tarifs transparents
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-mist"
          >
            Commencez gratuitement, évoluez quand vous êtes prêt.
          </motion.p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlighted
                  ? "bg-sage text-white shadow-xl shadow-sage/20 scale-105"
                  : "bg-card border border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-terracotta px-4 py-1 text-xs font-semibold text-white shadow-sm">
                  Populaire
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`font-fraunces text-xl font-semibold mb-1 ${
                    plan.highlighted ? "text-white" : "text-ink"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    plan.highlighted ? "text-white/70" : "text-mist"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-fraunces text-5xl font-semibold ${
                      plan.highlighted ? "text-white" : "text-ink"
                    }`}
                  >
                    {plan.price}€
                  </span>
                  <span
                    className={`text-sm ${
                      plan.highlighted ? "text-white/70" : "text-mist"
                    }`}
                  >
                    / mois
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        plan.highlighted ? "text-white" : "text-sage"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-white/90" : "text-ink/70"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center rounded-xl py-3 text-sm font-medium transition-all hover:-translate-y-0.5 ${
                  plan.highlighted
                    ? "bg-white text-sage hover:bg-white/90 shadow-sm"
                    : "bg-sage text-white hover:bg-sage-600"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
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
