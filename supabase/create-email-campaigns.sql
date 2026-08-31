create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'processing', 'completed', 'failed')),
  total_contacts integer not null default 0,
  total_sent integer not null default 0,
  total_failed integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.email_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  name text not null default '',
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  error_message text,
  resend_id text,
  sent_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, email)
);

create index if not exists email_campaigns_created_at_idx on public.email_campaigns (created_at desc);
create index if not exists email_campaigns_status_idx on public.email_campaigns (status);
create index if not exists email_campaign_recipients_campaign_status_idx on public.email_campaign_recipients (campaign_id, status);
create index if not exists email_campaign_recipients_email_idx on public.email_campaign_recipients (email);

create or replace function public.refresh_email_campaign_totals(target_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.email_campaigns campaign
  set
    total_contacts = totals.total_contacts,
    total_sent = totals.total_sent,
    total_failed = totals.total_failed
  from (
    select
      count(*)::integer as total_contacts,
      count(*) filter (where status = 'sent')::integer as total_sent,
      count(*) filter (where status = 'failed')::integer as total_failed
    from public.email_campaign_recipients
    where campaign_id = target_campaign_id
  ) totals
  where campaign.id = target_campaign_id;
end;
$$;

create or replace function public.sync_email_campaign_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_email_campaign_totals(coalesce(new.campaign_id, old.campaign_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists email_campaign_recipients_sync_totals on public.email_campaign_recipients;

create trigger email_campaign_recipients_sync_totals
after insert or update or delete on public.email_campaign_recipients
for each row execute function public.sync_email_campaign_totals();

alter table public.email_campaigns enable row level security;
alter table public.email_campaign_recipients enable row level security;

drop policy if exists "Admins can manage email campaigns" on public.email_campaigns;
create policy "Admins can manage email campaigns"
on public.email_campaigns
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage email campaign recipients" on public.email_campaign_recipients;
create policy "Admins can manage email campaign recipients"
on public.email_campaign_recipients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
