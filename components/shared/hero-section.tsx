"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <Badge
            variant="outline"
            className="gap-1.5 px-4 py-1.5 text-sm border-primary/30 text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Nouveau — Génération IA en temps réel
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight"
        >
          Crée des programmes coaching
          <br />
          <span className="text-primary">en quelques secondes</span>
          <br />
          avec l&apos;IA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          FitCoach AI génère des programmes d&apos;entraînement personnalisés, des plans nutrition
          et des contenus social media pour tes clients — en quelques secondes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" className="gap-2 text-base h-12 px-8" asChild>
            <Link href="/sign-up">
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2 text-base h-12 px-8" asChild>
            <Link href="#features">
              <Zap className="h-4 w-4" />
              Voir les fonctionnalités
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          Aucune carte bancaire requise
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 relative mx-auto max-w-5xl"
        >
          <div className="rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="mx-auto text-xs text-muted-foreground">fitcoachai.app/dashboard</div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Programmes ce mois", value: "12", change: "+3" },
                { label: "Clients actifs", value: "47", change: "+8" },
                { label: "Quota restant", value: "38/50", change: "Pro" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border/50 bg-background p-4"
                >
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-primary mt-1">{stat.change}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-lg border border-border/50 bg-background p-4 space-y-3">
                <p className="text-sm font-medium">Dernières générations</p>
                {[
                  {
                    title: "Programme PPL 3j — Marie Dupont",
                    type: "Programme",
                    time: "Il y a 2h",
                  },
                  { title: "Plan nutrition perte de poids", type: "Nutrition", time: "Il y a 5h" },
                  { title: "5 captions IG motivantes", type: "Contenu", time: "Hier" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary/10 blur-xl rounded-full" />
        </motion.div>
      </div>
    </section>
  )
}
