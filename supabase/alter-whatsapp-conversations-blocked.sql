alter table public.whatsapp_conversations drop constraint if exists whatsapp_conversations_status_check;

alter table public.whatsapp_conversations
add constraint whatsapp_conversations_status_check
check (status in ('open', 'archived', 'blocked'));

create index if not exists whatsapp_conversations_blocked_idx
on public.whatsapp_conversations (status) where status = 'blocked';
