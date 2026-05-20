"use client";

import { useState, useTransition, useRef } from "react";
import { previewImport, importClients } from "@/server/actions/import-clients";
import type {
  ImportSource,
  ParsedClient,
  ImportResult,
} from "@/server/actions/import-clients";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const SOURCES: { id: ImportSource; label: string; hint: string }[] = [
  {
    id: "itiaki",
    label: "Itiaki",
    hint: "Export CSV depuis Paramètres → Export des données",
  },
  {
    id: "jupiterre",
    label: "Jupi'Terre",
    hint: "Export CSV depuis Mon compte → Exporter mes clients",
  },
  {
    id: "maddie",
    label: "Maddie",
    hint: "Export CSV depuis Réglages → Clients → Exporter",
  },
  {
    id: "csv",
    label: "CSV générique",
    hint: "Tout fichier CSV avec colonnes : nom, email, téléphone…",
  },
];

function SourceCard({
  source,
  selected,
  onSelect,
}: {
  source: (typeof SOURCES)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-colors ${
        selected
          ? "border-sage bg-sage/5 ring-1 ring-sage/30"
          : "border-border bg-card hover:bg-muted/30"
      }`}
    >
      <p className="text-sm font-semibold text-ink">{source.label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{source.hint}</p>
    </button>
  );
}

function PreviewTable({ rows }: { rows: ParsedClient[] }) {
  const shown = rows.slice(0, 5);
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/30">
          <tr>
            {["Nom", "Email", "Téléphone", "Naissance", "Motif"].map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 text-left font-medium text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {shown.map((row, i) => (
            <tr key={i} className="bg-card">
              <td className="px-3 py-2 text-ink font-medium truncate max-w-[140px]">
                {row.full_name}
              </td>
              <td className="px-3 py-2 text-muted-foreground truncate max-w-[140px]">
                {row.email ?? "—"}
              </td>
              <td className="px-3 py-2 text-muted-foreground">{row.phone ?? "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.birth_date ?? "—"}</td>
              <td className="px-3 py-2 text-muted-foreground truncate max-w-[120px]">
                {row.primary_concern ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 5 && (
        <p className="px-3 py-2 text-xs text-muted-foreground bg-muted/20 border-t border-border/50">
          +{rows.length - 5} autres clients à importer
        </p>
      )}
    </div>
  );
}

export default function ImportPage() {
  const [source, setSource] = useState<ImportSource>("csv");
  const [step, setStep] = useState<"pick" | "preview" | "done">("pick");
  const [rows, setRows] = useState<ParsedClient[] | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleParse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }
    if (file.size > 5_000_000) {
      setError("Le fichier est trop volumineux (max 5 Mo).");
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (!content) {
        setError("Impossible de lire le fichier.");
        return;
      }
      const fd = new FormData();
      fd.set("source", source);
      fd.set("content", content);

      startTransition(async () => {
        const res = await previewImport(fd);
        if (res.error) {
          setError(res.error);
        } else {
          setRows(res.rows ?? []);
          setStep("preview");
        }
      });
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleImport = () => {
    if (!rows) return;
    startTransition(async () => {
      const res = await importClients(rows);
      if (res.error) {
        setError(res.error);
      } else {
        setResult(res.result ?? null);
        setStep("done");
      }
    });
  };

  const reset = () => {
    setStep("pick");
    setRows(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] py-2"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Paramètres
        </Link>
      </nav>

      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">
          Importer vos clients
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Transférez vos clients depuis votre ancien logiciel en quelques secondes.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1 — pick source + upload */}
      {step === "pick" && (
        <form onSubmit={handleParse} className="space-y-6">
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              Depuis quel logiciel ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SOURCES.map((s) => (
                <SourceCard
                  key={s.id}
                  source={s}
                  selected={source === s.id}
                  onSelect={() => setSource(s.id)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Votre fichier CSV</h2>
            <p className="text-sm text-muted-foreground">
              Exportez d&apos;abord vos clients depuis votre logiciel, puis déposez le
              fichier ici. Maximum 200 clients par import.
            </p>
            <label className="block">
              <span className="sr-only">Sélectionner le fichier CSV</span>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="block w-full text-sm text-muted-foreground
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-medium file:bg-sage/10 file:text-sage
                  hover:file:bg-sage/15 file:cursor-pointer cursor-pointer"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full min-h-[48px] rounded-xl bg-sage text-white text-sm font-medium
                       disabled:opacity-50 hover:bg-sage/90 transition-colors"
          >
            {isPending ? "Analyse en cours…" : "Analyser le fichier →"}
          </button>
        </form>
      )}

      {/* Step 2 — preview */}
      {step === "preview" && rows && (
        <div className="space-y-5">
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                Aperçu — {rows.length} client{rows.length > 1 ? "s" : ""} détecté
                {rows.length > 1 ? "s" : ""}
              </h2>
              <span className="text-xs text-muted-foreground bg-sage/10 text-sage rounded-full px-2.5 py-0.5 font-medium">
                {SOURCES.find((s) => s.id === source)?.label}
              </span>
            </div>
            <PreviewTable rows={rows} />
            <p className="text-xs text-muted-foreground">
              Les clients dont l&apos;email est déjà dans Naya seront ignorés
              (dédoublonnage automatique).
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              disabled={isPending}
              className="flex-1 min-h-[48px] rounded-xl border border-input bg-card text-sm font-medium
                         hover:bg-muted transition-colors disabled:opacity-50"
            >
              ← Modifier
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={isPending}
              className="flex-1 min-h-[48px] rounded-xl bg-sage text-white text-sm font-medium
                         disabled:opacity-50 hover:bg-sage/90 transition-colors"
            >
              {isPending
                ? "Import en cours…"
                : `Importer ${rows.length} client${rows.length > 1 ? "s" : ""} →`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — done */}
      {step === "done" && result && (
        <div className="space-y-5">
          <div className="rounded-xl bg-card border border-border p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="text-5xl">🌱</div>
              <h2 className="font-fraunces text-2xl font-semibold text-ink">
                Import terminé
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-sage/5 border border-sage/20 p-4 text-center">
                <p className="text-2xl font-semibold text-sage">{result.inserted}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  importé{result.inserted > 1 ? "s" : ""}
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 border border-border p-4 text-center">
                <p className="text-2xl font-semibold text-muted-foreground">
                  {result.skipped}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ignoré{result.skipped > 1 ? "s" : ""} (doublons)
                </p>
              </div>
              {result.errors.length > 0 && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
                  <p className="text-2xl font-semibold text-red-600">
                    {result.errors.length}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    erreur{result.errors.length > 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-1">
                <p className="text-xs font-medium text-red-700">Clients non importés :</p>
                <ul className="text-xs text-red-600 space-y-0.5">
                  {result.errors.map((name) => (
                    <li key={name}>• {name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/clients"
              className="flex-1 min-h-[48px] rounded-xl bg-sage text-white text-sm font-medium
                         flex items-center justify-center hover:bg-sage/90 transition-colors"
            >
              Voir mes clients →
            </Link>
            <button
              type="button"
              onClick={reset}
              className="flex-1 min-h-[48px] rounded-xl border border-input bg-card text-sm font-medium
                         hover:bg-muted transition-colors"
            >
              Nouvel import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
