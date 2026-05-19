"use client";

import { useTransition, useState, useId } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/server/actions/clients";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function NewClientPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const fullNameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const birthDateId = useId();
  const primaryConcernId = useId();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setFieldErrors({});

    // Basic client-side validation
    const newErrors: Record<string, string> = {};
    const fullName = (formData.get("full_name") as string | null) ?? "";
    if (!fullName || fullName.trim().length < 2) {
      newErrors.full_name = "Le nom complet est requis (2 caractères minimum).";
    }
    const email = (formData.get("email") as string | null) ?? "";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Adresse e-mail invalide.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    startTransition(async () => {
      const result = await createClient(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] py-2"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Clients
        </Link>
        <span className="text-muted-foreground/50" aria-hidden="true">
          /
        </span>
        <span className="text-foreground font-medium">Nouveau client</span>
      </nav>

      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">Nouveau client</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Renseignez les informations du client
        </p>
      </div>

      {/* Global error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            Informations générales
          </h2>

          {/* Full name */}
          <div>
            <label
              htmlFor={fullNameId}
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Nom complet{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(requis)</span>
            </label>
            <input
              id={fullNameId}
              name="full_name"
              required
              minLength={2}
              aria-required="true"
              aria-describedby={fieldErrors.full_name ? `${fullNameId}-error` : undefined}
              aria-invalid={!!fieldErrors.full_name}
              placeholder="Marie Dupont"
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 ${
                fieldErrors.full_name ? "border-red-400" : "border-input"
              }`}
            />
            {fieldErrors.full_name && (
              <p
                id={`${fullNameId}-error`}
                role="alert"
                className="mt-1.5 text-xs text-red-600"
              >
                {fieldErrors.full_name}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Email */}
            <div>
              <label
                htmlFor={emailId}
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
                aria-invalid={!!fieldErrors.email}
                placeholder="marie@exemple.fr"
                className={`w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 ${
                  fieldErrors.email ? "border-red-400" : "border-input"
                }`}
              />
              {fieldErrors.email && (
                <p
                  id={`${emailId}-error`}
                  role="alert"
                  className="mt-1.5 text-xs text-red-600"
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor={phoneId}
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Téléphone
              </label>
              <input
                id={phoneId}
                name="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
          </div>

          {/* Birth date */}
          <div>
            <label
              htmlFor={birthDateId}
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Date de naissance
            </label>
            <input
              id={birthDateId}
              name="birth_date"
              type="date"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>

          {/* Primary concern */}
          <div>
            <label
              htmlFor={primaryConcernId}
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Motif principal
            </label>
            <textarea
              id={primaryConcernId}
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
            className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-lg bg-sage text-white px-5 py-2.5 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                Enregistrement…
              </>
            ) : (
              "Créer le client"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center min-h-[44px] rounded-lg border border-input bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
