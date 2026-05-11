import { checkQuota, incrementQuota } from "@/lib/quotas"

type QuotaType = "programs" | "nutrition" | "content"

export async function withQuotaCheck<T>(
  userId: string,
  type: QuotaType,
  fn: () => Promise<T>
): Promise<T> {
  const { allowed, limit, plan } = await checkQuota(userId, type)

  if (!allowed) {
    throw new QuotaExceededError(type, plan, limit)
  }

  const result = await fn()

  // Increment after successful generation
  await incrementQuota(userId, type)

  return result
}

export class QuotaExceededError extends Error {
  constructor(
    public readonly type: QuotaType,
    public readonly plan: string,
    public readonly limit: number | null
  ) {
    super(`Quota dépassé pour ${type}. Plan ${plan}, limite : ${limit ?? "illimité"}/mois`)
    this.name = "QuotaExceededError"
  }
}
