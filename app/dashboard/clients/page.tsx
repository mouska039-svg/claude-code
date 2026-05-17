import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
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
    query = query.ilike("full_name", `%${search}%`);
  }

  const { data } = await query;
  return (data ?? []) as ClientRow[];
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { search } = await searchParams;
  const clients = await getClients(user.id, search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-ink">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sage text-white px-4 py-2 text-sm font-medium hover:bg-sage/90 transition-colors"
        >
          + Nouveau client
        </Link>
      </div>

      <form method="GET" action="/dashboard/clients">
        <div className="flex gap-2">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Rechercher un client…"
            className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
          />
          <button
            type="submit"
            className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Rechercher
          </button>
        </div>
      </form>

      {clients.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">
            {search
              ? "Aucun client trouvé pour cette recherche."
              : "Aucun client pour l'instant."}
          </p>
          {!search && (
            <Link
              href="/dashboard/clients/new"
              className="inline-block mt-3 text-sm text-sage hover:underline"
            >
              Créer votre premier client →
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {client.full_name}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {client.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="text-xs text-muted-foreground">{client.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    client.status === "active"
                      ? "bg-sage/10 text-sage"
                      : client.status === "inactive"
                        ? "bg-muted text-muted-foreground"
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
                  className="text-sm text-sage hover:underline font-medium"
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
