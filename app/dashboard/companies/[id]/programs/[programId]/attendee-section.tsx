"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { addAttendee, updateProgramStatus } from "@/server/actions/company-programs";
import type { Database } from "@/types/supabase";

type CompanyAttendeeRow = Database["public"]["Tables"]["company_attendees"]["Row"];
type CompanyProgramStatus =
  Database["public"]["Tables"]["company_programs"]["Row"]["status"];

const statusActionLabels: Partial<Record<CompanyProgramStatus, string>> = {
  proposal: "Passer en proposition",
  signed: "Marquer signé",
  in_progress: "Démarrer le programme",
  completed: "Marquer terminé",
};

interface AttendeeSectionProps {
  programId: string;
  attendees: CompanyAttendeeRow[];
  companyId: string;
  nextStatus?: CompanyProgramStatus;
  currentStatus?: CompanyProgramStatus;
}

export default function AttendeeSection({
  programId,
  attendees: initialAttendees,
  companyId,
  nextStatus,
  currentStatus: _currentStatus,
}: AttendeeSectionProps) {
  const [isPendingAdd, startAddTransition] = useTransition();
  const [isPendingStatus, startStatusTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const router = useRouter();

  function handleAddAttendee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    startAddTransition(async () => {
      const result = await addAttendee(programId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        form.reset();
        router.refresh();
      }
    });
  }

  function handleStatusUpdate() {
    if (!nextStatus) return;
    setStatusError(null);
    startStatusTransition(async () => {
      const result = await updateProgramStatus(programId, nextStatus);
      if (result?.error) {
        setStatusError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {nextStatus && (
        <div className="rounded-xl bg-card border border-border p-4">
          {statusError && <p className="text-sm text-red-600 mb-3">{statusError}</p>}
          <button
            onClick={handleStatusUpdate}
            disabled={isPendingStatus}
            className="rounded-lg bg-terracotta text-white px-4 py-2 text-sm font-medium hover:bg-terracotta/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPendingStatus
              ? "Mise à jour…"
              : (statusActionLabels[nextStatus] ?? "Avancer le statut")}
          </button>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Participants ({initialAttendees.length})
        </h2>

        {initialAttendees.length > 0 && (
          <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
            {initialAttendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {attendee.full_name}
                  </p>
                  {attendee.email && (
                    <p className="text-xs text-muted-foreground">{attendee.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Ajouter un participant
          </h3>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <form onSubmit={handleAddAttendee} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  name="full_name"
                  required
                  minLength={2}
                  placeholder="Marie Dupont"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="marie@acme.fr"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isPendingAdd}
              className="rounded-lg bg-sage text-white px-4 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isPendingAdd ? "Ajout…" : "Ajouter"}
            </button>
          </form>
        </div>
      </div>

      <div className="pt-2">
        <a
          href={`/dashboard/companies/${companyId}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour à l&apos;entreprise
        </a>
      </div>
    </div>
  );
}
