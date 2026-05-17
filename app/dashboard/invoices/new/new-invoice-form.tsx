"use client";
import { useState, useTransition } from "react";
import { createInvoice } from "@/server/actions/invoices";
import type { Database } from "@/types/supabase";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default function NewInvoiceForm({
  companies,
  clients,
}: {
  companies: CompanyRow[];
  clients: ClientRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [recipientType, setRecipientType] = useState<"client" | "company">("client");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (recipientType === "client") formData.delete("company_id");
    else formData.delete("client_id");
    setError(null);
    startTransition(async () => {
      const result = await createInvoice(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">
          Nouvelle facture
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Créez une facture pour un client ou une entreprise
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Destinataire</h2>
          <div className="flex gap-2">
            {(["client", "company"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRecipientType(t)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${recipientType === t ? "bg-sage text-white" : "border border-input bg-background hover:bg-muted"}`}
              >
                {t === "client" ? "Client particulier" : "Entreprise"}
              </button>
            ))}
          </div>
          {recipientType === "client" ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Client
              </label>
              <select
                name="client_id"
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              >
                <option value="">— Sélectionner —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Entreprise
              </label>
              <select
                name="company_id"
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              >
                <option value="">— Sélectionner —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Détails</h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Séances de naturopathie — mars 2026"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Montant HT (€) <span className="text-red-500">*</span>
              </label>
              <input
                name="amount"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="150.00"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                TVA
              </label>
              <select
                name="vat"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              >
                <option value="0">0 % (exonéré)</option>
                <option value="10">10 %</option>
                <option value="20">20 %</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Création…" : "Créer la facture"}
          </button>
          <a
            href="/dashboard/invoices"
            className="rounded-lg border border-input bg-background px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}
