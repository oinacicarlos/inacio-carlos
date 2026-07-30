-- Estrutura de anexos por pasta para o módulo Clientes.
-- Execute no SQL Editor do Supabase depois do create-routine-control.sql.

create table if not exists public.routine_client_attachments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.routine_clients(id) on delete cascade,
  category text not null,
  display_name text not null default '',
  file_name text not null default '',
  storage_path text not null unique,
  mime_type text,
  file_size bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routine_client_attachments_category_check
    check (category in ('socios', 'endereco', 'contratos', 'cnpj_inscricoes', 'licencas', 'procuracao'))
);

create or replace function public.touch_routine_client_attachment_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists routine_client_attachments_touch_updated_at on public.routine_client_attachments;
create trigger routine_client_attachments_touch_updated_at
before update on public.routine_client_attachments
for each row execute function public.touch_routine_client_attachment_updated_at();

alter table public.routine_client_attachments enable row level security;

drop policy if exists "Admins can manage routine client attachments" on public.routine_client_attachments;
create policy "Admins can manage routine client attachments"
on public.routine_client_attachments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists routine_client_attachments_client_category_idx
on public.routine_client_attachments(client_id, category, updated_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'routine-client-attachments',
  'routine-client-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can manage routine client attachment files" on storage.objects;
create policy "Admins can manage routine client attachment files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'routine-client-attachments'
  and public.is_admin()
)
with check (
  bucket_id = 'routine-client-attachments'
  and public.is_admin()
);
