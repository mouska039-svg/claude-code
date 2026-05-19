"use client";

import { useState, useTransition, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { updateProduct } from "@/server/actions/products";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setProduct(data as ProductRow | null);
          setLoading(false);
        });
    });
  }, [params.id]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", params.id);
    setError(null);
    startTransition(async () => {
      const result = await updateProduct(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Produit introuvable.</p>
        <Link
          href="/dashboard/shop"
          className="text-sage hover:underline text-sm mt-2 inline-block"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav aria-label="Fil d'Ariane">
        <Link
          href={`/dashboard/shop/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] py-2"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Retour au produit
        </Link>
      </nav>

      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">
          Modifier le produit
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{product.name}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            Informations générales
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nom du produit{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(requis)</span>
            </label>
            <input
              name="name"
              required
              defaultValue={product.name}
              placeholder="Ex : Magnésium Bisglycinate 300mg"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Catégorie
              </label>
              <select
                name="category"
                defaultValue={product.category ?? ""}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              >
                <option value="">Choisir…</option>
                <option value="complément">Complément</option>
                <option value="programme">Programme</option>
                <option value="guide_pdf">Guide PDF</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Marque
              </label>
              <input
                name="brand"
                defaultValue={product.brand ?? ""}
                placeholder="Ex : Nutri & Co"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Dosage
            </label>
            <input
              name="dosage"
              defaultValue={product.dosage ?? ""}
              placeholder="Ex : 2 gélules / jour"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Prix de vente (€)
              </label>
              <input
                name="retail_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product.retail_price ?? ""}
                placeholder="29.90"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Marge praticien (%)
              </label>
              <input
                name="practitioner_margin"
                type="number"
                min="0"
                max="100"
                step="0.1"
                defaultValue={product.practitioner_margin ?? ""}
                placeholder="20"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            Détails supplémentaires
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              URL de l&apos;image
            </label>
            <input
              name="image_url"
              type="url"
              defaultValue={product.image_url ?? ""}
              placeholder="https://…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fournisseur dropship
            </label>
            <input
              name="dropship_supplier"
              defaultValue={product.dropship_supplier ?? ""}
              placeholder="Ex : Fullwell"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-lg bg-sage text-white px-5 py-2.5 text-sm font-medium hover:bg-sage/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                Enregistrement…
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/shop/${params.id}`)}
            className="inline-flex items-center justify-center min-h-[44px] rounded-lg border border-input bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
