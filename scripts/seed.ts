/**
 * Seed script — creates demo data for development
 * Usage: npx tsx scripts/seed.ts
 *
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log("🌱 Seeding demo data...")

  // Create demo user
  const email = "demo@fitcoach.ai"
  const password = "demo123456"

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError && !authError.message.includes("already been registered")) {
    console.error("Auth error:", authError.message)
    process.exit(1)
  }

  const userId = authData?.user?.id
  if (!userId) {
    // Try to get existing user
    const { data: existing } = await supabase.auth.admin.listUsers()
    const found = existing?.users?.find((u) => u.email === email)
    if (!found) {
      console.error("Could not find or create demo user")
      process.exit(1)
    }
    console.log("Demo user already exists:", email)
    return
  }

  console.log("✅ Demo user created:", email)

  // Update profile with branding
  await supabase.from("profiles").upsert({
    id: userId,
    full_name: "Coach Demo",
    brand_name: "Elite Fitness",
    brand_color: "#6366f1",
    slogan: "Transform Your Body, Transform Your Life",
  })

  // Seed 2 clients
  const { data: clients } = await supabase
    .from("clients")
    .insert([
      {
        user_id: userId,
        full_name: "Marie Dupont",
        email: "marie@example.com",
        goal: "Perte de poids",
        tags: ["débutante", "cardio"],
      },
      {
        user_id: userId,
        full_name: "Thomas Martin",
        email: "thomas@example.com",
        goal: "Prise de masse",
        tags: ["intermédiaire", "musculation"],
      },
    ])
    .select("id")

  if (clients) {
    console.log("✅ Clients created:", clients.length)

    // Add measurements for first client
    const clientId = clients[0]?.id
    if (clientId) {
      await supabase.from("client_measurements").insert([
        { client_id: clientId, date: "2026-01-01", weight: 72.5, body_fat: 28 },
        { client_id: clientId, date: "2026-02-01", weight: 70.2, body_fat: 26 },
        { client_id: clientId, date: "2026-03-01", weight: 68.8, body_fat: 24 },
        { client_id: clientId, date: "2026-04-01", weight: 67.1, body_fat: 22 },
      ])
      console.log("✅ Measurements seeded")

      await supabase.from("client_notes").insert([
        {
          client_id: clientId,
          content: "Très motivée, progresse bien. Augmenter la fréquence cardio à 3x/semaine.",
        },
        {
          client_id: clientId,
          content: "A eu une blessure au genou droit — adapter les exercices jambes.",
        },
      ])
      console.log("✅ Notes seeded")
    }
  }

  // Seed a workout program
  const demoProgram = {
    title: "Programme Force 4 semaines",
    durationWeeks: 4,
    overview: "Programme de force sur 4 semaines avec focus sur les mouvements composés.",
    weeks: [
      {
        weekNumber: 1,
        days: [
          {
            name: "Lundi — Push",
            focus: "Poitrine & Épaules",
            exercises: [
              { name: "Développé couché", sets: 4, reps: "5", rest: "3min" },
              { name: "Développé militaire", sets: 3, reps: "6", rest: "2min" },
              { name: "Dips lestés", sets: 3, reps: "8", rest: "2min" },
            ],
          },
        ],
      },
    ],
    progressionNotes: "Augmenter le poids de 2.5kg par semaine sur les exercices principaux.",
  }

  const { data: program } = await supabase
    .from("workout_programs")
    .insert({
      user_id: userId,
      title: demoProgram.title,
      inputs: { goal: "strength", level: "intermediate", frequency: 4, equipment: ["barbell"], sessionDuration: 60 },
      output: demoProgram,
    })
    .select("id")
    .single()

  if (program) console.log("✅ Workout program seeded:", program.id)

  console.log("\n🎉 Seed complete!")
  console.log(`\n📧 Login: ${email}`)
  console.log(`🔑 Password: ${password}`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
