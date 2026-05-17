"use client";

import { motion } from "framer-motion";
import { Brain, Smartphone, Building2 } from "lucide-react";

const PILLARS = [
  {
    icon: Brain,
    color: "sage",
    title: "Cures structurées par IA",
    description:
      "Générez des protocoles personnalisés en quelques secondes à partir de l'anamnèse de votre client. Naturopathie, sophrologie, hypnothérapie — chaque spécialité a son propre modèle.",
    features: [
      "Protocoles adaptés à votre spécialité",
      "Anamnèse digitalisée multi-étapes",
      "Édition et personnalisation complète",
    ],
  },
  {
    icon: Smartphone,
    color: "terracotta",
    title: "Portail client mobile engagé",
    description:
      "Vos clients accèdent à leur cure depuis leur smartphone, réécoutent les audios sophro/hypno, tiennent leur journal d'humeur. L'effet de vos séances se prolonge dans le temps.",
    features: [
      "PWA installable sur mobile",
      "Journal d'humeur quotidien",
      "Audios personnalisés ElevenLabs",
    ],
  },
  {
    icon: Building2,
    color: "sage",
    title: "Marché entreprises QVCT",
    description:
      "Proposez des programmes bien-être aux entreprises. Générez des propositions commerciales convaincantes, suivez les participants, facturez en multi-échéances.",
    features: [
      "Propositions commerciales IA",
      "Suivi des participants RGPD",
      "Compte-rendu DRH automatisé",
    ],
  },
];

const colorMap = {
  sage: {
    bg: "bg-sage/8",
    icon: "text-sage bg-sage/12",
    border: "border-sage/15",
    dot: "bg-sage",
  },
  terracotta: {
    bg: "bg-terracotta/8",
    icon: "text-terracotta bg-terracotta/12",
    border: "border-terracotta/15",
    dot: "bg-terracotta",
  },
};

export function PillarsSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-sage uppercase tracking-widest mb-3"
          >
            Fonctionnalités
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-fraunces text-4xl sm:text-5xl font-semibold text-ink mb-4"
          >
            Tout ce dont vous avez besoin
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-mist"
          >
            Une plateforme pensée pour les praticiens du bien-être qui veulent structurer
            leur activité sans sacrifier l&apos;humain.
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PILLARS.map((pillar, i) => {
            const colors = colorMap[pillar.color as keyof typeof colorMap];
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-2xl border ${colors.border} ${colors.bg} p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.icon} mb-6`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-fraunces text-xl font-semibold text-ink mb-3">
                  {pillar.title}
                </h3>
                <p className="text-mist leading-relaxed mb-6 text-sm">
                  {pillar.description}
                </p>
                <ul className="space-y-2">
                  {pillar.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-ink/70"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${colors.dot} shrink-0`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
