"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { createSession } from "@/server/actions/sessions";
import type { Database } from "@/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

const SESSION_CATEGORIES = [
  { value: "suivi", label: "Suivi" },
  { value: "bilan_initial", label: "Bilan initial" },
  { value: "urgence", label: "Urgence" },
  { value: "atelier", label: "Atelier" },
] as const;

type SessionCategory = (typeof SESSION_CATEGORIES)[number]["value"];

const DURATION_PRESETS = [30, 45, 60, 90] as const;

export function NewSessionForm({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<SessionCategory>("suivi");
  const [duration, setDuration] = useState<number>(60);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    // Prepend category label to notes for context
    const rawNotes = (formData.get("notes_practitioner") as string) ?? "";
    const categoryLabel =
      SESSION_CATEGORIES.find((c) => c.value === category)?.label ?? "";
    const notesWithCategory = rawNotes
      ? `[${categoryLabel}] ${rawNotes}`
      : `[${categoryLabel}]`;
    formData.set("notes_practitioner", notesWithCategory);

    startTransition(async () => {
      const result = await createSession(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/sessions")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" />
          Séances
        </button>
        <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
          Nouvelle séance
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-card border border-border p-6 space-y-5"
      >
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Client selector */}
        <div className="space-y-1.5">
          <label
            htmlFor="client_id"
            className="block text-sm font-medium text-foreground"
          >
            Client <span className="text-destructive">*</span>
          </label>
          <select
            id="client_id"
            name="client_id"
            required
            className="w-full h-12 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
          >
            <option value="">Sélectionner un client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Date & time */}
        <div className="space-y-1.5">
          <label htmlFor="date" className="block text-sm font-medium text-foreground">
            Date et heure <span className="text-destructive">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            required
            className="w-full h-12 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
          />
        </div>

        {/* Session type — visual toggles */}
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Type de séance <span className="text-destructive">*</span>
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SESSION_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                  category === cat.value
                    ? "bg-sage text-white"
                    : "border border-input bg-background hover:bg-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Hidden field for DB compatibility */}
          <input type="hidden" name="type" value="presentiel" />
        </div>

        {/* Duration presets */}
        <div className="space-y-1.5">
          <label
            htmlFor="duration_min"
            className="block text-sm font-medium text-foreground"
          >
            Durée
          </label>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`min-h-[44px] px-3 rounded-lg text-sm font-medium transition-colors ${
                    duration === d
                      ? "bg-sage text-white"
                      : "border border-input bg-background hover:bg-muted"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">min</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              id="duration_min"
              name="duration_min"
              type="number"
              min="1"
              max="480"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-24 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label
            htmlFor="notes_practitioner"
            className="block text-sm font-medium text-foreground"
          >
            Notes (praticien)
          </label>
          <textarea
            id="notes_practitioner"
            name="notes_practitioner"
            placeholder="Notes privées sur la séance…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none min-h-[80px]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.push("/dashboard/sessions")}
            className="flex-1 rounded-lg border border-input bg-background min-h-[44px] px-4 text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-sage min-h-[44px] px-4 text-sm font-medium text-white hover:bg-sage/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Enregistrement…" : "Créer la séance"}
          </button>
        </div>
      </form>
    </div>
  );
}
