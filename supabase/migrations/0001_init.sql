-- ============================================================
-- FitCoach AI — Initial Schema
-- ============================================================

-- Enable necessary extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type plan_type as enum ('free', 'pro', 'premium');
create type subscription_status as enum ('active', 'canceled', 'past_due', 'trialing', 'incomplete');
create type resource_type as enum ('program', 'nutrition', 'content');
create type content_type as enum ('caption_ig', 'hook_tiktok', 'reel_idea', 'cta', 'viral_hook');
create type content_tone as enum ('motivating', 'professional', 'aggressive', 'luxury');

-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  avatar_url   text,
  locale       text not null default 'fr',
  brand_name   text,
  brand_logo_url text,
  brand_color  text default '#3b82f6',
  slogan       text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

create table subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  plan                   plan_type not null default 'free',
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 subscription_status not null default 'active',
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique(user_id)
);

alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role can manage subscriptions"
  on subscriptions for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- USAGE QUOTAS
-- ============================================================

create table usage_quotas (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  year_month     text not null, -- format: YYYY-MM
  programs_count integer not null default 0,
  nutrition_count integer not null default 0,
  content_count  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique(user_id, year_month)
);

alter table usage_quotas enable row level security;

create policy "Users can view own quotas"
  on usage_quotas for select
  using (auth.uid() = user_id);

create policy "Service role can manage quotas"
  on usage_quotas for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- STRIPE EVENTS (idempotence)
-- ============================================================

create table stripe_events (
  id           text primary key, -- Stripe event ID
  processed_at timestamptz not null default now()
);

alter table stripe_events enable row level security;

create policy "Service role can manage stripe events"
  on stripe_events for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- AI USAGE LOG
-- ============================================================

create table ai_usage_log (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  generator_type text not null,
  prompt_tokens  integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens   integer not null default 0,
  model          text not null,
  created_at     timestamptz not null default now()
);

alter table ai_usage_log enable row level security;

create policy "Users can view own AI usage"
  on ai_usage_log for select
  using (auth.uid() = user_id);

create policy "Service role can manage AI usage"
  on ai_usage_log for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- WORKOUT PROGRAMS
-- ============================================================

create table workout_programs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  inputs     jsonb not null default '{}',
  output     jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table workout_programs enable row level security;

create policy "Users can view own programs"
  on workout_programs for select
  using (auth.uid() = user_id);

create policy "Users can insert own programs"
  on workout_programs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own programs"
  on workout_programs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own programs"
  on workout_programs for delete
  using (auth.uid() = user_id);

-- ============================================================
-- NUTRITION PLANS
-- ============================================================

create table nutrition_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  inputs     jsonb not null default '{}',
  output     jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table nutrition_plans enable row level security;

create policy "Users can view own nutrition plans"
  on nutrition_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own nutrition plans"
  on nutrition_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own nutrition plans"
  on nutrition_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own nutrition plans"
  on nutrition_plans for delete
  using (auth.uid() = user_id);

-- ============================================================
-- SOCIAL CONTENTS
-- ============================================================

create table social_contents (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       content_type not null,
  tone       content_tone not null,
  topic      text not null,
  variants   jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table social_contents enable row level security;

create policy "Users can view own social contents"
  on social_contents for select
  using (auth.uid() = user_id);

create policy "Users can insert own social contents"
  on social_contents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own social contents"
  on social_contents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own social contents"
  on social_contents for delete
  using (auth.uid() = user_id);

-- ============================================================
-- CLIENTS
-- ============================================================

create table clients (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  full_name  text not null,
  email      text,
  phone      text,
  photo_url  text,
  goal       text,
  notes      text,
  tags       text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table clients enable row level security;

create policy "Users can view own clients"
  on clients for select
  using (auth.uid() = user_id);

create policy "Users can insert own clients"
  on clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own clients"
  on clients for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own clients"
  on clients for delete
  using (auth.uid() = user_id);

-- ============================================================
-- CLIENT ASSIGNMENTS
-- ============================================================

create table client_assignments (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  program_id   uuid references workout_programs(id) on delete set null,
  nutrition_id uuid references nutrition_plans(id) on delete set null,
  assigned_at  timestamptz not null default now()
);

alter table client_assignments enable row level security;

create policy "Users can view own client assignments"
  on client_assignments for select
  using (
    exists (
      select 1 from clients
      where clients.id = client_assignments.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can insert own client assignments"
  on client_assignments for insert
  with check (
    exists (
      select 1 from clients
      where clients.id = client_assignments.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can delete own client assignments"
  on client_assignments for delete
  using (
    exists (
      select 1 from clients
      where clients.id = client_assignments.client_id
      and clients.user_id = auth.uid()
    )
  );

-- ============================================================
-- CLIENT MEASUREMENTS
-- ============================================================

create table client_measurements (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  date         date not null,
  weight       numeric(5,2),
  body_fat     numeric(4,2),
  measurements jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

alter table client_measurements enable row level security;

create policy "Users can view own client measurements"
  on client_measurements for select
  using (
    exists (
      select 1 from clients
      where clients.id = client_measurements.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can insert own client measurements"
  on client_measurements for insert
  with check (
    exists (
      select 1 from clients
      where clients.id = client_measurements.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can update own client measurements"
  on client_measurements for update
  using (
    exists (
      select 1 from clients
      where clients.id = client_measurements.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can delete own client measurements"
  on client_measurements for delete
  using (
    exists (
      select 1 from clients
      where clients.id = client_measurements.client_id
      and clients.user_id = auth.uid()
    )
  );

-- ============================================================
-- CLIENT FILES
-- ============================================================

create table client_files (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  storage_path text not null,
  name         text not null,
  size         integer not null,
  mime         text not null,
  created_at   timestamptz not null default now()
);

alter table client_files enable row level security;

create policy "Users can view own client files"
  on client_files for select
  using (
    exists (
      select 1 from clients
      where clients.id = client_files.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can insert own client files"
  on client_files for insert
  with check (
    exists (
      select 1 from clients
      where clients.id = client_files.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can delete own client files"
  on client_files for delete
  using (
    exists (
      select 1 from clients
      where clients.id = client_files.client_id
      and clients.user_id = auth.uid()
    )
  );

-- ============================================================
-- SHARE TOKENS
-- ============================================================

create table share_tokens (
  token         text primary key,
  resource_type resource_type not null,
  resource_id   uuid not null,
  user_id       uuid not null references auth.users(id) on delete cascade,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

alter table share_tokens enable row level security;

create policy "Users can view own share tokens"
  on share_tokens for select
  using (auth.uid() = user_id);

create policy "Anyone can view share tokens for public access"
  on share_tokens for select
  using (true);

create policy "Users can insert own share tokens"
  on share_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own share tokens"
  on share_tokens for delete
  using (auth.uid() = user_id);

-- ============================================================
-- CLIENT NOTES
-- ============================================================

create table client_notes (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

alter table client_notes enable row level security;

create policy "Users can view own client notes"
  on client_notes for select
  using (
    exists (
      select 1 from clients
      where clients.id = client_notes.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can insert own client notes"
  on client_notes for insert
  with check (
    exists (
      select 1 from clients
      where clients.id = client_notes.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can delete own client notes"
  on client_notes for delete
  using (
    exists (
      select 1 from clients
      where clients.id = client_notes.client_id
      and clients.user_id = auth.uid()
    )
  );

-- ============================================================
-- TRIGGER: Auto-create profile + subscription on user signup
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, locale)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_user_meta_data ->> 'locale', 'fr')
  );

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_subscriptions_updated_at before update on subscriptions
  for each row execute procedure update_updated_at_column();

create trigger update_usage_quotas_updated_at before update on usage_quotas
  for each row execute procedure update_updated_at_column();

create trigger update_workout_programs_updated_at before update on workout_programs
  for each row execute procedure update_updated_at_column();

create trigger update_nutrition_plans_updated_at before update on nutrition_plans
  for each row execute procedure update_updated_at_column();

create trigger update_social_contents_updated_at before update on social_contents
  for each row execute procedure update_updated_at_column();

create trigger update_clients_updated_at before update on clients
  for each row execute procedure update_updated_at_column();

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_workout_programs_user_id on workout_programs(user_id);
create index idx_workout_programs_created_at on workout_programs(created_at desc);
create index idx_nutrition_plans_user_id on nutrition_plans(user_id);
create index idx_nutrition_plans_created_at on nutrition_plans(created_at desc);
create index idx_social_contents_user_id on social_contents(user_id);
create index idx_social_contents_created_at on social_contents(created_at desc);
create index idx_clients_user_id on clients(user_id);
create index idx_clients_tags on clients using gin(tags);
create index idx_client_measurements_client_id on client_measurements(client_id);
create index idx_client_files_client_id on client_files(client_id);
create index idx_client_notes_client_id on client_notes(client_id);
create index idx_share_tokens_expires_at on share_tokens(expires_at);
create index idx_ai_usage_log_user_id on ai_usage_log(user_id);
create index idx_usage_quotas_user_month on usage_quotas(user_id, year_month);
