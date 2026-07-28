import { createClient } from "@supabase/supabase-js"

// ATENÇÃO: client com service_role — ignora todas as políticas de RLS.
// Só pode ser usado em código que roda inteiramente no servidor e nunca é
// alcançável a partir do navegador (ex.: o webhook do Stripe). Nunca
// importe este arquivo em um componente 'use client' ou em qualquer código
// que possa acabar em um bundle enviado ao navegador.
export function createServiceRoleSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
