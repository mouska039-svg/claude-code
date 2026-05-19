"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-creme">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, #5C7A6B18 0%, transparent 50%),
                            radial-gradient(circle at 70% 80%, #D4876B12 0%, transparent 50%)`,
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full bg-sage/10 px-4 py-1.5 text-xs font-medium text-sage mb-8"
        >
          Bien-être professionnel · IA &amp; praticiens
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-fraunces text-4xl sm:text-6xl font-semibold text-ink tracking-tight mb-6"
        >
          Votre cabinet,
          <br className="hidden sm:block" />
          réinventé par l&apos;IA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10"
        >
          Protocoles personnalisés, suivi client simplifié, facturation automatisée — tout
          ce dont un praticien du bien-être a besoin.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/sign-up"
            className="bg-sage text-white rounded-xl px-8 py-3.5 text-base font-medium min-h-[52px] inline-flex items-center hover:bg-sage-600 transition-all hover:shadow-lg hover:shadow-sage/20 hover:-translate-y-0.5"
          >
            Commencer gratuitement →
          </Link>
          <a
            href="#features"
            className="border border-sage/30 text-sage bg-transparent rounded-xl px-8 py-3.5 text-base font-medium min-h-[52px] inline-flex items-center hover:bg-sage/5 transition-colors"
          >
            Voir la démonstration
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-5 text-sm text-muted-foreground"
        >
          Déjà utilisé par des naturopathes, sophrologues et hypnothérapeutes
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-16 mx-auto max-w-3xl pointer-events-none"
          aria-hidden="true"
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-ink/5 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
              <div className="h-3 w-3 rounded-full bg-destructive/40" />
              <div className="h-3 w-3 rounded-full bg-terracotta/40" />
              <div className="h-3 w-3 rounded-full bg-sage/40" />
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-sage/10 border border-sage/20 p-4 space-y-3">
                <p className="text-xs font-medium text-sage">Protocoles IA</p>
                <p className="font-fraunces text-2xl font-semibold text-sage">
                  3 générés
                </p>
                <p className="text-xs text-muted-foreground">ce mois</p>
                <div className="h-1.5 rounded-full bg-sage/20">
                  <div className="h-1.5 rounded-full bg-sage w-3/5" />
                </div>
              </div>

              <div className="rounded-xl bg-card border border-border shadow-sm p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Prochain RDV</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-terracotta" />
                  <p className="text-sm font-medium text-ink">Marie D.</p>
                </div>
                <p className="text-xs text-muted-foreground">Séance demain à 14h</p>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <div
                      key={d}
                      className={`h-5 w-5 rounded text-xs flex items-center justify-center font-medium ${d === 3 ? "bg-terracotta text-white" : "bg-muted/50 text-muted-foreground"}`}
                    >
                      {d + 11}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-terracotta/10 border border-terracotta/20 p-4 space-y-3">
                <p className="text-xs font-medium text-terracotta">Facturation</p>
                <p className="font-fraunces text-2xl font-semibold text-ink">180 €</p>
                <p className="text-xs text-muted-foreground">Facture #047</p>
                <span className="inline-flex items-center rounded-full bg-sage/15 px-2 py-0.5 text-xs font-medium text-sage">
                  Payée
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
