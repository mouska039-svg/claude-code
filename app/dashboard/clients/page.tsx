import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

async function getClients(userId: string, search?: string): Promise<ClientRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data } = await query;
  return (data ?? []) as ClientRow[];
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { q } = await searchParams;
  const clients = await getClients(user.id, q);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-ink">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 min-h-[44px] rounded-lg bg-sage text-white px-4 py-2.5 text-sm font-medium hover:bg-sage/90 transition-colors shrink-0"
        >
          + Nouveau client
        </Link>
      </div>

      {/* Search bar */}
      <form method="GET" action="/dashboard/clients">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Rechercher par nom ou email…"
            aria-label="Rechercher un client"
            className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
          />
        </div>
      </form>

      {/* Client list or empty state */}
      {clients.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Users className="text-muted-foreground" size={28} aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {q ? "Aucun client trouvé" : "Aucun client pour l'instant"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {q
                ? `Aucun résultat pour « ${q} »`
                : "Commencez par ajouter votre premier client"}
            </p>
          </div>
          {!q && (
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 min-h-[44px] rounded-lg bg-sage text-white px-5 py-2.5 text-sm font-medium hover:bg-sage/90 transition-colors"
            >
              Ajouter votre premier client
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center gap-4 rounded-xl bg-card border border-border px-4 py-3 hover:bg-muted/40 transition-colors"
            >
              {/* Initials avatar */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage text-white text-sm font-semibold"
                aria-hidden="true"
              >
                {getInitials(client.full_name)}
              </div>

              {/* Client info */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{client.full_name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {client.email && (
                    <p className="text-sm text-muted-foreground truncate">
                      {client.email}
                    </p>
                  )}
                  {client.primary_concern && (
                    <span className="inline-flex items-center rounded-full bg-brume/30 px-2 py-0.5 text-xs font-medium text-ink/70 shrink-0">
                      {client.primary_concern.slice(0, 30)}
                      {client.primary_concern.length > 30 ? "…" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Status badge + Voir link */}
              <div className="flex items-center gap-3 ml-2 shrink-0">
                <span
                  className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="inline-flex items-center min-h-[44px] min-w-[44px] justify-center rounded-lg border border-sage/30 bg-sage/5 px-3 text-sm font-medium text-sage hover:bg-sage/10 transition-colors"
                >
                  Voir
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
