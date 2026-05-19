"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import type { Database } from "@/types/supabase";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

const VAT_OPTIONS = [
  { value: 0, label: "0 %", sublabel: "exonéré" },
  { value: 10, label: "10 %" },
  { value: 20, label: "20 %" },
] as const;

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
}

function formatEur(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

let nextId = 1;

export default function NewInvoiceForm({
  companies,
  clients,
}: {
  companies: CompanyRow[];
  clients: ClientRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [recipientType, setRecipientType] = useState<"client" | "company">("client");
  const [vatRate, setVatRate] = useState<number>(0);
  const [items, setItems] = useState<LineItem[]>([
    { id: nextId++, description: "", quantity: 1, unit_price: 0 },
  ]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: nextId++, description: "", quantity: 1, unit_price: 0 },
    ]);
  }

  function removeItem(id: number) {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function updateItem(id: number, field: keyof Omit<LineItem, "id">, value: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (field === "description") return { ...it, description: value };
        const num = parseFloat(value) || 0;
        return { ...it, [field]: num };
      })
    );
  }

  const totalHt = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
  const totalVat = (totalHt * vatRate) / 100;
  const totalTtc = totalHt + totalVat;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const lineItems = items.map((it) => ({
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      total: parseFloat((it.quantity * it.unit_price).toFixed(2)),
    }));

    formData.set("items_json", JSON.stringify(lineItems));
    formData.set("vat", String(vatRate));

    if (recipientType === "client") formData.delete("company_id");
    else formData.delete("client_id");

    setError(null);
    startTransition(async () => {
      const { createInvoice } = await import("@/server/actions/invoices");
      const result = await createInvoice(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard/invoices");
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
      >
        <ChevronLeft className="w-4 h-4" />
        Factures
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
        {/* Recipient */}
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Destinataire</h2>
          <div className="flex gap-2" role="group">
            {(["client", "company"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRecipientType(t)}
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

        {/* Line items */}
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Prestations</h2>

          <div className="space-y-3">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_64px_100px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Description</span>
              <span className="text-center">Qté</span>
              <span className="text-right">PU HT (€)</span>
              <span />
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_64px_100px_32px] gap-2 items-start"
              >
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  placeholder="Consultation naturopathie"
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                  min="1"
                  step="1"
                  required
                  aria-label="Quantité"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
                />
                <input
                  type="number"
                  value={item.unit_price === 0 ? "" : item.unit_price}
                  onChange={(e) => updateItem(item.id, "unit_price", e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="80.00"
                  required
                  aria-label="Prix unitaire HT"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-sage/50 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  aria-label="Supprimer la ligne"
                  className="flex items-center justify-center h-11 w-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-sm text-sage hover:text-sage/80 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une prestation
          </button>
        </div>

        {/* TVA */}
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">TVA</h2>
          <div className="flex gap-2" role="group">
            {VAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVatRate(opt.value)}
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

          {/* Totals */}
          <div className="rounded-lg bg-muted/60 px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total HT</span>
              <span className="tabular-nums font-medium">{formatEur(totalHt)}</span>
            </div>
            {vatRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA ({vatRate} %)</span>
                <span className="tabular-nums font-medium">{formatEur(totalVat)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold border-t border-border/60 pt-1.5 mt-1.5">
              <span>Total TTC</span>
              <span className="tabular-nums">{formatEur(totalTtc)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-sage text-white px-5 min-h-[44px] text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Création en cours…" : "Créer la facture"}
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
