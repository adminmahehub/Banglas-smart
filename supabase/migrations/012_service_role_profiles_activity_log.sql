-- 012: edge functions (service_role) need these privileges (fixes Ban/Suspend/Delete "non-2xx" error). Already applied live.
grant select, update on public.profiles to service_role;
grant insert on public.activity_log to service_role;
