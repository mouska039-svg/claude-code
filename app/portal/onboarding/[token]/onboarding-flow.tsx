"use client";

import { useState } from "react";
import Link from "next/link";

interface OnboardingFlowProps {
  token: string;
  clientId: string;
  initialStep: number;
  practitionerName: string;
  clientFirstName: string;
}

async function updateStep(token: string, step: number) {
  await fetch(`/api/portal/onboarding-progress/${token}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step }),
  });
}

export function OnboardingFlow({
  token,
  clientId,
  initialStep,
  practitionerName,
  clientFirstName,
}: OnboardingFlowProps) {
  const [step, setStep] = useState(initialStep);
  const [checking, setChecking] = useState(false);

  const advance = async (nextStep: number) => {
    setStep(nextStep);
    await updateStep(token, nextStep);
  };

  const doCheckin = async () => {
    setChecking(true);
    try {
      await fetch("/api/portal/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      await advance(4);
    } finally {
      setChecking(false);
    }
  };

  if (step === 0) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 space-y-8 text-center">
        <div className="text-6xl">🌱</div>
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-ink">
            Bienvenue, {clientFirstName}
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {practitionerName} vous accompagne sur Naya pour structurer votre parcours
            bien-être.
          </p>
        </div>
        <button
          onClick={() => advance(1)}
          className="w-full min-h-[52px] rounded-2xl bg-sage text-white font-medium text-base"
        >
          Commencer →
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 space-y-8">
        <div className="text-center">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="font-fraunces text-2xl font-semibold text-ink">
            Installer l&apos;app
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajoutez Naya à votre écran d&apos;accueil pour un accès rapide.
          </p>
        </div>
        <div className="rounded-xl bg-card border border-sage/10 p-4 space-y-3 text-sm">
          <p className="font-medium text-ink">Sur iPhone (Safari)</p>
          <p className="text-muted-foreground">
            Appuyez sur <span className="font-mono">⬆︎</span> puis &laquo; Sur l&apos;écran
            d&apos;accueil &raquo;
          </p>
          <hr className="border-border/40" />
          <p className="font-medium text-ink">Sur Android (Chrome)</p>
          <p className="text-muted-foreground">
            Appuyez sur ⋮ puis &laquo; Ajouter à l&apos;écran d&apos;accueil &raquo;
          </p>
        </div>
        <button
          onClick={() => advance(2)}
          className="w-full min-h-[52px] rounded-2xl bg-sage text-white font-medium text-base"
        >
          C&apos;est fait →
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 space-y-8 text-center">
        <div className="text-5xl">🔔</div>
        <div>
          <h2 className="font-fraunces text-2xl font-semibold text-ink">
            Rappels quotidiens
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Activez les notifications pour votre check-in quotidien. Cela prend 2 minutes
            et vous aide à progresser.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={async () => {
              if ("Notification" in window) {
                await Notification.requestPermission();
              }
              await advance(3);
            }}
            className="w-full min-h-[52px] rounded-2xl bg-sage text-white font-medium text-base"
          >
            Activer les rappels
          </button>
          <button
            onClick={() => advance(3)}
            className="w-full min-h-[44px] text-sm text-muted-foreground"
          >
            Passer cette étape
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 space-y-8 text-center">
        <div className="text-5xl">✍️</div>
        <div>
          <h2 className="font-fraunces text-2xl font-semibold text-ink">
            Premier check-in
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Prenez une grande inspiration. Comment vous sentez-vous aujourd&apos;hui ?
          </p>
        </div>
        <button
          onClick={doCheckin}
          disabled={checking}
          className="w-full min-h-[52px] rounded-2xl bg-terracotta text-white font-medium text-base disabled:opacity-50"
        >
          {checking ? "Enregistrement…" : "Je me check-in 🌱"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12 space-y-8 text-center">
      <div className="text-6xl">🌳</div>
      <div>
        <h2 className="font-fraunces text-2xl font-semibold text-ink">
          Vous êtes prêt·e !
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Votre parcours Naya démarre. {practitionerName} est informé·e de votre
          connexion.
        </p>
      </div>
      <Link
        href="/portal"
        className="flex items-center justify-center w-full min-h-[52px] rounded-2xl bg-sage text-white font-medium text-base"
      >
        Accéder à mon espace
      </Link>
    </div>
  );
}
