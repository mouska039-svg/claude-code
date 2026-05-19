"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signUp } from "@/server/actions/auth";

const SPECIALTIES = [
  { value: "naturopathe", label: "Naturopathe" },
  { value: "sophrologue", label: "Sophrologue" },
  { value: "hypnotherapeute", label: "Hypnothérapeute" },
  { value: "multi", label: "Plusieurs spécialités" },
] as const;

const schema = z.object({
  full_name: z.string().min(2, "Nom requis (2 caractères minimum)"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  specialty: z.enum(["naturopathe", "sophrologue", "hypnotherapeute", "multi"]),
});

type FormData = z.infer<typeof schema>;

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { specialty: "naturopathe" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const result = await signUp(data);
    if (result?.error) {
      setServerError(result.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl bg-sage/10 border border-sage/20 p-6 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-sage/20 flex items-center justify-center mx-auto">
          <svg
            className="h-6 w-6 text-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="font-medium text-ink">Vérifiez votre email</h3>
        <p className="text-sm text-mist">
          Un lien de confirmation vous a été envoyé. Cliquez dessus pour activer votre
          compte Naya.
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
        <label className="text-sm font-medium text-ink" htmlFor="full_name">
          Nom complet
        </label>
        <input
          {...register("full_name")}
          id="full_name"
          type="text"
          placeholder="Marie Dupont"
          autoComplete="name"
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
        />
        {errors.full_name && (
          <p className="text-xs text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink" htmlFor="email">
          Email professionnel
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

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink" htmlFor="password">
          Mot de passe
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

      <div className="space-y-2">
        <label className="text-sm font-medium text-ink">Votre spécialité</label>
        <div className="grid grid-cols-2 gap-2">
          {SPECIALTIES.map((s) => (
            <label
              key={s.value}
              className="relative flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 hover:border-sage/40 hover:bg-accent transition-colors has-[:checked]:border-sage has-[:checked]:bg-sage/5"
            >
              <input
                {...register("specialty")}
                type="radio"
                value={s.value}
                className="accent-sage"
              />
              <span className="text-xs font-medium text-ink">{s.label}</span>
            </label>
          ))}
        </div>
        {errors.specialty && (
          <p className="text-xs text-destructive">{errors.specialty.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-sage py-2.5 text-sm font-medium text-white hover:bg-sage-600 focus:outline-none focus:ring-2 focus:ring-sage/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Créer mon compte
      </button>

      <p className="text-center text-xs text-mist">
        En créant un compte, vous acceptez nos{" "}
        <Link href="/cgv" className="text-sage hover:underline">
          CGU
        </Link>{" "}
        et notre{" "}
        <Link href="/politique-de-confidentialite" className="text-sage hover:underline">
          politique de confidentialité
        </Link>
      </p>
    </form>
  );
}
