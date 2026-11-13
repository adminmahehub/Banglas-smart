-- 014: resellers can approve a free trial by customer ID (0 credits), every account remembers WHO approved it and
--      WHICH plan it is, the account lookup shows it, and the trial link works also after a paid activation.
-- Backward compatible. Already-existing accounts keep working.

alter table public.vpn_accounts add column if not exists approved_by uuid;
alter table public.vpn_accounts add column if not exists approved_at timestamptz;
alter table public.vpn_accounts add column if not exists plan_label text;

-- admin approves from the dashboard card
create or replace function public.approve_trial(p_username text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); rec public.vpn_accounts;
begin
  if uid is null or not public.is_admin() then raise exception 'Only the admin can approve a trial'; end if;
  select * into rec from public.vpn_accounts where username = p_username and status = 'pending';
  if not found then raise exception 'No waiting trial request for this number'; end if;
  update public.vpn_accounts
     set status = 'active', trial_ends_at = now() + interval '1 hour', start_date = current_date, expiry_date = current_date + 1,
         approved_by = uid, approved_at = now(), plan_label = 'Free trial (1 hour)'
   where id = rec.id;
  insert into public.activity_log (owner_id, message) values (uid, 'Trial approved (1 hour): ' || p_username);
  return jsonb_build_object('ok', true);
end $function$;

-- reseller (or admin) approves a waiting trial with the customer's 6-digit ID. Costs no credit. The customer becomes theirs.
create or replace function public.approve_trial_by_code(p_code text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); rec public.vpn_accounts; cd text; adm boolean; owner_is_admin boolean;
begin
  if uid is null then raise exception 'Login required'; end if;
  adm := public.is_admin();
  cd := regexp_replace(coalesce(p_code, ''), '[^0-9]', '', 'g');
  if length(cd) <> 6 then raise exception 'Enter the 6-digit customer ID'; end if;
  select * into rec from public.vpn_accounts where customer_code = cd and service = 'dns' for update;
  if not found then raise exception 'Customer ID not found, or it already belongs to another reseller'; end if;
  select exists (select 1 from public.profiles where id = rec.owner_id and role = 'admin') into owner_is_admin;
  if rec.owner_id <> uid and not adm and not owner_is_admin then
    raise exception 'Customer ID not found, or it already belongs to another reseller';
  end if;
  if rec.status <> 'pending' then raise exception 'This customer is not waiting for a free trial'; end if;
  update public.vpn_accounts
     set status = 'active', trial_ends_at = now() + interval '1 hour', start_date = current_date, expiry_date = current_date + 1,
         owner_id = case when adm then rec.owner_id else uid end,
         approved_by = uid, approved_at = now(), plan_label = 'Free trial (1 hour)'
   where id = rec.id;
  insert into public.activity_log (owner_id, message)
    values (uid, 'Trial approved (1 hour, 0 credit): ' || rec.username || ' (ID ' || cd || ')');
  return jsonb_build_object('ok', true, 'username', rec.username, 'code', cd, 'trial', true);
end $function$;
revoke all on function public.approve_trial_by_code(text) from public, anon;
grant execute on function public.approve_trial_by_code(text) to authenticated;

-- paid activation remembers who did it and what plan
create or replace function public.activate_customer(p_code text, p_months integer)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); adm boolean; rec public.vpn_accounts; bal integer; new_exp date; cd text; owner_is_admin boolean;
begin
  if uid is null then raise exception 'Login required'; end if;
  adm := public.is_admin();
  if p_months is null or p_months < 1 or p_months > 12 then raise exception 'Months must be 1 to 12'; end if;
  cd := regexp_replace(coalesce(p_code, ''), '[^0-9]', '', 'g');
  if length(cd) <> 6 then raise exception 'Enter the 6-digit customer ID'; end if;
  select * into rec from public.vpn_accounts where customer_code = cd and service = 'dns' for update;
  if not found then raise exception 'Customer ID not found, or it already belongs to another reseller'; end if;
  select exists (select 1 from public.profiles where id = rec.owner_id and role = 'admin') into owner_is_admin;
  if rec.owner_id <> uid and not adm and not owner_is_admin then
    raise exception 'Customer ID not found, or it already belongs to another reseller';
  end if;
  if not adm then
    select credits into bal from public.profiles where id = uid for update;
    if bal is null or bal < p_months then raise exception 'Insufficient credits'; end if;
    update public.profiles set credits = credits - p_months where id = uid;
  end if;
  new_exp := greatest(rec.expiry_date, current_date) + (p_months * 30);
  update public.vpn_accounts
     set expiry_date = new_exp,
         status = 'active',
         trial_ends_at = null,
         owner_id = case when adm then rec.owner_id else uid end,
         approved_by = uid, approved_at = now(),
         plan_label = 'Paid - ' || p_months || ' month' || case when p_months > 1 then 's' else '' end
   where id = rec.id;
  insert into public.activity_log (owner_id, message)
    values (uid, 'Activated customer ' || rec.username || ' (ID ' || cd || '): +' || p_months || ' month(s)');
  return jsonb_build_object('ok', true, 'username', rec.username, 'code', cd, 'expiry_date', new_exp, 'months', p_months);
end $function$;

-- a reseller who creates a trial by hand is also recorded
create or replace function public.create_trial_customer(p_phone text)
returns public.vpn_accounts language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); ph text; host text; rec public.vpn_accounts;
begin
  if uid is null then raise exception 'Login required'; end if;
  ph := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(ph) < 8 or length(ph) > 15 then raise exception 'Enter a valid phone number with country code'; end if;
  if exists (select 1 from public.vpn_accounts where username = ph) then
    raise exception 'This phone number already has an account. Use Renew instead.';
  end if;
  select server_host into host from public.vpn_accounts where server_tier = 'Normal' and server_host is not null limit 1;
  insert into public.vpn_accounts
    (owner_id, username, password, server_tier, server_host, days, bandwidth_type, bandwidth_gb, used_mb, price_bdt, start_date, expiry_date, status, trial_ends_at, approved_by, approved_at, plan_label)
  values
    (uid, ph, substr(md5(random()::text || clock_timestamp()::text), 1, 12), 'Normal', coalesce(host, 'my.ovpn.ovh'),
     365, 'Unlimited', 0, 0, 0, current_date, current_date + 1, 'active', now() + interval '1 hour', uid, now(), 'Free trial (1 hour)')
  returning * into rec;
  insert into public.activity_log (owner_id, message) values (uid, 'Created TRIAL customer ' || ph || ' (1 hour)');
  return rec;
exception when unique_violation then
  raise exception 'This phone number already has an account. Use Renew instead.';
end $function$;

-- the website/app trial: the admin can switch ON "approval for everybody" (app_settings trial_force_manual = on)
create or replace function public.public_free_trial(p_name text, p_phone text, p_device text default null, p_manual boolean default false)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare
  ph text; nm text; v_ip text; owner uuid; host text; rec public.vpn_accounts; ex record; tok text; hdr jsonb;
  dev text := nullif(btrim(coalesce(p_device, '')), '');
  manual boolean := coalesce(p_manual, false);
begin
  if coalesce((select s.value from public.app_settings s where s.key = 'trial_force_manual'), 'off') = 'on' then manual := true; end if;
  nm := left(trim(coalesce(p_name, '')), 60);
  if length(nm) < 2 then raise exception 'Please enter your name'; end if;
  ph := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(ph) < 8 or length(ph) > 15 then raise exception 'Enter your WhatsApp number with country code'; end if;

  if manual then
    select a.status, a.customer_code into ex from public.vpn_accounts a where a.username = ph;
    if found and ex.status = 'pending' then
      return jsonb_build_object('pending', true, 'code', ex.customer_code);
    end if;
  end if;

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

  if manual then
    insert into public.vpn_accounts
      (owner_id, username, password, server_tier, server_host, days, bandwidth_type, bandwidth_gb, used_mb, price_bdt, start_date, expiry_date, status, trial_ends_at, plan_label)
    values
      (owner, ph, substr(md5(random()::text || clock_timestamp()::text), 1, 12), 'Normal', coalesce(host, 'my.ovpn.ovh'),
       365, 'Unlimited', 0, 0, 0, current_date, current_date + 1, 'pending', null, 'Waiting for approval')
    returning * into rec;
    insert into public.dns_access (account_id, token_hash)
    values (rec.id, encode(sha256(convert_to(gen_random_uuid()::text || clock_timestamp()::text, 'utf8')), 'hex'))
    on conflict (account_id) do nothing;
    insert into public.public_trial_log (name, phone, ip) values (nm, ph, v_ip);
    if dev is not null then insert into public.trial_devices (device_id, phone) values (dev, ph) on conflict do nothing; end if;
    insert into public.activity_log (owner_id, message) values (owner, 'Free trial REQUEST (approve it on the Dashboard): ' || nm || ' (' || ph || ') - ID ' || rec.customer_code);
    return jsonb_build_object('pending', true, 'code', rec.customer_code);
  end if;

  insert into public.vpn_accounts
    (owner_id, username, password, server_tier, server_host, days, bandwidth_type, bandwidth_gb, used_mb, price_bdt, start_date, expiry_date, status, trial_ends_at, plan_label)
  values
    (owner, ph, substr(md5(random()::text || clock_timestamp()::text), 1, 12), 'Normal', coalesce(host, 'my.ovpn.ovh'),
     365, 'Unlimited', 0, 0, 0, current_date, current_date + 1, 'active', now() + interval '1 hour', 'Free trial (1 hour) - instant, no approval')
  returning * into rec;

  tok := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.dns_access (account_id, token_hash)
  values (rec.id, encode(sha256(convert_to(tok, 'utf8')), 'hex'))
  on conflict (account_id) do update set token_hash = excluded.token_hash;

  insert into public.public_trial_log (name, phone, ip) values (nm, ph, v_ip);
  if dev is not null then insert into public.trial_devices (device_id, phone) values (dev, ph) on conflict do nothing; end if;
  insert into public.dns_access_log (account_id, event, ip, device_id) values (rec.id, 'trial', v_ip, left(dev, 12));
  insert into public.activity_log (owner_id, message) values (owner, 'Instant free trial (no approval): ' || nm || ' (' || ph || ') - 1 hour - ID ' || rec.customer_code);
  return jsonb_build_object('token', tok, 'ends_at', rec.trial_ends_at, 'code', rec.customer_code);
exception when unique_violation then
  raise exception 'This number already has an account or has used a trial. Please contact your reseller or admin.';
end $function$;
grant execute on function public.public_free_trial(text, text, text, boolean) to anon, authenticated;

-- "is my trial approved?": phone + 6-digit ID. An approved account that was never opened on a phone gets its private link here.
-- (works for a free trial AND for a paid activation done straight from the customer ID)
create or replace function public.trial_check(p_phone text, p_code text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  code text := upper(btrim(coalesce(p_code, '')));
  pk text; r public.vpn_accounts; tok text; fp int; hdr jsonb; v_ip text; used boolean;
begin
  if length(digits) < 8 or length(code) <> 6 then return jsonb_build_object('state', 'not_found'); end if;
  pk := right(digits, 9);
  begin
    hdr := nullif(current_setting('request.headers', true), '')::jsonb;
    v_ip := split_part(coalesce(hdr->>'cf-connecting-ip', hdr->>'x-forwarded-for', ''), ',', 1);
  exception when others then v_ip := null; end;
  v_ip := coalesce(nullif(trim(v_ip), ''), '');
  select count(*) into fp from public.dns_login_attempts where phone_key = pk and not ok and at > now() - interval '30 minutes';
  if fp >= 8 then return jsonb_build_object('state', 'too_many'); end if;

  select a.* into r from public.vpn_accounts a
   where a.service = 'dns' and right(a.username, 9) = pk and upper(coalesce(a.customer_code, '')) = code limit 1;
  if not found then
    insert into public.dns_login_attempts (phone_key, ip, ok) values (pk, v_ip, false);
    return jsonb_build_object('state', 'not_found');
  end if;
  if r.status = 'pending' then return jsonb_build_object('state', 'pending'); end if;
  if r.status <> 'active' or r.expiry_date < current_date or (r.trial_ends_at is not null and r.trial_ends_at <= now()) then
    return jsonb_build_object('state', 'expired');
  end if;
  select exists (select 1 from public.dns_devices x where x.account_id = r.id)
      or exists (select 1 from public.dns_access d where d.account_id = r.id and d.bound_ip is not null) into used;
  if used then return jsonb_build_object('state', 'used'); end if;
  tok := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  update public.dns_access set token_hash = encode(sha256(convert_to(tok, 'utf8')), 'hex') where account_id = r.id;
  insert into public.dns_login_attempts (phone_key, ip, ok) values (pk, v_ip, true);
  return jsonb_build_object('state', 'active', 'token', tok, 'ends_at', coalesce(r.trial_ends_at, r.expiry_date::timestamptz), 'trial', r.trial_ends_at is not null);
end $function$;
grant execute on function public.trial_check(text, text) to anon, authenticated;

-- the lookup card shows seller, who approved, and the plan
create or replace function public.admin_account_lookup(p_query text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); q text := btrim(coalesce(p_query, '')); tok text; lbl text; digits text; acc record;
begin
  if uid is null then raise exception 'Login required'; end if;
  if length(q) < 4 then raise exception 'Enter a customer ID, phone number or DNS link'; end if;
  tok := (regexp_match(lower(q), '[a-f0-9]{64}'))[1];
  if tok is null then lbl := (regexp_match(lower(q), '([a-f0-9]{16})(\.|$)'))[1]; end if;
  digits := regexp_replace(q, '\D', '', 'g');
  select a.id, a.username, a.service, a.status, a.expiry_date, a.owner_id, a.customer_code, a.trial_ends_at, a.approved_by, a.approved_at, a.plan_label,
         d.bound_ip, d.bound_at, d.max_devices into acc
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
    'plan', coalesce(acc.plan_label, case when acc.trial_ends_at is not null then 'Free trial (1 hour)' else null end),
    'approved_by_name', (select coalesce(p.name, p.whatsapp) from public.profiles p where p.id = acc.approved_by),
    'approved_at', acc.approved_at,
    'bound_ip', acc.bound_ip, 'bound_at', acc.bound_at, 'max_devices', coalesce(acc.max_devices, 1),
    'devices', coalesce((select jsonb_agg(jsonb_build_object('id', left(x.device_id, 6) || '...', 'first_seen', x.first_seen, 'last_seen', x.last_seen, 'ua', x.ua, 'country', x.country, 'ip', x.ip) order by x.first_seen)
                           from public.dns_devices x where x.account_id = acc.id), '[]'::jsonb),
    'log', coalesce((select jsonb_agg(to_jsonb(l)) from (select at, event, ip, country, ua from public.dns_access_log where account_id = acc.id order by at desc limit 15) l), '[]'::jsonb)
  );
end $function$;
