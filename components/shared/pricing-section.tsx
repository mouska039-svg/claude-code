"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Gratuit",
    price: "0",
    description: "Pour commencer à explorer FitCoach AI.",
    cta: "Commencer",
    ctaVariant: "outline" as const,
    features: [
      "3 générations / mois",
      "Accès aux générateurs IA",
      "Export PDF basique",
      "1 client",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "29",
    description: "Pour les coachs actifs qui veulent gagner du temps.",
    cta: "Essayer Pro",
    ctaVariant: "default" as const,
    badge: "Populaire",
    features: [
      "50 générations / mois",
      "Tous les générateurs IA",
      "Export PDF brandé",
      "Clients illimités",
      "Partage de liens clients",
      "Support prioritaire",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "79",
    description: "Pour les coachs qui gèrent une vraie activité.",
    cta: "Essayer Premium",
    ctaVariant: "outline" as const,
    features: [
      "Générations illimitées",
      "Tous les outils Pro",
      "Branding complet",
      "Analytics avancés",
      "API access",
      "Onboarding dédié",
    ],
    popular: false,
  },
]

export function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Tarifs simples et transparents
          </h2>
          <p className="text-muted-foreground text-lg">
            Commence gratuitement, évolue quand tu en as besoin.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative rounded-xl border bg-card p-8",
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 scale-105"
                  : "border-border/50"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-1">{plan.badge}</Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/ mois</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <Button
                variant={plan.ctaVariant}
                className="w-full mb-6"
                asChild
              >
                <Link href="/sign-up">{plan.cta}</Link>
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
