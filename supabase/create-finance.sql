create table if not exists public.finance_records (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('entrada', 'saida')),
  name text not null,
  category text not null default '',
  account text not null default 'Principal',
  value numeric(14,2) not null default 0 check (value >= 0),
  record_date date not null default current_date,
  status text not null default 'Pendente' check (status in ('Pendente', 'Parcial', 'Pago', 'Cancelado')),
  type text not null default 'Fixa' check (type in ('Fixa', 'Variável', 'Rendimento', 'Dívida')),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_records enable row level security;

drop policy if exists "Admin can manage finance records" on public.finance_records;
create policy "Admin can manage finance records"
on public.finance_records
for all
to authenticated
using (true)
with check (true);

create index if not exists finance_records_kind_idx on public.finance_records(kind);
create index if not exists finance_records_status_idx on public.finance_records(status);
create index if not exists finance_records_date_idx on public.finance_records(record_date desc);
create index if not exists finance_records_created_at_idx on public.finance_records(created_at desc);
