"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle } from "lucide-react";
import { forgotPassword } from "@/server/actions/auth";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const result = await forgotPassword(data);
    if (result?.error) {
      setServerError(result.error);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl bg-sage/10 border border-sage/20 p-6 text-center space-y-3">
        <CheckCircle className="h-10 w-10 text-sage mx-auto" />
        <h3 className="font-medium text-ink">Vérifiez votre boîte email</h3>
        <p className="text-sm text-mist">
          Un lien de réinitialisation vous a été envoyé. Il expire dans 1 heure.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink" htmlFor="email">
          Email
        </label>
        <input
          {...register("email")}
          id="email"
          type="email"
          placeholder="vous@exemple.fr"
          autoComplete="email"
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-sage py-2.5 text-sm font-medium text-white hover:bg-sage-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Envoyer le lien
      </button>
    </form>
  );
}
