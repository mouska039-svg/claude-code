import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Receipt } from "lucide-react";
import type { Database } from "@/types/supabase";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

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
  overdue: "bg-red-50 text-red-700",
  cancelled: "bg-red-50 text-red-700",
};

function formatEur(amount: number) {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function getInvoiceNumber(invoice: InvoiceRow, index: number) {
  const year = new Date(invoice.created_at).getFullYear();
  const seq = String(index + 1).padStart(3, "0");
  return `FAC-${year}-${seq}`;
}

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: invoicesData } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const invoices = (invoicesData ?? []) as InvoiceRow[];

  const { data: companiesData } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", user.id);

  const { data: clientsData } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("user_id", user.id);

  const companyMap = new Map(
    ((companiesData ?? []) as { id: string; name: string }[]).map((c) => [c.id, c.name])
  );
  const clientMap = new Map(
    ((clientsData ?? []) as { id: string; full_name: string }[]).map((c) => [
      c.id,
      c.full_name,
    ])
  );

  // Current month for summary
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const thisMonthInvoices = invoices.filter((inv) => inv.created_at >= monthStart);

  const totalThisMonth = thisMonthInvoices.reduce(
    (sum, inv) => sum + inv.amount * (1 + inv.vat / 100),
    0
  );
  const totalPending = invoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + inv.amount * (1 + inv.vat / 100), 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount * (1 + inv.vat / 100), 0);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-ink">Facturation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {invoices.length} facture{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sage text-white px-4 min-h-[44px] text-sm font-medium hover:bg-sage/90 transition-colors"
        >
          + Nouvelle facture
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">Total facturé ce mois</p>
          <p className="font-mono text-base font-semibold text-foreground mt-1 tabular-nums">
            {formatEur(totalThisMonth)}
          </p>
        </div>
        <div className="rounded-xl bg-card border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">En attente</p>
          <p className="font-mono text-base font-semibold text-blue-700 mt-1 tabular-nums">
            {formatEur(totalPending)}
          </p>
        </div>
        <div className="rounded-xl bg-card border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">Payé</p>
          <p className="font-mono text-base font-semibold text-sage mt-1 tabular-nums">
            {formatEur(totalPaid)}
          </p>
        </div>
      </div>

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center flex flex-col items-center gap-3">
          <Receipt className="w-10 h-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm font-medium">Aucune facture</p>
          <Link
            href="/dashboard/invoices/new"
            className="inline-flex items-center gap-1 rounded-lg bg-sage text-white px-4 min-h-[44px] text-sm font-medium hover:bg-sage/90 transition-colors"
          >
            Créer une facture
          </Link>
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
          {invoices.map((invoice, index) => {
            const recipientName = invoice.company_id
              ? companyMap.get(invoice.company_id)
              : invoice.client_id
                ? clientMap.get(invoice.client_id)
                : null;

            const amountTtc = invoice.amount * (1 + invoice.vat / 100);

            // Determine if overdue: has a due date, not paid/cancelled, past today
            // We use created_at + 30 days as a proxy for due date since there's no due_date field
            const createdAt = new Date(invoice.created_at);
            const dueDate = new Date(createdAt);
            dueDate.setDate(dueDate.getDate() + 30);
            const dueDateStr = dueDate.toISOString().slice(0, 10);
            const isPastDue =
              dueDateStr < today &&
              invoice.status !== "paid" &&
              invoice.status !== "cancelled";

            const invoiceNumber = getInvoiceNumber(invoice, invoices.length - 1 - index);

            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-medium text-foreground">
                    {invoiceNumber}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {recipientName && (
                      <p className="text-sm text-foreground truncate">{recipientName}</p>
                    )}
                    {invoice.status !== "paid" && (
                      <p
                        className={`text-xs ${isPastDue ? "text-red-600 font-medium" : "text-muted-foreground"}`}
                      >
                        Échéance {dueDate.toLocaleDateString("fr-FR")}
                        {isPastDue ? " — en retard" : ""}
                      </p>
                    )}
                    {invoice.paid_at && (
                      <p className="text-xs text-muted-foreground">
                        Payée le {new Date(invoice.paid_at).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <p className="font-mono text-sm font-medium tabular-nums text-foreground">
                    {formatEur(amountTtc)}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[invoice.status]}`}
                  >
                    {statusLabels[invoice.status]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
