-- MaheHub: credits system (1 credit = 1 month), phone-number customers, renew, coupons
-- Run this ONCE in Supabase > SQL Editor.

alter table public.profiles add column if not exists credits integer not null default 0;

create table if not exists public.coupons (
  code text primary key,
  percent integer not null check (percent between 1 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.coupons enable row level security;
drop policy if exists coupons_admin on public.coupons;
create policy coupons_admin on public.coupons
  for all using ((select public.is_admin())) with check ((select public.is_admin()));

-- stop resellers from editing their own role / credits / balance from the browser
create or replace function public.protect_profile() returns trigger
language plpgsql set search_path to '' as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    new.role := old.role;
    new.credits := old.credits;
    new.balance_bdt := old.balance_bdt;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile before update on public.profiles
  for each row execute function public.protect_profile();

-- admin adds credits (reseller packages are at least 10 credits = 2000 BDT)
create or replace function public.admin_add_credits(p_user uuid, p_credits integer, p_coupon text default null)
returns integer language plpgsql security definer set search_path to '' as $$
declare pct integer := 0; payable integer;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_credits is null or p_credits <= 0 then raise exception 'Invalid credits'; end if;
  if p_user <> auth.uid() and p_credits < 10 then raise exception 'Minimum package is 10 credits'; end if;
  if p_coupon is not null and length(trim(p_coupon)) > 0 then
    select percent into pct from public.coupons where lower(code) = lower(trim(p_coupon)) and active;
    if pct is null then raise exception 'Invalid coupon'; end if;
  end if;
  payable := round(p_credits * 200 * (100 - pct) / 100.0);
  update public.profiles set credits = credits + p_credits where id = p_user;
  if not found then raise exception 'User not found'; end if;
  insert into public.activity_log (owner_id, message)
    values (p_user, 'Credits +' || p_credits || ' (payable BDT ' || payable || ')');
  return payable;
end $$;

-- create a customer from a phone number only (admin accounts do not use credits)
create or replace function public.create_customer(p_phone text, p_months integer)
returns public.vpn_accounts language plpgsql security definer set search_path to '' as $$
declare uid uuid := auth.uid(); ph text; bal integer; host text; rec public.vpn_accounts; adm boolean;
begin
  if uid is null then raise exception 'Login required'; end if;
  adm := public.is_admin();
  ph := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(ph) < 8 or length(ph) > 15 then raise exception 'Enter a valid phone number with country code'; end if;
  if p_months is null or p_months < 1 or p_months > 12 then raise exception 'Months must be 1 to 12'; end if;
  if exists (select 1 from public.vpn_accounts where username = ph) then
    raise exception 'This phone number already has an account. Use Renew instead.';
  end if;
  if not adm then
    select credits into bal from public.profiles where id = uid for update;
    if bal is null or bal < p_months then raise exception 'Insufficient credits'; end if;
  end if;
  select server_host into host from public.vpn_accounts where server_tier = 'Normal' and server_host is not null limit 1;
  insert into public.vpn_accounts
    (owner_id, username, password, server_tier, server_host, days, bandwidth_type, bandwidth_gb, used_mb, price_bdt, start_date, expiry_date, status)
  values
    (uid, ph, substr(md5(random()::text || clock_timestamp()::text), 1, 12), 'Normal', coalesce(host, 'my.ovpn.ovh'),
     365, 'Unlimited', 0, 0, 0, current_date, current_date + (p_months * 30), 'active')
  returning * into rec;
  if not adm then update public.profiles set credits = credits - p_months where id = uid; end if;
  insert into public.activity_log (owner_id, message) values (uid, 'Created customer ' || ph || ' for ' || p_months || ' month(s)');
  return rec;
exception when unique_violation then
  raise exception 'This phone number already has an account. Use Renew instead.';
end $$;

-- renew for N months (expiry moves forward; credits are deducted from the caller unless admin)
create or replace function public.renew_customer(p_username text, p_months integer)
returns void language plpgsql security definer set search_path to '' as $$
declare uid uuid := auth.uid(); rec public.vpn_accounts; bal integer; adm boolean;
begin
  if uid is null then raise exception 'Login required'; end if;
  adm := public.is_admin();
  if p_months is null or p_months < 1 or p_months > 12 then raise exception 'Months must be 1 to 12'; end if;
  select * into rec from public.vpn_accounts where username = p_username for update;
  if not found then raise exception 'Account not found'; end if;
  if rec.owner_id <> uid and not adm then raise exception 'Not your customer'; end if;
  if not adm then
    select credits into bal from public.profiles where id = uid for update;
    if bal is null or bal < p_months then raise exception 'Insufficient credits'; end if;
    update public.profiles set credits = credits - p_months where id = uid;
  end if;
  update public.vpn_accounts
    set expiry_date = greatest(expiry_date, current_date) + (p_months * 30), status = 'active'
    where id = rec.id;
  insert into public.activity_log (owner_id, message) values (uid, 'Renewed ' || p_username || ' for ' || p_months || ' month(s)');
end $$;

revoke execute on function public.admin_add_credits(uuid, integer, text) from public, anon;
revoke execute on function public.create_customer(text, integer) from public, anon;
revoke execute on function public.renew_customer(text, integer) from public, anon;
grant execute on function public.admin_add_credits(uuid, integer, text) to authenticated;
grant execute on function public.create_customer(text, integer) to authenticated;
grant execute on function public.renew_customer(text, integer) to authenticated;
