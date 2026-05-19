"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-sage text-white px-4 py-2 text-sm font-medium shadow-md hover:bg-sage/90 transition-colors"
    >
      Télécharger PDF
    </button>
  );
}
