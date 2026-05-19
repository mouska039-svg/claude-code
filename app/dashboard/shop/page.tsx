import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Database } from "@/types/supabase";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

async function getProducts(userId: string): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as ProductRow[];
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

export default async function ShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const products = await getProducts(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-ink">Boutique</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {products.length} produit{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/shop/new"
          className="inline-flex items-center gap-2 min-h-[44px] rounded-lg bg-sage text-white px-4 py-2.5 text-sm font-medium hover:bg-sage/90 transition-colors shrink-0"
        >
          + Ajouter un produit
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <ShoppingBag className="text-muted-foreground" size={28} aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Aucun produit pour l&apos;instant
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Commencez par ajouter votre premier produit
            </p>
          </div>
          <Link
            href="/dashboard/shop/new"
            className="inline-flex items-center gap-2 min-h-[44px] rounded-lg bg-sage text-white px-5 py-2.5 text-sm font-medium hover:bg-sage/90 transition-colors"
          >
            Ajouter votre premier produit
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/shop/${product.id}`}
              className="rounded-xl bg-card border border-border p-5 hover:bg-muted/40 transition-colors space-y-3 flex flex-col"
            >
              {product.image_url ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                  <ShoppingBag
                    className="text-muted-foreground"
                    size={32}
                    aria-hidden="true"
                  />
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground leading-snug">
                    {product.name}
                  </p>
                  {product.category && (
                    <span className="shrink-0 inline-flex items-center rounded-full bg-sage/10 px-2 py-0.5 text-xs font-medium text-sage">
                      {categoryLabel[product.category] ?? product.category}
                    </span>
                  )}
                </div>

                {product.brand && (
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                )}

                {product.dosage && (
                  <p className="text-xs text-muted-foreground">{product.dosage}</p>
                )}
              </div>

              <div className="pt-1 border-t border-border">
                <p className="text-base font-semibold text-ink">
                  {formatPrice(product.retail_price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
