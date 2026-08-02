-- Solicitações do cliente (hub).
-- Run manually in the Supabase SQL Editor.
-- This file only creates new structures (table + storage bucket + RLS).
-- It does not alter any existing table, RLS policy, function, or the admin panel.
-- Important: clear the SQL Editor before pasting this file to avoid mixing old function blocks.

-- =============================================================================
-- Tabela principal
-- =============================================================================

create table if not exists public.client_requests (
  id uuid primary key default gen_random_uuid(),

  -- usuário dono da solicitação
  user_id uuid not null references auth.users(id) on delete cascade,

  -- categoria inicial, fixa nas opções usadas pelo Hub
  category text not null check (
    category in (
      'emissao_nota_fiscal',
      'inscricao_municipal',
      'inscricao_estadual',
      'alteracao_cadastral',
      'envio_documento',
      'duvida_atendimento',
      'consulta_serasa',
      'outra'
    )
  ),

  title text not null check (char_length(trim(title)) > 0),
  description text not null default '',

  "priority" text not null default 'normal' check ("priority" in ('normal', 'urgente')),

  status text not null default 'recebida' check (
    status in (
      'recebida',
      'em_analise',
      'aguardando_cliente',
      'em_andamento',
      'concluida',
      'cancelada'
    )
  ),

  -- caminho do arquivo no bucket client-request-attachments (ver abaixo).
  -- null quando a solicitação não tem anexo.
  attachment_path text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_requests_user_created_idx
on public.client_requests(user_id, created_at desc);

alter table public.client_requests enable row level security;

drop policy if exists "Clients can read own requests" on public.client_requests;
drop policy if exists "Clients can create own requests" on public.client_requests;

create policy "Clients can read own requests"
on public.client_requests
for select
to authenticated
using (user_id = auth.uid());

-- O cliente só pode criar a própria solicitação, e sempre com status inicial
-- "recebida" — não é possível já nascer "concluída" ou em qualquer outro
-- status forçando o valor no corpo da requisição.
create policy "Clients can create own requests"
on public.client_requests
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'recebida'
  and exists (
    select 1
    from public.client_hub_profiles chp
    where chp.id = auth.uid()
      and chp.current_plan <> 'free'
      and chp.subscription_status in ('active', 'trialing')
  )
);

-- Sem policy de update/delete para o cliente nesta etapa: mudar status
-- (em análise, concluída etc.) é responsabilidade do painel administrativo,
-- que será feito em outra etapa. O cliente só acompanha.

grant usage on schema public to authenticated;
grant select, insert on public.client_requests to authenticated;
revoke update, delete on public.client_requests from authenticated;

create or replace function public.set_client_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists client_requests_set_updated_at on public.client_requests;

create trigger client_requests_set_updated_at
before update on public.client_requests
for each row
execute function public.set_client_requests_updated_at();

-- =============================================================================
-- Anexos (Supabase Storage)
-- =============================================================================
-- Bucket privado. Cada cliente só enxerga/envia dentro da própria pasta
-- "<user_id>/...". Limite de 10 MB por arquivo, só tipos de documento comuns.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-request-attachments',
  'client-request-attachments',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Clients can upload own request attachments" on storage.objects;
drop policy if exists "Clients can read own request attachments" on storage.objects;

create policy "Clients can upload own request attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'client-request-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Clients can read own request attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'client-request-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);
