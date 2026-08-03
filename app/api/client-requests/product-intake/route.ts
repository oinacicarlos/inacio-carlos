import { NextResponse } from "next/server"
import {
  PRODUCT_REQUEST_INTAKES,
  buildStructuredDescription,
  isProductRequestSlug,
  validateIntakeField,
} from "@/lib/client-requests/product-intake"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

type ProductIntakePayload = {
  product?: unknown
  fields?: unknown
  notes?: unknown
}

function cleanValue(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 1200) : ""
}

function cleanFields(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, fieldValue]) => [key, cleanValue(fieldValue)]),
  )
}

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Faça login para enviar os dados da compra." }, { status: 401 })
  }

  const payload = (await request.json().catch(() => null)) as ProductIntakePayload | null
  if (!payload || !isProductRequestSlug(payload.product)) {
    return NextResponse.json({ error: "Produto inválido para coleta de dados." }, { status: 400 })
  }

  const intake = PRODUCT_REQUEST_INTAKES[payload.product]
  const fields = cleanFields(payload.fields)
  const notes = cleanValue(payload.notes)

  for (const field of intake.fields) {
    const fieldError = validateIntakeField(field, fields[field.name] ?? "")
    if (fieldError) {
      return NextResponse.json({ error: fieldError }, { status: 400 })
    }
  }

  const serviceClient = createServiceRoleSupabaseClient()
  const { data: purchase, error: purchaseError } = await serviceClient
    .from("product_purchases")
    .select("id, created_at")
    .eq("user_id", user.id)
    .eq("product", payload.product)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (purchaseError) {
    return NextResponse.json({ error: "Não foi possível confirmar a compra agora." }, { status: 500 })
  }

  if (!purchase) {
    return NextResponse.json(
      { error: "Seu pagamento ainda está sincronizando. Aguarde alguns segundos e tente novamente." },
      { status: 409 },
    )
  }

  const description = buildStructuredDescription(intake, fields, notes)
  const { data: existingRequest, error: requestLoadError } = await serviceClient
    .from("client_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", intake.title)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (requestLoadError) {
    return NextResponse.json({ error: "Não foi possível localizar a solicitação da compra." }, { status: 500 })
  }

  const requestData = {
    user_id: user.id,
    category: intake.category,
    title: intake.title,
    description,
    priority: "normal",
    status: "recebida",
  }

  const saveRequest = existingRequest
    ? serviceClient
        .from("client_requests")
        .update({ description, status: "recebida", updated_at: new Date().toISOString() })
        .eq("id", existingRequest.id)
    : serviceClient.from("client_requests").insert(requestData)

  const { error: saveError } = await saveRequest

  if (saveError) {
    return NextResponse.json({ error: "Não foi possível salvar os dados da compra." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
