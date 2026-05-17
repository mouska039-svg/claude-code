-- ============================================================
-- Naya SaaS – Initial Schema Migration
-- ============================================================

-- ----------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- TABLE: profiles
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         text,
  avatar_url        text,
  locale            text        NOT NULL DEFAULT 'fr',
  specialty         text        CHECK (specialty IN ('naturopathe','sophrologue','hypnotherapeute','multi')),
  brand_name        text,
  brand_logo_url    text,
  brand_color       text,
  slogan            text,
  siret             text,
  rpps_or_adeli     text,
  address_json      jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: user reads own row"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: user updates own row"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- service_role bypass is implicit via the Supabase service role (bypassrls)

-- ================================================================
-- TABLE: subscriptions
-- ================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan                    text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free','cabinet','cabinet_plus')),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  status                  text        NOT NULL DEFAULT 'active',
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions: user reads own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- ================================================================
-- TABLE: usage_quotas
-- ================================================================
CREATE TABLE IF NOT EXISTS public.usage_quotas (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year_month              text        NOT NULL,  -- format YYYY-MM
  protocols_count         int         NOT NULL DEFAULT 0,
  audios_count            int         NOT NULL DEFAULT 0,
  company_programs_count  int         NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, year_month)
);

ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_quotas: user reads own"
  ON public.usage_quotas FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usage_quotas_user_id    ON public.usage_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_quotas_year_month ON public.usage_quotas(year_month);

-- ================================================================
-- TABLE: stripe_events
-- ================================================================
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id            text        PRIMARY KEY,
  processed_at  timestamptz NOT NULL DEFAULT now()
);

-- No user-level RLS; accessible by service role only.
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- (no permissive policies — only service_role can access)

-- ================================================================
-- TABLE: clients
-- ================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name             text        NOT NULL,
  email                 text,
  phone                 text,
  photo_url             text,
  birth_date            date,
  primary_concern       text,
  tags                  text[]      NOT NULL DEFAULT '{}',
  status                text        NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  client_portal_user_id uuid,       -- nullable, for client portal auth link
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients: practitioner full CRUD"
  ON public.clients FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_clients_user_id               ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status                ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_client_portal_user_id ON public.clients(client_portal_user_id);

-- ================================================================
-- TABLE: consent_records
-- ================================================================
CREATE TABLE IF NOT EXISTS public.consent_records (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_id         uuid        REFERENCES public.clients(id) ON DELETE SET NULL,
  document_version  text        NOT NULL,
  signed_at         timestamptz NOT NULL,
  ip                text,
  signature_url     text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_records: practitioner reads own"
  ON public.consent_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_consent_records_user_id   ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_client_id ON public.consent_records(client_id);

-- ================================================================
-- TABLE: anamneses
-- ================================================================
CREATE TABLE IF NOT EXISTS public.anamneses (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  version             int         NOT NULL DEFAULT 1,
  data                jsonb       NOT NULL,
  signed_consent_id   uuid        REFERENCES public.consent_records(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;

-- Practitioner who owns the client can CRUD
CREATE POLICY "anamneses: practitioner full CRUD"
  ON public.anamneses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = anamneses.client_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = anamneses.client_id
        AND c.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_anamneses_client_id ON public.anamneses(client_id);

-- ================================================================
-- TABLE: protocols
-- ================================================================
CREATE TABLE IF NOT EXISTS public.protocols (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             text        NOT NULL,
  inputs            jsonb       NOT NULL DEFAULT '{}',
  output            jsonb       NOT NULL DEFAULT '{}',
  duration_weeks    int         NOT NULL DEFAULT 4,
  status            text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "protocols: practitioner full CRUD"
  ON public.protocols FOR ALL
  USING (auth.uid() = practitioner_id)
  WITH CHECK (auth.uid() = practitioner_id);

CREATE INDEX IF NOT EXISTS idx_protocols_practitioner_id ON public.protocols(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_protocols_client_id       ON public.protocols(client_id);
CREATE INDEX IF NOT EXISTS idx_protocols_status          ON public.protocols(status);

-- ================================================================
-- TABLE: sessions
-- ================================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  practitioner_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date                  timestamptz NOT NULL,
  duration_min          int,
  type                  text        NOT NULL DEFAULT 'presentiel' CHECK (type IN ('presentiel','visio')),
  notes_practitioner    text,
  summary_client        text,
  next_steps            jsonb       NOT NULL DEFAULT '[]',
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions: practitioner full CRUD"
  ON public.sessions FOR ALL
  USING (auth.uid() = practitioner_id)
  WITH CHECK (auth.uid() = practitioner_id);

CREATE INDEX IF NOT EXISTS idx_sessions_practitioner_id ON public.sessions(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id       ON public.sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date            ON public.sessions(date);

-- ================================================================
-- TABLE: session_audios
-- ================================================================
CREATE TABLE IF NOT EXISTS public.session_audios (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid        NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  title         text        NOT NULL,
  audio_url     text        NOT NULL,
  duration_sec  int,
  transcript    text,
  generated_by  text        NOT NULL DEFAULT 'upload' CHECK (generated_by IN ('upload','elevenlabs')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_audios ENABLE ROW LEVEL SECURITY;

-- Practitioner who owns the session can CRUD
CREATE POLICY "session_audios: practitioner full CRUD"
  ON public.session_audios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_audios.session_id
        AND s.practitioner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_audios.session_id
        AND s.practitioner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_session_audios_session_id ON public.session_audios(session_id);

-- ================================================================
-- TABLE: client_check_ins
-- ================================================================
CREATE TABLE IF NOT EXISTS public.client_check_ins (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date            date        NOT NULL,
  mood            int         CHECK (mood BETWEEN 1 AND 5),
  sleep_quality   int         CHECK (sleep_quality BETWEEN 1 AND 5),
  energy          int         CHECK (energy BETWEEN 1 AND 5),
  notes           text,
  custom_metrics  jsonb       NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_check_ins ENABLE ROW LEVEL SECURITY;

-- Practitioner who owns the client can read
CREATE POLICY "client_check_ins: practitioner read"
  ON public.client_check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_check_ins.client_id
        AND c.user_id = auth.uid()
    )
  );

-- Client reads their own via client_portal_user_id
CREATE POLICY "client_check_ins: client portal read own"
  ON public.client_check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_check_ins.client_id
        AND c.client_portal_user_id = auth.uid()
    )
  );

-- Practitioner or client portal user can insert/update
CREATE POLICY "client_check_ins: practitioner write"
  ON public.client_check_ins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_check_ins.client_id
        AND (c.user_id = auth.uid() OR c.client_portal_user_id = auth.uid())
    )
  );

CREATE POLICY "client_check_ins: practitioner update"
  ON public.client_check_ins FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_check_ins.client_id
        AND c.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_client_check_ins_client_id ON public.client_check_ins(client_id);
CREATE INDEX IF NOT EXISTS idx_client_check_ins_date      ON public.client_check_ins(date);

-- ================================================================
-- TABLE: products
-- ================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                    uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                  text           NOT NULL,
  category              text,
  brand                 text,
  dosage                text,
  retail_price          numeric(10,2),
  practitioner_margin   numeric(5,2),
  image_url             text,
  dropship_supplier     text,
  stripe_product_id     text,
  created_at            timestamptz    NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products: user full CRUD"
  ON public.products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);

-- ================================================================
-- TABLE: product_recommendations
-- ================================================================
CREATE TABLE IF NOT EXISTS public.product_recommendations (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id   uuid        NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  product_id    uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity      int         NOT NULL DEFAULT 1,
  posology      text,
  duration_days int,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;

-- Practitioner who owns the protocol can CRUD
CREATE POLICY "product_recommendations: practitioner full CRUD"
  ON public.product_recommendations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.protocols p
      WHERE p.id = product_recommendations.protocol_id
        AND p.practitioner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.protocols p
      WHERE p.id = product_recommendations.protocol_id
        AND p.practitioner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_product_recommendations_protocol_id ON public.product_recommendations(protocol_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_product_id  ON public.product_recommendations(product_id);

-- ================================================================
-- TABLE: companies
-- ================================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  contact_name    text,
  contact_email   text,
  siret           text,
  employee_count  int,
  sector          text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies: user full CRUD"
  ON public.companies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);

-- ================================================================
-- TABLE: company_programs
-- ================================================================
CREATE TABLE IF NOT EXISTS public.company_programs (
  id                uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid           NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  practitioner_id   uuid           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             text           NOT NULL,
  format            text           NOT NULL DEFAULT 'workshop' CHECK (format IN ('workshop','individual_session','subscription')),
  sessions_count    int            NOT NULL DEFAULT 1,
  price_total       numeric(10,2),
  status            text           NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','proposal','signed','in_progress','completed')),
  start_date        date,
  end_date          date,
  created_at        timestamptz    NOT NULL DEFAULT now(),
  updated_at        timestamptz    NOT NULL DEFAULT now()
);

ALTER TABLE public.company_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_programs: practitioner full CRUD"
  ON public.company_programs FOR ALL
  USING (auth.uid() = practitioner_id)
  WITH CHECK (auth.uid() = practitioner_id);

CREATE INDEX IF NOT EXISTS idx_company_programs_practitioner_id ON public.company_programs(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_company_programs_company_id      ON public.company_programs(company_id);
CREATE INDEX IF NOT EXISTS idx_company_programs_status          ON public.company_programs(status);

-- ================================================================
-- TABLE: company_attendees
-- ================================================================
CREATE TABLE IF NOT EXISTS public.company_attendees (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id          uuid        NOT NULL REFERENCES public.company_programs(id) ON DELETE CASCADE,
  full_name           text        NOT NULL,
  email               text,
  attended_sessions   jsonb       NOT NULL DEFAULT '[]',
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_attendees ENABLE ROW LEVEL SECURITY;

-- Practitioner who owns the program can CRUD
CREATE POLICY "company_attendees: practitioner full CRUD"
  ON public.company_attendees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.company_programs cp
      WHERE cp.id = company_attendees.program_id
        AND cp.practitioner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_programs cp
      WHERE cp.id = company_attendees.program_id
        AND cp.practitioner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_company_attendees_program_id ON public.company_attendees(program_id);

-- ================================================================
-- TABLE: invoices
-- ================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id                        uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id                 uuid           REFERENCES public.clients(id) ON DELETE SET NULL,
  company_id                uuid           REFERENCES public.companies(id) ON DELETE SET NULL,
  amount                    numeric(10,2)  NOT NULL,
  vat                       numeric(10,2)  NOT NULL DEFAULT 0,
  items                     jsonb          NOT NULL DEFAULT '[]',
  pdf_url                   text,
  status                    text           NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  paid_at                   timestamptz,
  stripe_payment_intent_id  text,
  created_at                timestamptz    NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices: user full CRUD"
  ON public.invoices FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id    ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id  ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status     ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_paid_at    ON public.invoices(paid_at);

-- ================================================================
-- TABLE: share_tokens
-- ================================================================
CREATE TABLE IF NOT EXISTS public.share_tokens (
  token          text        PRIMARY KEY,
  resource_type  text        NOT NULL,
  resource_id    uuid        NOT NULL,
  expires_at     timestamptz NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Token-based access; no user-level RLS policies needed.
ALTER TABLE public.share_tokens ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_share_tokens_resource_id ON public.share_tokens(resource_id);
CREATE INDEX IF NOT EXISTS idx_share_tokens_expires_at  ON public.share_tokens(expires_at);

-- ================================================================
-- TABLE: ai_usage_log
-- ================================================================
CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id                  uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  model               text           NOT NULL,
  prompt_tokens       int            NOT NULL DEFAULT 0,
  completion_tokens   int            NOT NULL DEFAULT 0,
  cost_eur            numeric(10,6)  NOT NULL DEFAULT 0,
  feature             text           NOT NULL,
  created_at          timestamptz    NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_log: user reads own"
  ON public.ai_usage_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user_id    ON public.ai_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_created_at ON public.ai_usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_feature    ON public.ai_usage_log(feature);

-- ================================================================
-- TRIGGER: create profile + subscription on new user
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, locale)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'locale', 'fr')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- MATERIALIZED VIEW: revenue_dashboard
-- ================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.revenue_dashboard AS
SELECT
  p.id                                                          AS practitioner_id,
  p.full_name,
  p.brand_name,

  -- Total clients
  COUNT(DISTINCT c.id)                                         AS total_clients,

  -- Active protocols
  COUNT(DISTINCT pr.id) FILTER (
    WHERE pr.status = 'active'
  )                                                            AS active_protocols,

  -- Monthly revenue (invoices paid in the current calendar month)
  COALESCE(SUM(
    CASE
      WHEN i.status = 'paid'
        AND date_trunc('month', i.paid_at) = date_trunc('month', now())
      THEN i.amount + i.vat
      ELSE 0
    END
  ), 0)                                                        AS monthly_revenue,

  -- Total revenue (all paid invoices)
  COALESCE(SUM(
    CASE
      WHEN i.status = 'paid'
      THEN i.amount + i.vat
      ELSE 0
    END
  ), 0)                                                        AS total_revenue

FROM public.profiles p
LEFT JOIN public.clients  c  ON c.user_id         = p.id
LEFT JOIN public.protocols pr ON pr.practitioner_id = p.id
LEFT JOIN public.invoices  i  ON i.user_id         = p.id
GROUP BY p.id, p.full_name, p.brand_name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_dashboard_practitioner_id
  ON public.revenue_dashboard(practitioner_id);

-- Refresh helper (call from a cron job or after invoice updates)
CREATE OR REPLACE FUNCTION public.refresh_revenue_dashboard()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.revenue_dashboard;
$$;
