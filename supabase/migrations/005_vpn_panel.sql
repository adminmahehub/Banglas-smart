-- VPN panel inside the DNS panel (additive; existing rows stay 'dns')
alter table public.vpn_accounts add column if not exists service text not null default 'dns';
alter table public.vpn_accounts drop constraint if exists vpn_accounts_service_check;
alter table public.vpn_accounts add constraint vpn_accounts_service_check check (service in ('dns', 'vpn'));
create index if not exists vpn_accounts_service_idx on public.vpn_accounts (service);

-- Create a VPN account (1 credit = 1 month, same as DNS; admin uses no credits)
create or replace function public.create_vpn_customer(p_username text, p_months integer, p_bw text default 'Unlimited')
returns public.vpn_accounts
language plpgsql
security definer
set search_path to ''
as $function$
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
    select credits into bal from public.profiles where id = uid for update;
    if bal is null or bal < p_months then raise exception 'Insufficient credits'; end if;
  end if;
  select server_host into host from public.vpn_accounts where server_tier = 'Normal' and server_host is not null limit 1;
  insert into public.vpn_accounts
    (owner_id, username, password, server_tier, server_host, days, bandwidth_type, bandwidth_gb, used_mb, price_bdt, start_date, expiry_date, status, service)
  values
    (uid, un, substr(md5(random()::text || clock_timestamp()::text), 1, 12), 'Normal', coalesce(host, 'my.ovpn.ovh'),
     365, bwt, gb, 0, 0, current_date, current_date + (p_months * 30), 'active', 'vpn')
  returning * into rec;
  if not adm then update public.profiles set credits = credits - p_months where id = uid; end if;
  insert into public.activity_log (owner_id, message)
    values (uid, 'Created VPN user ' || un || ' for ' || p_months || ' month(s), ' || case when bwt = 'Unlimited' then 'unlimited' else gb || ' GB' end);
  return rec;
exception when unique_violation then
  raise exception 'This username is already taken';
end $function$;

-- Dashboard stats now take the service ('dns' default, so the old no-argument call still works)
drop function if exists public.admin_dashboard_stats();
create or replace function public.admin_dashboard_stats(p_service text default 'dns')
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare res jsonb; svc text := case when p_service = 'vpn' then 'vpn' else 'dns' end;
begin
  if not coalesce(public.is_admin(), false) then raise exception 'Admin only'; end if;
  with recursive
  tree as (
    select p.id as root_id, p.id as member_id, 0 as lvl from public.profiles p where p.role = 'reseller'
    union all
    select t.root_id, c.id, t.lvl + 1 from tree t join public.profiles c on c.referred_by = t.member_id and c.role = 'reseller' where t.lvl < 10
  ),
  sold as (
    select owner_id, coalesce(sum(amount_bdt),0) as bdt, coalesce(sum(credits),0) as cr
    from public.credit_requests where status = 'approved' group by owner_id
  ),
  custs as (
    select owner_id, count(*) as total,
           count(*) filter (where status = 'active' and expiry_date >= current_date) as active
    from public.vpn_accounts where service = svc group by owner_id
  ),
  per as (
    select r.id, r.name, r.whatsapp, r.credits, r.created_at,
      up.name as upline_name,
      (select count(*) from public.profiles c where c.referred_by = r.id and c.role = 'reseller') as direct_count,
      (select count(*) from tree t where t.root_id = r.id and t.lvl > 0) as team_count,
      coalesce(s.bdt,0) as own_sales_bdt,
      coalesce(s.bdt,0) + coalesce((select sum(s2.bdt) from tree t join sold s2 on s2.owner_id = t.member_id where t.root_id = r.id and t.lvl > 0),0) as team_sales_bdt,
      coalesce(cu.total,0) as customers, coalesce(cu.active,0) as active_customers
    from public.profiles r
    left join public.profiles up on up.id = r.referred_by
    left join sold s on s.owner_id = r.id
    left join custs cu on cu.owner_id = r.id
    where r.role = 'reseller'
  )
  select jsonb_build_object(
    'total_sales_bdt', (select coalesce(sum(amount_bdt),0) from public.credit_requests where status='approved'),
    'month_sales_bdt', (select coalesce(sum(amount_bdt),0) from public.credit_requests where status='approved' and date_trunc('month', coalesce(resolved_at, created_at)) = date_trunc('month', now())),
    'total_credits_sold', (select coalesce(sum(credits),0) from public.credit_requests where status='approved'),
    'month_credits_sold', (select coalesce(sum(credits),0) from public.credit_requests where status='approved' and date_trunc('month', coalesce(resolved_at, created_at)) = date_trunc('month', now())),
    'resellers', (select count(*) from public.profiles where role='reseller'),
    'customers', (select count(*) from public.vpn_accounts where service = svc),
    'active_customers', (select count(*) from public.vpn_accounts where service = svc and status='active' and expiry_date >= current_date),
    'expiring_7d', (select count(*) from public.vpn_accounts where service = svc and status='active' and trial_ends_at is null and expiry_date between current_date and current_date + 7),
    'expired_customers', (select count(*) from public.vpn_accounts where service = svc and (status='expired' or expiry_date < current_date)),
    'active_trials', (select count(*) from public.vpn_accounts where service = svc and trial_ends_at is not null and trial_ends_at > now()),
    'pending_topups', (select count(*) from public.credit_requests where status='pending'),
    'monthly', coalesce((
      select jsonb_agg(jsonb_build_object('month', to_char(m, 'Mon YY'), 'sales_bdt', coalesce(x.bdt,0), 'credits', coalesce(x.cr,0)) order by m)
      from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
      left join (
        select date_trunc('month', coalesce(resolved_at, created_at)) as mm, sum(amount_bdt) as bdt, sum(credits) as cr
        from public.credit_requests where status='approved' group by 1
      ) x on x.mm = m
    ), '[]'::jsonb),
    'per_reseller', coalesce((select jsonb_agg(to_jsonb(per) order by per.team_sales_bdt desc, per.created_at) from per), '[]'::jsonb)
  ) into res;
  return res;
end $function$;
