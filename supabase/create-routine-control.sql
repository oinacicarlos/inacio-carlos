create table if not exists public.routine_clients (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.routine_competences (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.routine_items (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.routine_email_drafts (
  id uuid primary key default gen_random_uuid(),
  competence_id uuid not null references public.routine_competences(id) on delete cascade,
  scope text not null default 'Geral',
  subject text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competence_id, scope)
);

alter table public.routine_clients add column if not exists name text not null default '';
alter table public.routine_clients add column if not exists cnpj text not null default '';
alter table public.routine_clients add column if not exists partner_name text not null default '';
alter table public.routine_clients add column if not exists partner_cpf text not null default '';
alter table public.routine_clients add column if not exists regime text not null default 'MEI';
alter table public.routine_clients add column if not exists has_payroll boolean not null default false;
alter table public.routine_clients add column if not exists has_employees boolean not null default false;
alter table public.routine_clients add column if not exists has_pro_labore boolean not null default false;
alter table public.routine_clients add column if not exists issues_invoices boolean not null default true;
alter table public.routine_clients add column if not exists needs_fiscal_tracking boolean not null default true;
alter table public.routine_clients add column if not exists whatsapp text not null default '';
alter table public.routine_clients add column if not exists email text not null default '';
alter table public.routine_clients add column if not exists monthly_fee numeric(12,2) not null default 0;
alter table public.routine_clients add column if not exists notes text not null default '';
alter table public.routine_clients add column if not exists documents jsonb not null default '[]'::jsonb;
alter table public.routine_clients add column if not exists status text not null default 'Ativo';
alter table public.routine_clients add column if not exists created_at timestamptz not null default now();
alter table public.routine_clients add column if not exists updated_at timestamptz not null default now();

alter table public.routine_competences add column if not exists client_id uuid references public.routine_clients(id) on delete cascade;
alter table public.routine_competences add column if not exists competence_month date not null default date_trunc('month', now())::date;
alter table public.routine_competences add column if not exists created_at timestamptz not null default now();
alter table public.routine_competences add column if not exists updated_at timestamptz not null default now();

alter table public.routine_items add column if not exists competence_id uuid references public.routine_competences(id) on delete cascade;
alter table public.routine_items add column if not exists routine_name text not null default '';
alter table public.routine_items add column if not exists department text not null default 'Atualização Cadastral';
alter table public.routine_items add column if not exists category text not null default 'Rotina mensal';
alter table public.routine_items add column if not exists status text not null default 'Pendente';
alter table public.routine_items add column if not exists file_name text not null default '';
alter table public.routine_items add column if not exists file_url text not null default '';
alter table public.routine_items add column if not exists notes text not null default '';
alter table public.routine_items add column if not exists requires_file boolean not null default true;
alter table public.routine_items add column if not exists is_custom boolean not null default false;
alter table public.routine_items add column if not exists custom_obligation_id uuid;
alter table public.routine_items add column if not exists sort_order integer not null default 500;
alter table public.routine_items add column if not exists sent_at timestamptz;
alter table public.routine_items add column if not exists created_at timestamptz not null default now();
alter table public.routine_items add column if not exists updated_at timestamptz not null default now();

create table if not exists public.routine_client_custom_obligations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.routine_clients(id) on delete cascade,
  name text not null default '',
  department text not null default 'Obrigações específicas',
  category text not null default 'Personalizada',
  requires_file boolean not null default true,
  active boolean not null default true,
  notes text not null default '',
  sort_order integer not null default 900,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.routine_clients enable row level security;
alter table public.routine_competences enable row level security;
alter table public.routine_items enable row level security;
alter table public.routine_client_custom_obligations enable row level security;
alter table public.routine_email_drafts enable row level security;

drop policy if exists "Authenticated users can manage routine clients" on public.routine_clients;
create policy "Authenticated users can manage routine clients"
on public.routine_clients
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage routine competences" on public.routine_competences;
create policy "Authenticated users can manage routine competences"
on public.routine_competences
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage routine items" on public.routine_items;
create policy "Authenticated users can manage routine items"
on public.routine_items
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage routine client custom obligations" on public.routine_client_custom_obligations;
create policy "Authenticated users can manage routine client custom obligations"
on public.routine_client_custom_obligations
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage routine email drafts" on public.routine_email_drafts;
create policy "Authenticated users can manage routine email drafts"
on public.routine_email_drafts
for all
to authenticated
using (true)
with check (true);

create index if not exists routine_clients_name_idx on public.routine_clients(name);
create index if not exists routine_clients_status_idx on public.routine_clients(status);
create index if not exists routine_clients_has_payroll_idx on public.routine_clients(has_payroll);
create index if not exists routine_competences_client_month_idx on public.routine_competences(client_id, competence_month desc);
create index if not exists routine_items_competence_status_idx on public.routine_items(competence_id, status);
create index if not exists routine_items_competence_department_idx on public.routine_items(competence_id, department, sort_order);
create index if not exists routine_client_custom_obligations_client_idx on public.routine_client_custom_obligations(client_id, active, sort_order);
create index if not exists routine_email_drafts_competence_idx on public.routine_email_drafts(competence_id, scope);
