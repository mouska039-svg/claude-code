"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { generateProtocol } from "@/server/actions/protocols";
import type { Database } from "@/types/supabase";

type ProtocolRow = Database["public"]["Tables"]["protocols"]["Row"];

type GeneratedOutput = {
  title: string;
  summary: string;
  duration_weeks: number;
  steps: { week: string; recommendations: string[] }[];
  lifestyle: {
    nutrition: string[];
    sleep: string[];
    movement: string[];
    stress: string[];
  };
  contraindications: string[];
  disclaimer: string;
};

const SPECIALTY_OPTIONS: {
  value: "naturopathe" | "sophrologue" | "hypnotherapeute";
  label: string;
}[] = [
  { value: "naturopathe", label: "Naturopathe" },
  { value: "sophrologue", label: "Sophrologue" },
  { value: "hypnotherapeute", label: "Hypnothérapeute" },
];

type SpecialtyChip = {
  label: string;
  starter: string;
};

const SPECIALTY_CHIPS: Record<
  "naturopathe" | "sophrologue" | "hypnotherapeute",
  SpecialtyChip[]
> = {
  naturopathe: [
    {
      label: "Fatigue chronique",
      starter:
        "Client présentant une fatigue chronique persistante depuis plusieurs mois, avec des difficultés à récupérer malgré un sommeil suffisant. Alimentation déséquilibrée, sédentarité, et stress professionnel importants.",
    },
    {
      label: "Digestion difficile",
      starter:
        "Client souffrant de troubles digestifs récurrents : ballonnements, inconfort post-prandial et transit irrégulier depuis plus d'un an. Alimentation rapide, peu de fibres, et consommation régulière d'aliments transformés.",
    },
    {
      label: "Troubles du sommeil",
      starter:
        "Client présentant des difficultés d'endormissement et des réveils nocturnes fréquents depuis plusieurs semaines, avec une fatigue matinale persistante. Exposition tardive aux écrans et horaires de coucher irréguliers.",
    },
    {
      label: "Immunité basse",
      starter:
        "Client présentant des infections à répétition (rhumes, angines) sur les derniers mois, signe d'une immunité fragilisée. Terrain de stress chronique, alimentation pauvre en micronutriments et manque de sommeil réparateur.",
    },
  ],
  sophrologue: [
    {
      label: "Stress professionnel",
      starter:
        "Client en situation de stress professionnel intense, avec des tensions physiques, des difficultés de concentration et un sentiment de surcharge mentale chronique. Recherche des outils concrets pour retrouver un équilibre au quotidien.",
    },
    {
      label: "Anxiété",
      starter:
        "Client présentant une anxiété généralisée avec manifestations somatiques : palpitations, tension musculaire et ruminations fréquentes. Souhaite développer des ressources intérieures pour calmer les pensées envahissantes.",
    },
    {
      label: "Troubles du sommeil",
      starter:
        "Client présentant des difficultés d'endormissement et des réveils nocturnes fréquents depuis plusieurs semaines, avec une fatigue matinale persistante. Cherche des techniques de relaxation et de lâcher-prise avant le coucher.",
    },
    {
      label: "Préparation mentale",
      starter:
        "Client souhaitant renforcer sa confiance et sa concentration en vue d'un événement important (examen, compétition, entretien professionnel). Travail sur la visualisation positive et la gestion du trac.",
    },
  ],
  hypnotherapeute: [
    {
      label: "Confiance en soi",
      starter:
        "Client présentant un manque de confiance en soi impactant ses relations professionnelles et personnelles, avec des croyances limitantes ancrées depuis l'enfance. Souhaite reprogrammer ses schémas intérieurs pour agir avec plus d'assurance.",
    },
    {
      label: "Sevrage tabagique",
      starter:
        "Client fumeur depuis plusieurs années, motivé pour arrêter définitivement le tabac sans substitut nicotinique. Souhaite travailler sur les déclencheurs émotionnels et les habitudes associées à la cigarette.",
    },
    {
      label: "Gestion des peurs",
      starter:
        "Client présentant une peur spécifique (phobie, peur de l'échec, peur du jugement) qui limite son quotidien de façon significative. Cherche à désensibiliser cette peur et à la remplacer par une réponse émotionnelle plus adaptée.",
    },
    {
      label: "Prise de décision",
      starter:
        "Client présentant des difficultés récurrentes à prendre des décisions importantes, paralysé par le doute et la peur des conséquences. Souhaite accéder à ses ressources intérieures pour choisir avec clarté et sérénité.",
    },
  ],
};

const RGPD_DISCLAIMER =
  "Ces recommandations sont des conseils en hygiène de vie rédigés avec l'assistance de Naya et ne constituent pas un avis médical. Elles ne remplacent pas une consultation médicale. Consultez votre médecin avant toute modification de traitement ou de prise en charge.";

export default function NewProtocolPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [specialty, setSpecialty] = useState<
    "naturopathe" | "sophrologue" | "hypnotherapeute"
  >("naturopathe");
  const [context, setContext] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProtocolRow | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!context.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await generateProtocol(params.id, specialty, context);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setResult(res.data);
      }
    });
  }

  if (result) {
    const output = result.output as GeneratedOutput | null;
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane">
          <Link
            href={`/dashboard/clients/${params.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] py-2"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Retour au client
          </Link>
        </nav>

        {/* Title */}
        <div>
          <h1 className="font-fraunces text-xl font-semibold text-ink">{result.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Protocole généré · {output?.duration_weeks ?? "?"} semaine
            {(output?.duration_weeks ?? 0) > 1 ? "s" : ""}
          </p>
        </div>

        {/* RGPD disclaimer — amber box at top */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3">
          <p className="font-medium mb-0.5">Avertissement RGPD &amp; médical</p>
          <p>{RGPD_DISCLAIMER}</p>
        </div>

        {output?.summary && (
          <div className="rounded-xl bg-card border border-border p-6">
            <h2 className="text-base font-semibold text-foreground mb-2">Résumé</h2>
            <p className="text-sm text-foreground">{output.summary}</p>
          </div>
        )}

        {output?.steps && output.steps.length > 0 && (
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              Étapes du protocole
            </h2>
            <div className="space-y-4">
              {output.steps.map((s, i) => (
                <div key={i} className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{s.week}</h3>
                  <ul className="space-y-1">
                    {s.recommendations.map((r, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sage" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {output?.lifestyle && (
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Hygiène de vie</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Nutrition", items: output.lifestyle.nutrition },
                { label: "Sommeil", items: output.lifestyle.sleep },
                { label: "Mouvement", items: output.lifestyle.movement },
                { label: "Stress", items: output.lifestyle.stress },
              ].map(({ label, items }) =>
                items && items.length > 0 ? (
                  <div key={label}>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      {label}
                    </h3>
                    <ul className="space-y-1">
                      {items.map((item, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-terracotta" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {output?.contraindications && output.contraindications.length > 0 && (
          <div className="rounded-xl bg-card border border-border p-6 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              Contre-indications
            </h2>
            <ul className="space-y-1">
              {output.contraindications.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/clients/${params.id}`)}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 transition-colors min-h-[44px]"
          >
            Voir le client
          </button>
          <button
            onClick={() => setResult(null)}
            className="rounded-lg border border-input bg-card px-5 py-2 text-sm font-medium hover:bg-muted transition-colors min-h-[44px]"
          >
            Générer un autre
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane">
        <Link
          href={`/dashboard/clients/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] py-2"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Retour au client
        </Link>
      </nav>

      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">
          Générer un protocole
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Naya vous aide à structurer des recommandations d&apos;hygiène de vie
          personnalisées.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl bg-card border border-border p-6 space-y-5">
          {/* Specialty toggle buttons */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Spécialité
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SPECIALTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSpecialty(opt.value)}
                  className={`rounded-lg border px-3 text-sm font-medium transition-colors min-h-[44px] ${
                    specialty === opt.value
                      ? "bg-sage text-white border-sage"
                      : "border-input bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions rapides */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Suggestions rapides
            </p>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_CHIPS[specialty].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setContext(chip.starter)}
                  className="rounded-full bg-sage/8 text-sage text-xs font-medium px-3 py-1.5 hover:bg-sage/15 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Context textarea */}
          <div>
            <label
              htmlFor="context"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Contexte de la consultation{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              id="context"
              rows={6}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              required
              placeholder="Décrivez les objectifs du client, ses habitudes de vie, ses contraintes…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Plus le contexte est précis, plus le protocole sera pertinent.
            </p>
          </div>
        </div>

        {/* RGPD disclaimer — amber box */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3">
          <p className="font-medium mb-0.5">Information importante</p>
          <p>{RGPD_DISCLAIMER}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending || !context.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                Génération en cours…
              </>
            ) : (
              "Générer avec Naya ✦"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/clients/${params.id}`)}
            className="rounded-lg border border-input bg-card px-5 py-2 text-sm font-medium hover:bg-muted transition-colors min-h-[44px]"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
