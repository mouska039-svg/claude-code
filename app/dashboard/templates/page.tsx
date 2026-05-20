"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PROTOCOL_TEMPLATES,
  type ProtocolTemplate,
  type TemplateSpecialty,
  type TemplateTheme,
} from "@/lib/protocol-templates";

// ─── Theme metadata ──────────────────────────────────────────────────────────

const THEME_EMOJI: Record<TemplateTheme, string> = {
  fatigue: "🌿",
  digestion: "🫁",
  stress: "🧘",
  sommeil: "🌙",
  poids: "⚖️",
  immunite: "🛡️",
  hormones: "🌸",
  detox: "✨",
  douleurs: "💆",
  anxiete: "🌊",
  confiance: "⭐",
  tabac: "🚭",
};

const THEME_LABEL: Record<TemplateTheme, string> = {
  fatigue: "Fatigue",
  digestion: "Digestion",
  stress: "Stress",
  sommeil: "Sommeil",
  poids: "Poids",
  immunite: "Immunité",
  hormones: "Hormones",
  detox: "Détox",
  douleurs: "Douleurs",
  anxiete: "Anxiété",
  confiance: "Confiance",
  tabac: "Tabac",
};

// ─── Specialty metadata ───────────────────────────────────────────────────────

type FilterSpecialty = TemplateSpecialty | "all";

interface SpecialtyOption {
  value: FilterSpecialty;
  label: string;
}

const SPECIALTY_OPTIONS: SpecialtyOption[] = [
  { value: "all", label: "Tous" },
  { value: "naturopathe", label: "Naturopathe" },
  { value: "sophrologue", label: "Sophrologue" },
  { value: "hypnotherapeute", label: "Hypnothérapeute" },
];

const SPECIALTY_LABEL: Record<TemplateSpecialty, string> = {
  naturopathe: "Naturopathe",
  sophrologue: "Sophrologue",
  hypnotherapeute: "Hypnothérapeute",
  all: "Tous",
};

const SPECIALTY_BADGE_CLASS: Record<TemplateSpecialty, string> = {
  naturopathe: "bg-sage/10 text-sage border border-sage/20",
  sophrologue: "bg-terracotta/10 text-terracotta border border-terracotta/20",
  hypnotherapeute: "bg-ink/8 text-ink border border-ink/15",
  all: "",
};

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ template }: { template: ProtocolTemplate }) {
  const emoji = THEME_EMOJI[template.theme];
  const themeLabel = THEME_LABEL[template.theme];
  const specialtyLabel = SPECIALTY_LABEL[template.specialty];
  const badgeClass = SPECIALTY_BADGE_CLASS[template.specialty];

  return (
    <article className="flex flex-col bg-white rounded-2xl border border-cream shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Card header */}
      <div className="bg-cream px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          {/* Theme icon */}
          <span
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm text-2xl shrink-0"
            aria-label={themeLabel}
          >
            {emoji}
          </span>

          {/* Specialty badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}
          >
            {specialtyLabel}
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-3 font-fraunces text-ink font-semibold text-base leading-snug">
          {template.title}
        </h2>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 px-5 py-4 gap-3">
        {/* Summary */}
        <p className="text-mist text-sm leading-relaxed flex-1">{template.summary}</p>

        {/* Meta row */}
        <div className="flex items-center gap-2 text-xs text-mist">
          <span className="inline-flex items-center gap-1">
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="opacity-60"
            >
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M8 5v3.5l2 1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {template.duration_hint} semaines
          </span>
          <span className="text-cream select-none">·</span>
          <span>{themeLabel}</span>
        </div>

        {/* CTA */}
        <Link
          href={`/dashboard/clients?template=${template.id}`}
          className="mt-1 flex items-center justify-center gap-2 min-h-[44px] w-full rounded-xl bg-sage text-white text-sm font-medium px-4 hover:bg-sage/90 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
        >
          Utiliser ce modèle
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3.5 8h9M8.5 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}

// ─── Filter pills ─────────────────────────────────────────────────────────────

interface FilterPillsProps {
  active: FilterSpecialty;
  onChange: (value: FilterSpecialty) => void;
  counts: Record<FilterSpecialty, number>;
}

function FilterPills({ active, onChange, counts }: FilterPillsProps) {
  return (
    <div
      role="group"
      aria-label="Filtrer par spécialité"
      className="flex flex-wrap gap-2"
    >
      {SPECIALTY_OPTIONS.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={[
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium min-h-[44px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2",
              isActive
                ? "bg-sage text-white shadow-sm"
                : "bg-white text-mist border border-cream hover:border-sage/40 hover:text-ink",
            ].join(" ")}
          >
            {label}
            <span
              className={[
                "inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold",
                isActive ? "bg-white/20 text-white" : "bg-cream text-mist",
              ].join(" ")}
            >
              {counts[value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4" aria-hidden="true">
        📋
      </span>
      <p className="font-fraunces text-ink text-lg font-semibold">Aucun modèle trouvé</p>
      <p className="text-mist text-sm mt-1">Essayez un autre filtre de spécialité.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterSpecialty>("all");

  const filtered =
    activeFilter === "all"
      ? PROTOCOL_TEMPLATES
      : PROTOCOL_TEMPLATES.filter((t) => t.specialty === activeFilter);

  // Build counts for each pill
  const counts: Record<FilterSpecialty, number> = {
    all: PROTOCOL_TEMPLATES.length,
    naturopathe: PROTOCOL_TEMPLATES.filter((t) => t.specialty === "naturopathe").length,
    sophrologue: PROTOCOL_TEMPLATES.filter((t) => t.specialty === "sophrologue").length,
    hypnotherapeute: PROTOCOL_TEMPLATES.filter((t) => t.specialty === "hypnotherapeute")
      .length,
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="font-fraunces text-ink text-2xl sm:text-3xl font-semibold leading-tight">
            Modèles de contexte
          </h1>
          <p className="mt-2 text-mist text-sm sm:text-base leading-relaxed max-w-xl">
            Démarrez plus vite avec des contextes pré-rédigés pour vos consultations.
          </p>
        </header>

        {/* Filters */}
        <div className="mb-8">
          <FilterPills active={activeFilter} onChange={setActiveFilter} counts={counts} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
