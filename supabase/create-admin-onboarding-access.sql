-- Acesso administrativo à triagem de onboarding.
-- Run manually in the Supabase SQL Editor, depois de create-onboarding.sql.
-- Mesmo padrão de create-admin-client-requests-access.sql: três funções
-- novas gated por is_admin(). Não mexe no painel do cliente nem nas policies
-- já existentes em create-onboarding.sql, só complementa.
-- Important: clear the SQL Editor before pasting this file to avoid mixing old function blocks.

-- =============================================================================
-- Listagem administrativa
-- =============================================================================
-- Retorna tudo, exceto a senha gov.br (nunca decifrada aqui — só o
-- ciphertext existe no banco, e nem esse ciphertext sai por esta função).
-- security definer + checagem de is_admin() dentro dela: mesmo papel do
-- Postgres ("authenticated") para cliente e admin, diferenciados só pela
-- função is_admin().

create or replace function public.admin_list_onboarding_intakes()
returns table (
  id uuid,
  user_id uuid,
  cpf text,
  wants_certificado boolean,
  wants_abertura_empresa boolean,
  segmento text,
  descricao_cnpj text,
  has_certidao_casamento boolean,
  has_comprovante_bombeiro boolean,
  doc_identidade_path text,
  doc_certidao_casamento_path text,
  doc_comprovante_residencia_path text,
  doc_iptu_path text,
  doc_comprovante_bombeiro_path text,
  certificado_status text,
  abertura_status text,
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
      oi.segmento, oi.descricao_cnpj, oi.has_certidao_casamento, oi.has_comprovante_bombeiro,
      oi.doc_identidade_path, oi.doc_certidao_casamento_path, oi.doc_comprovante_residencia_path,
      oi.doc_iptu_path, oi.doc_comprovante_bombeiro_path,
      oi.certificado_status, oi.abertura_status, oi.created_at, oi.updated_at,
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

-- =============================================================================
-- Atualização de status (só os dois campos de status, nunca dados do cliente)
-- =============================================================================

create or replace function public.admin_update_onboarding_intake(
  p_id uuid,
  p_certificado_status text default null,
  p_abertura_status text default null
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

  update public.onboarding_intakes
  set certificado_status = coalesce(p_certificado_status, certificado_status),
      abertura_status = coalesce(p_abertura_status, abertura_status),
      updated_at = now()
  where id = p_id;
end;
$$;

revoke execute on function public.admin_update_onboarding_intake(uuid, text, text) from public;
grant execute on function public.admin_update_onboarding_intake(uuid, text, text) to authenticated;

-- =============================================================================
-- Revelar senha gov.br (só o ciphertext — a decriptação acontece fora do
-- banco, na rota app/api/admin/onboarding/[id]/reveal-senha, com a chave que
-- só existe em variável de ambiente do servidor)
-- =============================================================================

create or replace function public.admin_reveal_senha_gov(p_id uuid)
returns table (senha_gov_encrypted text, senha_gov_iv text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
    select oi.senha_gov_encrypted, oi.senha_gov_iv
    from public.onboarding_intakes oi
    where oi.id = p_id;
end;
$$;

revoke execute on function public.admin_reveal_senha_gov(uuid) from public;
grant execute on function public.admin_reveal_senha_gov(uuid) to authenticated;

-- =============================================================================
-- Storage: admin lê qualquer documento de onboarding
-- =============================================================================

drop policy if exists "Admins can read all onboarding documents" on storage.objects;

create policy "Admins can read all onboarding documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'onboarding-documents'
  and public.is_admin()
);
