"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/server/actions/products";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result?.error) {
        setError(result.error);
        setShowConfirm(false);
      } else {
        router.push("/dashboard/shop");
      }
    });
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            "Confirmer"
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="inline-flex items-center justify-center min-h-[44px] rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-lg border border-red-200 bg-red-50 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-100 transition-colors"
    >
      <Trash2 size={14} aria-hidden="true" />
      Supprimer
    </button>
  );
}
