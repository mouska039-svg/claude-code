"use client";
import { useState } from "react";
import { createCheckoutSession } from "@/server/actions/stripe";

interface UpgradeButtonProps {
  plan: "cabinet" | "cabinet_plus";
  billing?: "monthly" | "annual";
  label?: string;
  className?: string;
}

export function UpgradeButton({
  plan,
  billing = "monthly",
  label = "Mettre à niveau",
  className,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const result = await createCheckoutSession(plan, billing);
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
          "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sage text-white px-4 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        }
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Chargement…
          </>
        ) : (
          label
        )}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
