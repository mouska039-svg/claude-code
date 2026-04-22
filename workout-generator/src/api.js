const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

async function callClaude(prompt, apiKey) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ||
    text.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) throw new Error("Impossible de parser la réponse JSON");
  return JSON.parse(jsonMatch[1]);
}

export async function generatePreview(userData, apiKey) {
  const prompt = `Tu es un coach sportif expert. Génère un aperçu de programme sportif personnalisé (semaine 1 uniquement) en JSON.

Profil :
- Prénom : ${userData.firstName}
- Objectif : ${userData.goal}
- Niveau : ${userData.level}
- Équipement : ${userData.equipment}
- Jours disponibles : ${userData.daysPerWeek} jours/semaine
- Âge : ${userData.age} ans
- Sexe : ${userData.gender}

Génère exactement ${Math.min(userData.daysPerWeek, 3)} séances pour la semaine 1.

Réponds UNIQUEMENT avec ce JSON (rien d'autre) :
\`\`\`json
{
  "programName": "Nom du programme",
  "weekObjective": "Objectif de la semaine en 1 phrase",
  "sessions": [
    {
      "day": "Lundi",
      "name": "Nom de la séance",
      "objective": "Objectif de la séance",
      "duration": "45 min",
      "exercises": [
        {
          "name": "Nom exercice",
          "sets": 3,
          "reps": "8-10",
          "rest": "90 sec",
          "tip": "Conseil technique court"
        }
      ]
    }
  ]
}
\`\`\``;

  return callClaude(prompt, apiKey);
}

export async function generateFullProgram(userData, apiKey) {
  const prompt = `Tu es un coach sportif expert. Génère un programme sportif complet sur 8 semaines en JSON structuré.

Profil :
- Prénom : ${userData.firstName}
- Objectif : ${userData.goal}
- Niveau : ${userData.level}
- Équipement : ${userData.equipment}
- Jours disponibles : ${userData.daysPerWeek} jours/semaine
- Âge : ${userData.age} ans
- Sexe : ${userData.gender}

Réponds UNIQUEMENT avec ce JSON (rien d'autre) :
\`\`\`json
{
  "programName": "Nom du programme",
  "totalWeeks": 8,
  "generalAdvice": "Conseil général en 2-3 phrases",
  "nutritionGuide": {
    "calories": "Conseil apport calorique",
    "protein": "Conseil protéines",
    "carbs": "Conseil glucides",
    "hydration": "Conseil hydratation",
    "timing": "Conseil timing repas/entraînement"
  },
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Thème de la semaine",
      "intensityLevel": "Modérée",
      "weeklyTips": "Conseil spécifique à cette semaine",
      "sessions": [
        {
          "day": "Lundi",
          "name": "Nom séance",
          "objective": "Objectif",
          "duration": "45 min",
          "exercises": [
            {
              "name": "Nom exercice",
              "sets": 3,
              "reps": "8-10",
              "rest": "90 sec",
              "load": "Modérée (60% 1RM)",
              "tip": "Conseil technique"
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

Génère les 8 semaines complètes avec ${userData.daysPerWeek} séances par semaine. Assure une progression croissante en charge/intensité semaine après semaine.`;

  return callClaude(prompt, apiKey);
}
