-- Módulo Processos › Boletos: controle interno de cobranças recorrentes,
-- uma linha por cliente por competência (mês). Começa em setembro/2026.

create table if not exists public.admin_boletos (
  id uuid primary key default gen_random_uuid(),
  competence_month date not null default date_trunc('month', now())::date,
  client_id uuid references public.routine_clients(id) on delete set null,
  client_name_cache text not null default '',
  due_day integer not null default 5,            -- dia do vencimento (1-31)
  amount numeric(12,2) not null default 0,       -- valor em R$
  boleto_status text not null default 'Não enviado',  -- Enviado | Não enviado
  status text not null default 'Aberto',         -- Aberto | Pago | Vencido
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_boletos_month_idx on public.admin_boletos(competence_month desc);
create index if not exists admin_boletos_client_idx on public.admin_boletos(client_id);
create index if not exists admin_boletos_status_idx on public.admin_boletos(status);

alter table public.admin_boletos enable row level security;

drop policy if exists "Admins can manage admin boletos" on public.admin_boletos;
create policy "Admins can manage admin boletos"
on public.admin_boletos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
