create table if not exists public.routine_email_drafts (
  id uuid primary key default gen_random_uuid(),
  competence_id uuid not null references public.routine_competences(id) on delete cascade,
  scope text not null default 'Geral',
  subject text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competence_id, scope)
);

alter table public.routine_email_drafts enable row level security;

drop policy if exists "Authenticated users can manage routine email drafts" on public.routine_email_drafts;
create policy "Authenticated users can manage routine email drafts"
on public.routine_email_drafts
for all
to authenticated
using (true)
with check (true);

create index if not exists routine_email_drafts_competence_idx
on public.routine_email_drafts(competence_id, scope);
