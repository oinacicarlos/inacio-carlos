-- Suporte ao webhook do Stripe.
-- Run manually in the Supabase SQL Editor.
-- This file only extends public.client_hub_profiles with new columns and
-- creates a new internal table for deduplicação. It does not alter any
-- existing RLS policy, function, or the admin panel.
-- Important: clear the SQL Editor before pasting this file to avoid mixing old function blocks.

-- =============================================================================
-- Novas colunas em client_hub_profiles (a tabela e as policies já existentes
-- em create-client-hub.sql não são alteradas, só complementadas)
-- =============================================================================

alter table public.client_hub_profiles
  add column if not exists stripe_subscription_id text;

alter table public.client_hub_profiles
  add column if not exists current_period_end timestamptz;

create index if not exists client_hub_profiles_stripe_subscription_id_idx
on public.client_hub_profiles(stripe_subscription_id)
where stripe_subscription_id is not null;

-- =============================================================================
-- Deduplicação de eventos do webhook
-- =============================================================================
-- Tabela puramente interna: só o webhook (via service_role, que ignora RLS)
-- grava e lê aqui. Nenhuma policy é concedida para "authenticated" — o
-- navegador do cliente nunca deve enxergar isso.

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;

-- Sem policies para "authenticated": com RLS ligado e nenhuma policy, o
-- acesso é negado por padrão pra qualquer papel que não seja service_role.
