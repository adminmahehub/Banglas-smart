-- 020: White-label / B2B access requests from the website. The admin approves or rejects them in the panel.
create table if not exists public.b2b_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  website text,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.b2b_requests enable row level security;
drop policy if exists b2b_requests_admin on public.b2b_requests;
create policy b2b_requests_admin on public.b2b_requests for select to authenticated using (public.is_admin());

create or replace function public.submit_b2b_request(p_name text, p_whatsapp text, p_website text, p_message text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare nm text := left(btrim(coalesce(p_name, '')), 80); wa text := regexp_replace(coalesce(p_whatsapp, ''), '[^0-9]', '', 'g');
        web text := left(btrim(coalesce(p_website, '')), 200); msg text := left(btrim(coalesce(p_message, '')), 1000);
begin
  if length(nm) < 2 then raise exception 'Please enter your name'; end if;
  if length(wa) < 8 or length(wa) > 15 then raise exception 'Enter your WhatsApp number with country code'; end if;
  if exists (select 1 from public.b2b_requests where whatsapp = wa and status = 'pending') then
    return jsonb_build_object('ok', true, 'already', true);
  end if;
  if (select count(*) from public.b2b_requests where created_at > now() - interval '24 hours') >= 50 then
    raise exception 'Too many requests today. Please message us on WhatsApp.';
  end if;
  insert into public.b2b_requests (name, whatsapp, website, message) values (nm, wa, nullif(web, ''), nullif(msg, ''));
  insert into public.activity_log (owner_id, message)
    select p.id, 'New White-label/B2B request: ' || nm || ' (' || wa || ')' from public.profiles p where p.role = 'admin' order by p.created_at limit 1;
  return jsonb_build_object('ok', true);
end $function$;
revoke all on function public.submit_b2b_request(text, text, text, text) from public;
grant execute on function public.submit_b2b_request(text, text, text, text) to anon, authenticated;

create or replace function public.admin_resolve_b2b(p_id uuid, p_approve boolean, p_note text default null)
returns void language plpgsql security definer set search_path to '' as $function$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Admin only'; end if;
  update public.b2b_requests
     set status = case when p_approve then 'approved' else 'rejected' end, admin_note = left(p_note, 500), resolved_at = now()
   where id = p_id and status = 'pending';
  if not found then raise exception 'Request not found or already resolved'; end if;
end $function$;
revoke all on function public.admin_resolve_b2b(uuid, boolean, text) from public, anon;
grant execute on function public.admin_resolve_b2b(uuid, boolean, text) to authenticated;
