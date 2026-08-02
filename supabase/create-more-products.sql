-- Novos produtos avulsos: Certificado Digital PF (A1), Consulta Serasa PF/PJ,
-- Nota Fiscal de Serviço, Nota Fiscal de Produto (DANFE). "Alteração de CNPJ"
-- (alteracao_cnpj) continua o mesmo produto no Stripe — só o nome exibido
-- mudou para "Alteração contratual", não precisa de mudança de banco.
-- Run manually in the Supabase SQL Editor.
-- This file only extends existing check constraints. Does not alter RLS,
-- functions, or the admin panel.
-- Important: clear the SQL Editor before pasting this file to avoid mixing old function blocks.

-- =============================================================================
-- product_purchases: aceitar os produtos novos
-- =============================================================================

alter table public.product_purchases drop constraint if exists product_purchases_product_check;
alter table public.product_purchases add constraint product_purchases_product_check
  check (product in (
    'certificado_pj_a1',
    'certificado_pf_a1',
    'abertura_empresa',
    'alteracao_cnpj',
    'serasa_pf',
    'serasa_pj',
    'nota_fiscal_servico',
    'nota_fiscal_produto'
  ));

-- =============================================================================
-- client_requests: nova categoria "consulta_serasa", usada quando o webhook
-- do Stripe cria automaticamente uma solicitação após a compra de Consulta
-- Serasa PF/PJ (Nota Fiscal de Serviço/Produto já cai em 'emissao_nota_fiscal',
-- que já existia).
-- =============================================================================

alter table public.client_requests drop constraint if exists client_requests_category_check;
alter table public.client_requests add constraint client_requests_category_check
  check (category in (
    'emissao_nota_fiscal',
    'inscricao_municipal',
    'inscricao_estadual',
    'alteracao_cadastral',
    'envio_documento',
    'duvida_atendimento',
    'consulta_serasa',
    'outra'
  ));
