import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

const priceIds = {
  bronze: process.env.STRIPE_PRICE_BRONZE,
  prata: process.env.STRIPE_PRICE_PRATA,
} as const

export async function POST(request: Request) {
  const { plan } = (await request.json()) as { plan?: keyof typeof priceIds }
  const priceId = plan ? priceIds[plan] : null

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe Secret Key não configurada." }, { status: 500 })
  }

  if (!priceId || !plan) {
    return NextResponse.json({ error: "Price ID do plano não configurado." }, { status: 400 })
  }

  // Quem está comprando precisa estar autenticado — obtido no servidor via
  // cookie de sessão, nunca a partir de algo que o navegador informa.
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const origin = request.headers.get("origin") || new URL(request.url).origin
  const body = new URLSearchParams({
    mode: "subscription",
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/#planos`,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    // liga a sessão de checkout ao usuário interno do Supabase
    client_reference_id: user.id,
    customer_email: user.email ?? "",
    "metadata[user_id]": user.id,
    "metadata[plan]": plan,
    // também grava no metadata da assinatura resultante, não só na sessão
    "subscription_data[metadata][user_id]": user.id,
    "subscription_data[metadata][plan]": plan,
  })

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
