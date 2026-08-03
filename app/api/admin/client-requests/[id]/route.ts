import { NextResponse } from "next/server"
import {
  STATUS_LABELS,
  type RequestPriority,
  type RequestStatus,
} from "@/lib/client-requests/constants"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

const STATUS_VALUES = new Set<RequestStatus>(Object.keys(STATUS_LABELS) as RequestStatus[])
const PRIORITY_VALUES = new Set<RequestPriority>(["normal", "urgente"])

type UpdatePayload = {
  status?: unknown
  priority?: unknown
  internal_note?: unknown
}

function cleanNote(value: unknown) {
  if (typeof value !== "string") return null
  return value.trim().slice(0, 2000)
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Faça login para atualizar a solicitação." }, { status: 401 })
  }

  const { data: isAdmin } = await supabase.rpc("is_admin")

  if (isAdmin !== true) {
    return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 403 })
  }

  const payload = (await request.json().catch(() => null)) as UpdatePayload | null
  if (!payload) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
  }

  const update: Record<string, string> = {}

  if (typeof payload.status === "string") {
    if (!STATUS_VALUES.has(payload.status as RequestStatus)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 })
    }
    update.status = payload.status
  }

  if (typeof payload.priority === "string") {
    if (!PRIORITY_VALUES.has(payload.priority as RequestPriority)) {
      return NextResponse.json({ error: "Prioridade inválida." }, { status: 400 })
    }
    update.priority = payload.priority
  }

  const internalNote = cleanNote(payload.internal_note)
  if (internalNote !== null) {
    update.internal_note = internalNote
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 })
  }

  const serviceClient = createServiceRoleSupabaseClient()
  const { data, error } = await serviceClient
    .from("client_requests")
    .update(update)
    .eq("id", id)
    .select("id, status, priority, internal_note, updated_at")
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível atualizar. Confirme se o SQL de acesso administrativo das solicitações foi executado." },
      { status: 500 },
    )
  }

  if (!data) {
    return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 })
  }

  return NextResponse.json({ request: data })
}
