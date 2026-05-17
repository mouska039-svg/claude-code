"use client";
import { useState } from "react";
import { createPortalSession } from "@/server/actions/stripe";

interface PortalButtonProps {
  label?: string;
  className?: string;
}

export function PortalButton({
  label = "Gérer mon abonnement",
  className,
}: PortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const result = await createPortalSession();
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className={
          className ??
          "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        }
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Chargement…
          </>
        ) : (
          label
        )}
      </button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
