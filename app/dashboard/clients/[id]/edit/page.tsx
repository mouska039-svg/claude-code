"use client";

import { useState, useTransition, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { updateClient } from "@/server/actions/clients";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default function EditClientPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<ClientRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("clients")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setClient(data as ClientRow | null);
          setLoading(false);
        });
    });
  }, [params.id]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", params.id);
    setError(null);
    startTransition(async () => {
      const result = await updateClient(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Client introuvable.</p>
        <Link
          href="/dashboard/clients"
          className="text-sage hover:underline text-sm mt-2 inline-block"
        >
          Retour aux clients
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav aria-label="Fil d'Ariane">
        <Link
          href={`/dashboard/clients/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] py-2"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Retour au client
        </Link>
      </nav>

      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">
          Modifier le client
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{client.full_name}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              name="full_name"
              defaultValue={client.full_name}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                defaultValue={client.email ?? ""}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Téléphone
              </label>
              <input
                name="phone"
                type="tel"
                defaultValue={client.phone ?? ""}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Date de naissance
            </label>
            <input
              name="birth_date"
              type="date"
              defaultValue={client.birth_date ?? ""}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Motif principal
            </label>
            <textarea
              name="primary_concern"
              rows={3}
              defaultValue={client.primary_concern ?? ""}
              placeholder="Raison de la consultation, objectifs…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/clients/${params.id}`)}
            className="rounded-lg border border-input bg-card px-5 py-2 text-sm font-medium hover:bg-muted transition-colors min-h-[44px]"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
