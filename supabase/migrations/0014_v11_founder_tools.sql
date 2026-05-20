-- NPS responses
CREATE TABLE IF NOT EXISTS nps_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)  -- one NPS per user (can be updated)
);
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON nps_responses USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Feature requests / kanban cards
CREATE TABLE IF NOT EXISTS feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog','in_progress','done','cancelled')),
  priority integer NOT NULL DEFAULT 0,
  votes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
-- Admins can do everything (via service role / admin client, bypasses RLS)
-- Regular users can only read
CREATE POLICY "all_read" ON feature_requests FOR SELECT USING (true);
