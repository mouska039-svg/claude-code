"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sophie M.",
    role: "Naturopathe",
    location: "Lyon",
    content:
      "Naya a transformé ma façon de travailler. Je génère des protocoles en 5 minutes au lieu de 2 heures. Mes clients adorent le portail mobile, ils se sentent vraiment suivis entre les séances.",
    initials: "SM",
    color: "sage",
  },
  {
    name: "Marc T.",
    role: "Sophrologue",
    location: "Paris",
    content:
      "Le module entreprises m'a permis de décrocher mon premier contrat QVCT avec une PME de 200 personnes. La proposition commerciale créée avec Naya était bluffante et très professionnelle.",
    initials: "MT",
    color: "terracotta",
  },
  {
    name: "Isabelle R.",
    role: "Hypnothérapeute",
    location: "Bordeaux",
    content:
      "Mes clients réécoutent les audios entre les séances. Les résultats sont bien meilleurs et le journal d'humeur me permet de suivre leur progression avec une précision que je n'avais pas avant.",
    initials: "IR",
    color: "sage",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-sage uppercase tracking-widest mb-3"
          >
            Témoignages
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-fraunces text-4xl sm:text-5xl font-semibold text-ink"
          >
            Ce qu&apos;ils en disent
          </motion.h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl bg-card border border-border p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="h-8 w-8 text-sage/30 mb-4" />
              <p className="text-ink/70 leading-relaxed mb-6 text-sm">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                    t.color === "sage" ? "bg-sage" : "bg-terracotta"
                  }`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-medium text-ink text-sm">{t.name}</p>
                  <p className="text-xs text-mist">
                    {t.role} • {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
