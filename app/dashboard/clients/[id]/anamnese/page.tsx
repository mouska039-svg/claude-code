"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
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
  fields: { key: StepKey; label: string; multiline?: boolean }[];
}[] = [
  {
    title: "Motif & antécédents",
    fields: [
      { key: "motif_consultation", label: "Motif de consultation", multiline: true },
      { key: "antecedents_medicaux", label: "Antécédents médicaux", multiline: true },
      { key: "traitements_en_cours", label: "Traitements en cours", multiline: true },
      { key: "allergies", label: "Allergies", multiline: true },
    ],
  },
  {
    title: "Hygiène de vie",
    fields: [
      { key: "sommeil", label: "Sommeil", multiline: true },
      { key: "alimentation", label: "Alimentation", multiline: true },
      { key: "activite_physique", label: "Activité physique", multiline: true },
      { key: "stress", label: "Stress", multiline: true },
    ],
  },
  {
    title: "Objectifs & notes",
    fields: [
      { key: "objectifs", label: "Objectifs", multiline: true },
      { key: "notes_praticien", label: "Notes praticien", multiline: true },
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
        <div className="rounded-xl bg-card border border-border p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="font-fraunces text-2xl font-semibold text-ink">
            Anamnèse sauvegardée
          </h2>
          <p className="text-sm text-muted-foreground">
            Les données ont été chiffrées et enregistrées en toute sécurité.
          </p>
          <button
            onClick={() => router.push(`/dashboard/clients/${params.id}`)}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 transition-colors"
          >
            Retour au client
          </button>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => router.push(`/dashboard/clients/${params.id}`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour au client
        </button>
        <h1 className="font-fraunces text-3xl font-semibold text-ink mt-2">Anamnèse</h1>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                i < step
                  ? "bg-sage text-white"
                  : i === step
                    ? "bg-sage text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.title}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 ${i < step ? "bg-sage" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-card border border-border p-6 space-y-5">
        <h2 className="text-base font-semibold text-foreground">
          Étape {step + 1} — {currentStep.title}
        </h2>
        {currentStep.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {field.label}
            </label>
            <textarea
              rows={3}
              value={data[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={`${field.label}…`}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className="rounded-lg border border-input bg-card px-5 py-2 text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>
        <div className="text-xs text-muted-foreground">
          {step + 1} / {STEPS.length}
        </div>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 transition-colors"
          >
            Suivant
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={isPending}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Sauvegarde…" : "Terminer"}
          </button>
        )}
      </div>
    </div>
  );
}
