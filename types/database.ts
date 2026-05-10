export type PlanType = "free" | "pro" | "premium"
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "incomplete"
export type ResourceType = "program" | "nutrition" | "content"
export type ContentType = "caption_ig" | "hook_tiktok" | "reel_idea" | "cta" | "viral_hook"
export type ContentTone = "motivating" | "professional" | "aggressive" | "luxury"

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  locale: string
  brand_name: string | null
  brand_logo_url: string | null
  brand_color: string
  slogan: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: PlanType
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface UsageQuota {
  id: string
  user_id: string
  year_month: string
  programs_count: number
  nutrition_count: number
  content_count: number
  created_at: string
  updated_at: string
}

export interface WorkoutProgram {
  id: string
  user_id: string
  title: string
  inputs: Record<string, unknown>
  output: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface NutritionPlan {
  id: string
  user_id: string
  title: string
  inputs: Record<string, unknown>
  output: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SocialContent {
  id: string
  user_id: string
  type: ContentType
  tone: ContentTone
  topic: string
  variants: string[]
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  full_name: string
  email: string | null
  phone: string | null
  photo_url: string | null
  goal: string | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ClientAssignment {
  id: string
  client_id: string
  program_id: string | null
  nutrition_id: string | null
  assigned_at: string
}

export interface ClientMeasurement {
  id: string
  client_id: string
  date: string
  weight: number | null
  body_fat: number | null
  measurements: Record<string, number>
  created_at: string
}

export interface ClientFile {
  id: string
  client_id: string
  storage_path: string
  name: string
  size: number
  mime: string
  created_at: string
}

export interface ClientNote {
  id: string
  client_id: string
  content: string
  created_at: string
}

export interface ShareToken {
  token: string
  resource_type: ResourceType
  resource_id: string
  user_id: string
  expires_at: string
  created_at: string
}

export interface StripeEvent {
  id: string
  processed_at: string
}

export interface AiUsageLog {
  id: string
  user_id: string
  generator_type: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  model: string
  created_at: string
}
