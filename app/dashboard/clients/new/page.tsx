"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/server/actions/clients";
import { useState } from "react";

export default function NewClientPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createClient(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">Nouveau client</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Renseignez les informations du client
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
            Informations générales
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              name="full_name"
              required
              minLength={2}
              placeholder="Marie Dupont"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="marie@exemple.fr"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Téléphone
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Date de naissance
            </label>
            <input
              name="birth_date"
              type="date"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Motif principal
            </label>
            <textarea
              name="primary_concern"
              rows={3}
              placeholder="Décrivez le motif principal de consultation…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Création…" : "Créer le client"}
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
