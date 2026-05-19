"use client";

import { useState, useTransition } from "react";
import { generatePortalLink } from "@/server/actions/portal";
import { ExternalLink, Copy, Check, Loader2 } from "lucide-react";

export function ClientPortalButton({ clientId }: { clientId: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generatePortalLink(clientId);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        setLink(result.url);
      }
    });
  }

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (link) {
    return (
      <div className="rounded-xl bg-card border border-border p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Lien d&apos;accès client</p>
        <p className="text-xs text-muted-foreground">
          Valable 30 jours. Partagez ce lien avec votre client.
        </p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 rounded-lg border border-input bg-muted px-3 py-2 text-xs text-foreground truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-sage text-white px-3 py-2 text-xs font-medium hover:bg-sage/90 transition-colors min-h-[36px] shrink-0"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copié !" : "Copier"}
          </button>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-muted transition-colors min-h-[36px]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <button
          onClick={() => {
            setLink(null);
            handleGenerate();
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Générer un nouveau lien
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        onClick={handleGenerate}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors min-h-[44px] disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
        {isPending ? "Génération…" : "Générer le lien portail client"}
      </button>
    </div>
  );
}
