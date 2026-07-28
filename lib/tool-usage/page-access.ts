import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getToolUsageStatus } from "@/lib/tool-usage/status"

export type ToolPageAccess = {
  blocked: boolean
  trackUsage: boolean
  isAuthenticated: boolean
}

// Checagem no servidor, usada pelas 4 páginas de ferramenta antes de
// renderizar a ferramenta em si. Um visitante não autenticado pode preencher
// e ver a ferramenta normalmente — só o resultado final fica borrado no
// cliente (ver components/tool-result-gate.tsx) até criar conta ou entrar.
// "blocked" só acontece pra quem já tem conta grátis e estourou a cota do
// mês (paywall de upgrade, tela cheia).
export async function getToolPageAccess(tool: string): Promise<ToolPageAccess> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { blocked: false, trackUsage: false, isAuthenticated: false }
  }

  const status = await getToolUsageStatus(supabase, user.id, tool)
  const blocked = status.limited && (status.remaining ?? 0) <= 0

  return { blocked, trackUsage: !blocked, isAuthenticated: true }
}
