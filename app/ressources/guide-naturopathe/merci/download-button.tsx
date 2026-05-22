"use client";

import { Download } from "lucide-react";

export function DownloadGuideButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-sage text-white px-4 py-2.5 text-sm font-medium min-h-[44px] hover:bg-sage/90 transition-colors"
    >
      <Download className="h-4 w-4" />
      Télécharger le guide (PDF)
    </button>
  );
}
