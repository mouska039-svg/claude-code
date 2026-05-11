import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

function createRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

const redis = createRedis()

function createLimiter(tokens: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!redis) return null
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(tokens, window) })
}

// 10 AI generations per 10 minutes per user
const aiLimiter = createLimiter(10, "10 m")

// 5 login attempts per 15 minutes per IP
const loginLimiter = createLimiter(5, "15 m")

// 3 signups per hour per IP
const signupLimiter = createLimiter(3, "1 h")

export async function checkAiRateLimit(userId: string): Promise<NextResponse | null> {
  if (!aiLimiter) return null
  const { success, limit, remaining, reset } = await aiLimiter.limit(`ai:${userId}`)
  if (!success) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessaie dans quelques minutes." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    )
  }
  return null
}

export async function checkLoginRateLimit(ip: string): Promise<NextResponse | null> {
  if (!loginLimiter) return null
  const { success } = await loginLimiter.limit(`login:${ip}`)
  if (!success) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie dans 15 minutes." }, { status: 429 })
  }
  return null
}

export async function checkSignupRateLimit(ip: string): Promise<NextResponse | null> {
  if (!signupLimiter) return null
  const { success } = await signupLimiter.limit(`signup:${ip}`)
  if (!success) {
    return NextResponse.json({ error: "Trop d'inscriptions depuis cette adresse. Réessaie dans 1 heure." }, { status: 429 })
  }
  return null
}
