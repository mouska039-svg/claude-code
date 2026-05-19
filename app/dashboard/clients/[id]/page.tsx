import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, Sparkles, Calendar } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { Database } from "@/types/supabase";
import { ClientPortalButton } from "@/components/client-portal-button";

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
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] py-2"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Clients
        </Link>
        <span className="text-muted-foreground/50" aria-hidden="true">
          /
        </span>
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {client.full_name}
        </span>
      </nav>

      {/* Client header */}
      <div className="flex items-start gap-5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sage text-white text-xl font-semibold"
          aria-hidden="true"
        >
          {getInitials(client.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-fraunces text-2xl font-semibold text-ink leading-tight">
            {client.full_name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            {client.email && (
              <p className="text-sm text-muted-foreground">{client.email}</p>
            )}
            {client.phone && (
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            )}
          </div>
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
        <Link
          href={`/dashboard/clients/${id}/edit`}
          className="inline-flex items-center min-h-[44px] rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors shrink-0"
        >
          Modifier
        </Link>
      </div>

      {/* Quick action strip */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <Link
          href={`/dashboard/clients/${id}/anamnese`}
          className="inline-flex items-center gap-2 min-h-[44px] shrink-0 rounded-lg bg-sage/10 border border-sage/20 px-4 py-2.5 text-sm font-medium text-sage hover:bg-sage/15 transition-colors"
        >
          <FileText size={15} aria-hidden="true" />
          Anamnèse
        </Link>
        <Link
          href={`/dashboard/clients/${id}/protocol/new`}
          className="inline-flex items-center gap-2 min-h-[44px] shrink-0 rounded-lg bg-terracotta/10 border border-terracotta/20 px-4 py-2.5 text-sm font-medium text-terracotta hover:bg-terracotta/15 transition-colors"
        >
          <Sparkles size={15} aria-hidden="true" />
          Nouveau protocole
        </Link>
        <Link
          href={`/dashboard/sessions/new?clientId=${id}`}
          className="inline-flex items-center gap-2 min-h-[44px] shrink-0 rounded-lg bg-brume/30 border border-brume/50 px-4 py-2.5 text-sm font-medium text-ink/70 hover:bg-brume/40 transition-colors"
        >
          <Calendar size={15} aria-hidden="true" />
          Nouvelle séance
        </Link>
      </div>

      {/* Portal */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-3">
        <h2 className="text-base font-semibold text-foreground">Portail client</h2>
        <p className="text-sm text-muted-foreground">
          Générez un lien sécurisé pour que votre client accède à ses protocoles et
          séances.
        </p>
        <ClientPortalButton clientId={id} />
      </div>

      {/* Client info card */}
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

      {/* Protocols section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Protocoles ({protocols.length})
          </h2>
        </div>

        {protocols.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-10 flex flex-col items-center text-center gap-4">
            <div className="rounded-full bg-muted p-3">
              <Sparkles className="text-muted-foreground" size={24} aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium text-foreground">Aucun protocole</p>
              <p className="text-muted-foreground text-sm mt-1">
                Générez un protocole personnalisé grâce à l&apos;IA
              </p>
            </div>
            <Link
              href={`/dashboard/clients/${id}/protocol/new`}
              className="inline-flex items-center gap-2 min-h-[44px] rounded-lg bg-terracotta text-white px-5 py-2.5 text-sm font-medium hover:bg-terracotta/90 transition-colors"
            >
              <Sparkles size={14} aria-hidden="true" />
              Générer un protocole IA
            </Link>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
            {protocols.map((protocol) => (
              <Link
                key={protocol.id}
                href={`/dashboard/clients/${id}/protocol/${protocol.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {protocol.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {protocol.duration_weeks
                      ? `${protocol.duration_weeks} semaine${protocol.duration_weeks > 1 ? "s" : ""} · `
                      : ""}
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(protocol.created_at))}
                  </p>
                </div>
                <span
                  className={`ml-4 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${statusClass[protocol.status]}`}
                >
                  {statusLabel[protocol.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
