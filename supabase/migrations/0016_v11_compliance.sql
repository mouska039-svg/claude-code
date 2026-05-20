-- ============================================================
-- 0016_v11_compliance.sql — Lot 8 "Conformité renforcée"
-- ============================================================

-- Per-client consent tracking (consent_type-based)
-- NOTE: consent_records already exists for document-signing.
--       client_consents is the new per-type consent ledger.
CREATE TABLE IF NOT EXISTS public.client_consents (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type     text        NOT NULL CHECK (consent_type IN ('data_processing', 'health_data', 'photo', 'marketing')),
  granted          boolean     NOT NULL DEFAULT false,
  ip_address       text,
  signed_at        timestamptz,
  revoked_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, practitioner_id, consent_type)
);

ALTER TABLE public.client_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_consents: practitioner_all"
  ON public.client_consents
  USING (auth.uid() = practitioner_id)
  WITH CHECK (auth.uid() = practitioner_id);

CREATE INDEX IF NOT EXISTS idx_client_consents_client_id
  ON public.client_consents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_consents_practitioner_id
  ON public.client_consents(practitioner_id);

-- -------------------------------------------------------
-- Data deletion requests
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at     timestamptz NOT NULL DEFAULT now(),
  processed_at     timestamptz,
  status           text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed'))
);

ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deletion_requests: practitioner_all"
  ON public.deletion_requests
  USING (auth.uid() = practitioner_id)
  WITH CHECK (auth.uid() = practitioner_id);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_client_id
  ON public.deletion_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_practitioner_id
  ON public.deletion_requests(practitioner_id);
