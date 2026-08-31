create table if not exists public.anexos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  file_name text not null default '',
  storage_path text not null unique,
  mime_type text,
  file_size bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_anexos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists anexos_touch_updated_at on public.anexos;
create trigger anexos_touch_updated_at
before update on public.anexos
for each row execute function public.touch_anexos_updated_at();

alter table public.anexos enable row level security;

drop policy if exists "Admins can manage anexos" on public.anexos;
create policy "Admins can manage anexos"
on public.anexos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists anexos_created_at_idx on public.anexos(created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'anexos-gerais',
  'anexos-gerais',
  false,
  20971520,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/x-pkcs12',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can manage anexos files" on storage.objects;
create policy "Admins can manage anexos files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'anexos-gerais'
  and public.is_admin()
)
with check (
  bucket_id = 'anexos-gerais'
  and public.is_admin()
);
