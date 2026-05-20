-- Lead magnet email subscribers
-- Captures emails from public lead magnet pages before any auth

CREATE TABLE IF NOT EXISTS lead_magnet_subscribers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL,
  source     text        NOT NULL DEFAULT 'guide-naturopathe',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, source)
);

-- RLS enabled — only the service role (admin client) may access this table.
-- No user-facing policies are defined intentionally.
ALTER TABLE lead_magnet_subscribers ENABLE ROW LEVEL SECURITY;
