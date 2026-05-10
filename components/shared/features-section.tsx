"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Dumbbell, Salad, Megaphone, FileText, Users, Share2 } from "lucide-react"

const features = [
  {
    icon: Dumbbell,
    title: "Programmes d'entraînement",
    description: "Génère des plans d'entraînement complets et personnalisés en quelques secondes avec l'IA.",
  },
  {
    icon: Salad,
    title: "Plans nutrition",
    description: "Crée des plans alimentaires sur mesure avec macros, listes de courses et repas détaillés.",
  },
  {
    icon: Megaphone,
    title: "Contenus social media",
    description: "Génère des captions, hooks et idées de Reels pour booster ton engagement.",
  },
  {
    icon: FileText,
    title: "Export PDF brandé",
    description: "Exporte tes programmes avec ton logo et tes couleurs pour une présentation pro.",
  },
  {
    icon: Users,
    title: "Gestion des clients",
    description: "Suis les progrès, mensurations et notes de chaque client dans un seul endroit.",
  },
  {
    icon: Share2,
    title: "Partage sécurisé",
    description: "Partage les programmes avec tes clients via des liens sécurisés, sans compte requis.",
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-xl border border-border/50 bg-card p-6 hover:border-primary/30 transition-colors"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
        <feature.icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">{feature.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

export function FeaturesSection() {
  const headerRef = useRef(null)
  const isInView = useInView(headerRef, { once: true, margin: "-50px" })

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Tout ce dont tu as besoin pour coacher
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Des outils IA puissants pensés pour les coachs fitness professionnels.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
