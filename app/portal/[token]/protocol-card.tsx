"use client";

import { useState } from "react";
import type { Database } from "@/types/supabase";
import type { Json } from "@/types/supabase";

type ProtocolRow = Database["public"]["Tables"]["protocols"]["Row"];
type Specialty = Database["public"]["Tables"]["profiles"]["Row"]["specialty"];

interface ProtocolStep {
  week?: string;
  recommendations?: string[];
}

interface ProtocolContent {
  summary?: string;
  disclaimer?: string;
  steps?: string[] | ProtocolStep[];
  recommendations?: string[];
  duration_weeks?: number;
}

function parseContent(output: Json): ProtocolContent {
  if (typeof output === "object" && output !== null && !Array.isArray(output)) {
    return output as ProtocolContent;
  }
  return {};
}

function flattenItems(content: ProtocolContent): string[] {
  const raw = content.steps ?? content.recommendations ?? [];
  if (raw.length === 0) return [];
  // If steps are objects { week, recommendations }, flatten all recommendations
  if (typeof raw[0] === "object" && raw[0] !== null && !Array.isArray(raw[0])) {
    return (raw as ProtocolStep[]).flatMap((s) => s.recommendations ?? []);
  }
  return raw as string[];
}

function SpecialtyBadge({ specialty }: { specialty: Specialty }) {
  if (!specialty) return null;

  const config: Record<NonNullable<Specialty>, { label: string; className: string }> = {
    naturopathe: {
      label: "Naturopathe",
      className: "bg-sage/10 text-sage-700",
    },
    sophrologue: {
      label: "Sophrologue",
      className: "bg-blue-50 text-blue-700",
    },
    hypnotherapeute: {
      label: "Hypnothérapeute",
      className: "bg-purple-50 text-purple-700",
    },
    multi: {
      label: "Bien-être",
      className: "bg-terracotta/10 text-terracotta-700",
    },
  };

  const { label, className } = config[specialty];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

export function ProtocolCard({
  protocol,
  specialty,
}: {
  protocol: ProtocolRow;
  specialty: Specialty;
}) {
  const [expanded, setExpanded] = useState(false);
  const content = parseContent(protocol.output);
  const items = flattenItems(content);
  const visibleItems = expanded ? items : items.slice(0, 2);
  const hasMore = items.length > 2;

  return (
    <div className="rounded-2xl bg-card border border-sage/10 p-5 space-y-3 shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-ink text-base leading-snug">{protocol.title}</h3>
        {protocol.duration_weeks > 0 && (
          <span className="shrink-0 text-xs font-medium text-sage bg-sage/10 rounded-full px-2.5 py-0.5">
            {protocol.duration_weeks} sem.
          </span>
        )}
      </div>

      {/* Specialty badge */}
      <SpecialtyBadge specialty={specialty} />

      {/* Summary */}
      {content.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed">{content.summary}</p>
      )}

      {/* Steps / recommendations */}
      {items.length > 0 && (
        <div className="space-y-2">
          <ul className="space-y-1.5">
            {visibleItems.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-sage/60" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          {hasMore && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-sm font-medium text-sage hover:text-sage/80 min-h-[44px] flex items-center transition-colors"
            >
              {expanded ? "Réduire ↑" : `Voir tout (${items.length - 2} de plus)`}
            </button>
          )}
        </div>
      )}

      {/* Date */}
      <p className="text-xs text-muted-foreground pt-1">
        Débuté le{" "}
        {new Intl.DateTimeFormat("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(protocol.created_at))}
      </p>

      {/* Disclaimer */}
      {content.disclaimer && (
        <p className="text-xs italic text-muted-foreground border-t border-border/60 pt-3 leading-relaxed">
          {content.disclaimer}
        </p>
      )}
    </div>
  );
}
