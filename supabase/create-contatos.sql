create table if not exists public.contacts_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.contacts_categories(id) on delete set null,
  name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_category_idx on public.contacts(category_id);
create index if not exists contacts_created_at_idx on public.contacts(created_at);
create index if not exists contacts_categories_created_at_idx on public.contacts_categories(created_at);

alter table public.contacts_categories enable row level security;
alter table public.contacts enable row level security;

drop policy if exists "Admins can manage contacts categories" on public.contacts_categories;
create policy "Admins can manage contacts categories"
on public.contacts_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage contacts" on public.contacts;
create policy "Admins can manage contacts"
on public.contacts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
