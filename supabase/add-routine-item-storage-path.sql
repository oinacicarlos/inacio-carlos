-- Permite anexar o arquivo de verdade em cada obrigação (routine_items),
-- reaproveitando o bucket routine-client-attachments já existente.
-- Execute no SQL Editor do Supabase depois do create-routine-control.sql.

alter table public.routine_items add column if not exists file_storage_path text not null default '';
