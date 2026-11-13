-- 015: Website Editor (admin edits the public website: texts, colours, images, videos, sections)
-- * public bucket "site-media" (admin uploads, everybody can view the files)
-- * app_settings key "site_content" = one JSON text. Empty = the original website.
-- * admin_set_site_content / admin_restore_site_content (admin only) + public_site_settings now also returns site_content.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 52428800,
        array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists site_media_admin_all on storage.objects;
create policy site_media_admin_all on storage.objects
  for all to authenticated
  using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());

create or replace function public.admin_set_site_content(p_json text)
 returns void
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare v text := trim(coalesce(p_json, '')); cur text;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if length(v) > 120000 then raise exception 'Too much content (limit 120 KB)'; end if;
  if v <> '' then
    begin
      if jsonb_typeof(v::jsonb) <> 'object' then raise exception 'Invalid content'; end if;
    exception when invalid_text_representation then raise exception 'Invalid content';
    end;
  end if;
  select s.value into cur from public.app_settings s where s.key = 'site_content';
  if cur is not null and cur <> '' then
    insert into public.app_settings(key, value) values ('site_content_prev', cur)
    on conflict (key) do update set value = excluded.value;
  end if;
  insert into public.app_settings(key, value) values ('site_content', v)
  on conflict (key) do update set value = excluded.value;
  insert into public.activity_log (owner_id, message) values (auth.uid(), 'Website content updated (Website Editor)');
end $function$;

create or replace function public.admin_restore_site_content()
 returns void
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare prev text; cur text;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  select s.value into prev from public.app_settings s where s.key = 'site_content_prev';
  if prev is null then raise exception 'There is no earlier version'; end if;
  select s.value into cur from public.app_settings s where s.key = 'site_content';
  insert into public.app_settings(key, value) values ('site_content', prev)
  on conflict (key) do update set value = excluded.value;
  insert into public.app_settings(key, value) values ('site_content_prev', coalesce(cur, ''))
  on conflict (key) do update set value = excluded.value;
  insert into public.activity_log (owner_id, message) values (auth.uid(), 'Website content restored to the earlier version');
end $function$;

revoke all on function public.admin_set_site_content(text) from public, anon;
revoke all on function public.admin_restore_site_content() from public, anon;
grant execute on function public.admin_set_site_content(text) to authenticated;
grant execute on function public.admin_restore_site_content() to authenticated;

create or replace function public.public_site_settings()
 returns jsonb
 language sql
 stable security definer
 set search_path to ''
as $function$
  select coalesce(jsonb_object_agg(s.key, s.value), '{}'::jsonb)
  from public.app_settings s
  where s.key in ('price_per_credit','support_whatsapp_bd','support_whatsapp_my','support_email','facebook_url','telegram_url','store_headline','store_subline','store_note','store_plans','reseller_headline','reseller_subline','reseller_note','reseller_plans','site_content')
$function$;
