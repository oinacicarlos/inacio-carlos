import { NextResponse } from "next/server"

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

  if (!priceId) {
    return NextResponse.json({ error: "Price ID do plano não configurado." }, { status: 400 })
  }

  const origin = request.headers.get("origin") || new URL(request.url).origin
  const body = new URLSearchParams({
    mode: "subscription",
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/#planos`,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
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
