-- 009: device lock (app only) + phone/customer-ID login for the mobile app.
-- Safe for current customers: accounts with device_id NULL behave exactly as before.

-- 1) device binding columns
alter table public.dns_access add column if not exists device_id text;
alter table public.dns_access add column if not exists device_bound_at timestamptz;

-- 2) login attempts (rate limiting). RLS on, no policies: only SECURITY DEFINER functions touch it.
create table if not exists public.dns_login_attempts (
  id bigserial primary key,
  phone_key text not null,
  ip text not null default '',
  ok boolean not null default false,
  at timestamptz not null default now()
);
alter table public.dns_login_attempts enable row level security;
create index if not exists dns_login_attempts_phone_idx on public.dns_login_attempts (phone_key, at);
create index if not exists dns_login_attempts_ip_idx on public.dns_login_attempts (ip, at);

-- 3) activation: p_device is sent only by the mobile app.
--    App request  : first app phone claims the account; any IP change from the SAME phone is allowed (Wi-Fi/data can change freely);
--                   another phone gets 'device_locked'.
--    Web/legacy   : unchanged behaviour, EXCEPT an account already bound to a phone refuses web activation ('device_locked').
drop function if exists public.dns_activate_ip(text, text);
create or replace function public.dns_activate_ip(p_token text, p_ip text, p_device text default null)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare r record; n integer; lock_on boolean; h text := encode(sha256(convert_to(coalesce(p_token, ''), 'utf8')), 'hex');
begin
  if not public.is_public_ipv4(p_ip) then return jsonb_build_object('ok', false, 'error', 'invalid_ip'); end if;
  select d.account_id, d.bound_ip, d.blocked, d.day_changes, d.day_marker, d.device_id, a.status, a.expiry_date, a.owner_id, a.username into r
    from public.dns_access d join public.vpn_accounts a on a.id = d.account_id
   where d.token_hash = h for update of d;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if r.blocked then return jsonb_build_object('ok', false, 'error', 'blocked'); end if;
  if r.status <> 'active' or r.expiry_date < current_date then return jsonb_build_object('ok', false, 'error', 'expired'); end if;

  if p_device is not null and length(p_device) >= 8 then
    if r.device_id is null then
      update public.dns_access set device_id = p_device, device_bound_at = now() where account_id = r.account_id;
    elsif r.device_id <> p_device then
      return jsonb_build_object('ok', false, 'error', 'device_locked');
    end if;
  elsif r.device_id is not null then
    return jsonb_build_object('ok', false, 'error', 'device_locked');
  end if;

  if r.bound_ip is not distinct from p_ip then
    return jsonb_build_object('ok', true, 'ip', p_ip, 'changed', false);
  end if;
  if p_device is null then
    select coalesce((select value = 'on' from public.app_settings where key = 'device_lock'), false) into lock_on;
    if lock_on and r.bound_ip is not null then
      return jsonb_build_object('ok', false, 'error', 'locked');
    end if;
  end if;
  n := (case when r.day_marker = current_date then r.day_changes else 0 end) + 1;
  update public.dns_access
     set bound_ip = p_ip, bound_at = now(), day_changes = n, day_marker = current_date
   where account_id = r.account_id;
  if n = 50 or (n > 50 and n % 50 = 0) then
    insert into public.activity_log (owner_id, message)
    select p2.id, 'ADMIN ALERT: unusual DNS IP activity for ' || r.username || ' (' || n || ' changes today)'
      from public.profiles p2 where p2.role = 'admin';
  end if;
  insert into public.activity_log (owner_id, message) values (r.owner_id, 'DNS IP activated: ' || r.username);
  return jsonb_build_object('ok', true, 'ip', p_ip, 'changed', true);
end $function$;
revoke all on function public.dns_activate_ip(text, text, text) from public, anon, authenticated;
grant execute on function public.dns_activate_ip(text, text, text) to service_role;

-- 4) admin "Clear device lock" now also frees the phone binding
create or replace function public.dns_clear_ip(p_username text)
returns void language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); rec public.vpn_accounts;
begin
  if uid is null then raise exception 'Login required'; end if;
  if not public.is_admin() then raise exception 'Only the admin can clear a device lock'; end if;
  select * into rec from public.vpn_accounts where username = p_username;
  if not found then raise exception 'Account not found'; end if;
  update public.dns_access set bound_ip = null, bound_at = null, device_id = null, device_bound_at = null where account_id = rec.id;
  insert into public.activity_log (owner_id, message) values (uid, 'DNS device lock cleared: ' || p_username);
end $function$;

-- 5) phone + 6-digit customer ID login (called only by the dns-login edge function, with the service role).
--    Issues a NEW private token (the old link stops working, same as "generate link"), binds this phone.
create or replace function public.dns_login(p_phone text, p_code text, p_device text, p_ip text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  code text := upper(btrim(coalesce(p_code, '')));
  pk text; r record; tok text; fp int; fi int; ipk text := coalesce(p_ip, '');
begin
  if length(digits) < 8 or length(code) <> 6 or p_device is null or length(p_device) < 8 then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;
  pk := right(digits, 9);
  delete from public.dns_login_attempts where at < now() - interval '2 days';
  select count(*) into fp from public.dns_login_attempts where phone_key = pk and not ok and at > now() - interval '30 minutes';
  select count(*) into fi from public.dns_login_attempts where ip = ipk and not ok and at > now() - interval '30 minutes';
  if fp >= 5 or fi >= 15 then return jsonb_build_object('ok', false, 'error', 'too_many'); end if;

  select a.id, a.username, a.owner_id, d.device_id into r
    from public.vpn_accounts a left join public.dns_access d on d.account_id = a.id
   where a.service = 'dns' and right(a.username, 9) = pk and upper(coalesce(a.customer_code, '')) = code
   limit 1;
  if not found then
    insert into public.dns_login_attempts (phone_key, ip, ok) values (pk, ipk, false);
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if r.device_id is not null and r.device_id <> p_device then
    insert into public.dns_login_attempts (phone_key, ip, ok) values (pk, ipk, false);
    return jsonb_build_object('ok', false, 'error', 'device_locked');
  end if;

  tok := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.dns_access (account_id, token_hash, server_id, device_id, device_bound_at)
  values (r.id, encode(sha256(convert_to(tok, 'utf8')), 'hex'), public.pick_dns_server(r.username), p_device, now())
  on conflict (account_id) do update
    set token_hash = excluded.token_hash,
        device_id = coalesce(public.dns_access.device_id, excluded.device_id),
        device_bound_at = case when public.dns_access.device_id is null then now() else public.dns_access.device_bound_at end;
  insert into public.dns_login_attempts (phone_key, ip, ok) values (pk, ipk, true);
  insert into public.activity_log (owner_id, message) values (r.owner_id, 'App login: ' || r.username);
  return jsonb_build_object('ok', true, 'token', tok);
end $function$;
revoke all on function public.dns_login(text, text, text, text) from public, anon, authenticated;
grant execute on function public.dns_login(text, text, text, text) to service_role;
