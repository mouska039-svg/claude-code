import type { WorkoutInput } from "@/lib/ai/schemas/workout"

const GOAL_MAP: Record<WorkoutInput["goal"], string> = {
  strength: "développement de la force maximale",
  hypertrophy: "hypertrophie musculaire (prise de masse)",
  weight_loss: "perte de poids et tonification",
  endurance: "endurance musculaire et cardiovasculaire",
  general: "remise en forme générale",
}

const LEVEL_MAP: Record<WorkoutInput["level"], string> = {
  beginner: "débutant (moins d'1 an d'expérience)",
  intermediate: "intermédiaire (1-3 ans d'expérience)",
  advanced: "avancé (plus de 3 ans d'expérience)",
}

export function buildWorkoutPrompt(input: WorkoutInput): string {
  return `Tu es un coach fitness expert. Génère un programme d'entraînement structuré et professionnel.

PARAMÈTRES CLIENT :
- Objectif : ${GOAL_MAP[input.goal]}
- Niveau : ${LEVEL_MAP[input.level]}
- Fréquence : ${input.frequency} séances par semaine
- Durée par séance : ${input.sessionDuration} minutes
- Équipement disponible : ${input.equipment.join(", ")}
${input.injuries ? `- Blessures / restrictions : ${input.injuries}` : ""}
${input.clientName ? `- Nom du client : ${input.clientName}` : ""}

CONSIGNES :
- Crée un programme de 4 semaines (progressif)
- Chaque séance doit respecter strictement la durée impartie
- Varie les exercices pour éviter la monotonie
- Inclus échauffement et récupération dans le compte
- Sets, reps et repos adaptés à l'objectif et au niveau
- Tempo uniquement pour les exercices où c'est pertinent
- Notes d'exécution pour les exercices techniques
- Vue d'ensemble (overview) expliquant la logique du programme
- Notes de progression entre les semaines

FORMAT : JSON strict conforme au schéma fourni.`
}
