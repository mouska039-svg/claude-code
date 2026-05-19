"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PortalLandingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if ?token= is present
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      const extracted = extractToken(tokenParam);
      if (extracted) {
        router.replace(`/portal/${extracted}`);
      }
    }
  }, [searchParams, router]);

  function extractToken(value: string): string {
    // Accept full URL like https://…/portal/abc123 or just the token
    const trimmed = value.trim();
    const portalMatch = trimmed.match(/\/portal\/([^/?#]+)/);
    if (portalMatch) return portalMatch[1];
    return trimmed;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = extractToken(input);
    if (!token) return;
    setIsLoading(true);
    router.push(`/portal/${token}`);
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-4 py-12 pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-1">
          <p className="font-fraunces text-4xl font-semibold text-ink tracking-tight">
            naya
            <span className="text-terracotta">.</span>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-6">
          {/* Headline */}
          <div className="space-y-1.5 text-center">
            <h1 className="font-fraunces text-3xl font-semibold text-ink leading-tight">
              Votre espace bien-être
            </h1>
            <p className="text-base text-muted-foreground">
              Accédez à vos protocoles et séances
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Collez votre lien d'accès…"
              required
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base text-ink placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-sage/40 transition-shadow"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-full h-12 rounded-xl bg-sage text-base font-medium text-white hover:bg-sage/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Chargement…" : "Accéder"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          🔒 Lien sécurisé · Données hébergées en Europe
        </p>
      </div>
    </div>
  );
}

export default function PortalLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-cream flex items-center justify-center">
          <p className="font-fraunces text-4xl font-semibold text-ink tracking-tight">
            naya<span className="text-terracotta">.</span>
          </p>
        </div>
      }
    >
      <PortalLandingForm />
    </Suspense>
  );
}
