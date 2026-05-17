"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, #5C7A6B18 0%, transparent 50%),
                            radial-gradient(circle at 70% 80%, #D4876B12 0%, transparent 50%)`,
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-sage/5 px-4 py-1.5 text-xs font-medium text-sage mb-8"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Conçu pour naturopathes, sophrologues, hypnothérapeutes
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="font-fraunces text-7xl sm:text-8xl md:text-9xl font-semibold text-ink leading-none mb-2">
            naya
            <span
              className="inline-block w-2 h-2 rounded-full bg-terracotta mb-6 ml-1"
              aria-hidden="true"
            />
          </h1>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-mist font-medium mb-6"
        >
          Le guide digital des praticiens du bien-être
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto max-w-2xl text-xl sm:text-2xl text-ink/70 leading-relaxed mb-10"
        >
          Structurez vos cures, prolongez l&apos;effet de vos séances, développez votre
          activité.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-sage px-7 py-3.5 text-base font-medium text-white hover:bg-sage-600 transition-all hover:shadow-lg hover:shadow-sage/20 hover:-translate-y-0.5"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-base font-medium text-ink hover:bg-accent transition-colors"
          >
            Voir comment ça marche
          </a>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-mist"
        >
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-sage" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            RGPD conforme • Données en Europe
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-sage" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Sans engagement • Annulez à tout moment
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-sage" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Démarrage gratuit • Aucune carte requise
          </span>
        </motion.div>

        {/* Decorative portal preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          className="mt-20 mx-auto max-w-4xl"
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-ink/5 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
              <div className="h-3 w-3 rounded-full bg-destructive/40" />
              <div className="h-3 w-3 rounded-full bg-terracotta/40" />
              <div className="h-3 w-3 rounded-full bg-sage/40" />
            </div>
            <div className="p-6 grid grid-cols-3 gap-4 min-h-[280px]">
              {/* Dashboard preview cards */}
              <div className="col-span-3 sm:col-span-1 space-y-3">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="rounded-xl bg-sage/10 border border-sage/20 p-4 space-y-2">
                  <div className="text-3xl font-fraunces font-semibold text-sage">12</div>
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="rounded-xl bg-terracotta/10 border border-terracotta/20 p-4 space-y-2">
                  <div className="text-3xl font-fraunces font-semibold text-terracotta">
                    5
                  </div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="col-span-3 sm:col-span-2 rounded-xl bg-muted/30 border border-border p-4">
                <div className="h-3 w-28 bg-muted rounded mb-4 animate-pulse" />
                <div className="flex items-end gap-2 h-32">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-sage/20 hover:bg-sage/40 transition-colors"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
