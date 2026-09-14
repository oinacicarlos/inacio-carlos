alter table public.whatsapp_campaigns
  add column if not exists test_group text,
  add column if not exists total_replied integer not null default 0,
  add column if not exists total_interested integer not null default 0;

alter table public.whatsapp_conversations
  add column if not exists campaign_id uuid references public.whatsapp_campaigns(id) on delete set null,
  add column if not exists has_replied boolean not null default false;

create index if not exists whatsapp_campaigns_test_group_idx on public.whatsapp_campaigns (test_group) where test_group is not null;
create index if not exists whatsapp_conversations_campaign_id_idx on public.whatsapp_conversations (campaign_id) where campaign_id is not null;

create or replace function public.refresh_whatsapp_campaign_conversation_totals(target_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_campaign_id is null then
    return;
  end if;

  update public.whatsapp_campaigns campaign
  set
    total_replied = totals.total_replied,
    total_interested = totals.total_interested
  from (
    select
      count(*) filter (where has_replied)::integer as total_replied,
      count(*) filter (where interested)::integer as total_interested
    from public.whatsapp_conversations
    where campaign_id = target_campaign_id
  ) totals
  where campaign.id = target_campaign_id;
end;
$$;

create or replace function public.sync_whatsapp_campaign_conversation_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_whatsapp_campaign_conversation_totals(old.campaign_id);
    return old;
  end if;

  perform public.refresh_whatsapp_campaign_conversation_totals(new.campaign_id);

  if tg_op = 'UPDATE' and old.campaign_id is distinct from new.campaign_id then
    perform public.refresh_whatsapp_campaign_conversation_totals(old.campaign_id);
  end if;

  return new;
end;
$$;

drop trigger if exists whatsapp_conversations_sync_campaign_totals on public.whatsapp_conversations;

create trigger whatsapp_conversations_sync_campaign_totals
after insert or update or delete on public.whatsapp_conversations
for each row execute function public.sync_whatsapp_campaign_conversation_totals();
