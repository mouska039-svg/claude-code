import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

async function getSessionsWithClients(userId: string) {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("practitioner_id", userId)
    .order("date", { ascending: false });

  const rows = (sessions ?? []) as SessionRow[];

  if (rows.length === 0) return [];

  const clientIds = [...new Set(rows.map((s) => s.client_id))];
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .in("id", clientIds);

  const clientMap = new Map(((clients ?? []) as ClientRow[]).map((c) => [c.id, c]));

  return rows.map((s) => ({ session: s, client: clientMap.get(s.client_id) ?? null }));
}

const typeLabel: Record<SessionRow["type"], string> = {
  presentiel: "Présentiel",
  visio: "Visio",
};

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const items = await getSessionsWithClients(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-ink">Séances</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} séance{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/sessions/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage/90 transition-colors"
        >
          + Nouvelle séance
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">Aucune séance enregistrée.</p>
          <Link
            href="/dashboard/sessions/new"
            className="inline-block mt-3 text-sm text-sage hover:underline"
          >
            Créer la première séance →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
          {items.map(({ session, client }) => (
            <Link
              key={session.id}
              href={`/dashboard/sessions/${session.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {client?.full_name ?? "Client inconnu"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(session.date))}
                  {session.duration_min ? ` · ${session.duration_min} min` : ""}
                </p>
              </div>
              <span className="ml-4 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-sage/10 text-sage shrink-0">
                {typeLabel[session.type]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
