"use client";

import { useEffect, useRef, useState } from "react";

interface OnboardingQrButtonProps {
  clientId: string;
  clientName: string;
}

export function OnboardingQrButton({ clientId, clientName }: OnboardingQrButtonProps) {
  const [open, setOpen] = useState(false);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/onboarding-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = (await res.json()) as { qrSvg: string; url: string; step: number };
      setQrSvg(data.qrSvg);
      setOnboardingUrl(data.url);
      setStep(data.step);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Polling for step progress (every 3s while modal is open)
  useEffect(() => {
    if (!open || !onboardingUrl) return;

    const token = onboardingUrl.split("/").pop();
    if (!token) return;

    intervalRef.current = setInterval(async () => {
      const res = await fetch(`/api/portal/onboarding-progress/${token}`);
      const data = (await res.json()) as { step: number; completed: boolean };
      setStep(data.step);
      if (data.completed && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, onboardingUrl]);

  const stepLabels = [
    "En attente",
    "Bienvenue",
    "App installée",
    "Notifs activées",
    "Terminé ✓",
  ];

  return (
    <>
      <button
        onClick={generate}
        disabled={loading}
        className="inline-flex items-center gap-2 min-h-[44px] rounded-lg border border-sage/30
                   bg-sage/5 px-4 text-sm font-medium text-sage hover:bg-sage/10
                   disabled:opacity-50 transition-colors"
      >
        {loading ? "Génération…" : "🔗 Démarrer en cabinet"}
      </button>

      {open && qrSvg && onboardingUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-cream p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-fraunces text-lg font-semibold text-ink">
                Onboarding de {clientName}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground text-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Progression */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-sage" : "bg-muted/30"}`}
                />
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {stepLabels[step]}
            </p>

            {/* QR */}
            <div className="flex justify-center bg-white rounded-xl p-4 border border-muted/20">
              <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="w-48 h-48" />
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Montrez ce QR code à {clientName} pour qu&apos;il/elle scanne avec son
              téléphone
            </p>

            <a
              href={onboardingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-sage hover:underline truncate"
            >
              {onboardingUrl}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
