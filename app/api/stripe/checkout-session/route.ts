import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

type StripeCheckoutSession = {
  id?: string
  client_reference_id?: string | null
  payment_status?: string | null
  amount_total?: number | null
  currency?: string | null
}

function isCheckoutSessionId(value: string | null) {
  return Boolean(value && /^cs_(test|live)_[A-Za-z0-9_]+$/.test(value))
}

export async function GET(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    return NextResponse.json({ error: "Stripe Secret Key não configurada." }, { status: 500 })
  }

  const url = new URL(request.url)
  const sessionId = url.searchParams.get("session_id")

  if (!isCheckoutSessionId(sessionId)) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 400 })
  }

  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  })
  const session = (await response.json().catch(() => null)) as (StripeCheckoutSession & { error?: { message?: string } }) | null

  if (!response.ok || !session?.id) {
    return NextResponse.json({ error: session?.error?.message || "Não foi possível confirmar a compra." }, { status: 400 })
  }

  if (session.client_reference_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  return NextResponse.json({
    session_id: session.id,
    payment_status: session.payment_status ?? null,
    amount_total: typeof session.amount_total === "number" ? session.amount_total : null,
    currency: session.currency ?? null,
  })
}
