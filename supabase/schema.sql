-- ============================================================
-- TREPID DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES — extends Supabase Auth users with app-specific data
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'TRADER' check (role in ('TRADER', 'MENTOR', 'PARTNER')),
  created_at timestamptz not null default now()
);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RULES — user-defined trading discipline rules
-- ============================================================
create table public.rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null,
  value numeric not null default 0,
  unit text,
  enabled boolean not null default true,
  enforcement text not null default 'WARNING',
  category text not null default 'session',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_rules_user on public.rules(user_id);

-- ============================================================
-- TRADING SESSIONS — one per trading day/session
-- ============================================================
create table public.trading_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'LOCKED', 'COMPLETED')),
  discipline_score integer not null default 100,
  total_pnl numeric not null default 0,
  total_trades integer not null default 0,
  total_violations integer not null default 0,
  enforcement_level integer not null default 0,
  locked boolean not null default false,
  cooldown_ends_at timestamptz,
  summary text
);

create index idx_sessions_user on public.trading_sessions(user_id);

-- ============================================================
-- TRADES — individual trade entries
-- ============================================================
create table public.trades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid references public.trading_sessions(id) on delete set null,
  pair text not null,
  direction text not null check (direction in ('LONG', 'SHORT')),
  entry_price numeric not null,
  exit_price numeric,
  stop_loss numeric,
  take_profit numeric,
  lot_size numeric not null default 0.01,
  session_type text not null default 'LONDON' check (session_type in ('LONDON', 'NY', 'ASIAN', 'OVERLAP')),
  result text check (result in ('WIN', 'LOSS', 'BREAKEVEN')),
  pnl numeric not null default 0,
  emotion text not null default 'NEUTRAL',
  note text,
  rule_violations text[] not null default '{}',
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create index idx_trades_user on public.trades(user_id);
create index idx_trades_session on public.trades(session_id);
create index idx_trades_opened on public.trades(opened_at desc);

-- ============================================================
-- VIOLATIONS — rule breach records
-- ============================================================
create table public.violations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid references public.trading_sessions(id) on delete set null,
  rule_id uuid references public.rules(id) on delete set null,
  type text not null,
  severity text not null default 'LOW' check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  description text not null default '',
  enforcement_applied text not null default 'WARNING',
  mentor_notified boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_violations_user on public.violations(user_id);

-- ============================================================
-- ACCOUNTABILITY LINKS — mentor/partner relationships
-- ============================================================
create table public.accountability_links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  partner_email text not null,
  partner_name text not null default '',
  role text not null default 'PARTNER' check (role in ('MENTOR', 'PARTNER')),
  status text not null default 'PENDING' check (status in ('PENDING', 'ACTIVE', 'REVOKED')),
  permissions jsonb not null default '{"viewScore":true,"viewViolations":true,"viewTradeCount":true,"viewPnl":false,"receiveAlerts":true}',
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  last_notified_at timestamptz,
  last_alert_reason text
);

create index idx_links_user on public.accountability_links(user_id);

-- ============================================================
-- NOTIFICATIONS — in-app notification records
-- ============================================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null default '',
  tone text not null default 'info' check (tone in ('info', 'success', 'warning', 'danger')),
  channel text not null default 'IN_APP' check (channel in ('IN_APP', 'PUSH', 'SMS')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, read);

-- ============================================================
-- ROW LEVEL SECURITY — users can only see their own data
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Rules
alter table public.rules enable row level security;
create policy "Users can CRUD own rules"
  on public.rules for all using (auth.uid() = user_id);

-- Trading sessions
alter table public.trading_sessions enable row level security;
create policy "Users can CRUD own sessions"
  on public.trading_sessions for all using (auth.uid() = user_id);

-- Trades
alter table public.trades enable row level security;
create policy "Users can CRUD own trades"
  on public.trades for all using (auth.uid() = user_id);

-- Violations
alter table public.violations enable row level security;
create policy "Users can CRUD own violations"
  on public.violations for all using (auth.uid() = user_id);

-- Accountability links
alter table public.accountability_links enable row level security;
create policy "Users can CRUD own links"
  on public.accountability_links for all using (auth.uid() = user_id);

-- Notifications
alter table public.notifications enable row level security;
create policy "Users can CRUD own notifications"
  on public.notifications for all using (auth.uid() = user_id);
