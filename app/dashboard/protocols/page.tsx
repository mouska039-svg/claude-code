import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Suspense } from "react";
import FilterTabs from "./filter-tabs";
import type { Database } from "@/types/supabase";

type ProtocolRow = Database["public"]["Tables"]["protocols"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

type ProtocolWithClient = ProtocolRow & {
  clientName: string | null;
  clientId: string;
};

async function getProtocolsWithClients(
  userId: string,
  status?: string
): Promise<ProtocolWithClient[]> {
  const supabase = await createClient();

  let query = supabase
    .from("protocols")
    .select("*")
    .eq("practitioner_id", userId)
    .order("created_at", { ascending: false });

  if (status === "active" || status === "draft" || status === "completed") {
    query = query.eq("status", status);
  }

  const { data: protocols } = await query;
  if (!protocols || protocols.length === 0) return [];

  // Collect unique client IDs and fetch their names
  const clientIds = [...new Set(protocols.map((p) => p.client_id))];
  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name")
    .in("id", clientIds);

  const clientMap = new Map<string, string>(
    (clients ?? []).map((c: Pick<ClientRow, "id" | "full_name">) => [c.id, c.full_name])
  );

  return (protocols as ProtocolRow[]).map((p) => ({
    ...p,
    clientName: clientMap.get(p.client_id) ?? null,
    clientId: p.client_id,
  }));
}

const SPECIALTY_BADGE: Record<string, { label: string; className: string }> = {
  naturopathe: {
    label: "Naturopathe",
    className: "bg-sage/10 text-sage",
  },
  sophrologue: {
    label: "Sophrologue",
    className: "bg-blue-50 text-blue-700",
  },
  hypnotherapeute: {
    label: "Hypnothérapeute",
    className: "bg-purple-50 text-purple-700",
  },
};

const STATUS_BADGE: Record<ProtocolRow["status"], { label: string; className: string }> =
  {
    active: { label: "Actif", className: "bg-sage/10 text-sage" },
    draft: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
    completed: { label: "Complété", className: "bg-terracotta/10 text-terracotta" },
  };

export default async function ProtocolsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { status } = await searchParams;
  const protocols = await getProtocolsWithClients(user.id, status);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">
          Cures &amp; protocoles
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tous vos protocoles personnalisés
        </p>
      </div>

      {/* Filter tabs */}
      <Suspense>
        <FilterTabs />
      </Suspense>

      {/* Content */}
      {protocols.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <FileText className="text-muted-foreground" size={28} aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-foreground text-base">
              Aucun protocole généré
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Générez des protocoles personnalisés depuis la fiche d&apos;un client.
            </p>
          </div>
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-2 min-h-[44px] rounded-lg bg-sage text-white px-5 py-2.5 text-sm font-medium hover:bg-sage/90 transition-colors"
          >
            Choisir un client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {protocols.map((protocol) => {
            const inputsObj =
              protocol.inputs &&
              typeof protocol.inputs === "object" &&
              !Array.isArray(protocol.inputs)
                ? (protocol.inputs as Record<string, unknown>)
                : {};
            const specialty =
              typeof inputsObj.specialty === "string" ? inputsObj.specialty : null;
            const specialtyBadge = specialty ? SPECIALTY_BADGE[specialty] : null;
            const statusBadge = STATUS_BADGE[protocol.status];
            const clientName = protocol.clientName ?? "Client inconnu";
            const initials = getInitials(clientName);

            return (
              <div
                key={protocol.id}
                className="rounded-xl bg-card border border-border p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow"
              >
                {/* Client badge */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage text-white text-xs font-semibold"
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {clientName}
                  </span>
                </div>

                {/* Protocol title */}
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm leading-snug">
                    {protocol.title}
                  </p>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2">
                  {specialtyBadge && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${specialtyBadge.className}`}
                    >
                      {specialtyBadge.label}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(protocol.created_at))}
                  </span>
                  <Link
                    href={`/dashboard/clients/${protocol.clientId}`}
                    className="text-xs font-medium text-sage hover:underline"
                  >
                    Voir le client →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
