-- 016: (1) free trial always needs approval (also for the old app)  (2) app login with phone OR customer ID (or both)

-- 1) approval for everybody (the old app that gave an instant trial now gets an error instead)
insert into public.app_settings(key, value) values ('trial_force_manual', 'on')
on conflict (key) do update set value = 'on';

-- 2) dns_login: phone number only, customer ID only, or both.
--    Safety: every wrong try is counted (per phone/ID and per IP), and the device lock still applies,
--    so a second phone can never take over an account that is already linked to another phone.
create or replace function public.dns_login(p_phone text, p_code text, p_device text, p_ip text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  code text := upper(btrim(coalesce(p_code, '')));
  pk text; r record; tok text; fp int; fi int; fc int; cnt int; ipk text := coalesce(p_ip, '');
  has_phone boolean; has_code boolean;
begin
  has_phone := length(digits) >= 8;
  has_code := length(code) = 6;
  if p_device is null or length(p_device) < 8
     or (digits <> '' and not has_phone) or (code <> '' and not has_code)
     or not (has_phone or has_code) then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;
  pk := case when has_phone then right(digits, 9) else 'c' || code end;

  delete from public.dns_login_attempts where at < now() - interval '2 days';
  select count(*) into fp from public.dns_login_attempts where phone_key = pk and not ok and at > now() - interval '30 minutes';
  select count(*) into fi from public.dns_login_attempts where ip = ipk and not ok and at > now() - interval '30 minutes';
  if fp >= 5 or fi >= 15 then return jsonb_build_object('ok', false, 'error', 'too_many'); end if;
  if not has_phone then -- ID-only tries are limited harder, a 6-digit ID alone is easier to guess
    select count(*) into fc from public.dns_login_attempts where ip = ipk and phone_key like 'c%' and not ok and at > now() - interval '30 minutes';
    if fc >= 6 then return jsonb_build_object('ok', false, 'error', 'too_many'); end if;
  end if;

  select count(*) into cnt from public.vpn_accounts a
   where a.service = 'dns'
     and (not has_phone or right(a.username, 9) = right(digits, 9))
     and (not has_code or upper(coalesce(a.customer_code, '')) = code);
  if cnt = 0 then
    insert into public.dns_login_attempts (phone_key, ip, ok) values (pk, ipk, false);
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if cnt > 1 then
    return jsonb_build_object('ok', false, 'error', 'need_id');
  end if;

  select a.id, a.username, a.owner_id, coalesce(d.max_devices, 1) as mx into r
    from public.vpn_accounts a left join public.dns_access d on d.account_id = a.id
   where a.service = 'dns'
     and (not has_phone or right(a.username, 9) = right(digits, 9))
     and (not has_code or upper(coalesce(a.customer_code, '')) = code)
   limit 1;

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

-- 3) the "Pending free trials" card also shows when it was asked and from which IP
create or replace function public.pending_trials()
returns jsonb language plpgsql security definer set search_path to '' as $function$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Only the admin can see trial requests'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'username', a.username, 'code', a.customer_code, 'created_at', a.created_at,
      'name', (select l.name from public.public_trial_log l where l.phone = a.username order by l.created_at desc limit 1),
      'ip', (select l.ip from public.public_trial_log l where l.phone = a.username order by l.created_at desc limit 1)
    ) order by a.created_at)
    from public.vpn_accounts a where a.status = 'pending'
  ), '[]'::jsonb);
end $function$;
revoke all on function public.pending_trials() from public, anon;
grant execute on function public.pending_trials() to authenticated;
