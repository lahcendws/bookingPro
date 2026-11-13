-- Migration 058: User Profiles and Full Name
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "son profil (lecture)" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "son profil (mise à jour)" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  )
  on conflict (id) do update set
    first_name = coalesce(excluded.first_name, profiles.first_name),
    last_name = coalesce(excluded.last_name, profiles.last_name),
    updated_at = now();
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill existing users into profiles
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- Update _audit_user_name to prefer profiles first_name/last_name
create or replace function public._audit_user_name(p uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select nullif(trim(coalesce(first_name,'')||' '||coalesce(last_name,'')),'')
       from profiles where id = p),
    (select nullif(trim(coalesce(name,'')),'') from employees where user_id = p limit 1),
    (select coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
       from auth.users where id = p),
    'Utilisateur')
$$;

revoke execute on function public._audit_user_name(uuid) from public, anon, authenticated;
