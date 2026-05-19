import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Database } from "@/types/supabase";
import { ProtocolCard } from "./protocol-card";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ProtocolRow = Database["public"]["Tables"]["protocols"]["Row"];
type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ShareTokenRow = Database["public"]["Tables"]["share_tokens"]["Row"];

interface PortalSuccess {
  client: ClientRow;
  protocols: ProtocolRow[];
  sessions: SessionRow[];
  profile: ProfileRow | null;
  shareToken: ShareTokenRow;
}

interface PortalError {
  error: string;
}

async function getPortalData(token: string): Promise<PortalSuccess | PortalError> {
  const supabase = await createClient();

  const { data: shareToken } = await supabase
    .from("share_tokens")
    .select("*")
    .eq("token", token)
    .eq("resource_type", "client_portal")
    .maybeSingle();

  if (!shareToken) return { error: "Lien invalide ou introuvable" };
  if (new Date(shareToken.expires_at) < new Date()) {
    return { error: "Ce lien a expiré" };
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
    profile: (profileResult.data as ProfileRow | null) ?? null,
    shareToken: shareToken as ShareTokenRow,
  };
}

// ── Naya logo (inline) ────────────────────────────────────────
function NayaLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const cls =
    size === "sm"
      ? "font-fraunces text-xl font-semibold text-ink tracking-tight"
      : "font-fraunces text-3xl font-semibold text-ink tracking-tight";
  return (
    <span className={cls}>
      naya<span className="text-terracotta">.</span>
    </span>
  );
}

// ── Leaf icon (inline SVG, no extra deps) ─────────────────────
function LeafIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-sage/40 mx-auto"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

// ── Calendar icon ─────────────────────────────────────────────
function CalendarIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-sage/40 mx-auto"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

// ── Error / expired token view ────────────────────────────────
function TokenErrorView({ message }: { message: string }) {
  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-4 py-12 pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm space-y-8 text-center">
        <NayaLogo />

        <div className="rounded-2xl border border-terracotta/30 bg-terracotta-50 p-6 space-y-4">
          <p className="font-fraunces text-xl font-semibold text-ink">
            Ce lien a expiré ou est invalide
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">{message}</p>
          <p className="text-sm text-muted-foreground">
            Contactez votre praticien pour obtenir un nouveau lien d&apos;accès.
          </p>
        </div>

        <Link
          href="/portal"
          className="inline-flex items-center justify-center min-h-[44px] text-sm font-medium text-sage hover:text-sage/80 transition-colors"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default async function PortalTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getPortalData(token);

  if ("error" in result) {
    return <TokenErrorView message={result.error} />;
  }

  const { client, protocols, sessions, profile, shareToken } = result;

  const clientFirstName = client.full_name.split(" ")[0];
  const practitionerName = profile?.brand_name ?? profile?.full_name ?? "votre praticien";
  const specialty = profile?.specialty ?? null;

  const expiryFormatted = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(shareToken.expires_at));

  return (
    <div className="min-h-dvh bg-cream">
      {/* Top sage accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-sage to-sage/40" />

      <div className="max-w-lg mx-auto px-4 pt-6 pb-[calc(4rem+env(safe-area-inset-bottom))] space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <NayaLogo size="sm" />

          <div className="space-y-0.5">
            <h1 className="font-fraunces text-2xl font-semibold text-ink">
              Bonjour {clientFirstName}
            </h1>
            <p className="text-sm text-muted-foreground">Suivi par {practitionerName}</p>
          </div>
        </header>

        {/* Protocols section */}
        <section className="space-y-4">
          <h2 className="font-fraunces text-lg font-semibold text-ink">Vos protocoles</h2>

          {protocols.length === 0 ? (
            <div className="rounded-2xl bg-card border border-sage/10 p-8 text-center space-y-3 shadow-sm">
              <LeafIcon />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Votre praticien n&apos;a pas encore partagé de protocole.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {protocols.map((protocol) => (
                <ProtocolCard
                  key={protocol.id}
                  protocol={protocol}
                  specialty={specialty}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sessions section */}
        <section className="space-y-4">
          <h2 className="font-fraunces text-lg font-semibold text-ink">Vos séances</h2>

          {sessions.length === 0 ? (
            <div className="rounded-2xl bg-card border border-sage/10 p-8 text-center space-y-3 shadow-sm">
              <CalendarIcon />
              <p className="text-sm text-muted-foreground">Aucune séance enregistrée.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-sage/10 overflow-hidden shadow-sm divide-y divide-border/60">
              {sessions.map((session) => {
                const sessionType =
                  session.type === "presentiel" ? "Présentiel" : "Visio";
                return (
                  <div key={session.id} className="px-5 py-4 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink">
                        {new Intl.DateTimeFormat("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(session.date))}
                      </p>
                      <span className="shrink-0 text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                        {sessionType}
                        {session.duration_min ? ` · ${session.duration_min} min` : ""}
                      </span>
                    </div>
                    {session.summary_client && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {session.summary_client}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* RGPD footer */}
        <footer className="space-y-2 pt-2 border-t border-border/60">
          <p className="text-xs text-muted-foreground text-center">
            Vos données sont chiffrées et hébergées en Europe
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Accès valide jusqu&apos;au {expiryFormatted}
          </p>
          <p className="text-center">
            <Link
              href="/politique-de-confidentialite"
              className="text-xs text-sage hover:underline min-h-[44px] inline-flex items-center"
            >
              Politique de confidentialité
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
