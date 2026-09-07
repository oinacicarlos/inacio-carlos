-- Backfill para a separação pró-labore x funcionários (CLT) no motor de rotinas.
--
-- Antes desta mudança a coluna has_employees nunca era preenchida pela interface,
-- então todo cliente ficou com has_employees = false. Com as novas regras, as
-- rotinas FGTS, Relatório de Consignado, Extrato Mensal de Folha e Detalhamento
-- de Guia só são geradas quando has_employees = true.
--
-- Assumimos que quem já tinha folha (has_payroll = true) tem funcionários CLT.
-- Ajuste manualmente depois os clientes que só têm pró-labore: desmarque
-- "Tem funcionários (CLT)" e marque "Tem pró-labore" no cadastro.

update public.routine_clients
set has_employees = true,
    updated_at = now()
where has_payroll = true
  and has_employees = false;

-- Conferência: clientes que ficaram marcados como tendo funcionários.
-- select name, regime, has_payroll, has_employees, has_pro_labore
-- from public.routine_clients
-- where has_employees = true
-- order by name;
