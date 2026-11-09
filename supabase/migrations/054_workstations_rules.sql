-- Migration 054: Workstations GiST Overlap Protection and Expiration Holds

create extension if not exists btree_gist;

alter table public.appointments
  add column if not exists expires_at timestamptz;

-- Note: We add the exclusion constraint safely if btree_gist is available and table exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'prevent_workstations_overlap'
  ) then
    alter table public.appointments
      add constraint prevent_workstations_overlap
      exclude using gist (
        workstation_id with =,
        tstzrange(starts_at, ends_at, '[)') with &&
      );
  end if;
exception
  when others then
    raise notice 'Exclusion constraint could not be added automatically (check btree_gist extension or overlapping data)';
end $$;
