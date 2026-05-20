"use client";
import { useState, useTransition } from "react";
import { updateProfile, changePassword, deleteAccount } from "@/server/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const TABS = [
  { id: "profile", label: "Profil" },
  { id: "branding", label: "Identité visuelle" },
  { id: "security", label: "Sécurité" },
  { id: "rgpd", label: "RGPD & données" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={`rounded-lg px-4 py-3 text-sm ${type === "success" ? "bg-sage/10 border border-sage/20 text-sage" : "bg-red-50 border border-red-200 text-red-700"}`}
    >
      {message}
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("profile");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          setProfile(data as ProfileRow | null);
          setLoading(false);
        });
    });
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("tab", tab);

    setFeedback(null);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Modifications enregistrées." });
      }
    });
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setFeedback(null);
    startTransition(async () => {
      const result = await changePassword(formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Mot de passe mis à jour." });
        form.reset();
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez votre profil et vos préférences
        </p>
      </div>

      {/* Import shortcut */}
      <Link
        href="/dashboard/settings/import"
        className="flex items-center justify-between rounded-xl bg-card border border-border px-5 py-4 hover:bg-muted/30 transition-colors group"
      >
        <div>
          <p className="text-sm font-semibold text-ink">
            Importer depuis un autre logiciel
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Itiaki, Jupi&apos;Terre, Maddie ou CSV générique
          </p>
        </div>
        <span
          className="text-muted-foreground group-hover:text-foreground transition-colors text-lg"
          aria-hidden="true"
        >
          →
        </span>
      </Link>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setFeedback(null);
            }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-sage text-sage"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      {/* Profile tab */}
      {tab === "profile" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              Informations professionnelles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  name="full_name"
                  defaultValue={profile?.full_name ?? ""}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Spécialité
                </label>
                <select
                  name="specialty"
                  defaultValue={profile?.specialty ?? ""}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                >
                  <option value="">— Choisir —</option>
                  <option value="naturopathe">Naturopathe</option>
                  <option value="sophrologue">Sophrologue</option>
                  <option value="hypnotherapeute">Hypnothérapeute</option>
                  <option value="multi">Multi-praticien</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  N° SIRET
                </label>
                <input
                  name="siret"
                  defaultValue={profile?.siret ?? ""}
                  maxLength={14}
                  placeholder="12345678901234"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  N° RPPS ou ADELI
                </label>
                <input
                  name="rpps_or_adeli"
                  defaultValue={profile?.rpps_or_adeli ?? ""}
                  maxLength={20}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              Adresse professionnelle
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Rue
                </label>
                <input
                  name="address_street"
                  defaultValue={
                    (
                      profile?.address_json as {
                        street?: string;
                        postal_code?: string;
                        city?: string;
                        country?: string;
                      } | null
                    )?.street ?? ""
                  }
                  placeholder="12 rue des Lilas"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Code postal
                </label>
                <input
                  name="address_postal_code"
                  defaultValue={
                    (
                      profile?.address_json as {
                        street?: string;
                        postal_code?: string;
                        city?: string;
                        country?: string;
                      } | null
                    )?.postal_code ?? ""
                  }
                  maxLength={10}
                  placeholder="75001"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Ville
                </label>
                <input
                  name="address_city"
                  defaultValue={
                    (
                      profile?.address_json as {
                        street?: string;
                        postal_code?: string;
                        city?: string;
                        country?: string;
                      } | null
                    )?.city ?? ""
                  }
                  placeholder="Paris"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Pays
                </label>
                <input
                  name="address_country"
                  defaultValue={
                    (
                      profile?.address_json as {
                        street?: string;
                        postal_code?: string;
                        city?: string;
                        country?: string;
                      } | null
                    )?.country ?? "France"
                  }
                  placeholder="France"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      )}

      {/* Branding tab */}
      {tab === "branding" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              Identité visuelle de votre cabinet
            </h2>
            <p className="text-sm text-muted-foreground">
              Ces informations apparaissent sur les documents PDF et dans le portail
              client.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nom du cabinet
                </label>
                <input
                  name="brand_name"
                  defaultValue={profile?.brand_name ?? ""}
                  maxLength={100}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Slogan
                </label>
                <input
                  name="slogan"
                  defaultValue={profile?.slogan ?? ""}
                  maxLength={200}
                  placeholder="Votre expertise au service du bien-être"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Couleur principale
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="brand_color"
                    defaultValue={profile?.brand_color ?? "#5C7A6B"}
                    className="h-10 w-16 rounded-lg border border-input cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    Couleur des en-têtes PDF
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  URL du logo
                </label>
                <input
                  name="brand_logo_url"
                  defaultValue={profile?.brand_logo_url ?? ""}
                  type="url"
                  placeholder="https://…"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lien public vers votre logo (PNG, SVG)
                </p>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              Changer le mot de passe
            </h2>
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="new_password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Mise à jour…" : "Mettre à jour"}
          </button>
        </form>
      )}

      {/* RGPD tab */}
      {tab === "rgpd" && (
        <div className="space-y-5">
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              Vos données personnelles
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conformément au RGPD, vous pouvez exporter ou supprimer l&apos;ensemble des
              données associées à votre compte. L&apos;export inclut votre profil, vos
              clients, protocoles, séances et factures.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/api/rgpd/export"
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Télécharger mes données (JSON)
              </a>
            </div>
          </div>

          <div className="rounded-xl bg-red-50 border border-red-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-red-700">Zone de danger</h2>
            <p className="text-sm text-red-600 leading-relaxed">
              La suppression de votre compte est{" "}
              <strong>définitive et irréversible</strong>. Toutes vos données (clients,
              protocoles, séances, factures) seront supprimées. Cette action ne peut pas
              être annulée.
            </p>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Supprimer mon compte
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-red-700">
                  Êtes-vous sûr ? Cette action est irréversible.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      startTransition(async () => {
                        await deleteAccount();
                      });
                    }}
                    disabled={isPending}
                    className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    {isPending ? "Suppression…" : "Confirmer la suppression"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
