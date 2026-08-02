-- Correções seguras para avisos do Supabase Database Linter.
-- Execute manualmente no Supabase SQL Editor.
--
-- Este arquivo evita mexer em dados existentes. Ele:
-- 1) fixa search_path de funções conhecidas;
-- 2) troca policies administrativas permissivas por public.is_admin();
-- 3) remove EXECUTE público/anônimo das RPCs administrativas.
--
-- Observação:
-- - O aviso "auth_leaked_password_protection" é configuração do painel:
--   Authentication > Protection > Enable leaked password protection.
-- - O aviso "extension_in_public" do pg_net deve ser revisado com cuidado,
--   porque mover extensão pode afetar recursos/integrações do Supabase.
-- - As RPCs administrativas continuam com EXECUTE para authenticated porque
--   o painel admin atual chama essas RPCs pelo cliente Supabase e cada função
--   valida public.is_admin() internamente. Revogar authenticated exigiria
--   migrar o painel admin para API routes server-side com service_role.

begin;

-- =============================================================================
-- 1) Function search_path
-- =============================================================================

do $$
declare
  fn record;
begin
  for fn in
    select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where (n.nspname, p.proname) in (
      ('stripe', 'set_updated_at'),
      ('stripe', 'set_updated_at_metadata'),
      ('stripe', 'check_rate_limit'),
      ('public', 'set_tool_usage_reference_month'),
      ('public', 'set_client_requests_updated_at'),
      ('public', 'set_onboarding_intakes_updated_at'),
      ('public', 'touch_routine_client_attachment_updated_at')
    )
  loop
    execute format('alter function %I.%I(%s) set search_path = %I', fn.nspname, fn.proname, fn.args, fn.nspname);
  end loop;
end $$;

-- =============================================================================
-- 2) Policies administrativas: authenticated comum deixa de ter acesso amplo
-- =============================================================================

drop policy if exists "Admin can manage boards" on public.boards;
create policy "Admin can manage boards"
on public.boards
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin manage briefings" on public.client_briefings;
create policy "Admin manage briefings"
on public.client_briefings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin manage editorial" on public.client_editorial;
create policy "Admin manage editorial"
on public.client_editorial
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin manage extras" on public.client_extras;
create policy "Admin manage extras"
on public.client_extras
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin manage clients" on public.clients;
create policy "Admin manage clients"
on public.clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin can manage crm_activities" on public.crm_activities;
create policy "Admin can manage crm_activities"
on public.crm_activities
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin can manage crm_leads" on public.crm_leads;
create policy "Admin can manage crm_leads"
on public.crm_leads
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "auth full access" on public.dispatches;
create policy "auth full access"
on public.dispatches
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin can manage forms_principal" on public.forms_principal;
create policy "Admin can manage forms_principal"
on public.forms_principal
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage pfx clients" on public.pfx_clients;
create policy "Authenticated users can manage pfx clients"
on public.pfx_clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage routine client custom obligation" on public.routine_client_custom_obligations;
create policy "Authenticated users can manage routine client custom obligation"
on public.routine_client_custom_obligations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage routine clients" on public.routine_clients;
create policy "Authenticated users can manage routine clients"
on public.routine_clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage routine competences" on public.routine_competences;
create policy "Authenticated users can manage routine competences"
on public.routine_competences
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage routine items" on public.routine_items;
create policy "Authenticated users can manage routine items"
on public.routine_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin manage tracked clicks" on public.tracked_link_clicks;
create policy "Admin manage tracked clicks"
on public.tracked_link_clicks
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin can manage tracked links" on public.tracked_links;
create policy "Admin can manage tracked links"
on public.tracked_links
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =============================================================================
-- 3) RPCs administrativas: remover execução anônima/pública
-- =============================================================================

revoke execute on function public.admin_list_client_requests() from public, anon;
revoke execute on function public.admin_list_onboarding_intakes() from public, anon;
revoke execute on function public.admin_list_presumido_real_leads() from public, anon;
revoke execute on function public.admin_reveal_senha_gov(uuid) from public, anon;
revoke execute on function public.admin_update_client_request(uuid, text, text) from public, anon;
revoke execute on function public.admin_update_onboarding_intake(uuid, text, text, text, text) from public, anon;
revoke execute on function public.admin_update_presumido_real_lead_status(uuid, text) from public, anon;

grant execute on function public.admin_list_client_requests() to authenticated;
grant execute on function public.admin_list_onboarding_intakes() to authenticated;
grant execute on function public.admin_list_presumido_real_leads() to authenticated;
grant execute on function public.admin_reveal_senha_gov(uuid) to authenticated;
grant execute on function public.admin_update_client_request(uuid, text, text) to authenticated;
grant execute on function public.admin_update_onboarding_intake(uuid, text, text, text, text) to authenticated;
grant execute on function public.admin_update_presumido_real_lead_status(uuid, text) to authenticated;

commit;

-- =============================================================================
-- Policies públicas que ainda precisam de regra específica por coluna
-- =============================================================================
-- O linter também apontou policies públicas com WITH CHECK (true):
-- - public.client_briefings: "Public update briefing by token"
-- - public.crm_leads: "public form insert"
-- - public.forms_principal: "Anyone can insert forms_principal"
-- - public.tracked_link_clicks: "Public can insert tracked clicks"
--
-- Essas policies parecem atender formulários públicos / tracking / token.
-- Não alterei automaticamente para não quebrar entrada pública. Para zerar
-- esses avisos, substitua WITH CHECK (true) por validações reais, por exemplo:
--   with check (email is not null and email <> '')
--   with check (token is not null and token = public.client_briefings.token)
-- conforme as colunas reais de cada tabela.
