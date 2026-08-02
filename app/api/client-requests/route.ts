import { NextResponse } from "next/server"
import { canCreateClientRequest } from "@/lib/client-requests/access"
import {
  CATEGORY_OPTIONS,
  type RequestCategory,
  type RequestPriority,
} from "@/lib/client-requests/constants"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

type ClientRequestPayload = {
  category?: unknown
  title?: unknown
  description?: unknown
  priority?: unknown
  attachment_path?: unknown
}

const CATEGORY_VALUES = new Set<RequestCategory>(CATEGORY_OPTIONS.map((option) => option.value))
const PRIORITY_VALUES = new Set<RequestPriority>(["normal", "urgente"])

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, maxLength)
}

function cleanAttachmentPath(value: unknown, userId: string) {
  if (typeof value !== "string") return null

  const path = value.trim()
  if (!path) return null

  return path.startsWith(`${userId}/`) ? path.slice(0, 500) : null
}

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Faça login para enviar uma solicitação." }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("client_hub_profiles")
    .select("current_plan, subscription_status")
    .eq("id", user.id)
    .maybeSingle()

  if (!canCreateClientRequest(profile)) {
    return NextResponse.json(
      { error: "Solicitações contábeis estão disponíveis nos planos pagos." },
      { status: 403 },
    )
  }

  const payload = (await request.json().catch(() => null)) as ClientRequestPayload | null
  if (!payload) {
    return NextResponse.json({ error: "Dados inválidos para a solicitação." }, { status: 400 })
  }

  const category = typeof payload.category === "string" && CATEGORY_VALUES.has(payload.category as RequestCategory)
    ? payload.category
    : null
  const priority = typeof payload.priority === "string" && PRIORITY_VALUES.has(payload.priority as RequestPriority)
    ? payload.priority
    : "normal"
  const title = cleanText(payload.title, 140)
  const description = cleanText(payload.description, 5000)
  const attachmentPath = cleanAttachmentPath(payload.attachment_path, user.id)

  if (!category || !title) {
    return NextResponse.json({ error: "Informe categoria e título para enviar a solicitação." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("client_requests")
    .insert({
      user_id: user.id,
      category,
      title,
      description,
      priority,
      attachment_path: attachmentPath,
    })
    .select("id, category, title, description, priority, status, attachment_path, created_at")
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Não foi possível enviar a solicitação. Tente novamente." }, { status: 500 })
  }

  return NextResponse.json({ request: data })
}
