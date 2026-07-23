-- Client Hub schema.
-- Run manually in the Supabase SQL Editor.
-- This file creates only new structures for the client hub and does not alter admin tables.
-- Important: clear the SQL Editor before pasting this file to avoid mixing old function blocks.

create table if not exists public.client_hub_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  document text not null default '',
  company_name text not null default '',
  user_type text not null default 'client' check (user_type in ('client', 'admin')),
  current_plan text not null default 'free' check (current_plan in ('free', 'bronze', 'prata', 'ouro')),
  subscription_status text not null default 'free' check (
    subscription_status in ('free', 'active', 'trialing', 'past_due', 'canceled', 'inactive')
  ),
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_hub_profiles enable row level security;

drop trigger if exists client_hub_profiles_protect_fields on public.client_hub_profiles;
drop trigger if exists protect_client_hub_profile_fields on public.client_hub_profiles;
drop function if exists public.prevent_client_hub_privilege_escalation();
drop function if exists public.protect_client_hub_profile_fields();
drop function if exists public.is_client_hub_admin();

drop policy if exists "Client hub users can read own profile" on public.client_hub_profiles;
drop policy if exists "Client hub admins can read all profiles" on public.client_hub_profiles;
drop policy if exists "Client hub users can create own client profile" on public.client_hub_profiles;
drop policy if exists "Client hub users can create own profile" on public.client_hub_profiles;
drop policy if exists "Client hub users can update own profile" on public.client_hub_profiles;
drop policy if exists "Client hub admins can manage all profiles" on public.client_hub_profiles;

create policy "Client hub users can read own profile"
on public.client_hub_profiles
for select
to authenticated
using (id = auth.uid());

create policy "Client hub users can create own profile"
on public.client_hub_profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Client hub users can update own profile"
on public.client_hub_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

grant usage on schema public to authenticated;
grant select on public.client_hub_profiles to authenticated;

revoke insert on public.client_hub_profiles from authenticated;
grant insert (
  id,
  name,
  phone,
  document,
  company_name
) on public.client_hub_profiles to authenticated;

revoke update on public.client_hub_profiles from authenticated;
grant update (
  name,
  phone,
  document,
  company_name
) on public.client_hub_profiles to authenticated;

create index if not exists client_hub_profiles_user_type_idx
on public.client_hub_profiles(user_type);

create index if not exists client_hub_profiles_current_plan_idx
on public.client_hub_profiles(current_plan);

create index if not exists client_hub_profiles_subscription_status_idx
on public.client_hub_profiles(subscription_status);

create unique index if not exists client_hub_profiles_stripe_customer_id_idx
on public.client_hub_profiles(stripe_customer_id)
where stripe_customer_id is not null;
