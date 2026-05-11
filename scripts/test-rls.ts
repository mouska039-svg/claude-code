/**
 * RLS policy tester — verifies that Row Level Security is correctly enforced
 * Usage: npx tsx scripts/test-rls.ts
 *
 * Creates two test users and ensures user A cannot read user B's data.
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !serviceKey || !anonKey) {
  console.error("Missing env vars")
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let passed = 0
let failed = 0

function ok(label: string) {
  console.log(`  ✅ ${label}`)
  passed++
}

function fail(label: string, detail?: string) {
  console.error(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`)
  failed++
}

async function createTestUser(email: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "testpassword123",
    email_confirm: true,
  })
  if (error) throw new Error(`Could not create user ${email}: ${error.message}`)
  return data.user!
}

async function getAuthClient(email: string) {
  const client = createClient(supabaseUrl, anonKey)
  const { error } = await client.auth.signInWithPassword({ email, password: "testpassword123" })
  if (error) throw new Error(`Could not sign in as ${email}: ${error.message}`)
  return client
}

async function cleanup(userIds: string[]) {
  for (const id of userIds) {
    await admin.auth.admin.deleteUser(id)
  }
}

async function run() {
  console.log("🔒 Testing RLS policies...\n")

  const emailA = `rls-test-a-${Date.now()}@fitcoach.test`
  const emailB = `rls-test-b-${Date.now()}@fitcoach.test`

  let userAId = ""
  let userBId = ""

  try {
    const userA = await createTestUser(emailA)
    const userB = await createTestUser(emailB)
    userAId = userA.id
    userBId = userB.id

    const clientA = await getAuthClient(emailA)
    const clientB = await getAuthClient(emailB)

    // Seed data as admin for user A
    await admin.from("workout_programs").insert({
      user_id: userAId,
      title: "Program A",
      inputs: {},
      output: {},
    })

    await admin.from("clients").insert({
      user_id: userAId,
      full_name: "Client of A",
    })

    await admin.from("nutrition_plans").insert({
      user_id: userAId,
      title: "Nutrition A",
      inputs: {},
      output: {},
    })

    console.log("workout_programs RLS:")
    // User A can read own programs
    const { data: aProgs } = await clientA.from("workout_programs").select("id").eq("user_id", userAId)
    aProgs && aProgs.length > 0 ? ok("User A can read own programs") : fail("User A cannot read own programs")

    // User B cannot read user A's programs
    const { data: bProgs } = await clientB.from("workout_programs").select("id").eq("user_id", userAId)
    bProgs && bProgs.length === 0 ? ok("User B cannot read user A's programs") : fail("User B can read user A's programs — RLS BROKEN")

    console.log("\nclients RLS:")
    const { data: aClients } = await clientA.from("clients").select("id").eq("user_id", userAId)
    aClients && aClients.length > 0 ? ok("User A can read own clients") : fail("User A cannot read own clients")

    const { data: bClients } = await clientB.from("clients").select("id").eq("user_id", userAId)
    bClients && bClients.length === 0 ? ok("User B cannot read user A's clients") : fail("User B can read user A's clients — RLS BROKEN")

    console.log("\nnutrition_plans RLS:")
    const { data: aNutrition } = await clientA.from("nutrition_plans").select("id").eq("user_id", userAId)
    aNutrition && aNutrition.length > 0 ? ok("User A can read own nutrition plans") : fail("User A cannot read own nutrition plans")

    const { data: bNutrition } = await clientB.from("nutrition_plans").select("id").eq("user_id", userAId)
    bNutrition && bNutrition.length === 0 ? ok("User B cannot read user A's nutrition plans") : fail("User B can read user A's nutrition plans — RLS BROKEN")

    console.log("\nprofiles RLS:")
    // User A can read own profile
    const { data: aProfile } = await clientA.from("profiles").select("id").eq("id", userAId)
    aProfile && aProfile.length > 0 ? ok("User A can read own profile") : fail("User A cannot read own profile")

    // User B cannot update user A's profile
    const { error: updateErr } = await clientB.from("profiles").update({ full_name: "Hacked" }).eq("id", userAId)
    updateErr ? ok("User B cannot update user A's profile") : fail("User B updated user A's profile — RLS BROKEN")

    console.log("\nWrite isolation:")
    // User B cannot insert a program with user_id = A
    const { error: insertErr } = await clientB.from("workout_programs").insert({
      user_id: userAId,
      title: "Injected",
      inputs: {},
      output: {},
    })
    insertErr ? ok("User B cannot insert program as user A") : fail("User B inserted program as user A — RLS BROKEN")

  } finally {
    await cleanup([userAId, userBId].filter(Boolean))
    console.log("\n🧹 Test users cleaned up")
  }

  console.log(`\n${"─".repeat(40)}`)
  console.log(`Results: ${passed} passed, ${failed} failed`)

  if (failed > 0) {
    console.error("\n⚠️  Some RLS policies are not properly enforced!")
    process.exit(1)
  } else {
    console.log("\n✅ All RLS policies are correctly enforced.")
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
