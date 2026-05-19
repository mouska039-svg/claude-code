"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createCompany } from "@/server/actions/companies";

export default function NewCompanyPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createCompany(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/companies"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
      >
        <ChevronLeft className="w-4 h-4" />
        Entreprises
      </Link>

      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">
          Nouvelle entreprise
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Renseignez les informations de l&apos;entreprise
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
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Nom de l&apos;entreprise <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              placeholder="Acme SAS"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contact_name"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Nom du contact
              </label>
              <input
                id="contact_name"
                name="contact_name"
                placeholder="Julie Martin"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
              />
            </div>
            <div>
              <label
                htmlFor="contact_email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email du contact
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                placeholder="julie@acme.fr"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="siret"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                SIRET
              </label>
              <input
                id="siret"
                name="siret"
                placeholder="123 456 789 00012"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
              />
            </div>
            <div>
              <label
                htmlFor="sector"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Secteur
              </label>
              <input
                id="sector"
                name="sector"
                placeholder="Technologie, Santé…"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="employee_count"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Nombre d&apos;employés
            </label>
            <input
              id="employee_count"
              name="employee_count"
              type="number"
              min="1"
              placeholder="50"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Création…" : "Créer ll'entrepriseapos;entreprise"}
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
