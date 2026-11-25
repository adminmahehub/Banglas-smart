-- 023: let the admin stop an already-approved B2B partner: marks the request revoked and kills any API key of the matching reseller.
alter table public.b2b_requests drop constraint if exists b2b_requests_status_check;
alter table public.b2b_requests add constraint b2b_requests_status_check check (status in ('pending','approved','rejected','revoked'));

create or replace function public.admin_revoke_b2b_request(p_id uuid, p_note text default null)
returns int language plpgsql security definer set search_path to '' as $function$
declare wa text; n int := 0;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Admin only'; end if;
  select regexp_replace(whatsapp, '[^0-9]', '', 'g') into wa from public.b2b_requests where id = p_id;
  if wa is null then raise exception 'Request not found'; end if;
  update public.b2b_requests set status = 'revoked', admin_note = left(coalesce(p_note, admin_note), 500), resolved_at = now() where id = p_id;
  update public.b2b_keys set active = false
   where partner_id in (select id from public.profiles where regexp_replace(coalesce(whatsapp, ''), '[^0-9]', '', 'g') = wa);
  get diagnostics n = row_count;
  insert into public.activity_log (owner_id, message) values (auth.uid(), 'B2B access revoked for request ' || p_id || ' (' || n || ' key(s))');
  return n;
end $function$;
revoke all on function public.admin_revoke_b2b_request(uuid, text) from public, anon;
grant execute on function public.admin_revoke_b2b_request(uuid, text) to authenticated;
