import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";
import { PrintButton } from "../print-button";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

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

interface AddressJson {
  street?: string;
  postal_code?: string;
  city?: string;
  country?: string;
}

export default async function InvoicePrintPage({
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

  const address = profile?.address_json as AddressJson | null;
  const addressLines = address
    ? [
        address.street,
        [address.postal_code, address.city].filter(Boolean).join(" "),
        address.country,
      ].filter(Boolean)
    : [];

  const invoiceDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(invoice.created_at));

  const dueDate = new Date(invoice.created_at);
  dueDate.setDate(dueDate.getDate() + 30);
  const dueDateStr = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dueDate);

  return (
    <>
      {/* Print button — hidden on print */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <PrintButton />
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center rounded-lg border border-input bg-white px-4 py-2 text-sm font-medium shadow-md hover:bg-muted transition-colors"
        >
          ← Retour
        </Link>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 20mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* A4 invoice */}
      <div className="min-h-screen bg-white">
        <div className="max-w-[794px] mx-auto p-12 print:p-0 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-8">
            {/* Emitter */}
            <div className="space-y-1">
              <p className="font-fraunces text-2xl font-bold text-ink">
                {profile?.brand_name ?? profile?.full_name ?? "Praticien"}
              </p>
              {profile?.specialty && (
                <p className="text-sm text-gray-500 capitalize">{profile.specialty}</p>
              )}
              {addressLines.map((line, i) => (
                <p key={i} className="text-sm text-gray-600">
                  {line}
                </p>
              ))}
              {profile?.siret && (
                <p className="text-sm text-gray-500">SIRET : {profile.siret}</p>
              )}
            </div>

            {/* Invoice meta */}
            <div className="text-right space-y-1 shrink-0">
              <p className="font-fraunces text-xl font-semibold text-ink">
                {invoiceNumber}
              </p>
              <p className="text-sm text-gray-500">Date : {invoiceDate}</p>
              <p className="text-sm text-gray-500">Échéance : {dueDateStr}</p>
              <span
                className={`inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-medium ${
                  invoice.status === "paid"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "sent"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {invoice.status === "paid"
                  ? "Payée"
                  : invoice.status === "sent"
                    ? "Envoyée"
                    : invoice.status === "overdue"
                      ? "En retard"
                      : "Brouillon"}
              </span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-gray-200" />

          {/* Client */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Facturé à
            </p>
            {client ? (
              <>
                <p className="font-semibold text-ink">{client.full_name}</p>
                {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
              </>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>

          {/* Items table */}
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 border border-gray-200">
                  Prestation
                </th>
                {hasLineItems && (
                  <>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 border border-gray-200 w-16">
                      Qté
                    </th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 border border-gray-200 w-28">
                      PU HT
                    </th>
                  </>
                )}
                <th className="text-right px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 border border-gray-200 w-28">
                  Total HT
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-3 py-3 text-gray-800 border border-gray-200">
                      {item.description ?? "—"}
                    </td>
                    {hasLineItems && (
                      <>
                        <td className="px-3 py-3 text-right tabular-nums text-gray-600 border border-gray-200">
                          {item.quantity ?? 1}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-gray-600 border border-gray-200">
                          {item.unit_price !== undefined
                            ? formatEur(item.unit_price)
                            : "—"}
                        </td>
                      </>
                    )}
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800 border border-gray-200">
                      {item.total !== undefined
                        ? formatEur(item.total)
                        : formatEur(invoice.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-3 py-3 text-gray-400 border border-gray-200"
                    colSpan={hasLineItems ? 4 : 2}
                  >
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="ml-auto w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total HT</span>
              <span className="tabular-nums font-medium text-gray-800">
                {formatEur(invoice.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">TVA ({invoice.vat} %)</span>
              <span className="tabular-nums font-medium text-gray-800">
                {formatEur(amountVat)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2">
              <span className="text-ink">Total TTC</span>
              <span className="tabular-nums text-ink">{formatEur(amountTtc)}</span>
            </div>
            {invoice.paid_at && (
              <p className="text-xs text-green-700 font-medium text-right pt-1">
                ✓ Payée le{" "}
                {new Intl.DateTimeFormat("fr-FR").format(new Date(invoice.paid_at))}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 space-y-1 text-xs text-gray-400 text-center">
            {invoice.vat === 0 && <p>TVA non applicable — article 293 B du CGI</p>}
            <p>
              En cas de retard de paiement, des pénalités de 3× le taux légal
              s&apos;appliquent.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
