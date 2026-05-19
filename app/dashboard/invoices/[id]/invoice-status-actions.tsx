"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateInvoiceStatus } from "@/server/actions/invoices";
import type { Database } from "@/types/supabase";

type InvoiceStatus = Database["public"]["Tables"]["invoices"]["Row"]["status"];

const TRANSITIONS: Record<
  InvoiceStatus,
  { label: string; next: InvoiceStatus; className: string }[]
> = {
  draft: [
    {
      label: "Marquer comme envoyée",
      next: "sent",
      className: "bg-blue-600 text-white hover:bg-blue-700",
    },
    {
      label: "Annuler",
      next: "cancelled",
      className: "border border-input bg-background hover:bg-muted text-foreground",
    },
  ],
  sent: [
    {
      label: "Marquer comme payée",
      next: "paid",
      className: "bg-sage text-white hover:bg-sage/90",
    },
    {
      label: "Marquer en retard",
      next: "overdue",
      className: "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
    },
    {
      label: "Annuler",
      next: "cancelled",
      className: "border border-input bg-background hover:bg-muted text-foreground",
    },
  ],
  overdue: [
    {
      label: "Marquer comme payée",
      next: "paid",
      className: "bg-sage text-white hover:bg-sage/90",
    },
    {
      label: "Annuler",
      next: "cancelled",
      className: "border border-input bg-background hover:bg-muted text-foreground",
    },
  ],
  paid: [],
  cancelled: [
    {
      label: "Remettre en brouillon",
      next: "draft",
      className: "border border-input bg-background hover:bg-muted text-foreground",
    },
  ],
};

export function InvoiceStatusActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const actions = TRANSITIONS[status] ?? [];

  if (actions.length === 0) return null;

  function handleAction(next: InvoiceStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateInvoiceStatus(invoiceId, next);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.next}
            onClick={() => handleAction(action.next)}
            disabled={isPending}
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium min-h-[44px] transition-colors disabled:opacity-60 ${action.className}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
