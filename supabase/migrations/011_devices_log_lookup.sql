-- 011: allowed devices (1-3), access log, one free trial per phone (app), admin lookup by ID / phone / DNS link.
-- Safe for current customers: every account keeps max_devices = 1 and behaves as before until the admin raises it.

-- 1) tables
alter table public.dns_access add column if not exists max_devices int not null default 1;
do $$ begin
  alter table public.dns_access add constraint dns_access_max_devices_chk check (max_devices between 1 and 3);
exception when duplicate_object then null; end $$;

create table if not exists public.dns_devices (
  account_id uuid not null references public.vpn_accounts(id) on delete cascade,
  device_id text not null,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  ua text, ip text, country text,
  primary key (account_id, device_id)
);
alter table public.dns_devices enable row level security;

create table if not exists public.dns_access_log (
  id bigserial primary key,
  account_id uuid not null references public.vpn_accounts(id) on delete cascade,
  at timestamptz not null default now(),
  event text not null,
  ip text, country text, ua text, device_id text
);
alter table public.dns_access_log enable row level security;
create index if not exists dns_access_log_acc_idx on public.dns_access_log (account_id, at desc);

create table if not exists public.trial_devices (
  device_id text primary key,
  phone text,
  created_at timestamptz not null default now()
);
alter table public.trial_devices enable row level security;

-- phones that are already bound keep their binding
insert into public.dns_devices (account_id, device_id, first_seen)
select account_id, device_id, coalesce(device_bound_at, now()) from public.dns_access where device_id is not null
on conflict do nothing;

-- 2) device check: known device -> ok; new device -> ok only while under the account's limit
create or replace function public.dns_device_ok(p_account uuid, p_device text, p_max int, p_ua text, p_ip text, p_country text)
returns boolean language plpgsql security definer set search_path to '' as $function$
declare n int;
begin
  if exists (select 1 from public.dns_devices where account_id = p_account and device_id = p_device) then
    update public.dns_devices
       set last_seen = now(), ua = coalesce(left(p_ua, 300), ua), ip = coalesce(p_ip, ip), country = coalesce(p_country, country)
     where account_id = p_account and device_id = p_device;
    return true;
  end if;
  select count(*) into n from public.dns_devices where account_id = p_account;
  if n >= greatest(coalesce(p_max, 1), 1) then return false; end if;
  insert into public.dns_devices (account_id, device_id, ua, ip, country) values (p_account, p_device, left(p_ua, 300), p_ip, p_country);
  return true;
end $function$;
revoke all on function public.dns_device_ok(uuid, text, int, text, text, text) from public, anon, authenticated;
grant execute on function public.dns_device_ok(uuid, text, int, text, text, text) to service_role;

-- 3) activation (same rules as 009, but with the allowed-devices list and the access log)
drop function if exists public.dns_activate_ip(text, text, text);
create or replace function public.dns_activate_ip(p_token text, p_ip text, p_device text default null, p_ua text default null, p_country text default null)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare r record; n integer; lock_on boolean; h text := encode(sha256(convert_to(coalesce(p_token, ''), 'utf8')), 'hex');
begin
  if not public.is_public_ipv4(p_ip) then return jsonb_build_object('ok', false, 'error', 'invalid_ip'); end if;
  select d.account_id, d.bound_ip, d.blocked, d.day_changes, d.day_marker, d.max_devices, a.status, a.expiry_date, a.owner_id, a.username into r
    from public.dns_access d join public.vpn_accounts a on a.id = d.account_id
   where d.token_hash = h for update of d;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if r.blocked then return jsonb_build_object('ok', false, 'error', 'blocked'); end if;
  if r.status <> 'active' or r.expiry_date < current_date then return jsonb_build_object('ok', false, 'error', 'expired'); end if;

  if p_device is not null and length(p_device) >= 8 then
    if not public.dns_device_ok(r.account_id, p_device, r.max_devices, p_ua, p_ip, p_country) then
      return jsonb_build_object('ok', false, 'error', 'device_locked');
    end if;
    update public.dns_access set device_id = coalesce(device_id, p_device), device_bound_at = coalesce(device_bound_at, now()) where account_id = r.account_id;
  elsif exists (select 1 from public.dns_devices where account_id = r.account_id) then
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
  insert into public.dns_access_log (account_id, event, ip, country, ua, device_id)
  values (r.account_id, 'activate', p_ip, nullif(p_country, ''), left(p_ua, 300), left(p_device, 12));
  if random() < 0.02 then delete from public.dns_access_log where at < now() - interval '180 days'; end if;
  return jsonb_build_object('ok', true, 'ip', p_ip, 'changed', true);
end $function$;
revoke all on function public.dns_activate_ip(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.dns_activate_ip(text, text, text, text, text) to service_role;

-- 4) "Clear device lock" also empties the allowed-devices list
create or replace function public.dns_clear_ip(p_username text)
returns void language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); rec public.vpn_accounts;
begin
  if uid is null then raise exception 'Login required'; end if;
  if not public.is_admin() then raise exception 'Only the admin can clear a device lock'; end if;
  select * into rec from public.vpn_accounts where username = p_username;
  if not found then raise exception 'Account not found'; end if;
  update public.dns_access set bound_ip = null, bound_at = null, device_id = null, device_bound_at = null where account_id = rec.id;
  delete from public.dns_devices where account_id = rec.id;
  insert into public.activity_log (owner_id, message) values (uid, 'DNS device lock cleared: ' || p_username);
end $function$;

-- 5) phone + customer-ID login, now aware of several allowed devices.
--    With 2-3 allowed devices a second phone must open the customer LINK (a login would replace the private link of the first phone).
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

  select a.id, a.username, a.owner_id, coalesce(d.max_devices, 1) as mx into r
    from public.vpn_accounts a left join public.dns_access d on d.account_id = a.id
   where a.service = 'dns' and right(a.username, 9) = pk and upper(coalesce(a.customer_code, '')) = code
   limit 1;
  if not found then
    insert into public.dns_login_attempts (phone_key, ip, ok) values (pk, ipk, false);
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if r.mx > 1 and exists (select 1 from public.dns_devices where account_id = r.id and device_id <> p_device) then
    return jsonb_build_object('ok', false, 'error', 'use_link');
  end if;
  if not public.dns_device_ok(r.id, p_device, r.mx, null, left(ipk, 64), null) then
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
  insert into public.dns_access_log (account_id, event, ip, device_id) values (r.id, 'app_login', left(ipk, 64), left(p_device, 12));
  insert into public.activity_log (owner_id, message) values (r.owner_id, 'App login: ' || r.username);
  return jsonb_build_object('ok', true, 'token', tok);
end $function$;
revoke all on function public.dns_login(text, text, text, text) from public, anon, authenticated;
grant execute on function public.dns_login(text, text, text, text) to service_role;

-- 6) admin: set allowed devices (1-3) for a DNS customer
create or replace function public.set_allowed_devices(p_username text, p_max int)
returns void language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); rec public.vpn_accounts;
begin
  if uid is null then raise exception 'Login required'; end if;
  if not public.is_admin() then raise exception 'Only the admin can change allowed devices'; end if;
  if p_max is null or p_max < 1 or p_max > 3 then raise exception 'Allowed devices must be 1, 2 or 3'; end if;
  select * into rec from public.vpn_accounts where username = p_username;
  if not found then raise exception 'Account not found'; end if;
  update public.dns_access set max_devices = p_max where account_id = rec.id;
  if not found then raise exception 'This customer has no DNS link yet. Create the link first.'; end if;
  insert into public.activity_log (owner_id, message) values (uid, 'Allowed devices set to ' || p_max || ': ' || p_username);
end $function$;
revoke all on function public.set_allowed_devices(text, int) from public, anon;
grant execute on function public.set_allowed_devices(text, int) to authenticated;

-- 7) lookup by customer ID, phone, full DNS link, private token or per-customer hostname.
--    Admin sees every customer; a reseller only their own.
create or replace function public.admin_account_lookup(p_query text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); q text := btrim(coalesce(p_query, '')); tok text; lbl text; digits text; acc record;
begin
  if uid is null then raise exception 'Login required'; end if;
  if length(q) < 4 then raise exception 'Enter a customer ID, phone number or DNS link'; end if;
  tok := (regexp_match(lower(q), '[a-f0-9]{64}'))[1];
  if tok is null then lbl := (regexp_match(lower(q), '([a-f0-9]{16})(\.|$)'))[1]; end if;
  digits := regexp_replace(q, '\D', '', 'g');
  select a.id, a.username, a.service, a.status, a.expiry_date, a.owner_id, a.customer_code, d.bound_ip, d.bound_at, d.max_devices into acc
    from public.vpn_accounts a left join public.dns_access d on d.account_id = a.id
   where (tok is not null and d.token_hash = encode(sha256(convert_to(tok, 'utf8')), 'hex'))
      or (tok is null and lbl is not null and d.host_label = lbl)
      or (tok is null and lbl is null and length(q) = 6 and upper(coalesce(a.customer_code, '')) = upper(q))
      or (tok is null and lbl is null and length(digits) >= 8 and right(a.username, 9) = right(digits, 9))
   limit 1;
  if not found then return jsonb_build_object('found', false); end if;
  if not public.is_admin() and acc.owner_id is distinct from uid then return jsonb_build_object('found', false); end if;
  return jsonb_build_object(
    'found', true, 'username', acc.username, 'service', acc.service, 'status', acc.status,
    'expiry', acc.expiry_date, 'customer_code', acc.customer_code, 'owner_id', acc.owner_id,
    'bound_ip', acc.bound_ip, 'bound_at', acc.bound_at, 'max_devices', coalesce(acc.max_devices, 1),
    'devices', coalesce((select jsonb_agg(jsonb_build_object('id', left(x.device_id, 6) || '...', 'first_seen', x.first_seen, 'last_seen', x.last_seen, 'ua', x.ua, 'country', x.country, 'ip', x.ip) order by x.first_seen)
                           from public.dns_devices x where x.account_id = acc.id), '[]'::jsonb),
    'log', coalesce((select jsonb_agg(to_jsonb(l)) from (select at, event, ip, country, ua from public.dns_access_log where account_id = acc.id order by at desc limit 15) l), '[]'::jsonb)
  );
end $function$;
revoke all on function public.admin_account_lookup(text) from public, anon;
grant execute on function public.admin_account_lookup(text) to authenticated;

-- 8) free trial: one trial per phone (the app sends its device ID). The website is unchanged (still limited per IP).
drop function if exists public.public_free_trial(text, text);
create or replace function public.public_free_trial(p_name text, p_phone text, p_device text default null)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare
  ph text; nm text; v_ip text; owner uuid; host text; rec public.vpn_accounts; tok text; hdr jsonb; dev text := nullif(btrim(coalesce(p_device, '')), '');
begin
  nm := left(trim(coalesce(p_name, '')), 60);
  if length(nm) < 2 then raise exception 'Please enter your name'; end if;
  ph := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(ph) < 8 or length(ph) > 15 then raise exception 'Enter your WhatsApp number with country code'; end if;

  if dev is not null then
    if length(dev) < 8 or length(dev) > 64 then dev := null;
    elsif exists (select 1 from public.trial_devices t where t.device_id = dev) then
      raise exception 'This phone has already used a free trial. Please buy a plan to continue.';
    end if;
  end if;

  begin
    hdr := nullif(current_setting('request.headers', true), '')::jsonb;
    v_ip := split_part(coalesce(hdr->>'cf-connecting-ip', hdr->>'x-forwarded-for', ''), ',', 1);
  exception when others then v_ip := null; end;
  v_ip := nullif(trim(v_ip), '');

  if (select count(*) from public.public_trial_log l where l.created_at > now() - interval '24 hours') >= 100 then
    raise exception 'Free trials are very busy right now. Please message us on WhatsApp.';
  end if;
  if v_ip is not null and (select count(*) from public.public_trial_log l where l.ip = v_ip and l.created_at > now() - interval '24 hours') >= 2 then
    raise exception 'Trial limit reached for today. Please message us on WhatsApp.';
  end if;

  if exists (select 1 from public.vpn_accounts a where a.username = ph) then
    raise exception 'This number already has an account or has used a trial. Please contact your reseller or admin.';
  end if;

  select p.id into owner from public.profiles p where p.role = 'admin' order by p.created_at limit 1;
  if owner is null then raise exception 'Service not ready'; end if;
  select a.server_host into host from public.vpn_accounts a where a.server_tier = 'Normal' and a.server_host is not null limit 1;

  insert into public.vpn_accounts
    (owner_id, username, password, server_tier, server_host, days, bandwidth_type, bandwidth_gb, used_mb, price_bdt, start_date, expiry_date, status, trial_ends_at)
  values
    (owner, ph, substr(md5(random()::text || clock_timestamp()::text), 1, 12), 'Normal', coalesce(host, 'my.ovpn.ovh'),
     365, 'Unlimited', 0, 0, 0, current_date, current_date + 1, 'active', now() + interval '1 hour')
  returning * into rec;

  tok := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.dns_access (account_id, token_hash)
  values (rec.id, encode(sha256(convert_to(tok, 'utf8')), 'hex'))
  on conflict (account_id) do update set token_hash = excluded.token_hash;

  insert into public.public_trial_log (name, phone, ip) values (nm, ph, v_ip);
  if dev is not null then insert into public.trial_devices (device_id, phone) values (dev, ph) on conflict do nothing; end if;
  insert into public.dns_access_log (account_id, event, ip, device_id) values (rec.id, 'trial', v_ip, left(dev, 12));
  insert into public.activity_log (owner_id, message) values (owner, 'Website free trial: ' || nm || ' (' || ph || ') - 1 hour - ID ' || rec.customer_code);
  return jsonb_build_object('token', tok, 'ends_at', rec.trial_ends_at, 'code', rec.customer_code);
exception when unique_violation then
  raise exception 'This number already has an account or has used a trial. Please contact your reseller or admin.';
end $function$;
grant execute on function public.public_free_trial(text, text, text) to anon, authenticated;
