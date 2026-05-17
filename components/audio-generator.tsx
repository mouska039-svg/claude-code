"use client";
import { useState } from "react";
import { generateAudio } from "@/server/actions/audio";

export function AudioGenerator({ sessionId }: { sessionId: string }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;
    setError(null);
    setIsPending(true);
    try {
      const result = await generateAudio(sessionId, text, title);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        setAudioUrl(result.url);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {audioUrl ? (
        <div className="space-y-3">
          <p className="text-sm text-sage font-medium">Audio généré avec succès</p>
          <audio controls src={audioUrl} className="w-full" />
          <button
            onClick={() => {
              setAudioUrl(null);
              setTitle("");
              setText("");
            }}
            className="text-sm text-muted-foreground underline underline-offset-2"
          >
            Générer un autre audio
          </button>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Titre
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Relaxation guidée — séance 1"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Script audio
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Installez-vous confortablement…"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={isPending || !title.trim() || !text.trim()}
            className="rounded-lg bg-sage text-white px-5 py-2 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Génération en cours…" : "Générer l'audio"}
          </button>
        </form>
      )}
    </div>
  );
}
