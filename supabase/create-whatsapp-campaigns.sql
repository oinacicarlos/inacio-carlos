create table if not exists public.whatsapp_optouts (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  reason text,
  source text not null default 'manual',
  opt_in_status text,
  opt_in_source text,
  opt_in_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  template_name text not null,
  template_language text not null,
  template_category text not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'processing', 'paused', 'completed', 'cancelled', 'failed')),
  total_contacts integer not null default 0,
  total_queued integer not null default 0,
  total_sent integer not null default 0,
  total_delivered integer not null default 0,
  total_read integer not null default 0,
  total_failed integer not null default 0,
  total_optout integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.whatsapp_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.whatsapp_campaigns(id) on delete cascade,
  name text not null,
  phone text not null,
  status text not null default 'pending' check (status in ('pending', 'queued', 'accepted', 'sent', 'delivered', 'read', 'failed', 'skipped', 'optout')),
  wamid text unique,
  error_code text,
  error_message text,
  attempts integer not null default 0,
  body_parameters jsonb not null default '[]'::jsonb,
  queued_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, phone)
);

create index if not exists whatsapp_optouts_phone_idx on public.whatsapp_optouts (phone);
create index if not exists whatsapp_campaigns_created_at_idx on public.whatsapp_campaigns (created_at desc);
create index if not exists whatsapp_campaigns_status_idx on public.whatsapp_campaigns (status);
create index if not exists whatsapp_campaign_recipients_campaign_status_idx on public.whatsapp_campaign_recipients (campaign_id, status);
create index if not exists whatsapp_campaign_recipients_wamid_idx on public.whatsapp_campaign_recipients (wamid) where wamid is not null;
create index if not exists whatsapp_campaign_recipients_phone_idx on public.whatsapp_campaign_recipients (phone);

create or replace function public.refresh_whatsapp_campaign_totals(target_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.whatsapp_campaigns campaign
  set
    total_contacts = totals.total_contacts,
    total_queued = totals.total_queued,
    total_sent = totals.total_sent,
    total_delivered = totals.total_delivered,
    total_read = totals.total_read,
    total_failed = totals.total_failed,
    total_optout = totals.total_optout
  from (
    select
      count(*)::integer as total_contacts,
      count(*) filter (where status = 'queued')::integer as total_queued,
      count(*) filter (where status in ('sent', 'delivered', 'read'))::integer as total_sent,
      count(*) filter (where status in ('delivered', 'read'))::integer as total_delivered,
      count(*) filter (where status = 'read')::integer as total_read,
      count(*) filter (where status = 'failed')::integer as total_failed,
      count(*) filter (where status = 'optout')::integer as total_optout
    from public.whatsapp_campaign_recipients
    where campaign_id = target_campaign_id
  ) totals
  where campaign.id = target_campaign_id;
end;
$$;

create or replace function public.sync_whatsapp_campaign_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_whatsapp_campaign_totals(coalesce(new.campaign_id, old.campaign_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists whatsapp_campaign_recipients_sync_totals on public.whatsapp_campaign_recipients;

create trigger whatsapp_campaign_recipients_sync_totals
after insert or update or delete on public.whatsapp_campaign_recipients
for each row execute function public.sync_whatsapp_campaign_totals();

alter table public.whatsapp_optouts enable row level security;
alter table public.whatsapp_campaigns enable row level security;
alter table public.whatsapp_campaign_recipients enable row level security;

drop policy if exists "Admins can manage whatsapp optouts" on public.whatsapp_optouts;
create policy "Admins can manage whatsapp optouts"
on public.whatsapp_optouts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage whatsapp campaigns" on public.whatsapp_campaigns;
create policy "Admins can manage whatsapp campaigns"
on public.whatsapp_campaigns
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage whatsapp campaign recipients" on public.whatsapp_campaign_recipients;
create policy "Admins can manage whatsapp campaign recipients"
on public.whatsapp_campaign_recipients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
