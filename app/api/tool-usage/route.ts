import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"
import { getToolUsageStatus } from "@/lib/tool-usage/status"
import { isToolSlug } from "@/lib/tool-usage/tools"

export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const tool = body?.tool
  const idempotencyKey = body?.idempotencyKey

  if (!isToolSlug(tool)) {
    return NextResponse.json({ error: "invalid_tool" }, { status: 400 })
  }

  if (typeof idempotencyKey !== "string" || idempotencyKey.length < 8) {
    return NextResponse.json({ error: "invalid_idempotency_key" }, { status: 400 })
  }

  // Validação de limite no servidor — nunca confia no que o navegador diz.
  // O limite é por ferramenta, então o status é sempre checado para o "tool"
  // que está sendo gravado agora, não para o total entre todas as ferramentas.
  const statusBefore = await getToolUsageStatus(supabase, user.id, tool)

  if (statusBefore.limited && (statusBefore.remaining ?? 0) <= 0) {
    return NextResponse.json({ error: "limit_reached", ...statusBefore }, { status: 403 })
  }

  const { error: insertError } = await supabase
    .from("tool_usage")
    .insert({ user_id: user.id, tool, idempotency_key: idempotencyKey })

  // 23505 = unique_violation em (user_id, idempotency_key): a mesma
  // conclusão já tinha sido gravada (ex.: retry de rede). Não é erro real,
  // só não deve contar de novo.
  if (insertError && insertError.code !== "23505") {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 })
  }

  const statusAfter = await getToolUsageStatus(supabase, user.id, tool)
  return NextResponse.json({ ok: true, ...statusAfter })
}
