import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ProtocolRow = Database["public"]["Tables"]["protocols"]["Row"];

async function getClient(userId: string, clientId: string): Promise<ClientRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("user_id", userId)
    .maybeSingle();
  return data as ClientRow | null;
}

async function getClientProtocols(
  userId: string,
  clientId: string
): Promise<ProtocolRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("protocols")
    .select("*")
    .eq("client_id", clientId)
    .eq("practitioner_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as ProtocolRow[];
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { id } = await params;
  const client = await getClient(user.id, id);

  if (!client) notFound();

  const protocols = await getClientProtocols(user.id, id);

  const statusLabel: Record<ProtocolRow["status"], string> = {
    draft: "Brouillon",
    active: "Actif",
    completed: "Terminé",
  };

  const statusClass: Record<ProtocolRow["status"], string> = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-sage/10 text-sage",
    completed: "bg-terracotta/10 text-terracotta",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/clients"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour aux clients
          </Link>
          <h1 className="font-fraunces text-3xl font-semibold text-ink mt-2">
            {client.full_name}
          </h1>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-2 ${
              client.status === "active"
                ? "bg-sage/10 text-sage"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {client.status === "active"
              ? "Actif"
              : client.status === "inactive"
                ? "Inactif"
                : "Archivé"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/clients/${id}/edit`}
            className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Modifier
          </Link>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Informations</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {client.email && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Email</dt>
              <dd className="text-sm text-foreground mt-0.5">{client.email}</dd>
            </div>
          )}
          {client.phone && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Téléphone</dt>
              <dd className="text-sm text-foreground mt-0.5">{client.phone}</dd>
            </div>
          )}
          {client.birth_date && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Date de naissance
              </dt>
              <dd className="text-sm text-foreground mt-0.5">
                {new Intl.DateTimeFormat("fr-FR").format(new Date(client.birth_date))}
              </dd>
            </div>
          )}
          {client.primary_concern && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">
                Motif principal
              </dt>
              <dd className="text-sm text-foreground mt-0.5">{client.primary_concern}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/clients/${id}/anamnese`}
            className="inline-flex items-center gap-2 rounded-lg bg-sage/10 border border-sage/20 px-4 py-2 text-sm font-medium text-sage hover:bg-sage/15 transition-colors"
          >
            Anamnèse
          </Link>
          <Link
            href={`/dashboard/clients/${id}/protocol/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-terracotta/10 border border-terracotta/20 px-4 py-2 text-sm font-medium text-terracotta hover:bg-terracotta/15 transition-colors"
          >
            + Générer un protocole
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Protocoles ({protocols.length})
          </h2>
        </div>
        {protocols.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun protocole pour ce client.
            </p>
            <Link
              href={`/dashboard/clients/${id}/protocol/new`}
              className="inline-block mt-3 text-sm text-sage hover:underline"
            >
              Générer le premier protocole →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
            {protocols.map((protocol) => {
              const output = protocol.output as {
                title?: string;
                summary?: string;
                duration_weeks?: number;
              } | null;
              return (
                <div
                  key={protocol.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {protocol.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {output?.duration_weeks
                        ? `${output.duration_weeks} semaine${output.duration_weeks > 1 ? "s" : ""} · `
                        : ""}
                      {new Intl.DateTimeFormat("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(protocol.created_at))}
                    </p>
                  </div>
                  <span
                    className={`ml-4 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[protocol.status]}`}
                  >
                    {statusLabel[protocol.status]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
