"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Comment fonctionne la génération IA ?",
    answer: "FitCoach AI utilise GPT-4 pour générer des programmes d'entraînement, plans nutrition et contenus basés sur les informations que tu fournis. Chaque génération est unique et personnalisée.",
  },
  {
    question: "Puis-je modifier les programmes générés ?",
    answer: "Oui, tu peux modifier tous les programmes générés directement dans l'application. L'IA fournit une base de travail que tu peux affiner selon tes besoins.",
  },
  {
    question: "Comment fonctionne le partage avec les clients ?",
    answer: "Tu génères un lien sécurisé depuis ton dashboard. Ton client peut accéder à son programme sans créer de compte, avec ton branding affiché.",
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer: "Oui, tu peux annuler ton abonnement à tout moment. Tu conserves l'accès jusqu'à la fin de ta période de facturation.",
  },
  {
    question: "Les données de mes clients sont-elles sécurisées ?",
    answer: "Oui. Toutes les données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais les données de tes clients avec des tiers.",
  },
  {
    question: "Y a-t-il une période d'essai gratuite ?",
    answer: "Le plan gratuit te donne accès à 3 générations par mois sans limite de durée. Tu peux upgrader quand tu le souhaites.",
  },
]

export function FaqSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Questions fréquentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Tout ce que tu dois savoir sur FitCoach AI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-lg border border-border/50 bg-card px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
