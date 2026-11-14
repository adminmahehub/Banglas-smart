-- 021: White-label / B2B API. A partner is a normal reseller (has credits) that also owns an API key.
-- The key is shown ONCE when the admin generates it; only its SHA-256 hash is stored.
create table if not exists public.b2b_keys (
  partner_id uuid primary key references public.profiles(id) on delete cascade,
  key_hash text not null unique,
  prefix text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
alter table public.b2b_keys enable row level security;
drop policy if exists b2b_keys_admin on public.b2b_keys;
create policy b2b_keys_admin on public.b2b_keys for select to authenticated using (public.is_admin());

create or replace function public.admin_b2b_new_key(p_partner uuid)
returns text language plpgsql security definer set search_path to '' as $function$
declare k text; r text;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Admin only'; end if;
  select role into r from public.profiles where id = p_partner;
  if r is null then raise exception 'Reseller not found'; end if;
  if r = 'admin' then raise exception 'Choose a reseller, not the admin'; end if;
  k := 'mh_live_' || encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.b2b_keys (partner_id, key_hash, prefix, active)
  values (p_partner, encode(sha256(convert_to(k, 'utf8')), 'hex'), left(k, 12), true)
  on conflict (partner_id) do update set key_hash = excluded.key_hash, prefix = excluded.prefix, active = true, created_at = now(), last_used_at = null;
  insert into public.activity_log (owner_id, message) values (auth.uid(), 'B2B API key generated for ' || p_partner);
  return k;
end $function$;
revoke all on function public.admin_b2b_new_key(uuid) from public, anon;
grant execute on function public.admin_b2b_new_key(uuid) to authenticated;

create or replace function public.admin_b2b_revoke(p_partner uuid)
returns void language plpgsql security definer set search_path to '' as $function$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Admin only'; end if;
  update public.b2b_keys set active = false where partner_id = p_partner;
  insert into public.activity_log (owner_id, message) values (auth.uid(), 'B2B API key revoked for ' || p_partner);
end $function$;
revoke all on function public.admin_b2b_revoke(uuid) from public, anon;
grant execute on function public.admin_b2b_revoke(uuid) to authenticated;

-- edge function only (service role)
create or replace function public.b2b_partner_by_key(p_hash text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare k public.b2b_keys; p public.profiles;
begin
  select * into k from public.b2b_keys where key_hash = p_hash and active;
  if not found then return null; end if;
  select * into p from public.profiles where id = k.partner_id;
  if not found or p.status in ('banned', 'suspended') then return null; end if;
  update public.b2b_keys set last_used_at = now() where partner_id = k.partner_id;
  return jsonb_build_object('id', p.id, 'name', p.name, 'credits', p.credits);
end $function$;
revoke all on function public.b2b_partner_by_key(text) from public, anon, authenticated;
grant execute on function public.b2b_partner_by_key(text) to service_role;

create or replace function public.b2b_create_customer(p_partner uuid, p_phone text, p_months int)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare ph text; bal int; host text; rec public.vpn_accounts; tok text;
begin
  ph := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(ph) < 8 or length(ph) > 15 then raise exception 'invalid_phone'; end if;
  if p_months is null or p_months < 1 or p_months > 12 then raise exception 'invalid_months'; end if;
  if exists (select 1 from public.vpn_accounts where username = ph) then raise exception 'already_exists'; end if;
  select credits into bal from public.profiles where id = p_partner for update;
  if bal is null or bal < p_months then raise exception 'insufficient_credits'; end if;
  select server_host into host from public.vpn_accounts where server_tier = 'Normal' and server_host is not null limit 1;
  insert into public.vpn_accounts
    (owner_id, username, password, server_tier, server_host, days, bandwidth_type, bandwidth_gb, used_mb, price_bdt, start_date, expiry_date, status)
  values
    (p_partner, ph, substr(md5(random()::text || clock_timestamp()::text), 1, 12), 'Normal', coalesce(host, 'my.ovpn.ovh'),
     365, 'Unlimited', 0, 0, 0, current_date, current_date + (p_months * 30), 'active')
  returning * into rec;
  update public.profiles set credits = credits - p_months where id = p_partner;
  tok := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.dns_access (account_id, token_hash, server_id)
  values (rec.id, encode(sha256(convert_to(tok, 'utf8')), 'hex'), public.pick_dns_server(ph))
  on conflict (account_id) do update set token_hash = excluded.token_hash;
  insert into public.activity_log (owner_id, message) values (p_partner, 'API: created customer ' || ph || ' for ' || p_months || ' month(s)');
  return jsonb_build_object('phone', ph, 'customer_id', rec.customer_code, 'expiry', rec.expiry_date, 'token', tok, 'credits_left', bal - p_months);
end $function$;
revoke all on function public.b2b_create_customer(uuid, text, int) from public, anon, authenticated;
grant execute on function public.b2b_create_customer(uuid, text, int) to service_role;

create or replace function public.b2b_customer_status(p_partner uuid, p_phone text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare ph text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'); r public.vpn_accounts;
begin
  select * into r from public.vpn_accounts where username = ph and owner_id = p_partner;
  if not found then return null; end if;
  return jsonb_build_object('phone', r.username, 'customer_id', r.customer_code, 'status', r.status, 'expiry', r.expiry_date);
end $function$;
revoke all on function public.b2b_customer_status(uuid, text) from public, anon, authenticated;
grant execute on function public.b2b_customer_status(uuid, text) to service_role;
