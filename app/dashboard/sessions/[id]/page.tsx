import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";
import { AudioGenerator } from "@/components/audio-generator";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type SessionAudioRow = Database["public"]["Tables"]["session_audios"]["Row"];

const typeLabel: Record<SessionRow["type"], string> = {
  presentiel: "Présentiel",
  visio: "Visio",
};

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: sessionData } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .eq("practitioner_id", user.id)
    .maybeSingle();

  if (!sessionData) notFound();

  const session = sessionData as SessionRow;

  const [clientResult, audiosResult] = await Promise.all([
    supabase.from("clients").select("*").eq("id", session.client_id).maybeSingle(),
    supabase
      .from("session_audios")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const client = clientResult.data as ClientRow | null;
  const audios = (audiosResult.data ?? []) as SessionAudioRow[];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/sessions"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour aux séances
          </Link>
          <h1 className="font-fraunces text-3xl font-semibold text-ink mt-2">
            Séance du{" "}
            {new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(session.date))}
          </h1>
        </div>
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-sage/10 text-sage">
          {typeLabel[session.type]}
        </span>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Informations</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Client</dt>
            <dd className="text-sm text-foreground mt-0.5">
              {client ? (
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="text-sage hover:underline"
                >
                  {client.full_name}
                </Link>
              ) : (
                "Client inconnu"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Date</dt>
            <dd className="text-sm text-foreground mt-0.5">
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(session.date))}
            </dd>
          </div>
          {session.duration_min && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Durée</dt>
              <dd className="text-sm text-foreground mt-0.5">
                {session.duration_min} min
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Type</dt>
            <dd className="text-sm text-foreground mt-0.5">{typeLabel[session.type]}</dd>
          </div>
          {session.notes_practitioner && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">
                Notes praticien
              </dt>
              <dd className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">
                {session.notes_practitioner}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Audios ({audios.length})
        </h2>

        {audios.length > 0 && (
          <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
            {audios.map((audio) => (
              <div key={audio.id} className="px-5 py-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{audio.title}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "short",
                    }).format(new Date(audio.created_at))}
                  </span>
                </div>
                <audio controls src={audio.audio_url} className="w-full h-9" />
              </div>
            ))}
          </div>
        )}

        <AudioGenerator sessionId={id} />
      </div>
    </div>
  );
}
