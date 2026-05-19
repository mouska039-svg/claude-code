import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
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

const typeBadgeClass: Record<SessionRow["type"], string> = {
  presentiel: "bg-sage/10 text-sage",
  visio: "bg-blue-50 text-blue-700",
};

function groupByMonth(
  items: Array<{ session: SessionRow; client: ClientRow | null }>
): Array<{
  label: string;
  items: Array<{ session: SessionRow; client: ClientRow | null }>;
}> {
  const groups = new Map<
    string,
    Array<{ session: SessionRow; client: ClientRow | null }>
  >();

  for (const item of items) {
    const d = new Date(item.session.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  return Array.from(groups.entries()).map(([, groupItems]) => ({
    label: new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(new Date(groupItems[0].session.date)),
    items: groupItems,
  }));
}

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const items = await getSessionsWithClients(user.id);
  const groups = groupByMonth(items);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-ink">
            Séances &amp; audios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} séance{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/sessions/new"
          className="inline-flex items-center gap-2 min-h-[44px] rounded-lg bg-sage px-4 py-2.5 text-sm font-medium text-white hover:bg-sage/90 transition-colors shrink-0"
        >
          + Nouvelle séance
        </Link>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <CalendarDays
              className="text-muted-foreground"
              size={28}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="font-medium text-foreground">Aucune séance enregistrée</p>
            <p className="text-muted-foreground text-sm mt-1">
              Commencez par planifier votre première séance
            </p>
          </div>
          <Link
            href="/dashboard/sessions/new"
            className="inline-flex items-center gap-2 min-h-[44px] rounded-lg bg-sage text-white px-5 py-2.5 text-sm font-medium hover:bg-sage/90 transition-colors"
          >
            Planifier une séance
          </Link>
        </div>
      ) : (
        /* Grouped by month */
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label} className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 capitalize">
                {group.label}
              </h2>
              <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
                {group.items.map(({ session, client }) => (
                  <Link
                    key={session.id}
                    href={`/dashboard/sessions/${session.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors min-h-[60px]"
                  >
                    {/* Date column */}
                    <div className="shrink-0 w-12 text-center">
                      <p className="text-lg font-bold text-ink leading-none">
                        {new Date(session.date).getDate()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(
                          new Date(session.date)
                        )}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-border shrink-0" aria-hidden="true" />

                    {/* Session info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {client?.full_name ?? "Client inconnu"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Intl.DateTimeFormat("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(session.date))}
                        {session.duration_min ? ` · ${session.duration_min} min` : ""}
                      </p>
                    </div>

                    {/* Type badge */}
                    <span
                      className={`ml-2 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeClass[session.type]}`}
                    >
                      {typeLabel[session.type]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
