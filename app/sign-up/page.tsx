import Link from "next/link";
import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-fraunces text-xl font-semibold text-ink">
          naya
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta mb-2 ml-0.5" />
        </Link>
        <p className="text-sm text-mist">
          Déjà un compte ?{" "}
          <Link href="/sign-in" className="text-sage font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-fraunces text-3xl font-semibold text-ink mb-2">
              Créer votre compte
            </h1>
            <p className="text-mist text-sm">
              Commencez gratuitement, aucune carte requise
            </p>
          </div>
          <SignUpForm />
          <p className="text-center text-xs text-mist mt-6">
            Données hébergées en Europe • RGPD conforme
          </p>
        </div>
      </div>
    </div>
  );
}
