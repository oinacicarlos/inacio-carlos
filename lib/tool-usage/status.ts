import type { SupabaseClient } from "@supabase/supabase-js"

export const FREE_PLAN_MONTHLY_LIMIT = 3

export type ToolUsageStatus = {
  plan: string
  isAdmin: boolean
  limited: boolean
  limit: number | null
  used: number
  remaining: number | null
}

function currentMonthStart() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getToolUsageStatus(supabase: SupabaseClient<any>, userId: string, tool: string): Promise<ToolUsageStatus> {
  const [{ data: profile }, { data: isAdmin }] = await Promise.all([
    supabase.from("client_hub_profiles").select("current_plan").eq("id", userId).maybeSingle(),
    supabase.rpc("is_admin"),
  ])

  const plan = profile?.current_plan ?? "free"

  // Administradores nunca são limitados por esse controle de uso do cliente.
  if (isAdmin === true || plan !== "free") {
    return { plan, isAdmin: isAdmin === true, limited: false, limit: null, used: 0, remaining: null }
  }

  // O limite é por ferramenta: cada uma das 4 ferramentas tem sua própria
  // cota de 3 usos mensais, independente das outras.
  const { count } = await supabase
    .from("tool_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("tool", tool)
    .eq("reference_month", currentMonthStart())

  const used = count ?? 0

  return {
    plan,
    isAdmin: false,
    limited: true,
    limit: FREE_PLAN_MONTHLY_LIMIT,
    used,
    remaining: Math.max(FREE_PLAN_MONTHLY_LIMIT - used, 0),
  }
}
