create table if not exists public.links_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.links_categories(id) on delete set null,
  name text not null,
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists links_category_idx on public.links(category_id);
create index if not exists links_created_at_idx on public.links(created_at);
create index if not exists links_categories_created_at_idx on public.links_categories(created_at);

alter table public.links_categories enable row level security;
alter table public.links enable row level security;

drop policy if exists "Admins can manage links categories" on public.links_categories;
create policy "Admins can manage links categories"
on public.links_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage links" on public.links;
create policy "Admins can manage links"
on public.links
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
