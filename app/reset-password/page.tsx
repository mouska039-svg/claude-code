import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center px-6 py-4">
        <Link href="/" className="font-fraunces text-xl font-semibold text-ink">
          naya
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta mb-2 ml-0.5" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-fraunces text-3xl font-semibold text-ink mb-2">
              Nouveau mot de passe
            </h1>
            <p className="text-mist text-sm">
              Choisissez un nouveau mot de passe sécurisé
            </p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
