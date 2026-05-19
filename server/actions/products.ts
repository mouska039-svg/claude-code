"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const productSchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis"),
  category: z.string().optional().or(z.literal("")),
  brand: z.string().optional().or(z.literal("")),
  dosage: z.string().optional().or(z.literal("")),
  retail_price: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v !== "" ? parseFloat(v) : null)),
  practitioner_margin: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v !== "" ? parseFloat(v) : null)),
  image_url: z.string().url("URL invalide").optional().or(z.literal("")),
  dropship_supplier: z.string().optional().or(z.literal("")),
});

export async function createProduct(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    brand: formData.get("brand"),
    dosage: formData.get("dosage"),
    retail_price: formData.get("retail_price"),
    practitioner_margin: formData.get("practitioner_margin"),
    image_url: formData.get("image_url"),
    dropship_supplier: formData.get("dropship_supplier"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase.from("products").insert({
    user_id: user.id,
    name: parsed.data.name,
    category: parsed.data.category || null,
    brand: parsed.data.brand || null,
    dosage: parsed.data.dosage || null,
    retail_price: parsed.data.retail_price,
    practitioner_margin: parsed.data.practitioner_margin,
    image_url: parsed.data.image_url || null,
    dropship_supplier: parsed.data.dropship_supplier || null,
  });

  if (error) {
    return { error: "Erreur lors de la création du produit" };
  }

  redirect("/dashboard/shop");
}

export async function updateProduct(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const id = formData.get("id") as string;
  if (!id) return { error: "ID produit manquant" };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    brand: formData.get("brand"),
    dosage: formData.get("dosage"),
    retail_price: formData.get("retail_price"),
    practitioner_margin: formData.get("practitioner_margin"),
    image_url: formData.get("image_url"),
    dropship_supplier: formData.get("dropship_supplier"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      category: parsed.data.category || null,
      brand: parsed.data.brand || null,
      dosage: parsed.data.dosage || null,
      retail_price: parsed.data.retail_price,
      practitioner_margin: parsed.data.practitioner_margin,
      image_url: parsed.data.image_url || null,
      dropship_supplier: parsed.data.dropship_supplier || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erreur lors de la mise à jour du produit" };
  }

  redirect(`/dashboard/shop/${id}`);
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erreur lors de la suppression du produit" };
  }

  return { error: undefined };
}

export async function getProducts(): Promise<ProductRow[]> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as ProductRow[];
}
