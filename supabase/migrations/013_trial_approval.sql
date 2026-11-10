-- 013: website free trial needs the admin's approval (customer sends his ID on WhatsApp, admin taps Approve).
-- Backward compatible: the old website (no p_manual) still gets an instant trial until the new website is live.
-- (The mobile app keeps the instant trial; it is already limited to one trial per phone.)

alter table public.vpn_accounts drop constraint if exists vpn_accounts_status_check;
alter table public.vpn_accounts add constraint vpn_accounts_status_check check (status in ('active', 'suspended', 'expired', 'pending'));

drop function if exists public.public_free_trial(text, text, text);
create or replace function public.public_free_trial(p_name text, p_phone text, p_device text default null, p_manual boolean default false)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare
  ph text; nm text; v_ip text; owner uuid; host text; rec public.vpn_accounts; ex record; tok text; hdr jsonb;
  dev text := nullif(btrim(coalesce(p_device, '')), '');
begin
  nm := left(trim(coalesce(p_name, '')), 60);
  if length(nm) < 2 then raise exception 'Please enter your name'; end if;
  ph := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(ph) < 8 or length(ph) > 15 then raise exception 'Enter your WhatsApp number with country code'; end if;

  -- the same number asks again while still waiting: show the same ID again
  if p_manual then
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

  if p_manual then
    insert into public.vpn_accounts
      (owner_id, username, password, server_tier, server_host, days, bandwidth_type, bandwidth_gb, used_mb, price_bdt, start_date, expiry_date, status, trial_ends_at)
    values
      (owner, ph, substr(md5(random()::text || clock_timestamp()::text), 1, 12), 'Normal', coalesce(host, 'my.ovpn.ovh'),
       365, 'Unlimited', 0, 0, 0, current_date, current_date + 1, 'pending', null)
    returning * into rec;
    -- placeholder: nobody knows this token. The real private link is created when the admin approves and the customer checks.
    insert into public.dns_access (account_id, token_hash)
    values (rec.id, encode(sha256(convert_to(gen_random_uuid()::text || clock_timestamp()::text, 'utf8')), 'hex'))
    on conflict (account_id) do nothing;
    insert into public.public_trial_log (name, phone, ip) values (nm, ph, v_ip);
    if dev is not null then insert into public.trial_devices (device_id, phone) values (dev, ph) on conflict do nothing; end if;
    insert into public.activity_log (owner_id, message) values (owner, 'Free trial REQUEST (approve it on the Dashboard): ' || nm || ' (' || ph || ') - ID ' || rec.customer_code);
    return jsonb_build_object('pending', true, 'code', rec.customer_code);
  end if;

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
grant execute on function public.public_free_trial(text, text, text, boolean) to anon, authenticated;

-- the customer asks "is my trial approved?" (phone + 6-character ID). When approved he gets his private link.
create or replace function public.trial_check(p_phone text, p_code text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  code text := upper(btrim(coalesce(p_code, '')));
  pk text; r public.vpn_accounts; tok text; fp int; hdr jsonb; v_ip text;
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
  if not found or (r.trial_ends_at is null and r.status <> 'pending') then
    insert into public.dns_login_attempts (phone_key, ip, ok) values (pk, v_ip, false);
    return jsonb_build_object('state', 'not_found');
  end if;
  if r.status = 'pending' then return jsonb_build_object('state', 'pending'); end if;
  if r.status = 'active' and r.trial_ends_at is not null and r.trial_ends_at > now() then
    tok := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
    update public.dns_access set token_hash = encode(sha256(convert_to(tok, 'utf8')), 'hex') where account_id = r.id;
    insert into public.dns_login_attempts (phone_key, ip, ok) values (pk, v_ip, true);
    return jsonb_build_object('state', 'active', 'token', tok, 'ends_at', r.trial_ends_at);
  end if;
  return jsonb_build_object('state', 'expired');
end $function$;
grant execute on function public.trial_check(text, text) to anon, authenticated;

-- admin: list, approve and reject website trial requests
create or replace function public.pending_trials()
returns jsonb language plpgsql security definer set search_path to '' as $function$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Only the admin can see trial requests'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'username', a.username, 'code', a.customer_code, 'created_at', a.created_at,
      'name', (select l.name from public.public_trial_log l where l.phone = a.username order by l.created_at desc limit 1)
    ) order by a.created_at)
    from public.vpn_accounts a where a.status = 'pending'
  ), '[]'::jsonb);
end $function$;
revoke all on function public.pending_trials() from public, anon;
grant execute on function public.pending_trials() to authenticated;

create or replace function public.approve_trial(p_username text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); rec public.vpn_accounts;
begin
  if uid is null or not public.is_admin() then raise exception 'Only the admin can approve a trial'; end if;
  select * into rec from public.vpn_accounts where username = p_username and status = 'pending';
  if not found then raise exception 'No waiting trial request for this number'; end if;
  update public.vpn_accounts
     set status = 'active', trial_ends_at = now() + interval '1 hour', start_date = current_date, expiry_date = current_date + 1
   where id = rec.id;
  insert into public.activity_log (owner_id, message) values (uid, 'Trial approved (1 hour): ' || p_username);
  return jsonb_build_object('ok', true);
end $function$;
revoke all on function public.approve_trial(text) from public, anon;
grant execute on function public.approve_trial(text) to authenticated;

create or replace function public.reject_trial(p_username text)
returns void language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid();
begin
  if uid is null or not public.is_admin() then raise exception 'Only the admin can reject a trial'; end if;
  delete from public.vpn_accounts where username = p_username and status = 'pending';
  if not found then raise exception 'No waiting trial request for this number'; end if;
  insert into public.activity_log (owner_id, message) values (uid, 'Trial request rejected: ' || p_username);
end $function$;
revoke all on function public.reject_trial(text) from public, anon;
grant execute on function public.reject_trial(text) to authenticated;

-- requests nobody answered for 3 days are removed (so the number can ask again)
create or replace function public.expire_trials()
returns integer language plpgsql security definer set search_path to '' as $function$
declare n integer;
begin
  delete from public.vpn_accounts where status = 'pending' and created_at < now() - interval '3 days';
  -- a trial that was renewed (paid) is a normal account from now on
  update public.vpn_accounts set trial_ends_at = null
   where trial_ends_at is not null
     and expiry_date > (trial_ends_at at time zone 'utc')::date + 1;
  with e as (
    update public.vpn_accounts set status = 'expired'
     where status = 'active' and trial_ends_at is not null and trial_ends_at <= now()
    returning owner_id, username)
  insert into public.activity_log (owner_id, message)
  select owner_id, 'Trial ended: ' || username from e;
  get diagnostics n = row_count;
  return n;
end $function$;
