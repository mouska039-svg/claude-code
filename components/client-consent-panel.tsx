"use client";

import { useState, useTransition } from "react";
import { upsertConsent } from "@/server/actions/consent";
import type { ClientConsent } from "@/server/actions/consent";

type ConsentType = "data_processing" | "health_data" | "photo" | "marketing";

interface ConsentMeta {
  type: ConsentType;
  label: string;
  description: string;
  required?: boolean;
}

const CONSENT_ITEMS: ConsentMeta[] = [
  {
    type: "data_processing",
    label: "Traitement des données personnelles",
    description: "Collecte et traitement des informations d'identité et de contact.",
    required: true,
  },
  {
    type: "health_data",
    label: "Données de santé",
    description: "Conservation et traitement des données médicales et de bien-être.",
  },
  {
    type: "photo",
    label: "Photos / vidéos",
    description: "Utilisation de photos ou vidéos dans le cadre du suivi.",
  },
  {
    type: "marketing",
    label: "Communications",
    description: "Envoi d'informations et de conseils personnalisés par e-mail.",
  },
];

interface Props {
  clientId: string;
  initialConsents: ClientConsent[];
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default function ClientConsentPanel({ clientId, initialConsents }: Props) {
  const [consents, setConsents] = useState<Map<ConsentType, ClientConsent>>(
    () => new Map(initialConsents.map((c) => [c.consent_type as ConsentType, c]))
  );
  const [isPending, startTransition] = useTransition();
  const [pendingType, setPendingType] = useState<ConsentType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleToggle(type: ConsentType, currentGranted: boolean | undefined) {
    const newGranted = !(currentGranted ?? false);
    setPendingType(type);
    setErrorMsg(null);

    startTransition(async () => {
      // Optimistic update
      const now = new Date().toISOString();
      const existing = consents.get(type);
      const optimistic: ClientConsent = {
        id: existing?.id ?? "",
        client_id: clientId,
        practitioner_id: existing?.practitioner_id ?? "",
        consent_type: type,
        granted: newGranted,
        ip_address: existing?.ip_address ?? null,
        signed_at: newGranted ? now : (existing?.signed_at ?? null),
        revoked_at: newGranted ? null : now,
        created_at: existing?.created_at ?? now,
      };

      setConsents((prev) => new Map(prev).set(type, optimistic));

      const result = await upsertConsent(clientId, type, newGranted);

      if (result.error) {
        // Revert
        setConsents((prev) => {
          const next = new Map(prev);
          if (existing) {
            next.set(type, existing);
          } else {
            next.delete(type);
          }
          return next;
        });
        setErrorMsg(result.error);
      }

      setPendingType(null);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div>
        <h3 className="font-fraunces text-lg font-semibold text-ink">
          Gestion des consentements
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Conformément au RGPD, gérez ici les consentements de votre client.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      <ul className="divide-y divide-border">
        {CONSENT_ITEMS.map((item) => {
          const record = consents.get(item.type);
          const isGranted = record?.granted ?? false;
          const hasRecord = record !== undefined;
          const isLoading = isPending && pendingType === item.type;

          const statusLabel = !hasRecord
            ? "Non renseigné"
            : isGranted
              ? "Accordé"
              : "Refusé";

          const statusClass = isGranted
            ? "bg-sage/10 text-sage border-sage/20"
            : "bg-muted text-muted-foreground border-border";

          const actionDate = isGranted ? record?.signed_at : record?.revoked_at;

          return (
            <li key={item.type} className="py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-ink">{item.label}</span>
                  {item.required && (
                    <span className="text-xs text-terracotta font-medium">
                      Obligatoire
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {item.description}
                </p>
                {actionDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {isGranted ? "Accordé le" : "Révoqué le"} {formatDate(actionDate)}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleToggle(item.type, record?.granted)}
                className={`shrink-0 min-h-[36px] rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed ${
                  isGranted
                    ? "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                    : "bg-sage text-white hover:bg-sage/90"
                }`}
              >
                {isLoading ? "…" : isGranted ? "Révoquer" : "Accorder"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
