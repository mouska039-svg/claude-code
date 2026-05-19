"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <p className="font-fraunces text-8xl font-semibold text-terracotta">!</p>
        <h1 className="font-fraunces text-2xl font-semibold text-ink">
          Une erreur est survenue
        </h1>
        <p className="text-muted-foreground text-sm">
          Quelque chose s&apos;est mal passé. Réessayez ou contactez le support.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-sage text-white px-5 py-2.5 text-sm font-medium hover:bg-sage/90 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
