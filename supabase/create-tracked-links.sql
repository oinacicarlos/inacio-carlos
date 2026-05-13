create table if not exists public.tracked_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  destination_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tracked_link_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.tracked_links(id) on delete cascade,
  source text not null default 'Direto',
  referrer text,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  clicked_at timestamptz not null default now()
);

alter table public.tracked_links enable row level security;
alter table public.tracked_link_clicks enable row level security;

drop policy if exists "Admin can manage tracked links" on public.tracked_links;
create policy "Admin can manage tracked links"
on public.tracked_links
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read active tracked links" on public.tracked_links;
create policy "Public can read active tracked links"
on public.tracked_links
for select
to anon
using (is_active = true);

drop policy if exists "Admin can read tracked clicks" on public.tracked_link_clicks;
create policy "Admin can read tracked clicks"
on public.tracked_link_clicks
for select
to authenticated
using (true);

drop policy if exists "Public can insert tracked clicks" on public.tracked_link_clicks;
create policy "Public can insert tracked clicks"
on public.tracked_link_clicks
for insert
to anon
with check (true);

create index if not exists tracked_links_slug_idx on public.tracked_links(slug);
create index if not exists tracked_link_clicks_link_id_idx on public.tracked_link_clicks(link_id);
create index if not exists tracked_link_clicks_clicked_at_idx on public.tracked_link_clicks(clicked_at);
