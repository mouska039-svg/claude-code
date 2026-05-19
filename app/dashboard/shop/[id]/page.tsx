import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import type { Database } from "@/types/supabase";
import DeleteProductButton from "./DeleteProductButton";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

async function getProduct(userId: string, productId: string): Promise<ProductRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("user_id", userId)
    .maybeSingle();
  return data as ProductRow | null;
}

const categoryLabel: Record<string, string> = {
  complément: "Complément",
  programme: "Programme",
  guide_pdf: "Guide PDF",
  autre: "Autre",
};

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { id } = await params;
  const product = await getProduct(user.id, id);

  if (!product) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm">
        <Link
          href="/dashboard/shop"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] py-2"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Boutique
        </Link>
        <span className="text-muted-foreground/50" aria-hidden="true">
          /
        </span>
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="flex items-start gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-fraunces text-2xl font-semibold text-ink leading-tight">
              {product.name}
            </h1>
            {product.category && (
              <span className="inline-flex items-center rounded-full bg-sage/10 px-2.5 py-0.5 text-xs font-medium text-sage shrink-0">
                {categoryLabel[product.category] ?? product.category}
              </span>
            )}
          </div>
          {product.brand && (
            <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/shop/${id}/edit`}
            className="inline-flex items-center min-h-[44px] rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Modifier
          </Link>
          <DeleteProductButton productId={id} />
        </div>
      </div>

      {product.image_url && (
        <div className="rounded-xl overflow-hidden bg-muted border border-border aspect-video max-h-72">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {!product.image_url && (
        <div className="rounded-xl bg-muted border border-border p-10 flex items-center justify-center">
          <ShoppingBag className="text-muted-foreground" size={48} aria-hidden="true" />
        </div>
      )}

      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Informations produit</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Nom</dt>
            <dd className="text-sm text-foreground mt-0.5">{product.name}</dd>
          </div>

          {product.category && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Catégorie</dt>
              <dd className="text-sm text-foreground mt-0.5">
                {categoryLabel[product.category] ?? product.category}
              </dd>
            </div>
          )}

          {product.brand && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Marque</dt>
              <dd className="text-sm text-foreground mt-0.5">{product.brand}</dd>
            </div>
          )}

          {product.dosage && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Dosage</dt>
              <dd className="text-sm text-foreground mt-0.5">{product.dosage}</dd>
            </div>
          )}

          <div>
            <dt className="text-xs font-medium text-muted-foreground">Prix de vente</dt>
            <dd className="text-sm text-foreground mt-0.5 font-medium">
              {formatPrice(product.retail_price)}
            </dd>
          </div>

          {product.practitioner_margin !== null && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Marge praticien
              </dt>
              <dd className="text-sm text-foreground mt-0.5">
                {product.practitioner_margin} %
              </dd>
            </div>
          )}

          {product.dropship_supplier && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Fournisseur dropship
              </dt>
              <dd className="text-sm text-foreground mt-0.5">
                {product.dropship_supplier}
              </dd>
            </div>
          )}

          {product.stripe_product_id && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Stripe Product ID
              </dt>
              <dd className="text-sm text-foreground mt-0.5 font-mono text-xs">
                {product.stripe_product_id}
              </dd>
            </div>
          )}

          <div>
            <dt className="text-xs font-medium text-muted-foreground">Ajouté le</dt>
            <dd className="text-sm text-foreground mt-0.5">
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(product.created_at))}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
