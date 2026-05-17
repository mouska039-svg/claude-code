"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/server/actions/sessions";
import type { Database } from "@/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export function NewSessionForm({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createSession(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour
        </button>
        <h1 className="font-fraunces text-3xl font-semibold text-ink mt-2">
          Nouvelle séance
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-card border border-border p-6 space-y-5"
      >
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="client_id" className="text-sm font-medium text-foreground">
            Client <span className="text-destructive">*</span>
          </label>
          <select
            id="client_id"
            name="client_id"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sélectionner un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="date" className="text-sm font-medium text-foreground">
            Date et heure <span className="text-destructive">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="duration_min" className="text-sm font-medium text-foreground">
              Durée (minutes)
            </label>
            <input
              id="duration_min"
              name="duration_min"
              type="number"
              min="1"
              max="480"
              placeholder="60"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="type" className="text-sm font-medium text-foreground">
              Type <span className="text-destructive">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue="presentiel"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="presentiel">Présentiel</option>
              <option value="visio">Visio</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="notes_practitioner"
            className="text-sm font-medium text-foreground"
          >
            Notes (praticien)
          </label>
          <textarea
            id="notes_practitioner"
            name="notes_practitioner"
            rows={4}
            placeholder="Notes privées sur la séance..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Enregistrement..." : "Créer la séance"}
          </button>
        </div>
      </form>
    </div>
  );
}
