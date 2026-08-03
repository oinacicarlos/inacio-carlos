import { NextResponse } from "next/server"
import {
  ABERTURA_STATUS_LABELS,
  ALTERACAO_STATUS_LABELS,
  CERTIFICADO_STATUS_LABELS,
  MEI_STATUS_LABELS,
  type AberturaStatus,
  type AlteracaoStatus,
  type CertificadoStatus,
  type MeiStatus,
} from "@/lib/onboarding/constants"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

const CERTIFICADO_STATUS_VALUES = new Set<CertificadoStatus>(Object.keys(CERTIFICADO_STATUS_LABELS) as CertificadoStatus[])
const ABERTURA_STATUS_VALUES = new Set<AberturaStatus>(Object.keys(ABERTURA_STATUS_LABELS) as AberturaStatus[])
const MEI_STATUS_VALUES = new Set<MeiStatus>(Object.keys(MEI_STATUS_LABELS) as MeiStatus[])
const ALTERACAO_STATUS_VALUES = new Set<AlteracaoStatus>(Object.keys(ALTERACAO_STATUS_LABELS) as AlteracaoStatus[])

type UpdatePayload = {
  certificado_status?: unknown
  abertura_status?: unknown
  mei_status?: unknown
  alteracao_status?: unknown
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Faça login para atualizar o processo." }, { status: 401 })
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

  if (typeof payload.certificado_status === "string") {
    if (!CERTIFICADO_STATUS_VALUES.has(payload.certificado_status as CertificadoStatus)) {
      return NextResponse.json({ error: "Status do certificado inválido." }, { status: 400 })
    }
    update.certificado_status = payload.certificado_status
  }

  if (typeof payload.abertura_status === "string") {
    if (!ABERTURA_STATUS_VALUES.has(payload.abertura_status as AberturaStatus)) {
      return NextResponse.json({ error: "Status da abertura inválido." }, { status: 400 })
    }
    update.abertura_status = payload.abertura_status
  }

  if (typeof payload.mei_status === "string") {
    if (!MEI_STATUS_VALUES.has(payload.mei_status as MeiStatus)) {
      return NextResponse.json({ error: "Status do MEI inválido." }, { status: 400 })
    }
    update.mei_status = payload.mei_status
  }

  if (typeof payload.alteracao_status === "string") {
    if (!ALTERACAO_STATUS_VALUES.has(payload.alteracao_status as AlteracaoStatus)) {
      return NextResponse.json({ error: "Status da alteração inválido." }, { status: 400 })
    }
    update.alteracao_status = payload.alteracao_status
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 })
  }

  const serviceClient = createServiceRoleSupabaseClient()
  const { data, error } = await serviceClient
    .from("onboarding_intakes")
    .update(update)
    .eq("id", id)
    .select("id, certificado_status, abertura_status, mei_status, alteracao_status, updated_at")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: "Não foi possível atualizar o processo." }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "Processo não encontrado." }, { status: 404 })
  }

  return NextResponse.json({ onboarding: data })
}
