-- Bloqueia criação direta de solicitações por usuários do plano grátis.
-- Run manually in the Supabase SQL Editor.
-- Mantém select para histórico e preserva inserts via service_role/webhook.

alter table public.client_requests enable row level security;

drop policy if exists "Clients can create own requests" on public.client_requests;

create policy "Clients can create own requests"
on public.client_requests
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'recebida'
  and exists (
    select 1
    from public.client_hub_profiles chp
    where chp.id = auth.uid()
      and chp.current_plan <> 'free'
      and chp.subscription_status in ('active', 'trialing')
  )
);
