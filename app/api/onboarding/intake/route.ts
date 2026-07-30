import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"
import { encryptSecret } from "@/lib/onboarding/crypto"

type IntakePayload = {
  cpf?: string
  senha_gov?: string
  segmento?: string
  descricao_cnpj?: string
  estado_civil?: string
  regime_bens?: string
  razao_social?: string
  tem_nome_fantasia?: boolean | null
  nome_fantasia?: string
  quantidade_socios?: number | null
  cnpj_atual?: string
  descricao_alteracao?: string
  has_certidao_casamento?: boolean | null
  has_comprovante_bombeiro?: boolean | null
}

function cleanString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined
}

// A senha gov.br nunca passa pelo cliente Supabase do navegador (as colunas
// senha_gov_encrypted/senha_gov_iv nem têm grant pra "authenticated" — ver
// supabase/create-onboarding.sql). Ela chega em texto puro aqui, só nessa
// rota, é cifrada com a chave do servidor e só o ciphertext é gravado.
export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const payload = (await request.json().catch(() => null)) as IntakePayload | null
  if (!payload) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }

  const update: Record<string, unknown> = {}

  const cpf = cleanString(payload.cpf)
  if (cpf !== undefined) update.cpf = cpf

  const segmento = cleanString(payload.segmento)
  if (segmento !== undefined) update.segmento = segmento

  const descricaoCnpj = cleanString(payload.descricao_cnpj)
  if (descricaoCnpj !== undefined) update.descricao_cnpj = descricaoCnpj

  const estadoCivil = cleanString(payload.estado_civil)
  if (estadoCivil !== undefined) update.estado_civil = estadoCivil

  const regimeBens = cleanString(payload.regime_bens)
  if (regimeBens !== undefined) update.regime_bens = regimeBens

  const razaoSocial = cleanString(payload.razao_social)
  if (razaoSocial !== undefined) update.razao_social = razaoSocial

  const nomeFantasia = cleanString(payload.nome_fantasia)
  if (nomeFantasia !== undefined) update.nome_fantasia = nomeFantasia

  const cnpjAtual = cleanString(payload.cnpj_atual)
  if (cnpjAtual !== undefined) update.cnpj_atual = cnpjAtual

  const descricaoAlteracao = cleanString(payload.descricao_alteracao)
  if (descricaoAlteracao !== undefined) update.descricao_alteracao = descricaoAlteracao

  if (typeof payload.tem_nome_fantasia === "boolean") {
    update.tem_nome_fantasia = payload.tem_nome_fantasia
  }
  if (typeof payload.quantidade_socios === "number" && Number.isFinite(payload.quantidade_socios)) {
    update.quantidade_socios = Math.max(1, Math.trunc(payload.quantidade_socios))
  }
  if (typeof payload.has_certidao_casamento === "boolean") {
    update.has_certidao_casamento = payload.has_certidao_casamento
  }
  if (typeof payload.has_comprovante_bombeiro === "boolean") {
    update.has_comprovante_bombeiro = payload.has_comprovante_bombeiro
  }

  const senhaGov = cleanString(payload.senha_gov)
  if (senhaGov) {
    const encrypted = await encryptSecret(senhaGov)
    if (!encrypted) {
      return NextResponse.json({ error: "Criptografia não configurada neste ambiente." }, { status: 500 })
    }
    update.senha_gov_encrypted = encrypted.ciphertext
    update.senha_gov_iv = encrypted.iv
  }

  const serviceClient = createServiceRoleSupabaseClient()

  const { data: existing } = await serviceClient
    .from("onboarding_intakes")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await serviceClient
      .from("onboarding_intakes")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", existing.id)

    if (error) {
      return NextResponse.json({ error: "Não foi possível salvar a triagem." }, { status: 500 })
    }
  } else {
    const { error } = await serviceClient.from("onboarding_intakes").insert({ user_id: user.id, ...update })

    if (error) {
      return NextResponse.json({ error: "Não foi possível salvar a triagem." }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
