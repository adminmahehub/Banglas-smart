-- Reseller account status (active / suspended / banned). Run once in the Supabase SQL Editor.
alter table public.profiles
  add column if not exists status text not null default 'active'
  check (status in ('active','suspended','banned'));

-- A reseller must never be able to change their own status (only admin / service role can).
create or replace function public.protect_profile()
returns trigger language plpgsql set search_path to '' as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    new.role := old.role;
    new.credits := old.credits;
    new.balance_bdt := old.balance_bdt;
    new.status := old.status;
  end if;
  return new;
end $$;
