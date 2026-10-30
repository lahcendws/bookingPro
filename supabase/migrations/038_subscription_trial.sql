-- Migration 038: Add trial periods and Stripe billing metadata to businesses

alter table public.businesses
  add column if not exists trial_ends_at timestamptz default null,
  add column if not exists stripe_customer_id text default null,
  add column if not exists stripe_subscription_id text default null,
  add column if not exists stripe_price_id text default null;

-- Index for stripe customer lookup
create index if not exists idx_businesses_stripe_customer on public.businesses(stripe_customer_id);
create index if not exists idx_businesses_stripe_subscription on public.businesses(stripe_subscription_id);
