import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-fraunces text-xl font-semibold text-ink">
          naya
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta mb-2 ml-0.5" />
        </Link>
        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/sign-up" className="text-sage font-medium hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-fraunces text-3xl font-semibold text-foreground mb-2">
              Bon retour
            </h1>
            <p className="text-muted-foreground text-sm">
              Connectez-vous à votre espace Naya
            </p>
          </div>
          <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-xl" />}>
            <SignInForm />
          </Suspense>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Données hébergées en Europe • RGPD conforme
          </p>
        </div>
      </div>
    </div>
  );
}
