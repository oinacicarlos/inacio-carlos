create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.boards enable row level security;

drop policy if exists "Admin can manage boards" on public.boards;
create policy "Admin can manage boards"
on public.boards
for all
to authenticated
using (true)
with check (true);

create index if not exists boards_updated_at_idx on public.boards(updated_at desc);
