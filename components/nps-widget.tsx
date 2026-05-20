"use client";

import { useState, useEffect } from "react";
import { submitNps } from "@/server/actions/nps";

interface NpsWidgetProps {
  initialStatus: { responded: boolean; score?: number };
}

export function NpsWidget({ initialStatus }: NpsWidgetProps) {
  const [dismissed, setDismissed] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setDismissed(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  if (initialStatus.responded || dismissed) {
    return null;
  }

  function getScoreColor(score: number): string {
    if (score <= 6) return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
    if (score <= 8)
      return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
    return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
  }

  function getScoreSelectedColor(score: number): string {
    if (score <= 6) return "bg-red-500 text-white border-red-500";
    if (score <= 8) return "bg-yellow-500 text-white border-yellow-500";
    return "bg-green-500 text-white border-green-500";
  }

  async function handleSubmit() {
    if (selectedScore === null) return;
    setSubmitting(true);
    setError(null);

    const result = await submitNps(selectedScore, comment.trim() || undefined);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 sm:pb-6">
      <div className="w-full max-w-lg rounded-2xl border border-sage/20 bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-0">
          {submitted ? (
            <p className="text-sm font-medium text-foreground">
              Merci pour votre retour ! 🌿
            </p>
          ) : (
            <p className="text-sm font-medium text-foreground leading-snug pr-2">
              Comment recommanderiez-vous Naya à un·e collègue ?
            </p>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 flex-shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {!submitted && (
          <div className="p-4 pt-3 space-y-3">
            {/* Score labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pas du tout</span>
              <span>Tout à fait</span>
            </div>

            {/* Score buttons */}
            <div className="flex gap-1 justify-between">
              {Array.from({ length: 11 }, (_, i) => i).map((score) => {
                const isSelected = selectedScore === score;
                return (
                  <button
                    key={score}
                    onClick={() => setSelectedScore(score)}
                    className={`flex-1 rounded-md border py-1.5 text-xs font-semibold transition-colors ${
                      isSelected ? getScoreSelectedColor(score) : getScoreColor(score)
                    }`}
                    aria-label={`Note ${score}`}
                    aria-pressed={isSelected}
                  >
                    {score}
                  </button>
                );
              })}
            </div>

            {/* Comment + Submit — shown after score selection */}
            {selectedScore !== null && (
              <div className="space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Un commentaire ? (optionnel)"
                  maxLength={500}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-muted/30 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30"
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Envoi…" : "Envoyer"}
                </button>
              </div>
            )}
          </div>
        )}

        {submitted && (
          <div className="px-4 pb-4 pt-1">
            <p className="text-xs text-muted-foreground">
              Votre avis nous aide à améliorer Naya. Cette fenêtre se fermera
              automatiquement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
