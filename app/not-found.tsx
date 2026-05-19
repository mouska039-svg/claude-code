import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <p className="font-fraunces text-8xl font-semibold text-sage">404</p>
        <h1 className="font-fraunces text-2xl font-semibold text-ink">
          Page introuvable
        </h1>
        <p className="text-muted-foreground text-sm">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg bg-sage text-white px-5 py-2.5 text-sm font-medium hover:bg-sage/90 transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
