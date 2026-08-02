import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

const priceIds = {
  certificado_pj_a1: process.env.STRIPE_PRICE_CERTIFICADO_A1,
  certificado_pf_a1: process.env.STRIPE_PRICE_CERTIFICADO_PF_A1,
  abertura_empresa: process.env.STRIPE_PRICE_ABERTURA_EMPRESA,
  alteracao_cnpj: process.env.STRIPE_PRICE_ALTERACAO_CNPJ,
  serasa_pf: process.env.STRIPE_PRICE_SERASA_PF,
  serasa_pj: process.env.STRIPE_PRICE_SERASA_PJ,
  nota_fiscal_servico: process.env.STRIPE_PRICE_NOTA_FISCAL_SERVICO,
  nota_fiscal_produto: process.env.STRIPE_PRICE_NOTA_FISCAL_PRODUTO,
} as const

// Rota separada de app/api/stripe/checkout/route.ts porque os parâmetros do
// Stripe são incompatíveis entre os dois modos: "subscription" (planos
// Bronze/Prata) usa subscription_data[metadata], que o Stripe rejeita em
// mode "payment" (produto avulso, cobrança única).
export async function POST(request: Request) {
  const { product } = (await request.json()) as { product?: keyof typeof priceIds }
  const priceId = product ? priceIds[product] : null

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe Secret Key não configurada." }, { status: 500 })
  }

  if (!priceId || !product) {
    return NextResponse.json({ error: "Price ID do produto não configurado." }, { status: 400 })
  }

  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const origin = request.headers.get("origin") || new URL(request.url).origin
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/hub?tab=processo&compra=success`,
    cancel_url: `${origin}/hub?tab=processo`,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    client_reference_id: user.id,
    customer_email: user.email ?? "",
    "metadata[user_id]": user.id,
    "metadata[product]": product,
    "payment_intent_data[metadata][user_id]": user.id,
    "payment_intent_data[metadata][product]": product,
  })

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
  const data = (await response.json()) as { url?: string; error?: { message?: string } }

  if (!response.ok || !data.url) {
    return NextResponse.json({ error: data.error?.message || "Erro ao criar sessão do Stripe." }, { status: 500 })
  }

  return NextResponse.json({ url: data.url })
}
