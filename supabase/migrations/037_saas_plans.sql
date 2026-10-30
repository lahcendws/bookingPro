-- Migration 037: SaaS Commercial Plans and Feature Limits (plans & plan_features)

-- 1. Plans table
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,                      -- 'Free', 'Pro', 'Business', 'Enterprise'
  slug text not null unique,               -- 'free', 'pro', 'business', 'enterprise'
  price_monthly numeric(10,2) not null default 0.00,
  price_yearly numeric(10,2) not null default 0.00,

  -- Feature limits & toggles
  appointments_limit integer default null,   -- null = unlimited
  employees_limit integer default 1,         -- max employees
  locations_limit integer default 1,         -- max locations / branches
  storage_limit_mb integer default 100,      -- storage limit in MB
  sms_enabled boolean not null default false,
  inventory_enabled boolean not null default false,
  analytics_enabled boolean not null default false,
  api_enabled boolean not null default false,

  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes
create index if not exists idx_plans_slug on public.plans(slug);

-- Enable RLS
alter table public.plans enable row level security;

-- Public can view active plans
create policy "Anyone can view active plans"
  on public.plans
  for select
  to anon, authenticated
  using (is_active = true);

-- 2. Add plan relation and subscription info to businesses table
alter table public.businesses
  add column if not exists plan_id uuid references public.plans(id),
  add column if not exists subscription_status text not null default 'active', -- 'active', 'past_due', 'canceled', 'trialing'
  add column if not exists subscription_ends_at timestamptz default null;

-- Index for business plan
create index if not exists idx_businesses_plan_id on public.businesses(plan_id);

-- 3. Seed default plans (FREE, PRO, BUSINESS, ENTERPRISE)
insert into public.plans (name, slug, price_monthly, price_yearly, appointments_limit, employees_limit, locations_limit, storage_limit_mb, sms_enabled, inventory_enabled, analytics_enabled, api_enabled, sort_order)
values
  ('Free', 'free', 0.00, 0.00, 50, 1, 1, 50, false, false, false, false, 1),
  ('Pro', 'pro', 29.00, 290.00, 500, 5, 1, 500, true, true, true, false, 2),
  ('Business', 'business', 79.00, 790.00, null, 15, 3, 2000, true, true, true, true, 3),
  ('Enterprise', 'enterprise', 199.00, 1990.00, null, null, null, 10000, true, true, true, true, 4)
on conflict (slug) do update set
  price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly,
  appointments_limit = excluded.appointments_limit,
  employees_limit = excluded.employees_limit,
  locations_limit = excluded.locations_limit,
  storage_limit_mb = excluded.storage_limit_mb,
  sms_enabled = excluded.sms_enabled,
  inventory_enabled = excluded.inventory_enabled,
  analytics_enabled = excluded.analytics_enabled,
  api_enabled = excluded.api_enabled;

-- Assign default 'free' plan to existing businesses that don't have a plan yet
update public.businesses
set plan_id = (select id from public.plans where slug = 'free' limit 1)
where plan_id is null;
