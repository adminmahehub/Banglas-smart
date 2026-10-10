-- WireGuard VPN (Bangladesh VPS) for the VPN panel. Additive: OpenVPN objects are untouched.
create table if not exists public.wg_config (
  id integer primary key default 1 check (id = 1),
  api_url text not null,
  api_token text not null,
  updated_at timestamptz not null default now()
);
alter table public.wg_config enable row level security;  -- no policies: only the service role (edge functions) can read it

-- Called every minute by the WireGuard server (through the wg-sync edge function):
-- adds the usage it measured, expires accounts, and returns which peers should be active.
create or replace function public.wg_sync(p_usage jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare act text[]; ina text[];
begin
  update public.vpn_accounts a
     set used_mb = a.used_mb + round((u.value)::numeric / 1048576, 3)
    from jsonb_each_text(coalesce(p_usage, '{}'::jsonb)) u
   where a.service = 'vpn' and coalesce(a.cert_name, replace(a.username, '.', '_')) = u.key;

  with e as (
    update public.vpn_accounts set status = 'expired'
     where service = 'vpn' and status = 'active' and expiry_date < current_date
    returning owner_id, username)
  insert into public.activity_log (owner_id, message)
  select owner_id, 'Expired: ' || username from e;

  with o as (
    update public.vpn_accounts set status = 'expired'
     where service = 'vpn' and status = 'active' and bandwidth_type = 'Limited' and bandwidth_gb > 0
       and used_mb >= bandwidth_gb * 1024
    returning owner_id, username)
  insert into public.activity_log (owner_id, message)
  select owner_id, 'Bandwidth finished: ' || username from o;

  select coalesce(array_agg(coalesce(cert_name, replace(username, '.', '_'))), '{}') into act
    from public.vpn_accounts where service = 'vpn' and status = 'active';
  select coalesce(array_agg(coalesce(cert_name, replace(username, '.', '_'))), '{}') into ina
    from public.vpn_accounts where service = 'vpn' and status <> 'active';
  return jsonb_build_object('active', to_jsonb(act), 'inactive', to_jsonb(ina));
end $function$;
revoke all on function public.wg_sync(jsonb) from public, anon, authenticated;
grant execute on function public.wg_sync(jsonb) to service_role;
