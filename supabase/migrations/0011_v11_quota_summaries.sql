-- ============================================================
-- v1.1 Migration 0011 — Quota summaries + Protocol cache
-- ============================================================

-- ----------------------------------------------------------------
-- Ajouter summaries_count à usage_quotas
-- ----------------------------------------------------------------
ALTER TABLE public.usage_quotas
  ADD COLUMN IF NOT EXISTS summaries_count integer NOT NULL DEFAULT 0;

-- ----------------------------------------------------------------
-- TABLE: protocol_cache
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.protocol_cache (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key        text        NOT NULL UNIQUE,
  protocol_output  jsonb       NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  expires_at       timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  hit_count        integer     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_protocol_cache_key        ON public.protocol_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_protocol_cache_expires_at ON public.protocol_cache(expires_at);
