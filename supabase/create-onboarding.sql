-- Onboarding de produtos avulsos (Certificado Digital PJ A1 e Abertura de Empresa).
-- Run manually in the Supabase SQL Editor.
-- This file only creates new structures (tables + storage bucket + RLS).
-- It does not alter any existing table, RLS policy, function, or the admin panel.
-- Important: clear the SQL Editor before pasting this file to avoid mixing old function blocks.

-- =============================================================================
-- Compras avulsas (gravado só pelo webhook do Stripe, via service_role)
-- =============================================================================

create table if not exists public.product_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null check (product in ('certificado_pj_a1', 'abertura_empresa')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_total integer,
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  created_at timestamptz not null default now()
);

create index if not exists product_purchases_user_id_idx
on public.product_purchases(user_id, created_at desc);

alter table public.product_purchases enable row level security;

drop policy if exists "Clients can read own purchases" on public.product_purchases;

create policy "Clients can read own purchases"
on public.product_purchases
for select
to authenticated
using (user_id = auth.uid());

-- Sem policy de insert/update/delete para "authenticated": só o webhook
-- (service_role, que ignora RLS) grava aqui.

grant usage on schema public to authenticated;
grant select on public.product_purchases to authenticated;

-- =============================================================================
-- Triagem única de onboarding (uma linha por cliente)
-- =============================================================================

create table if not exists public.onboarding_intakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  cpf text not null default '',

  -- Senha gov.br: nunca fica em texto puro. Cifrada em AES-256-GCM na rota
  -- server-side (app/api/onboarding/intake), com a chave só em variável de
  -- ambiente do servidor (ONBOARDING_ENCRYPTION_KEY) — nunca no banco. Essas
  -- duas colunas são propositalmente excluídas do grant de select/update
  -- abaixo: "authenticated" nunca consegue ler nem escrever nelas direto.
  senha_gov_encrypted text,
  senha_gov_iv text,

  wants_certificado boolean not null default false,
  wants_abertura_empresa boolean not null default false,

  segmento text not null default '',
  descricao_cnpj text not null default '',

  has_certidao_casamento boolean,
  has_comprovante_bombeiro boolean,

  doc_identidade_path text,
  doc_certidao_casamento_path text,
  doc_comprovante_residencia_path text,
  doc_iptu_path text,
  doc_comprovante_bombeiro_path text,

  -- Status controlados só pelo time interno (ver create-admin-onboarding-access.sql).
  certificado_status text not null default 'nao_iniciado' check (
    certificado_status in ('nao_iniciado', 'aguardando_agendamento', 'em_atendimento', 'senha_recebida', 'concluido')
  ),
  abertura_status text not null default 'nao_iniciado' check (
    abertura_status in ('nao_iniciado', 'triagem_enviada', 'em_analise', 'protocolado_junta', 'concluido')
  ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_intakes_user_id_idx
on public.onboarding_intakes(user_id);

alter table public.onboarding_intakes enable row level security;

drop policy if exists "Clients can read own intake" on public.onboarding_intakes;
drop policy if exists "Clients can create own intake" on public.onboarding_intakes;
drop policy if exists "Clients can update own intake" on public.onboarding_intakes;

create policy "Clients can read own intake"
on public.onboarding_intakes
for select
to authenticated
using (user_id = auth.uid());

create policy "Clients can create own intake"
on public.onboarding_intakes
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Clients can update own intake"
on public.onboarding_intakes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select (
  id, user_id, cpf, wants_certificado, wants_abertura_empresa,
  segmento, descricao_cnpj, has_certidao_casamento, has_comprovante_bombeiro,
  doc_identidade_path, doc_certidao_casamento_path, doc_comprovante_residencia_path,
  doc_iptu_path, doc_comprovante_bombeiro_path,
  certificado_status, abertura_status, created_at, updated_at
) on public.onboarding_intakes to authenticated;

grant insert (
  id, user_id, cpf, wants_certificado, wants_abertura_empresa,
  segmento, descricao_cnpj, has_certidao_casamento, has_comprovante_bombeiro
) on public.onboarding_intakes to authenticated;

-- Cliente pode atualizar os próprios dados (inclui reenviar CPF/segmento se
-- errar) e os caminhos dos documentos (ele mesmo faz upload) — mas nunca
-- senha_gov_*, certificado_status ou abertura_status.
grant update (
  cpf, wants_certificado, wants_abertura_empresa, segmento, descricao_cnpj,
  has_certidao_casamento, has_comprovante_bombeiro,
  doc_identidade_path, doc_certidao_casamento_path, doc_comprovante_residencia_path,
  doc_iptu_path, doc_comprovante_bombeiro_path
) on public.onboarding_intakes to authenticated;

create or replace function public.set_onboarding_intakes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists onboarding_intakes_set_updated_at on public.onboarding_intakes;

create trigger onboarding_intakes_set_updated_at
before update on public.onboarding_intakes
for each row
execute function public.set_onboarding_intakes_updated_at();

-- =============================================================================
-- Documentos (Supabase Storage)
-- =============================================================================
-- Bucket privado, mesmo padrão do client-request-attachments: cada cliente
-- só enxerga/envia dentro da própria pasta "<user_id>/...".

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'onboarding-documents',
  'onboarding-documents',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Clients can upload own onboarding documents" on storage.objects;
drop policy if exists "Clients can read own onboarding documents" on storage.objects;

create policy "Clients can upload own onboarding documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'onboarding-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Clients can read own onboarding documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'onboarding-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
