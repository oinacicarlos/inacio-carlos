-- Boletos do módulo Offline.
-- Execute no SQL Editor do Supabase.
-- Cria tabelas exclusivas do admin offline e um bucket privado para PDFs.

create table if not exists public.offline_billing_clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null default '',
  email text not null default '',
  whatsapp text not null default '',
  due_day integer not null default 15 check (due_day between 1 and 31),
  default_amount numeric(12, 2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_offline_billing_clients_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists offline_billing_clients_touch_updated_at on public.offline_billing_clients;
create trigger offline_billing_clients_touch_updated_at
before update on public.offline_billing_clients
for each row execute function public.touch_offline_billing_clients_updated_at();

alter table public.offline_billing_clients enable row level security;

drop policy if exists "Admins can manage offline billing clients" on public.offline_billing_clients;
create policy "Admins can manage offline billing clients"
on public.offline_billing_clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.offline_billing_slips (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.offline_billing_clients(id) on delete cascade,
  client_name text not null default '',
  email text not null default '',
  whatsapp text not null default '',
  due_date date not null,
  reference_month date not null,
  amount numeric(12, 2) not null default 0,
  status text not null default 'pendente'
    check (status in ('pendente', 'pago', 'vencido')),
  file_name text not null default '',
  file_path text not null default '',
  file_size bigint not null default 0,
  initial_sent_at timestamptz,
  reminder_5d_sent_at timestamptz,
  due_date_sent_at timestamptz,
  recovery_sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.offline_billing_slips
  add column if not exists client_id uuid references public.offline_billing_clients(id) on delete cascade;

alter table public.offline_billing_slips
  drop constraint if exists offline_billing_slips_file_path_key;

alter table public.offline_billing_slips
  alter column file_path drop not null;

alter table public.offline_billing_slips
  alter column file_path drop default;

create unique index if not exists offline_billing_slips_file_path_unique_idx
on public.offline_billing_slips(file_path)
where file_path is not null and file_path <> '';

create unique index if not exists offline_billing_slips_client_reference_unique_idx
on public.offline_billing_slips(client_id, reference_month)
where client_id is not null;

create or replace function public.touch_offline_billing_slips_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists offline_billing_slips_touch_updated_at on public.offline_billing_slips;
create trigger offline_billing_slips_touch_updated_at
before update on public.offline_billing_slips
for each row execute function public.touch_offline_billing_slips_updated_at();

alter table public.offline_billing_slips enable row level security;

drop policy if exists "Admins can manage offline billing slips" on public.offline_billing_slips;
create policy "Admins can manage offline billing slips"
on public.offline_billing_slips
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists offline_billing_slips_due_date_idx
on public.offline_billing_slips(due_date, status);

create index if not exists offline_billing_slips_reference_month_idx
on public.offline_billing_slips(reference_month);

create index if not exists offline_billing_clients_active_idx
on public.offline_billing_clients(active, due_day);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'offline-billing-slips',
  'offline-billing-slips',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can manage offline billing files" on storage.objects;
create policy "Admins can manage offline billing files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'offline-billing-slips'
  and public.is_admin()
)
with check (
  bucket_id = 'offline-billing-slips'
  and public.is_admin()
);
