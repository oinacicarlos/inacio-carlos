-- Tool usage tracking.
-- Run manually in the Supabase SQL Editor.
-- This file only creates a new table + RLS policies for tool usage tracking.
-- It does not alter any existing table, RLS policy, function, or the admin panel.
-- Important: clear the SQL Editor before pasting this file to avoid mixing old function blocks.

-- Plan rule (documented here for reference, not enforced by this file):
--   free            -> up to 3 uses per calendar month, PER tool (each of the 4 tools has its own quota)
--   bronze/prata/ouro -> unlimited uses
-- Enforcing this limit (counting + visual blocking) is a later step and is
-- intentionally NOT implemented here.

create table if not exists public.tool_usage (
  id uuid primary key default gen_random_uuid(),

  -- usuário
  user_id uuid not null references auth.users(id) on delete cascade,

  -- ferramenta utilizada
  tool text not null check (
    tool in (
      'gerador-contrato',
      'simulador-rescisao',
      'simulador-contratacao',
      'calculadora-precificacao'
    )
  ),

  -- data da utilização
  used_at timestamptz not null default now(),

  -- mês de referência, derivado de used_at por trigger (ver abaixo).
  -- Não usamos "generated always as" aqui porque date_trunc() sobre uma
  -- coluna timestamptz depende do fuso horário da sessão e o Postgres não
  -- aceita isso como expressão de coluna gerada (erro 42P17).
  reference_month date not null default date_trunc('month', now())::date,

  -- informação técnica para evitar contagem duplicada:
  -- a aplicação deve gerar essa chave (ex.: crypto.randomUUID()) UMA VEZ,
  -- no momento em que a ferramenta é efetivamente concluída (não ao abrir a
  -- página), e reutilizar o mesmo valor se a gravação precisar ser repetida
  -- (retry de rede, duplo clique, nova renderização). O índice único abaixo
  -- garante que a mesma conclusão nunca seja contada duas vezes.
  idempotency_key text not null,

  created_at timestamptz not null default now()
);

-- Garante que reference_month sempre reflita used_at de verdade, mesmo se
-- used_at for informado explicitamente na inserção (o cliente não consegue
-- divergir os dois valores).
create or replace function public.set_tool_usage_reference_month()
returns trigger
language plpgsql
as $$
begin
  new.reference_month := date_trunc('month', new.used_at)::date;
  return new;
end;
$$;

drop trigger if exists tool_usage_set_reference_month on public.tool_usage;

create trigger tool_usage_set_reference_month
before insert or update of used_at on public.tool_usage
for each row
execute function public.set_tool_usage_reference_month();

alter table public.tool_usage enable row level security;

drop policy if exists "Clients can read own tool usage" on public.tool_usage;
drop policy if exists "Clients can record own tool usage" on public.tool_usage;

create policy "Clients can read own tool usage"
on public.tool_usage
for select
to authenticated
using (user_id = auth.uid());

create policy "Clients can record own tool usage"
on public.tool_usage
for insert
to authenticated
with check (user_id = auth.uid());

-- Sem policy de update/delete: o histórico é somente-inserção, então um
-- cliente nunca pode editar ou apagar o próprio registro para burlar o limite.

grant usage on schema public to authenticated;
grant select, insert on public.tool_usage to authenticated;
revoke update, delete on public.tool_usage from authenticated;

create index if not exists tool_usage_user_month_idx
on public.tool_usage(user_id, reference_month);

create unique index if not exists tool_usage_dedupe_idx
on public.tool_usage(user_id, idempotency_key);
