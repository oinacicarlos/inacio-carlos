create table if not exists public.routine_clients (
  id uuid primary key default gen_random_uuid()
);

alter table public.routine_clients
  add column if not exists name text not null default '',
  add column if not exists cnpj text not null default '',
  add column if not exists regime text not null default 'MEI',
  add column if not exists has_payroll boolean not null default false,
  add column if not exists whatsapp text not null default '',
  add column if not exists email text not null default '',
  add column if not exists monthly_fee numeric(12,2) not null default 0,
  add column if not exists notes text not null default '',
  add column if not exists status text not null default 'Ativo',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.routine_competences (
  id uuid primary key default gen_random_uuid()
);

alter table public.routine_competences
  add column if not exists client_id uuid references public.routine_clients(id) on delete cascade,
  add column if not exists competence_month date not null default date_trunc('month', now())::date,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.routine_items (
  id uuid primary key default gen_random_uuid()
);

alter table public.routine_items
  add column if not exists competence_id uuid references public.routine_competences(id) on delete cascade,
  add column if not exists routine_name text not null default '',
  add column if not exists status text not null default 'Pendente',
  add column if not exists file_name text not null default '',
  add column if not exists file_url text not null default '',
  add column if not exists notes text not null default '',
  add column if not exists sent_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'routine_clients_regime_check'
  ) then
    alter table public.routine_clients
    add constraint routine_clients_regime_check
    check (regime in ('MEI', 'Simples Nacional'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'routine_clients_status_check'
  ) then
    alter table public.routine_clients
    add constraint routine_clients_status_check
    check (status in ('Ativo', 'Inativo'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'routine_items_status_check'
  ) then
    alter table public.routine_items
    add constraint routine_items_status_check
    check (status in ('Pendente', 'Não precisa', 'Anexado', 'Enviado'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'routine_competences_client_month_unique'
  ) then
    alter table public.routine_competences
    add constraint routine_competences_client_month_unique
    unique (client_id, competence_month);
  end if;
end $$;

alter table public.routine_clients enable row level security;
alter table public.routine_competences enable row level security;
alter table public.routine_items enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'routine_clients'
      and policyname = 'Authenticated users can manage routine clients'
  ) then
    create policy "Authenticated users can manage routine clients"
    on public.routine_clients
    for all
    to authenticated
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'routine_competences'
      and policyname = 'Authenticated users can manage routine competences'
  ) then
    create policy "Authenticated users can manage routine competences"
    on public.routine_competences
    for all
    to authenticated
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'routine_items'
      and policyname = 'Authenticated users can manage routine items'
  ) then
    create policy "Authenticated users can manage routine items"
    on public.routine_items
    for all
    to authenticated
    using (true)
    with check (true);
  end if;
end $$;

create index if not exists routine_clients_name_idx
on public.routine_clients(name);

create index if not exists routine_clients_status_idx
on public.routine_clients(status);

create index if not exists routine_clients_has_payroll_idx
on public.routine_clients(has_payroll);

create index if not exists routine_competences_client_month_idx
on public.routine_competences(client_id, competence_month desc);

create index if not exists routine_items_competence_status_idx
on public.routine_items(competence_id, status);
