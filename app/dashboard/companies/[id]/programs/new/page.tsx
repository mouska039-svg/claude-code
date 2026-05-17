"use client";

import { useTransition, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createProgram } from "@/server/actions/company-programs";

export default function NewProgramPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams<{ id: string }>();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("company_id", params.id);
    setError(null);
    startTransition(async () => {
      const result = await createProgram(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">
          Nouveau programme
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Créez un programme QVCT pour cette entreprise
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            Détails du programme
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              required
              minLength={2}
              placeholder="Atelier gestion du stress"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Format <span className="text-red-500">*</span>
            </label>
            <select
              name="format"
              required
              defaultValue="workshop"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            >
              <option value="workshop">Atelier</option>
              <option value="individual_session">Séance individuelle</option>
              <option value="subscription">Abonnement</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nombre de séances <span className="text-red-500">*</span>
              </label>
              <input
                name="sessions_count"
                type="number"
                required
                min="1"
                defaultValue="1"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Prix total (€)
              </label>
              <input
                name="price_total"
                type="number"
                min="0"
                step="0.01"
                placeholder="1200.00"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date de début
              </label>
              <input
                name="start_date"
                type="date"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date de fin
              </label>
              <input
                name="end_date"
                type="date"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Création…" : "Créer le programme"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-input bg-card px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
