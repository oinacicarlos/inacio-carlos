create table if not exists public.pfx_clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_type text not null default 'PJ' check (client_type in ('PJ', 'PF')),
  bird_id_done boolean not null default false,
  document text not null default '',
  pfx_file_name text not null default '',
  pfx_file_url text not null default '',
  pfx_file_size bigint not null default 0,
  validity_date date,
  whatsapp text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pfx_clients enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'pfx_clients'
      and policyname = 'Authenticated users can manage pfx clients'
  ) then
    create policy "Authenticated users can manage pfx clients"
    on public.pfx_clients
    for all
    to authenticated
    using (true)
    with check (true);
  end if;
end $$;

create index if not exists pfx_clients_validity_date_idx
on public.pfx_clients(validity_date);

create index if not exists pfx_clients_updated_at_idx
on public.pfx_clients(updated_at desc);
