import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

const PRODUCT_PRICE_ENV_NAMES = {
  certificado_pj_a1: "STRIPE_PRICE_CERTIFICADO_A1",
  certificado_pf_a1: "STRIPE_PRICE_CERTIFICADO_PF_A1",
  abertura_empresa: "STRIPE_PRICE_ABERTURA_EMPRESA",
  alteracao_cnpj: "STRIPE_PRICE_ALTERACAO_CNPJ",
  serasa_pf: "STRIPE_PRICE_SERASA_PF",
  serasa_pj: "STRIPE_PRICE_SERASA_PJ",
  nota_fiscal_servico: "STRIPE_PRICE_NOTA_FISCAL_SERVICO",
  nota_fiscal_produto: "STRIPE_PRICE_NOTA_FISCAL_PRODUTO",
} as const

type ProductKey = keyof typeof PRODUCT_PRICE_ENV_NAMES

function isProductKey(value: unknown): value is ProductKey {
  return (
    value === "certificado_pj_a1" ||
    value === "certificado_pf_a1" ||
    value === "abertura_empresa" ||
    value === "alteracao_cnpj" ||
    value === "serasa_pf" ||
    value === "serasa_pj" ||
    value === "nota_fiscal_servico" ||
    value === "nota_fiscal_produto"
  )
}

function getStripeProductPriceIds() {
  return {
    certificado_pj_a1: process.env.STRIPE_PRICE_CERTIFICADO_A1,
    certificado_pf_a1: process.env.STRIPE_PRICE_CERTIFICADO_PF_A1,
    abertura_empresa: process.env.STRIPE_PRICE_ABERTURA_EMPRESA,
    alteracao_cnpj: process.env.STRIPE_PRICE_ALTERACAO_CNPJ,
    serasa_pf: process.env.STRIPE_PRICE_SERASA_PF,
    serasa_pj: process.env.STRIPE_PRICE_SERASA_PJ,
    nota_fiscal_servico: process.env.STRIPE_PRICE_NOTA_FISCAL_SERVICO,
    nota_fiscal_produto: process.env.STRIPE_PRICE_NOTA_FISCAL_PRODUTO,
  } as const
}

// Rota separada de app/api/stripe/checkout/route.ts porque os parâmetros do
// Stripe são incompatíveis entre os dois modos: "subscription" (planos
// Bronze/Prata) usa subscription_data[metadata], que o Stripe rejeita em
// mode "payment" (produto avulso, cobrança única).
export async function POST(request: Request) {
  const { product } = (await request.json()) as { product?: unknown }
  const productKey = isProductKey(product) ? product : null
  const priceIds = getStripeProductPriceIds()
  const priceId = productKey ? priceIds[productKey] : null
  const envName = productKey ? PRODUCT_PRICE_ENV_NAMES[productKey] : null

  console.info("[stripe.checkout-product] price lookup", {
    productReceived: typeof product === "string" ? product : null,
    envName,
    found: Boolean(priceId),
  })

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe Secret Key não configurada." }, { status: 500 })
  }

  if (!priceId || !productKey) {
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
    success_url: `${origin}/hub?tab=ferramentas&compra=success&product=${productKey}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/hub?tab=ferramentas`,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    client_reference_id: user.id,
    customer_email: user.email ?? "",
    "metadata[user_id]": user.id,
    "metadata[product]": productKey,
    "payment_intent_data[metadata][user_id]": user.id,
    "payment_intent_data[metadata][product]": productKey,
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
