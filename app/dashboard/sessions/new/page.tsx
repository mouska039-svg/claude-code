import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";
import { NewSessionForm } from "./new-session-form";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default async function NewSessionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("full_name", { ascending: true });

  const clients = (data ?? []) as ClientRow[];

  return <NewSessionForm clients={clients} />;
}
