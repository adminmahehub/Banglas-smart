-- 019: PipraPay online payment for reseller credit top-ups.
-- Edge functions piprapay-create / piprapay-webhook talk to the gateway; credits are added ONLY after the gateway confirms the payment.
create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  credits int not null check (credits >= 1),
  amount_bdt numeric not null check (amount_bdt > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  pp_id text unique,
  txn_id text,
  method text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists payment_orders_owner_idx on public.payment_orders(owner_id, created_at desc);
alter table public.payment_orders enable row level security;
drop policy if exists payment_orders_select on public.payment_orders;
create policy payment_orders_select on public.payment_orders for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());
-- no insert/update policy: only the edge functions (service role) write here

-- Atomic + idempotent: the first call marks the order paid and adds the credits, repeats do nothing.
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
  update public.profiles set credits = credits + o.credits where id = o.owner_id;
  insert into public.activity_log (owner_id, message)
    values (o.owner_id, 'Credits +' || o.credits || ' paid online (' || coalesce(p_method, 'PipraPay') || ', Txn ' || coalesce(p_txn, '-') || ')');
  return jsonb_build_object('ok', true, 'credits', o.credits);
end $function$;
revoke all on function public.piprapay_mark_paid(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.piprapay_mark_paid(uuid, text, text, text) to service_role;
