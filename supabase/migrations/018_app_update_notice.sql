-- 018: "Update available" popup in the app. Admin sets app_latest_version (e.g. 1.2.0) and app_update_url (APK / store link).
-- Example:  update public.app_settings set value = '1.1.0' where key = 'app_latest_version';
insert into public.app_settings(key, value) values ('app_latest_version', ''), ('app_update_url', '') on conflict (key) do nothing;

create or replace function public.public_site_settings()
 returns jsonb
 language sql
 stable security definer
 set search_path to ''
as $function$
  select coalesce(jsonb_object_agg(s.key, s.value), '{}'::jsonb)
  from public.app_settings s
  where s.key in ('price_per_credit','support_whatsapp_bd','support_whatsapp_my','support_email','facebook_url','telegram_url','store_headline','store_subline','store_note','store_plans','reseller_headline','reseller_subline','reseller_note','reseller_plans','site_content','app_latest_version','app_update_url')
$function$;
