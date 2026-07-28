import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe Secret Key não configurada." }, { status: 500 })
  }

  // Mesmo padrão do checkout: sessão obtida no servidor via cookie, nunca
  // a partir de algo que o navegador informa.
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("client_hub_profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle()

  const customerId = profile?.stripe_customer_id as string | null | undefined

  if (!customerId) {
    return NextResponse.json({ error: "no_stripe_customer" }, { status: 400 })
  }

  const origin = request.headers.get("origin") || new URL(request.url).origin
  const body = new URLSearchParams({
    customer: customerId,
    return_url: `${origin}/hub`,
  })

  const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
  const data = (await response.json()) as { url?: string; error?: { message?: string } }

  if (!response.ok || !data.url) {
    return NextResponse.json({ error: data.error?.message || "Erro ao abrir o portal do Stripe." }, { status: 500 })
  }

  return NextResponse.json({ url: data.url })
}
