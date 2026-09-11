create table if not exists public.notepad (
  id text primary key default 'main',
  content text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.notepad (id, content)
values ('main', '')
on conflict (id) do nothing;

alter table public.notepad enable row level security;

drop policy if exists "Admins can manage notepad" on public.notepad;
create policy "Admins can manage notepad"
on public.notepad
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
