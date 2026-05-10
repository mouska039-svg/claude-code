"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-3xl text-center rounded-2xl border border-primary/20 bg-primary/5 p-12 sm:p-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Prêt à transformer ton coaching ?
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Rejoins les coachs qui gagnent des heures chaque semaine grâce à FitCoach AI.
        </p>
        <Button size="lg" className="gap-2 text-base h-12 px-8" asChild>
          <Link href="/sign-up">
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">Aucune carte bancaire requise</p>
      </motion.div>
    </section>
  )
}
