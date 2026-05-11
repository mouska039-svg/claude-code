"use client"

import { useState, useCallback } from "react"

interface GenerationState<T> {
  data: T | null
  loading: boolean
  error: string | null
  quotaExceeded: boolean
}

export function useGeneration<TInput, TOutput>(endpoint: string) {
  const [state, setState] = useState<GenerationState<TOutput>>({
    data: null,
    loading: false,
    error: null,
    quotaExceeded: false,
  })

  const generate = useCallback(
    async (input: TInput): Promise<{ id: string; data: TOutput } | null> => {
      setState({ data: null, loading: true, error: null, quotaExceeded: false })

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        })

        if (res.status === 429) {
          const body = await res.json()
          if (body.error === "QUOTA_EXCEEDED") {
            setState((s) => ({ ...s, loading: false, quotaExceeded: true }))
            return null
          }
        }

        if (!res.ok) {
          const body = await res.json()
          setState((s) => ({
            ...s,
            loading: false,
            error: body.error ?? "Erreur de génération",
          }))
          return null
        }

        const result = await res.json()
        setState({ data: result.data, loading: false, error: null, quotaExceeded: false })
        return result
      } catch {
        setState((s) => ({
          ...s,
          loading: false,
          error: "Erreur réseau, réessaie plus tard",
        }))
        return null
      }
    },
    [endpoint]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, quotaExceeded: false })
  }, [])

  return { ...state, generate, reset }
}
