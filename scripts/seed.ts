import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
  );
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function seed() {
  console.log("🌱 Démarrage du seed...");

  const email = "praticien-test@naya.app";
  const password = "TestNaya2026!";

  console.log("👤 Création du praticien test...");
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError && !authError.message.includes("already been registered")) {
    throw new Error(`Erreur création utilisateur: ${authError.message}`);
  }

  const userId = authData?.user?.id;
  if (!userId) {
    console.log("ℹ️  Utilisateur existant, récupération...");
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users?.users?.find((u) => u.email === email);
    if (!existing) throw new Error("Impossible de récupérer l'utilisateur");

    console.log(`✓ Praticien récupéré: ${existing.id}`);
    await runSeedForUser(existing.id);
    return;
  }

  console.log(`✓ Praticien créé: ${userId}`);

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: "Marie Dupont",
    specialty: "naturopathe",
    brand_name: "Cabinet Bien-Être",
    siret: "12345678901234",
  });

  if (profileError) {
    console.error("Erreur profil:", profileError.message);
  } else {
    console.log("✓ Profil créé");
  }

  await runSeedForUser(userId);
}

async function runSeedForUser(userId: string) {
  console.log("👥 Création des clients...");

  const clients: Database["public"]["Tables"]["clients"]["Insert"][] = [
    {
      user_id: userId,
      full_name: "Sophie Martin",
      email: "sophie.martin@example.com",
      phone: "0612345678",
      birth_date: "1985-03-15",
      primary_concern: "Fatigue chronique et troubles du sommeil",
      tags: ["fatigue", "sommeil"],
      status: "active",
    },
    {
      user_id: userId,
      full_name: "Pierre Leclerc",
      email: "pierre.leclerc@example.com",
      phone: "0623456789",
      birth_date: "1972-07-22",
      primary_concern: "Gestion du stress professionnel",
      tags: ["stress", "anxiété"],
      status: "active",
    },
    {
      user_id: userId,
      full_name: "Isabelle Renard",
      email: "isabelle.renard@example.com",
      phone: "0634567890",
      birth_date: "1990-11-08",
      primary_concern: "Rééquilibrage alimentaire",
      tags: ["nutrition", "poids"],
      status: "active",
    },
  ];

  const { data: createdClients, error: clientsError } = await supabase
    .from("clients")
    .insert(clients)
    .select();

  if (clientsError) {
    console.error("Erreur clients:", clientsError.message);
  } else {
    console.log(`✓ ${createdClients?.length ?? 0} clients créés`);
  }

  const firstClientId = createdClients?.[0]?.id;
  if (!firstClientId) {
    console.log("⚠️  Pas de client pour créer le protocole");
    return;
  }

  console.log("📋 Création du protocole test...");

  const { error: protocolError } = await supabase.from("protocols").insert({
    client_id: firstClientId,
    practitioner_id: userId,
    title: "Protocole Fatigue — Sophie Martin",
    inputs: {
      symptoms: ["fatigue chronique", "insomnie", "irritabilité"],
      lifestyle: "sédentaire, stress élevé",
    },
    output: {
      recommendations: [
        "Complémentation magnésium bisglycinate",
        "Phytothérapie : valériane le soir",
        "Routine sommeil : coucher avant 22h",
      ],
      duration: "8 semaines",
    },
    duration_weeks: 8,
    status: "active",
  });

  if (protocolError) {
    console.error("Erreur protocole:", protocolError.message);
  } else {
    console.log("✓ Protocole créé");
  }

  console.log("✅ Seed terminé avec succès");
  console.log(`\nCompte test: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log("Email: praticien-test@naya.app");
  console.log("Mot de passe: TestNaya2026!");
}

async function main() {
  try {
    await seed();
  } catch (err) {
    console.error("❌ Erreur seed:", err);
    process.exit(1);
  }
}

main();
