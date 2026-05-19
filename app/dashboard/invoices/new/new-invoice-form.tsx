"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createInvoice } from "@/server/actions/invoices";
import type { Database } from "@/types/supabase";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

const VAT_OPTIONS = [
  { value: 0, label: "0 %", sublabel: "exonéré" },
  { value: 10, label: "10 %" },
  { value: 20, label: "20 %" },
] as const;

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
  const [amountHt, setAmountHt] = useState<string>("");
  const [vatRate, setVatRate] = useState<number>(0);

  const amountHtNum = parseFloat(amountHt) || 0;
  const amountTtc = amountHtNum * (1 + vatRate / 100);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (recipientType === "client") formData.delete("company_id");
    else formData.delete("client_id");
    // Ensure vat value from state is set
    formData.set("vat", String(vatRate));
    setError(null);
    startTransition(async () => {
      const result = await createInvoice(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
      >
        <ChevronLeft className="w-4 h-4" />
        Facturation
      </Link>

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
        {/* Recipient section */}
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Destinataire</h2>
          <div className="flex gap-2" role="group" aria-label="Type de destinataire">
            {(["client", "company"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRecipientType(t)}
                aria-pressed={recipientType === t}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${recipientType === t ? "bg-sage text-white" : "border border-input bg-background hover:bg-muted"}`}
              >
                {t === "client" ? "Client particulier" : "Entreprise"}
              </button>
            ))}
          </div>
          {recipientType === "client" ? (
            <div>
              <label
                htmlFor="client_id"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="client_id"
                name="client_id"
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
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
              <label
                htmlFor="company_id"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Entreprise <span className="text-red-500">*</span>
              </label>
              <select
                id="company_id"
                name="company_id"
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
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

        {/* Details section */}
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Détails</h2>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              placeholder="Séances de naturopathie — mars 2026"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Montant HT (€) <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="150.00"
              value={amountHt}
              onChange={(e) => setAmountHt(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-foreground mb-2">TVA</p>
            {/* Hidden input to carry the value */}
            <input type="hidden" name="vat" value={vatRate} />
            <div className="flex gap-2" role="group" aria-label="Taux de TVA">
              {VAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVatRate(opt.value)}
                  aria-pressed={vatRate === opt.value}
                  className={`flex flex-col items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors min-h-[44px] min-w-[64px] ${vatRate === opt.value ? "bg-sage text-white" : "border border-input bg-background hover:bg-muted"}`}
                >
                  <span>{opt.label}</span>
                  {"sublabel" in opt && (
                    <span className="text-[10px] font-normal opacity-70">
                      {opt.sublabel}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time TTC display */}
          <div className="rounded-lg bg-muted/60 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total TTC</span>
            <span className="font-mono text-base font-semibold text-foreground tabular-nums">
              {amountTtc.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-sage text-white px-5 min-h-[44px] text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Création en cours…
              </>
            ) : (
              "Créer la facture"
            )}
          </button>
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center rounded-lg border border-input bg-background px-5 min-h-[44px] text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
