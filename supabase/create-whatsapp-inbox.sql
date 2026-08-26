create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  last_message_text text,
  last_message_at timestamptz,
  unread_count integer not null default 0,
  status text not null default 'open' check (status in ('open', 'archived')),
  interested boolean not null default false,
  opted_out boolean not null default false,
  customer_service_window_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  wamid text unique,
  direction text not null check (direction in ('inbound', 'outbound')),
  type text not null default 'text' check (type in ('text', 'button', 'template', 'system', 'unsupported')),
  text text,
  button_text text,
  template_name text,
  status text,
  error_code text,
  error_message text,
  meta_timestamp timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists whatsapp_conversations_last_message_at_idx on public.whatsapp_conversations (last_message_at desc nulls last);
create index if not exists whatsapp_conversations_unread_idx on public.whatsapp_conversations (unread_count) where unread_count > 0;
create index if not exists whatsapp_conversations_interested_idx on public.whatsapp_conversations (interested) where interested = true;
create index if not exists whatsapp_conversations_opted_out_idx on public.whatsapp_conversations (opted_out) where opted_out = true;
create index if not exists whatsapp_messages_conversation_created_idx on public.whatsapp_messages (conversation_id, created_at);
create index if not exists whatsapp_messages_wamid_idx on public.whatsapp_messages (wamid) where wamid is not null;

create or replace function public.touch_whatsapp_inbox_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists whatsapp_conversations_touch_updated_at on public.whatsapp_conversations;
create trigger whatsapp_conversations_touch_updated_at
before update on public.whatsapp_conversations
for each row execute function public.touch_whatsapp_inbox_updated_at();

drop trigger if exists whatsapp_messages_touch_updated_at on public.whatsapp_messages;
create trigger whatsapp_messages_touch_updated_at
before update on public.whatsapp_messages
for each row execute function public.touch_whatsapp_inbox_updated_at();

alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;

drop policy if exists "Admins can manage whatsapp conversations" on public.whatsapp_conversations;
create policy "Admins can manage whatsapp conversations"
on public.whatsapp_conversations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage whatsapp messages" on public.whatsapp_messages;
create policy "Admins can manage whatsapp messages"
on public.whatsapp_messages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
