"use client";

import Link from "next/link";

interface QuotaGuardProps {
  quotaType: "protocols" | "audios" | "company_programs";
  used: number;
  limit: number | null;
}

const QUOTA_LABELS: Record<QuotaGuardProps["quotaType"], string> = {
  protocols: "protocoles",
  audios: "audios",
  company_programs: "programmes entreprise",
};

export function QuotaGuard({ quotaType, used, limit }: QuotaGuardProps) {
  const label = QUOTA_LABELS[quotaType];
  const isExhausted = limit !== null && used >= limit;
  const percentage = limit !== null ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="rounded-xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {limit === null ? (
            <span>
              {used} {label} ce mois-ci
            </span>
          ) : (
            <span>
              {used} / {limit} {label} utilisés ce mois-ci
            </span>
          )}
        </p>
        {limit !== null && (
          <span className="text-xs text-muted-foreground">{percentage}%</span>
        )}
      </div>

      {limit !== null && (
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isExhausted
                ? "bg-destructive"
                : percentage >= 80
                  ? "bg-terracotta"
                  : "bg-sage"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isExhausted && (
        <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2.5 space-y-2">
          <p className="text-sm text-destructive font-medium">
            Quota atteint pour ce mois
          </p>
          <p className="text-xs text-destructive/80">
            Passez à un plan supérieur pour continuer à générer des {label}.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center rounded-lg bg-destructive text-white px-3 py-1.5 text-xs font-medium hover:bg-destructive/90 transition-colors"
          >
            Mettre à niveau →
          </Link>
        </div>
      )}
    </div>
  );
}
