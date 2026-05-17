import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ProtocolRow = Database["public"]["Tables"]["protocols"]["Row"];
type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

async function getPortalData(token: string) {
  const supabase = await createClient();

  const { data: shareToken } = await supabase
    .from("share_tokens")
    .select("*")
    .eq("token", token)
    .eq("resource_type", "client_portal")
    .maybeSingle();

  if (!shareToken) return { error: "Lien invalide ou introuvable" };
  if (new Date(shareToken.expires_at) < new Date()) {
    return { error: "Ce lien a expiré. Demandez un nouveau lien à votre praticien." };
  }

  const clientId = shareToken.resource_id;

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();

  if (!clientData) return { error: "Client introuvable" };
  const client = clientData as ClientRow;

  const [protocolsResult, sessionsResult, profileResult] = await Promise.all([
    supabase
      .from("protocols")
      .select("*")
      .eq("client_id", clientId)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("sessions")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false })
      .limit(10),
    supabase.from("profiles").select("*").eq("id", client.user_id).maybeSingle(),
  ]);

  return {
    client,
    protocols: (protocolsResult.data ?? []) as ProtocolRow[],
    sessions: (sessionsResult.data ?? []) as SessionRow[],
    profile: profileResult.data as ProfileRow | null,
  };
}

export default async function PortalTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getPortalData(token);

  if ("error" in result && result.error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="font-fraunces text-2xl font-semibold text-ink">Lien invalide</h1>
          <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-3">
            <p className="text-sm text-muted-foreground">{result.error}</p>
            <p className="text-sm text-muted-foreground">
              Contactez votre praticien pour obtenir un nouveau lien d&apos;accès.
            </p>
          </div>
          <Link href="/portal" className="text-sm text-sage hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  if (!("client" in result) || !result.client) notFound();

  const client: ClientRow = result.client;
  const protocols: ProtocolRow[] = result.protocols ?? [];
  const sessions: SessionRow[] = result.sessions ?? [];
  const profile: ProfileRow | null = result.profile ?? null;

  const practitionerName = profile?.brand_name ?? profile?.full_name ?? "votre praticien";

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-8 pb-16">
        <header className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Votre espace bien-être
          </p>
          <h1 className="font-fraunces text-2xl font-semibold text-ink">
            Bonjour, {client.full_name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">Suivi avec {practitionerName}</p>
        </header>

        {protocols.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-fraunces text-lg font-semibold text-ink">
              Mon protocole
            </h2>
            <div className="space-y-3">
              {protocols.map((protocol) => {
                const output = protocol.output as {
                  summary?: string;
                  duration_weeks?: number;
                } | null;
                return (
                  <div
                    key={protocol.id}
                    className="rounded-2xl bg-card border border-border p-5 space-y-2 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        {protocol.title}
                      </h3>
                      {protocol.duration_weeks > 0 && (
                        <span className="shrink-0 text-xs font-medium text-sage bg-sage/10 rounded-full px-2 py-0.5">
                          {protocol.duration_weeks} sem.
                        </span>
                      )}
                    </div>
                    {output?.summary && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {output.summary}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Débuté le{" "}
                      {new Intl.DateTimeFormat("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(protocol.created_at))}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="font-fraunces text-lg font-semibold text-ink">Mes séances</h2>
          {sessions.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-6 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">
                Aucune séance enregistrée pour le moment.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm divide-y divide-border">
              {sessions.map((session) => (
                <div key={session.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {new Intl.DateTimeFormat("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(session.date))}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {session.type === "presentiel" ? "Présentiel" : "Visio"}
                      {session.duration_min ? ` · ${session.duration_min} min` : ""}
                    </span>
                  </div>
                  {session.summary_client && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {session.summary_client}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            Naya · Espace bien-être personnel
          </p>
        </footer>
      </div>
    </div>
  );
}
