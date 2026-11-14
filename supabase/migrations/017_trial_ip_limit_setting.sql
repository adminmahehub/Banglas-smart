-- 017: the daily free-trial limit per internet connection (IP) is now an admin setting (app_settings.trial_ip_limit, default 2).
-- Raise it while testing, e.g.:  update public.app_settings set value = '10' where key = 'trial_ip_limit';
insert into public.app_settings(key, value) values ('trial_ip_limit', '2') on conflict (key) do nothing;

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
  if v_ip is not null and (select count(*) from public.public_trial_log l where l.ip = v_ip and l.created_at > now() - interval '24 hours') >= coalesce(nullif((select s.value from public.app_settings s where s.key = 'trial_ip_limit'), '')::int, 2) then
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
