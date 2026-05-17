import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
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
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-sage/10 text-sage",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-red-50 text-red-400",
};

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-ink">Factures</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {invoices.length} facture{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sage text-white px-4 py-2 text-sm font-medium hover:bg-sage/90 transition-colors"
        >
          + Nouvelle facture
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Aucune facture pour l&apos;instant.
          </p>
          <Link
            href="/dashboard/invoices/new"
            className="inline-block mt-3 text-sm text-sage hover:underline"
          >
            Créer votre première facture →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
          {invoices.map((invoice) => {
            const recipientName = invoice.company_id
              ? companyMap.get(invoice.company_id)
              : invoice.client_id
                ? clientMap.get(invoice.client_id)
                : null;

            const vatMultiplier = 1 + invoice.vat / 100;
            const amountTtc = invoice.amount * vatMultiplier;

            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground font-mono">
                    {invoice.id.slice(0, 8).toUpperCase()}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {recipientName && (
                      <p className="text-xs text-muted-foreground truncate">
                        {recipientName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {amountTtc.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                      {invoice.vat > 0 && (
                        <span className="ml-1 text-muted-foreground/70">
                          TVA {invoice.vat}%
                        </span>
                      )}
                    </p>
                    {invoice.paid_at && (
                      <p className="text-xs text-muted-foreground">
                        Payée le {new Date(invoice.paid_at).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[invoice.status]}`}
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
