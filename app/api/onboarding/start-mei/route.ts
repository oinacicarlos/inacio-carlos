import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

// Abertura de MEI é gratuita — ao contrário de certificado_pj_a1/
// abertura_empresa/alteracao_cnpj, não passa por checkout do Stripe nem por
// product_purchases. Essa rota só marca a intenção (wants_abertura_mei) na
// triagem do usuário logado, pra liberar o formulário "Serviços" no hub.
export async function POST() {
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
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
      .update({ wants_abertura_mei: true, updated_at: new Date().toISOString() })
      .eq("id", existing.id)

    if (error) {
      return NextResponse.json({ error: "Não foi possível iniciar a abertura do MEI." }, { status: 500 })
    }
  } else {
    const { error } = await serviceClient
      .from("onboarding_intakes")
      .insert({ user_id: user.id, wants_abertura_mei: true })

    if (error) {
      return NextResponse.json({ error: "Não foi possível iniciar a abertura do MEI." }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
