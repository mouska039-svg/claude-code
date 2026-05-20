-- Migration 0013 : Programme de parrainage / ambassadrices (v1.1)

-- Table des codes de parrainage (un code par utilisateur)
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,         -- ex. "CELINE-3F2A"
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS referral_codes_user_idx ON referral_codes(user_id);
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select" ON referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert" ON referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Table de suivi des parrainages
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
  converted_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_id)   -- un seul parrain par nouvel utilisateur
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrer_select" ON referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "service_insert" ON referrals FOR INSERT WITH CHECK (true); -- insertion via admin client
