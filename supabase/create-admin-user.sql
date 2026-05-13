-- Run this in the Supabase SQL Editor for this project.
-- It creates/updates the admin Auth user used by /login.

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  admin_email text := 'contatoinaciocarlos@gmail.com';
  admin_password text := 'narutobk12';
  admin_user_id uuid;
begin
  select id
    into admin_user_id
  from auth.users
  where email = admin_email
  limit 1;

  if admin_user_id is null then
    admin_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at,
      is_anonymous
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      extensions.crypt(admin_password, extensions.gen_salt('bf')),
      now(),
      null,
      '',
      null,
      '',
      null,
      '',
      '',
      null,
      null,
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      now(),
      now(),
      null,
      null,
      '',
      '',
      null,
      '',
      0,
      null,
      '',
      null,
      false,
      null,
      false
    );
  else
    update auth.users
       set encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
           updated_at = now()
     where id = admin_user_id;
  end if;

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    admin_user_id,
    admin_user_id,
    jsonb_build_object('sub', admin_user_id::text, 'email', admin_email),
    'email',
    admin_email,
    now(),
    now(),
    now()
  )
  on conflict (provider, provider_id)
  do update set
    user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = now();
end $$;
