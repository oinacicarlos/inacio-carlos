-- Módulo Processos › Tarefas: lista simples de demandas internas.
-- Campos: Empresa, Título, Instruções, Canal, Status.

create table if not exists public.admin_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.routine_clients(id) on delete set null,
  client_name_cache text not null default '',
  title text not null default '',
  instructions text not null default '',
  channel text not null default 'WhatsApp',  -- WhatsApp | E-mail | Ligação | Pessoalmente | Outro
  status text not null default 'Aberta',     -- Aberta | Fazendo | Concluída
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_tasks_status_idx on public.admin_tasks(status);
create index if not exists admin_tasks_client_idx on public.admin_tasks(client_id);
create index if not exists admin_tasks_created_at_idx on public.admin_tasks(created_at desc);

alter table public.admin_tasks enable row level security;

drop policy if exists "Admins can manage admin tasks" on public.admin_tasks;
create policy "Admins can manage admin tasks"
on public.admin_tasks
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
