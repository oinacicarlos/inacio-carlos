create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null default '',
  email text not null default '',
  phone text not null default '',
  source text not null default '',
  stage text not null default 'Novos',

  -- Tentativas de contato
  attempt1 boolean not null default false,
  attempt2 boolean not null default false,
  attempt3 boolean not null default false,

  -- Qualificação
  has_team boolean,       -- Tem vendedores/atendentes?
  above_simples boolean,  -- Acima do Simples Nacional?
  ads_budget boolean,     -- Budget > R$1.000 em tráfego pago?
  qualified_flag boolean not null default false,

  -- Etapas do processo
  meeting_done boolean not null default false,
  proposal_done boolean not null default false,
  contract_done boolean not null default false,
  is_closed boolean not null default false,

  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  type text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

alter table public.crm_leads enable row level security;
alter table public.crm_activities enable row level security;

drop policy if exists "Admin can manage crm_leads" on public.crm_leads;
create policy "Admin can manage crm_leads"
on public.crm_leads for all to authenticated
using (true) with check (true);

drop policy if exists "Admin can manage crm_activities" on public.crm_activities;
create policy "Admin can manage crm_activities"
on public.crm_activities for all to authenticated
using (true) with check (true);

create index if not exists crm_leads_stage_idx on public.crm_leads(stage);
create index if not exists crm_leads_updated_at_idx on public.crm_leads(updated_at desc);
create index if not exists crm_activities_lead_id_idx on public.crm_activities(lead_id);
create index if not exists crm_activities_created_at_idx on public.crm_activities(created_at desc);
