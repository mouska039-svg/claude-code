import type { NutritionInput } from "@/lib/ai/schemas/nutrition"

const GOAL_MAP: Record<NutritionInput["goal"], string> = {
  weight_loss: "perte de poids (déficit calorique)",
  maintenance: "maintien du poids actuel",
  muscle_gain: "prise de masse musculaire (surplus calorique)",
}

const PREF_MAP: Record<NutritionInput["preference"], string> = {
  omnivore: "omnivore (tous aliments)",
  vegetarian: "végétarien (pas de viande ni poisson)",
  vegan: "végan (aucun produit animal)",
  halal: "halal",
  kosher: "casher",
}

const ACTIVITY_MAP: Record<NonNullable<NutritionInput["activityLevel"]>, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

function calculateTDEE(input: NutritionInput): number | null {
  if (!input.age || !input.weight || !input.height || !input.sex || !input.activityLevel) {
    return null
  }
  // Mifflin-St Jeor
  const bmr =
    input.sex === "male"
      ? 10 * input.weight + 6.25 * input.height - 5 * input.age + 5
      : 10 * input.weight + 6.25 * input.height - 5 * input.age - 161
  return Math.round(bmr * ACTIVITY_MAP[input.activityLevel])
}

export function buildNutritionPrompt(input: NutritionInput): string {
  const tdee = calculateTDEE(input)
  const calories =
    input.targetCalories ??
    (tdee
      ? input.goal === "weight_loss"
        ? tdee - 500
        : input.goal === "muscle_gain"
          ? tdee + 300
          : tdee
      : 2000)

  return `Tu es un nutritionniste expert en performance sportive. Génère un plan nutritionnel complet sur 7 jours.

PARAMÈTRES :
- Objectif : ${GOAL_MAP[input.goal]}
- Calories cibles : ~${calories} kcal/jour
- Préférence alimentaire : ${PREF_MAP[input.preference]}
- Nombre de repas : ${input.mealsPerDay} repas par jour
${input.allergies ? `- Allergies / intolérances : ${input.allergies}` : ""}
${tdee ? `- TDEE calculé : ${tdee} kcal/jour` : ""}

CONSIGNES :
- Plan complet sur 7 jours avec variation (pas de copier-coller de journées)
- Pour chaque aliment : grammes précis, calories, protéines, glucides, lipides
- Totaux quotidiens cohérents avec la cible calorique (±10%)
- Macros cohérentes avec l'objectif (protéines élevées si prise de masse/perte)
- Aliments accessibles en France
- Liste de courses agrégée sur la semaine (unique, sans doublons)
- 3-5 conseils pratiques personnalisés

FORMAT : JSON strict conforme au schéma fourni.`
}
