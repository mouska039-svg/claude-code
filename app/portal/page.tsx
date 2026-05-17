"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PortalLandingPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = token.trim();
    if (t) {
      router.push(`/portal/${t}`);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-fraunces text-3xl font-semibold text-ink">Naya</h1>
          <p className="text-sm text-muted-foreground">
            Votre espace bien-être personnel
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="font-fraunces text-xl font-semibold text-ink">
              Accéder à mon espace
            </h2>
            <p className="text-sm text-muted-foreground">
              Entrez le code d&apos;accès fourni par votre praticien pour consulter vos
              protocoles et séances.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="token" className="text-sm font-medium text-foreground">
                Code d&apos;accès
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Collez votre code ici"
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!token.trim()}
              className="w-full rounded-lg bg-sage px-4 py-2.5 text-sm font-medium text-white hover:bg-sage/90 transition-colors disabled:opacity-50"
            >
              Accéder à mon espace
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Votre espace Naya vous est fourni par votre praticien de bien-être.
        </p>
      </div>
    </div>
  );
}
