import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

const PLAN_PRICE_ENV_NAMES = {
  bronze: "STRIPE_PRICE_BRONZE",
  prata: "STRIPE_PRICE_PRATA",
  ouro: "STRIPE_PRICE_OURO",
  diamante: "STRIPE_PRICE_DIAMANTE",
} as const

type PlanKey = keyof typeof PLAN_PRICE_ENV_NAMES

function isPlanKey(value: unknown): value is PlanKey {
  return value === "bronze" || value === "prata" || value === "ouro" || value === "diamante"
}

function getStripePlanPriceIds() {
  return {
    bronze: process.env.STRIPE_PRICE_BRONZE,
    prata: process.env.STRIPE_PRICE_PRATA,
    ouro: process.env.STRIPE_PRICE_OURO,
    diamante: process.env.STRIPE_PRICE_DIAMANTE,
  } as const
}

export async function POST(request: Request) {
  const { plan } = (await request.json()) as { plan?: unknown }
  const planKey = isPlanKey(plan) ? plan : null
  const priceIds = getStripePlanPriceIds()
  const priceId = planKey ? priceIds[planKey] : null
  const envName = planKey ? PLAN_PRICE_ENV_NAMES[planKey] : null

  console.info("[stripe.checkout] price lookup", {
    planReceived: typeof plan === "string" ? plan : null,
    envName,
    found: Boolean(priceId),
  })

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe Secret Key não configurada." }, { status: 500 })
  }

  if (!priceId || !planKey) {
    return NextResponse.json({ error: "Price ID do plano não configurado." }, { status: 400 })
  }

  // Quem está comprando precisa estar autenticado — obtido no servidor via
  // cookie de sessão, nunca a partir de algo que o navegador informa.
  //
  // TEMP-BRONZE-GUEST-CHECKOUT (2026-08-04): teste de conversão do Google
  // Ads exige checkout sem login. Enquanto durar o teste, só o plano Bronze
  // pode pular a exigência de usuário autenticado. Para reverter: apagar
  // `isGuestCheckoutAllowed` e voltar a bloquear sempre que `!user`.
  const isGuestCheckoutAllowed = planKey === "bronze"

  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isGuestCheckoutAllowed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const origin = request.headers.get("origin") || new URL(request.url).origin
  const params: Record<string, string> = {
    mode: "subscription",
    success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#planos`,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "metadata[plan]": planKey,
    // também grava no metadata da assinatura resultante, não só na sessão
    "subscription_data[metadata][plan]": planKey,
  }

  // Sem usuário (checkout Bronze de visitante) não há a quem ligar a sessão
  // — client_reference_id/metadata[user_id] ficam de fora e o Stripe coleta
  // o e-mail na própria página hospedada de checkout.
  if (user) {
    params.client_reference_id = user.id
    params.customer_email = user.email ?? ""
    params["metadata[user_id]"] = user.id
    params["subscription_data[metadata][user_id]"] = user.id
  }

  const body = new URLSearchParams(params)

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      // a Secret Key nunca sai do servidor — só é usada aqui, nesta chamada
      // servidor-a-servidor para a API do Stripe.
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
