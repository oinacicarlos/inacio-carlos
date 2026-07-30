-- Fluxo "Abrir CNPJ" (MEI / Simples Nacional / Lucro Presumido ou Real) +
-- produto avulso "Alteração de CNPJ" + planos recorrentes Ouro/Diamante.
-- Run manually in the Supabase SQL Editor, depois de create-onboarding.sql
-- e create-admin-onboarding-access.sql.
-- This file only extends public.onboarding_intakes, public.product_purchases
-- e public.client_hub_profiles com novas colunas/valores permitidos, e cria
-- a tabela nova public.presumido_real_leads. Não recria nada que já existe.
-- Important: clear the SQL Editor before pasting this file to avoid mixing old function blocks.

-- =============================================================================
-- onboarding_intakes: campos do MEI, da Alteração de CNPJ e os campos que
-- faltavam no formulário do Simples Nacional (estado civil, razão social,
-- nome fantasia, quantidade de sócios).
-- =============================================================================

alter table public.onboarding_intakes add column if not exists wants_abertura_mei boolean not null default false;
alter table public.onboarding_intakes add column if not exists wants_alteracao_cnpj boolean not null default false;

alter table public.onboarding_intakes add column if not exists estado_civil text not null default '';
alter table public.onboarding_intakes drop constraint if exists onboarding_intakes_estado_civil_check;
alter table public.onboarding_intakes add constraint onboarding_intakes_estado_civil_check
  check (estado_civil in ('', 'solteiro', 'casado', 'uniao_estavel', 'divorciado', 'viuvo'));

alter table public.onboarding_intakes add column if not exists regime_bens text not null default '';
alter table public.onboarding_intakes drop constraint if exists onboarding_intakes_regime_bens_check;
alter table public.onboarding_intakes add constraint onboarding_intakes_regime_bens_check
  check (regime_bens in ('', 'comunhao_parcial', 'comunhao_universal', 'separacao_total', 'participacao_final_aquestos'));

alter table public.onboarding_intakes add column if not exists razao_social text not null default '';
alter table public.onboarding_intakes add column if not exists tem_nome_fantasia boolean;
alter table public.onboarding_intakes add column if not exists nome_fantasia text not null default '';
alter table public.onboarding_intakes add column if not exists quantidade_socios integer;

alter table public.onboarding_intakes add column if not exists cnpj_atual text not null default '';
alter table public.onboarding_intakes add column if not exists descricao_alteracao text not null default '';

alter table public.onboarding_intakes add column if not exists mei_status text not null default 'nao_iniciado';
alter table public.onboarding_intakes drop constraint if exists onboarding_intakes_mei_status_check;
alter table public.onboarding_intakes add constraint onboarding_intakes_mei_status_check
  check (mei_status in ('nao_iniciado', 'triagem_enviada', 'em_analise', 'concluido'));

alter table public.onboarding_intakes add column if not exists alteracao_status text not null default 'nao_iniciado';
alter table public.onboarding_intakes drop constraint if exists onboarding_intakes_alteracao_status_check;
alter table public.onboarding_intakes add constraint onboarding_intakes_alteracao_status_check
  check (alteracao_status in ('nao_iniciado', 'triagem_enviada', 'em_analise', 'protocolado', 'concluido'));

-- Cliente pode ler e escrever os novos campos de dados (mesmo padrão de
-- segmento/descricao_cnpj), mas nunca os novos campos de status
-- (mei_status/alteracao_status ficam ao lado de certificado_status/
-- abertura_status: só o admin muda, via admin_update_onboarding_intake).

grant select (
  wants_abertura_mei, wants_alteracao_cnpj, estado_civil, regime_bens,
  razao_social, tem_nome_fantasia, nome_fantasia, quantidade_socios,
  cnpj_atual, descricao_alteracao, mei_status, alteracao_status
) on public.onboarding_intakes to authenticated;

grant insert (
  wants_abertura_mei, wants_alteracao_cnpj, estado_civil, regime_bens,
  razao_social, tem_nome_fantasia, nome_fantasia, quantidade_socios,
  cnpj_atual, descricao_alteracao
) on public.onboarding_intakes to authenticated;

grant update (
  estado_civil, regime_bens, razao_social, tem_nome_fantasia, nome_fantasia,
  quantidade_socios, cnpj_atual, descricao_alteracao
) on public.onboarding_intakes to authenticated;

-- =============================================================================
-- product_purchases: novo produto avulso "Alteração de CNPJ"
-- =============================================================================

alter table public.product_purchases drop constraint if exists product_purchases_product_check;
alter table public.product_purchases add constraint product_purchases_product_check
  check (product in ('certificado_pj_a1', 'abertura_empresa', 'alteracao_cnpj'));

-- =============================================================================
-- client_hub_profiles: novo plano recorrente "diamante" (Ouro já era aceito
-- aqui, só nunca teve checkout automático até agora)
-- =============================================================================

alter table public.client_hub_profiles drop constraint if exists client_hub_profiles_current_plan_check;
alter table public.client_hub_profiles add constraint client_hub_profiles_current_plan_check
  check (current_plan in ('free', 'bronze', 'prata', 'ouro', 'diamante'));

-- =============================================================================
-- Leads de Lucro Presumido/Real (contato manual, sem automação de processo)
-- =============================================================================
-- Tabela puramente interna, mesmo padrão de stripe_webhook_events: só a rota
-- app/api/onboarding/contato-presumido (service_role) grava, e só admins leem
-- via RPC abaixo. Sem policy de insert/select para "anon"/"authenticated" —
-- o formulário público não escreve direto no banco, passa pela rota server-side
-- (que também dispara o e-mail de notificação pro time).

create table if not exists public.presumido_real_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  email text not null,
  company_description text not null default '',
  status text not null default 'novo' check (status in ('novo', 'em_contato', 'concluido')),
  created_at timestamptz not null default now()
);

create index if not exists presumido_real_leads_created_at_idx
on public.presumido_real_leads(created_at desc);

alter table public.presumido_real_leads enable row level security;

-- =============================================================================
-- Admin: onboarding_intakes com os campos novos + leads de Presumido/Real
-- =============================================================================

-- O retorno ganhou várias colunas novas — Postgres não deixa "create or
-- replace" mudar o formato da linha de uma função RETURNS TABLE (mesmo com
-- os mesmos parâmetros), então a versão antiga precisa ser removida primeiro.
drop function if exists public.admin_list_onboarding_intakes();

create or replace function public.admin_list_onboarding_intakes()
returns table (
  id uuid,
  user_id uuid,
  cpf text,
  wants_certificado boolean,
  wants_abertura_empresa boolean,
  wants_abertura_mei boolean,
  wants_alteracao_cnpj boolean,
  segmento text,
  descricao_cnpj text,
  estado_civil text,
  regime_bens text,
  razao_social text,
  tem_nome_fantasia boolean,
  nome_fantasia text,
  quantidade_socios integer,
  cnpj_atual text,
  descricao_alteracao text,
  has_certidao_casamento boolean,
  has_comprovante_bombeiro boolean,
  doc_identidade_path text,
  doc_certidao_casamento_path text,
  doc_comprovante_residencia_path text,
  doc_iptu_path text,
  doc_comprovante_bombeiro_path text,
  certificado_status text,
  abertura_status text,
  mei_status text,
  alteracao_status text,
  created_at timestamptz,
  updated_at timestamptz,
  client_name text,
  client_email text,
  client_company_name text,
  purchased_products text[]
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
    select
      oi.id, oi.user_id, oi.cpf, oi.wants_certificado, oi.wants_abertura_empresa,
      oi.wants_abertura_mei, oi.wants_alteracao_cnpj,
      oi.segmento, oi.descricao_cnpj,
      oi.estado_civil, oi.regime_bens, oi.razao_social, oi.tem_nome_fantasia,
      oi.nome_fantasia, oi.quantidade_socios, oi.cnpj_atual, oi.descricao_alteracao,
      oi.has_certidao_casamento, oi.has_comprovante_bombeiro,
      oi.doc_identidade_path, oi.doc_certidao_casamento_path, oi.doc_comprovante_residencia_path,
      oi.doc_iptu_path, oi.doc_comprovante_bombeiro_path,
      oi.certificado_status, oi.abertura_status, oi.mei_status, oi.alteracao_status,
      oi.created_at, oi.updated_at,
      chp.name as client_name, u.email::text as client_email, chp.company_name as client_company_name,
      coalesce(
        (select array_agg(pp.product order by pp.created_at) from public.product_purchases pp where pp.user_id = oi.user_id),
        array[]::text[]
      ) as purchased_products
    from public.onboarding_intakes oi
    left join public.client_hub_profiles chp on chp.id = oi.user_id
    left join auth.users u on u.id = oi.user_id
    order by oi.created_at desc;
end;
$$;

revoke execute on function public.admin_list_onboarding_intakes() from public;
grant execute on function public.admin_list_onboarding_intakes() to authenticated;

-- Atualização de status: substitui a função de create-admin-onboarding-access.sql
-- pra incluir mei_status/alteracao_status junto de certificado_status/abertura_status.
-- A assinatura muda (3 parâmetros → 5), então "create or replace" sozinho
-- criaria uma segunda função sobrecarregada em vez de substituir — a versão
-- antiga de 3 parâmetros precisa ser removida explicitamente primeiro.

drop function if exists public.admin_update_onboarding_intake(uuid, text, text);

create or replace function public.admin_update_onboarding_intake(
  p_id uuid,
  p_certificado_status text default null,
  p_abertura_status text default null,
  p_mei_status text default null,
  p_alteracao_status text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if p_certificado_status is not null and p_certificado_status not in (
    'nao_iniciado', 'aguardando_agendamento', 'em_atendimento', 'senha_recebida', 'concluido'
  ) then
    raise exception 'invalid certificado_status';
  end if;

  if p_abertura_status is not null and p_abertura_status not in (
    'nao_iniciado', 'triagem_enviada', 'em_analise', 'protocolado_junta', 'concluido'
  ) then
    raise exception 'invalid abertura_status';
  end if;

  if p_mei_status is not null and p_mei_status not in (
    'nao_iniciado', 'triagem_enviada', 'em_analise', 'concluido'
  ) then
    raise exception 'invalid mei_status';
  end if;

  if p_alteracao_status is not null and p_alteracao_status not in (
    'nao_iniciado', 'triagem_enviada', 'em_analise', 'protocolado', 'concluido'
  ) then
    raise exception 'invalid alteracao_status';
  end if;

  update public.onboarding_intakes
  set certificado_status = coalesce(p_certificado_status, certificado_status),
      abertura_status = coalesce(p_abertura_status, abertura_status),
      mei_status = coalesce(p_mei_status, mei_status),
      alteracao_status = coalesce(p_alteracao_status, alteracao_status),
      updated_at = now()
  where id = p_id;
end;
$$;

revoke execute on function public.admin_update_onboarding_intake(uuid, text, text, text, text) from public;
grant execute on function public.admin_update_onboarding_intake(uuid, text, text, text, text) to authenticated;

create or replace function public.admin_list_presumido_real_leads()
returns table (
  id uuid,
  name text,
  whatsapp text,
  email text,
  company_description text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
    select prl.id, prl.name, prl.whatsapp, prl.email, prl.company_description, prl.status, prl.created_at
    from public.presumido_real_leads prl
    order by prl.created_at desc;
end;
$$;

revoke execute on function public.admin_list_presumido_real_leads() from public;
grant execute on function public.admin_list_presumido_real_leads() to authenticated;

create or replace function public.admin_update_presumido_real_lead_status(p_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if p_status not in ('novo', 'em_contato', 'concluido') then
    raise exception 'invalid status';
  end if;

  update public.presumido_real_leads
  set status = p_status
  where id = p_id;
end;
$$;

revoke execute on function public.admin_update_presumido_real_lead_status(uuid, text) from public;
grant execute on function public.admin_update_presumido_real_lead_status(uuid, text) to authenticated;
