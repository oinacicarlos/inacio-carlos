import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

export async function requireAdminRoute() {
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false as const, status: 401, error: "unauthorized" }
  }

  const { data: isAdmin } = await supabase.rpc("is_admin")
  if (isAdmin !== true) {
    return { ok: false as const, status: 403, error: "forbidden" }
  }

  return { ok: true as const, supabase, user }
}
