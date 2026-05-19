"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { saveAnamnese } from "@/server/actions/anamnese";

type StepKey =
  | "motif_consultation"
  | "antecedents_medicaux"
  | "traitements_en_cours"
  | "allergies"
  | "sommeil"
  | "alimentation"
  | "activite_physique"
  | "stress"
  | "objectifs"
  | "notes_praticien";

const STEPS: {
  title: string;
  label: string;
  fields: { key: StepKey; label: string; placeholder?: string }[];
}[] = [
  {
    title: "Motif & antécédents",
    label: "Consultation",
    fields: [
      {
        key: "motif_consultation",
        label: "Motif de consultation",
        placeholder: "Décrivez le motif principal de la consultation…",
      },
      {
        key: "antecedents_medicaux",
        label: "Antécédents médicaux",
        placeholder: "Maladies, opérations, hospitalisations…",
      },
      {
        key: "traitements_en_cours",
        label: "Traitements en cours",
        placeholder: "Médicaments, suppléments, thérapies…",
      },
      {
        key: "allergies",
        label: "Allergies",
        placeholder: "Allergies alimentaires, médicamenteuses, environnementales…",
      },
    ],
  },
  {
    title: "Hygiène de vie",
    label: "Hygiène de vie",
    fields: [
      {
        key: "sommeil",
        label: "Sommeil",
        placeholder: "Qualité, durée, troubles éventuels…",
      },
      {
        key: "alimentation",
        label: "Alimentation",
        placeholder: "Régime, habitudes alimentaires, restrictions…",
      },
      {
        key: "activite_physique",
        label: "Activité physique",
        placeholder: "Type d'activité, fréquence, intensité…",
      },
      {
        key: "stress",
        label: "Stress",
        placeholder: "Sources de stress, gestion émotionnelle…",
      },
    ],
  },
  {
    title: "Objectifs & notes",
    label: "Objectifs",
    fields: [
      {
        key: "objectifs",
        label: "Objectifs",
        placeholder: "Qu'espère atteindre le client à l'issue du suivi ?",
      },
      {
        key: "notes_praticien",
        label: "Notes praticien",
        placeholder: "Observations personnelles, points d'attention…",
      },
    ],
  },
];

export default function AnamesePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<StepKey, string>>({
    motif_consultation: "",
    antecedents_medicaux: "",
    traitements_en_cours: "",
    allergies: "",
    sommeil: "",
    alimentation: "",
    activite_physique: "",
    stress: "",
    objectifs: "",
    notes_praticien: "",
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(key: StepKey, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }

  function handleFinish() {
    setError(null);
    startTransition(async () => {
      const result = await saveAnamnese(params.id, data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-2xl bg-card border border-border p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center mx-auto">
            <Check className="w-7 h-7 text-sage" />
          </div>
          <h2 className="font-fraunces text-2xl font-semibold text-ink">
            Anamnèse enregistrée
          </h2>
          <p className="text-sm text-muted-foreground">
            Les données ont été chiffrées et enregistrées en toute sécurité.
          </p>
          <button
            onClick={() => router.push(`/dashboard/clients/${params.id}`)}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background min-h-[44px] px-6 text-sm font-medium hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour au client
          </button>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/dashboard/clients/${params.id}`)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour au client
        </button>
        <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">Anamnèse</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                  i < step
                    ? "bg-sage/20 text-sage"
                    : i === step
                      ? "bg-sage text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block whitespace-nowrap ${
                  i === step ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 mb-5 sm:mb-0 transition-colors ${
                  i < step ? "bg-sage" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step card */}
      <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
        <h2 className="text-base font-semibold text-foreground">
          Étape {step + 1} — {currentStep.title}
        </h2>
        {currentStep.fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label
              htmlFor={field.key}
              className="block text-sm font-medium text-foreground"
            >
              {field.label}
            </label>
            <textarea
              id={field.key}
              value={data[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder ?? `${field.label}…`}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none min-h-[100px]"
            />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background min-h-[44px] px-6 text-sm font-medium hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>
        ) : (
          <div />
        )}

        <div className="text-xs text-muted-foreground">
          {step + 1} / {STEPS.length}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-sage text-white min-h-[44px] px-6 text-sm font-medium hover:bg-sage/90 transition-colors"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-sage text-white min-h-[44px] px-6 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Enregistrement…" : "Enregistrer l'anamnèse"}
          </button>
        )}
      </div>
    </div>
  );
}
