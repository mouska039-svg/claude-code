"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-sage px-8 py-16 sm:px-16 text-center"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 50%),
                              radial-gradient(circle at 80% 50%, rgba(212,135,107,0.12) 0%, transparent 50%)`,
          }}
        >
          <h2 className="font-fraunces text-4xl sm:text-5xl font-semibold text-white mb-4">
            Prêt à transformer votre pratique ?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Rejoignez les praticiens du bien-être qui ont choisi Naya pour structurer
            leurs cures et développer leur activité.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-medium text-sage hover:bg-white/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Déjà un compte ? Se connecter →
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-8">
            Aucune carte bancaire requise • Gratuit pour toujours sur le plan Découverte
          </p>
        </motion.div>
      </div>
    </section>
  );
}
