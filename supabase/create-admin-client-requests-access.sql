-- Acesso do administrador às solicitações de clientes.
-- Run manually in the Supabase SQL Editor.
-- Não altera nenhuma policy já existente em create-client-requests.sql —
-- só acrescenta uma coluna, aperta um grant (ver explicação abaixo) e cria
-- duas funções novas gated por is_admin(). Não mexe no painel administrativo
-- em si, nem em RLS de outras tabelas.
-- Important: clear the SQL Editor before pasting this file to avoid mixing old function blocks.

-- =============================================================================
-- Observação interna (só visível pro admin)
-- =============================================================================

alter table public.client_requests
  add column if not exists internal_note text;

-- RLS restringe LINHAS, não COLUNAS — e admin/cliente são o mesmo papel do
-- Postgres ("authenticated"), diferenciados só pela função is_admin(). Por
-- isso, pra internal_note nunca ir pro cliente, o grant de select da tabela
-- passa a listar as colunas explicitamente (sem internal_note). O admin
-- nunca lê essa coluna direto da tabela — só através da função
-- admin_list_client_requests() abaixo, que é SECURITY DEFINER e confere
-- is_admin() antes de retornar qualquer linha.
revoke select on public.client_requests from authenticated;

grant select (
  id,
  user_id,
  category,
  title,
  description,
  priority,
  status,
  attachment_path,
  created_at,
  updated_at
) on public.client_requests to authenticated;

-- =============================================================================
-- Leitura administrativa (com dados do cliente relacionado)
-- =============================================================================

create or replace function public.admin_list_client_requests()
returns table (
  id uuid,
  user_id uuid,
  category text,
  title text,
  description text,
  priority text,
  status text,
  attachment_path text,
  internal_note text,
  created_at timestamptz,
  updated_at timestamptz,
  client_name text,
  client_email text,
  client_company_name text
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
      cr.id,
      cr.user_id,
      cr.category,
      cr.title,
      cr.description,
      cr.priority,
      cr.status,
      cr.attachment_path,
      cr.internal_note,
      cr.created_at,
      cr.updated_at,
      chp.name as client_name,
      u.email::text as client_email,
      chp.company_name as client_company_name
    from public.client_requests cr
    left join public.client_hub_profiles chp on chp.id = cr.user_id
    left join auth.users u on u.id = cr.user_id
    order by cr.created_at desc;
end;
$$;

-- Funções recebem EXECUTE para PUBLIC automaticamente na criação — revoga
-- isso explicitamente pra só "authenticated" poder sequer chamar a função.
-- A checagem de is_admin() dentro dela continua existindo de qualquer forma
-- (defesa em profundidade), mas assim nem usuário anônimo consegue chegar
-- perto de tentar.
revoke execute on function public.admin_list_client_requests() from public;
grant execute on function public.admin_list_client_requests() to authenticated;

-- =============================================================================
-- Atualização administrativa (status + observação interna)
-- =============================================================================

create or replace function public.admin_update_client_request(
  p_request_id uuid,
  p_status text default null,
  p_internal_note text default null
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

  if p_status is not null and p_status not in (
    'recebida', 'em_analise', 'aguardando_cliente', 'em_andamento', 'concluida', 'cancelada'
  ) then
    raise exception 'invalid status';
  end if;

  update public.client_requests
  set
    status = coalesce(p_status, status),
    internal_note = coalesce(p_internal_note, internal_note),
    updated_at = now()
  where id = p_request_id;
end;
$$;

revoke execute on function public.admin_update_client_request(uuid, text, text) from public;
grant execute on function public.admin_update_client_request(uuid, text, text) to authenticated;

-- =============================================================================
-- Anexos: admin também pode ler o que qualquer cliente enviou
-- =============================================================================
-- Adiciona uma policy nova, sem tocar na policy de storage já existente que
-- permite ao próprio cliente ler os arquivos que ele mesmo enviou.

drop policy if exists "Admins can read all request attachments" on storage.objects;

create policy "Admins can read all request attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'client-request-attachments'
  and public.is_admin()
);
