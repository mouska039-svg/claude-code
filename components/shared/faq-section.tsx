"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "Naya est-il conforme au RGPD ?",
    answer:
      "Oui, entièrement. Les données sont hébergées en Europe (Supabase EU). Les anamnèses et données de santé sont chiffrées au repos. Un modèle de consentement RGPD avec signature électronique est intégré. Vous gardez le contrôle total de vos données et pouvez les exporter à tout moment.",
  },
  {
    question: "L'IA pose-t-elle des diagnostics médicaux ?",
    answer:
      "Non, jamais. Naya est un outil d'aide à la structuration des cures, pas un outil médical. Tous les protocoles générés contiennent un disclaimer clair : « Ces recommandations relèvent du conseil en hygiène de vie et ne se substituent pas à un avis médical. Consultez votre médecin avant toute modification de traitement. »",
  },
  {
    question: "Puis-je utiliser mon propre branding ?",
    answer:
      "Oui, dès le plan Cabinet. Vous pouvez ajouter votre logo, votre couleur d'accent et votre slogan. Les PDFs protocoles et le portail client refléteront votre identité de marque, avec Naya en mention discrète en footer.",
  },
  {
    question: "Comment fonctionne le clone vocal ElevenLabs ?",
    answer:
      "En plan Cabinet + Entreprise, vous pouvez enregistrer votre voix pour créer un clone vocal et générer des audios sophro/hypno avec votre propre voix. Cette fonctionnalité nécessite une validation d'identité et un consentement explicite (conditions d'utilisation ElevenLabs).",
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer:
      "Oui, sans engagement ni frais de résiliation. Vos données restent accessibles 30 jours après l'annulation, le temps de les exporter. Vous pouvez gérer votre abonnement directement depuis votre espace Naya ou via le portail Stripe.",
  },
  {
    question: "Le portail client est-il une application mobile ?",
    answer:
      "C'est une PWA (Progressive Web App) : vos clients peuvent l'ajouter à leur écran d'accueil comme une vraie application, sans passer par l'App Store ni le Play Store. Ça fonctionne parfaitement sur iOS et Android, avec accès hors-ligne pour consulter la cure.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-ink text-sm sm:text-base pr-4">{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-mist shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-96 pb-5" : "max-h-0"
        )}
      >
        <p className="text-sm text-mist leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="py-24 sm:py-32 bg-muted/20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-sage uppercase tracking-widest mb-3"
          >
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-fraunces text-4xl font-semibold text-ink"
          >
            Questions fréquentes
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl bg-card border border-border px-6 sm:px-8"
        >
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.question} {...item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
