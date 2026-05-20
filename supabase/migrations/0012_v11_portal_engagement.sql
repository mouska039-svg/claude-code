-- ============================================================
-- v1.1 Migration 0012 — Portal engagement (push, points, onboarding)
-- ============================================================

-- ----------------------------------------------------------------
-- TABLE: push_subscriptions
-- Stocke les abonnements push web (VAPID) des clients du portail
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  endpoint      text        NOT NULL UNIQUE,
  keys_p256dh   text        NOT NULL,
  keys_auth     text        NOT NULL,
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_client_id ON public.push_subscriptions(client_id);

-- ----------------------------------------------------------------
-- TABLE: client_points
-- Score total de points par client (une ligne par client)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_points (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid        NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  total_points  integer     NOT NULL DEFAULT 0,
  level         text        NOT NULL DEFAULT 'graine'
                            CHECK (level IN ('graine', 'pousse', 'fleur', 'arbre')),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_points ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_client_points_client_id ON public.client_points(client_id);

-- ----------------------------------------------------------------
-- TABLE: client_point_events
-- Historique des événements qui ont généré des points
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_point_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  event_type    text        NOT NULL,  -- 'checkin', 'audio_complete', 'streak_7d', 'cure_complete'
  points        integer     NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_point_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_client_point_events_client_id ON public.client_point_events(client_id);
CREATE INDEX IF NOT EXISTS idx_client_point_events_created_at ON public.client_point_events(created_at);

-- ----------------------------------------------------------------
-- TABLE: onboarding_sessions
-- Suivi de l'avancement de l'onboarding QR par client
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboarding_sessions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  token         text        NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  step          integer     NOT NULL DEFAULT 0,  -- 0=bienvenue, 1=pwa, 2=notifs, 3=checkin, 4=terminé
  completed     boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_token     ON public.onboarding_sessions(token);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_client_id ON public.onboarding_sessions(client_id);
