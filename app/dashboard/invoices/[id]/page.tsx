import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Printer } from "lucide-react";
import type { Database } from "@/types/supabase";
import { InvoiceStatusActions } from "./invoice-status-actions";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const statusLabels: Record<InvoiceRow["status"], string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

const statusColors: Record<InvoiceRow["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-sage/10 text-sage",
  overdue: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
};

function formatEur(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function getInvoiceNumber(invoice: InvoiceRow) {
  const year = new Date(invoice.created_at).getFullYear();
  return `FAC-${year}-${invoice.id.slice(0, 8).toUpperCase()}`;
}

interface ItemRow {
  description?: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: invoiceData } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!invoiceData) notFound();
  const invoice = invoiceData as InvoiceRow;

  const [{ data: profileData }, { data: clientData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    invoice.client_id
      ? supabase.from("clients").select("*").eq("id", invoice.client_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const profile = profileData as ProfileRow | null;
  const client = clientData as ClientRow | null;

  const invoiceNumber = getInvoiceNumber(invoice);
  const amountVat = (invoice.amount * invoice.vat) / 100;
  const amountTtc = invoice.amount + amountVat;

  const items = (Array.isArray(invoice.items) ? invoice.items : []) as ItemRow[];
  const hasLineItems = items.length > 0 && items[0]?.quantity !== undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] py-2"
        >
          <ChevronLeft size={14} />
          Factures
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium text-foreground font-mono">{invoiceNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="font-fraunces text-2xl font-semibold text-ink">
            {invoiceNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Créée le{" "}
            {new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(invoice.created_at))}
          </p>
          {invoice.paid_at && (
            <p className="text-sm text-sage">
              Payée le{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(invoice.paid_at))}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[invoice.status]}`}
          >
            {statusLabels[invoice.status]}
          </span>
          <Link
            href={`/invoice-print/${invoice.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors min-h-[44px]"
          >
            <Printer size={15} />
            Imprimer / PDF
          </Link>
        </div>
      </div>

      {/* Invoice card */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-6">
        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Émetteur
            </p>
            <p className="font-medium text-foreground">
              {profile?.brand_name ?? profile?.full_name ?? "—"}
            </p>
            {profile?.siret && (
              <p className="text-sm text-muted-foreground">SIRET {profile.siret}</p>
            )}
            {profile?.specialty && (
              <p className="text-sm text-muted-foreground capitalize">
                {profile.specialty}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Destinataire
            </p>
            {client ? (
              <>
                <p className="font-medium text-foreground">{client.full_name}</p>
                {client.email && (
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                )}
                {client.phone && (
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
        </div>

        <hr className="border-border" />

        {/* Items */}
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Prestation
                </th>
                {hasLineItems && (
                  <>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Qté
                    </th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      PU HT
                    </th>
                  </>
                )}
                <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Total HT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.length > 0 ? (
                items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 text-foreground">{item.description ?? "—"}</td>
                    {hasLineItems && (
                      <>
                        <td className="py-3 text-right tabular-nums text-muted-foreground">
                          {item.quantity ?? 1}
                        </td>
                        <td className="py-3 text-right tabular-nums text-muted-foreground">
                          {item.unit_price !== undefined
                            ? formatEur(item.unit_price)
                            : "—"}
                        </td>
                      </>
                    )}
                    <td className="py-3 text-right tabular-nums font-medium text-foreground">
                      {item.total !== undefined
                        ? formatEur(item.total)
                        : formatEur(invoice.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="py-3 text-muted-foreground"
                    colSpan={hasLineItems ? 4 : 2}
                  >
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto w-full sm:w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total HT</span>
            <span className="tabular-nums font-medium">{formatEur(invoice.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TVA ({invoice.vat} %)</span>
            <span className="tabular-nums font-medium">{formatEur(amountVat)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t border-border pt-2">
            <span>Total TTC</span>
            <span className="tabular-nums">{formatEur(amountTtc)}</span>
          </div>
        </div>
      </div>

      {/* Status actions */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Mettre à jour le statut</h2>
        <InvoiceStatusActions invoiceId={invoice.id} status={invoice.status} />
      </div>
    </div>
  );
}
