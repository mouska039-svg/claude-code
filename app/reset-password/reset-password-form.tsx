"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { resetPassword } from "@/server/actions/auth";

const schema = z
  .object({
    password: z.string().min(8, "8 caractères minimum"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const result = await resetPassword({ password: data.password });
    if (result?.error) {
      setServerError(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink" htmlFor="password">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-ink transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink" htmlFor="confirm">
          Confirmer le mot de passe
        </label>
        <input
          {...register("confirm")}
          id="confirm"
          type={showPassword ? "text" : "password"}
          placeholder="Répétez le mot de passe"
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
        />
        {errors.confirm && (
          <p className="text-xs text-destructive">{errors.confirm.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-sage py-2.5 text-sm font-medium text-white hover:bg-sage-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Réinitialiser le mot de passe
      </button>

      <div className="text-center">
        <Link href="/sign-in" className="text-sm text-sage hover:underline">
          ← Retour à la connexion
        </Link>
      </div>
    </form>
  );
}
