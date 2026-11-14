-- 022: VPN Panel has its OWN credit balance and its OWN rate (DNS credits and VPN credits never mix).
alter table public.profiles add column if not exists vpn_credits integer not null default 0;
alter table public.credit_requests add column if not exists kind text not null default 'dns' check (kind in ('dns','vpn'));
alter table public.payment_orders add column if not exists kind text not null default 'dns' check (kind in ('dns','vpn'));
insert into public.app_settings(key, value)
select 'vpn_price_per_credit', coalesce((select value from public.app_settings where key = 'price_per_credit'), '200')
on conflict (key) do nothing;

-- allow the admin to set the VPN rate
do $$ begin
  execute replace(replace(pg_get_functiondef('public.admin_set_setting(text,text)'::regprocedure), '''price_per_credit'',', '''price_per_credit'',''vpn_price_per_credit'','), 'p_key = ''price_per_credit'' and', 'p_key in (''price_per_credit'',''vpn_price_per_credit'') and');
end $$;

-- VPN customers cost VPN credits
create or replace function public.create_vpn_customer(p_username text, p_months integer, p_bw text default 'Unlimited')
returns public.vpn_accounts language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); un text; bal integer; host text; rec public.vpn_accounts; adm boolean; gb integer := 0; bwt text;
begin
  if uid is null then raise exception 'Login required'; end if;
  adm := public.is_admin();
  un := lower(btrim(coalesce(p_username, '')));
  if un !~ '^[a-z0-9][a-z0-9_-]{2,30}$' then
    raise exception 'Username must be 3 to 31 characters: letters, numbers, - or _ only';
  end if;
  if p_months is null or p_months < 1 or p_months > 12 then raise exception 'Months must be 1 to 12'; end if;
  if p_bw is null or lower(p_bw) = 'unlimited' then bwt := 'Unlimited';
  elsif p_bw ~ '^[0-9]{1,4}$' and p_bw::int between 1 and 5000 then bwt := 'Limited'; gb := p_bw::int;
  else raise exception 'Invalid bandwidth'; end if;
  if exists (select 1 from public.vpn_accounts where username = un) then
    raise exception 'This username is already taken';
  end if;
  if not adm then
    select vpn_credits into bal from public.profiles where id = uid for update;
    if bal is null or bal < p_months then raise exception 'Insufficient VPN credits'; end if;
  end if;
  select server_host into host from public.vpn_accounts where server_tier = 'Normal' and server_host is not null limit 1;
  insert into public.vpn_accounts
    (owner_id, username, password, server_tier, server_host, days, bandwidth_type, bandwidth_gb, used_mb, price_bdt, start_date, expiry_date, status, service)
  values
    (uid, un, substr(md5(random()::text || clock_timestamp()::text), 1, 12), 'Normal', coalesce(host, 'my.ovpn.ovh'),
     365, bwt, gb, 0, 0, current_date, current_date + (p_months * 30), 'active', 'vpn')
  returning * into rec;
  if not adm then update public.profiles set vpn_credits = vpn_credits - p_months where id = uid; end if;
  insert into public.activity_log (owner_id, message)
    values (uid, 'Created VPN user ' || un || ' for ' || p_months || ' month(s), ' || case when bwt = 'Unlimited' then 'unlimited' else gb || ' GB' end);
  return rec;
exception when unique_violation then
  raise exception 'This username is already taken';
end $function$;

-- renew: VPN accounts use VPN credits, DNS accounts use DNS credits
create or replace function public.renew_customer(p_username text, p_months integer, p_add_gb integer default 0)
returns void language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); rec public.vpn_accounts; bal integer; adm boolean; new_exp date; new_gb integer;
begin
  if uid is null then raise exception 'Login required'; end if;
  adm := public.is_admin();
  if p_months is null or p_months < 0 or p_months > 12 then raise exception 'Months must be 0 to 12'; end if;
  if p_add_gb is null or p_add_gb < 0 or p_add_gb > 5000 then raise exception 'Invalid bandwidth'; end if;
  if p_months = 0 and p_add_gb = 0 then raise exception 'Choose months or bandwidth to add'; end if;
  select * into rec from public.vpn_accounts where username = p_username for update;
  if not found then raise exception 'Account not found'; end if;
  if rec.owner_id <> uid and not adm then raise exception 'Not your customer'; end if;
  if p_add_gb > 0 and rec.bandwidth_type = 'Unlimited' then raise exception 'This account has unlimited bandwidth'; end if;
  if not adm and p_months > 0 then
    if rec.service = 'vpn' then
      select vpn_credits into bal from public.profiles where id = uid for update;
      if bal is null or bal < p_months then raise exception 'Insufficient VPN credits'; end if;
      update public.profiles set vpn_credits = vpn_credits - p_months where id = uid;
    else
      select credits into bal from public.profiles where id = uid for update;
      if bal is null or bal < p_months then raise exception 'Insufficient credits'; end if;
      update public.profiles set credits = credits - p_months where id = uid;
    end if;
  end if;
  new_exp := case when p_months > 0 then greatest(rec.expiry_date, current_date) + (p_months * 30) else rec.expiry_date end;
  new_gb := rec.bandwidth_gb + p_add_gb;
  update public.vpn_accounts
     set expiry_date = new_exp,
         bandwidth_gb = new_gb,
         status = case when new_exp >= current_date and (rec.bandwidth_type = 'Unlimited' or rec.used_mb < new_gb * 1024.0)
                       then 'active' else status end
   where id = rec.id;
  insert into public.activity_log (owner_id, message)
    values (uid, 'Renewed ' || p_username || ': +' || p_months || ' month(s), +' || p_add_gb || ' GB');
end $function$;

-- admin adds credits of a chosen kind
drop function if exists public.admin_add_credits(uuid, integer, text);
create or replace function public.admin_add_credits(p_user uuid, p_credits integer, p_coupon text default null, p_kind text default 'dns')
returns integer language plpgsql security definer set search_path to '' as $function$
declare pct integer := 0; payable integer; price numeric; k text := case when p_kind = 'vpn' then 'vpn' else 'dns' end;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_credits is null or p_credits <= 0 then raise exception 'Invalid credits'; end if;
  if p_user <> auth.uid() and p_credits < 10 then raise exception 'Minimum package is 10 credits'; end if;
  if p_coupon is not null and length(trim(p_coupon)) > 0 then
    select percent into pct from public.coupons where lower(code) = lower(trim(p_coupon)) and active;
    if pct is null then raise exception 'Invalid coupon'; end if;
  end if;
  select coalesce(nullif(value,'')::numeric, 200) into price from public.app_settings
   where key = case when k = 'vpn' then 'vpn_price_per_credit' else 'price_per_credit' end;
  payable := round(p_credits * coalesce(price, 200) * (100 - pct) / 100.0);
  if k = 'vpn' then update public.profiles set vpn_credits = vpn_credits + p_credits where id = p_user;
  else update public.profiles set credits = credits + p_credits where id = p_user; end if;
  if not found then raise exception 'User not found'; end if;
  insert into public.activity_log (owner_id, message)
    values (p_user, upper(k) || ' credits +' || p_credits || ' (payable BDT ' || payable || ')');
  return payable;
end $function$;
revoke all on function public.admin_add_credits(uuid, integer, text, text) from public, anon;
grant execute on function public.admin_add_credits(uuid, integer, text, text) to authenticated;

-- manual top-up request with a kind
drop function if exists public.request_credit_topup(integer, text, text, text, text, text);
create or replace function public.request_credit_topup(p_credits integer, p_trx text, p_method text default null, p_coupon text default null, p_sender text default null, p_proof text default null, p_kind text default 'dns')
returns public.credit_requests language plpgsql security definer set search_path to '' as $function$
declare uid uuid := auth.uid(); price numeric; trx text; m text; rec public.credit_requests; c public.reseller_coupons; pct integer := 0; ccode text; snd text; prf text;
        k text := case when p_kind = 'vpn' then 'vpn' else 'dns' end;
begin
  if uid is null then raise exception 'Login required'; end if;
  if p_credits is null or p_credits < 10 or p_credits > 1000 then raise exception 'Minimum package is 10 credits'; end if;
  trx := upper(regexp_replace(coalesce(p_trx,''), '\s', '', 'g'));
  if trx !~ '^[A-Z0-9]{6,30}$' then raise exception 'Enter a valid Transaction ID'; end if;
  snd := nullif(regexp_replace(coalesce(p_sender,''), '[^0-9]', '', 'g'), '');
  if snd is not null and (length(snd) < 6 or length(snd) > 15) then raise exception 'Enter the number you paid from'; end if;
  prf := nullif(trim(coalesce(p_proof,'')), '');
  if prf is not null and (left(prf, length(uid::text) + 1) <> uid::text || '/' or length(prf) > 200) then raise exception 'Invalid payment screenshot'; end if;
  select coalesce(nullif(s.value,'')::numeric, 200) into price from public.app_settings s
   where s.key = case when k = 'vpn' then 'vpn_price_per_credit' else 'price_per_credit' end;
  price := coalesce(price, 200);
  select coalesce(nullif(p_method,''), (select s.value from public.app_settings s where s.key='pay_method'), 'bKash') into m;
  if p_coupon is not null and length(trim(p_coupon)) > 0 then
    select * into c from public.reseller_coupons rc where upper(rc.code) = upper(trim(p_coupon)) for update;
    if not found or not c.active or (c.expires_at is not null and c.expires_at <= now()) or c.used_count >= c.max_uses
       or exists (select 1 from public.coupon_redemptions r where r.coupon_id = c.id and r.user_id = uid) then
      raise exception 'Invalid or expired coupon';
    end if;
    if c.kind <> 'discount' then raise exception 'This is a gift coupon. Redeem it to get free credits.'; end if;
    pct := c.value; ccode := c.code;
  end if;
  insert into public.credit_requests (owner_id, credits, amount_bdt, method, trx_id, coupon_code, discount_percent, sender_number, proof_path, kind)
    values (uid, p_credits, round(p_credits * price * (100 - pct) / 100.0), m, trx, ccode, pct, snd, prf, k)
    returning * into rec;
  if ccode is not null then
    insert into public.coupon_redemptions (coupon_id, user_id) values (c.id, uid);
    update public.reseller_coupons rc set used_count = rc.used_count + 1 where rc.id = c.id;
  end if;
  insert into public.activity_log (owner_id, message)
    values (uid, 'Top-up request (' || upper(k) || '): ' || p_credits || ' credits, TrxID ' || trx || ' (BDT ' || rec.amount_bdt || case when ccode is not null then ', coupon ' || ccode else '' end || ')');
  return rec;
exception when unique_violation then
  raise exception 'This Transaction ID was already submitted';
end $function$;
revoke all on function public.request_credit_topup(integer, text, text, text, text, text, text) from public, anon;
grant execute on function public.request_credit_topup(integer, text, text, text, text, text, text) to authenticated;

-- approving adds to the right balance
create or replace function public.resolve_credit_request(p_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path to '' as $function$
declare rec public.credit_requests; cid uuid;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  select * into rec from public.credit_requests where id = p_id for update;
  if not found then raise exception 'Request not found'; end if;
  if rec.status <> 'pending' then raise exception 'Request already resolved'; end if;
  update public.credit_requests set status = case when p_approve then 'approved' else 'rejected' end, resolved_at = now() where id = p_id;
  if p_approve then
    if rec.kind = 'vpn' then update public.profiles set vpn_credits = vpn_credits + rec.credits where id = rec.owner_id;
    else update public.profiles set credits = credits + rec.credits where id = rec.owner_id; end if;
    insert into public.activity_log (owner_id, message)
      values (rec.owner_id, upper(rec.kind) || ' credits +' || rec.credits || ' approved (TrxID ' || rec.trx_id || ')');
  else
    if rec.coupon_code is not null then
      select id into cid from public.reseller_coupons where upper(code) = upper(rec.coupon_code);
      if cid is not null then
        delete from public.coupon_redemptions where coupon_id = cid and user_id = rec.owner_id;
        update public.reseller_coupons set used_count = greatest(0, used_count - 1) where id = cid;
      end if;
    end if;
    insert into public.activity_log (owner_id, message)
      values (rec.owner_id, 'Top-up rejected (TrxID ' || rec.trx_id || ')');
  end if;
end $function$;

-- PipraPay: credit the right balance
create or replace function public.piprapay_mark_paid(p_order uuid, p_pp_id text, p_txn text, p_method text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare o public.payment_orders;
begin
  update public.payment_orders
     set status = 'paid', paid_at = now(), pp_id = coalesce(pp_id, p_pp_id), txn_id = p_txn, method = p_method
   where id = p_order and status = 'pending'
   returning * into o;
  if not found then
    select * into o from public.payment_orders where id = p_order;
    return jsonb_build_object('ok', found, 'already', true, 'status', o.status);
  end if;
  if o.kind = 'vpn' then update public.profiles set vpn_credits = vpn_credits + o.credits where id = o.owner_id;
  else update public.profiles set credits = credits + o.credits where id = o.owner_id; end if;
  insert into public.activity_log (owner_id, message)
    values (o.owner_id, upper(o.kind) || ' credits +' || o.credits || ' paid online (' || coalesce(p_method, 'PipraPay') || ', Txn ' || coalesce(p_txn, '-') || ')');
  return jsonb_build_object('ok', true, 'credits', o.credits);
end $function$;
revoke all on function public.piprapay_mark_paid(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.piprapay_mark_paid(uuid, text, text, text) to service_role;
