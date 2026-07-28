import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"
import { verifyStripeWebhookSignature } from "@/lib/stripe/webhook"
import { isPlanSlug, resolvePlanFromPriceId, type PlanSlug } from "@/lib/stripe/plans"

// Status internos aceitos por client_hub_profiles.subscription_status
// (ver supabase/create-client-hub.sql).
type OurSubscriptionStatus = "free" | "active" | "trialing" | "past_due" | "canceled" | "inactive"

// Tipagem mínima e local dos objetos do Stripe usados aqui — o projeto não
// depende do SDK oficial `stripe` (mesma decisão já tomada no checkout).
type StripeEvent = {
  id: string
  type: string
  data: { object: Record<string, unknown> }
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0
}

function mapStripeSubscriptionStatus(stripeStatus: unknown): OurSubscriptionStatus {
  switch (stripeStatus) {
    case "active":
      return "active"
    case "trialing":
      return "trialing"
    case "past_due":
    case "unpaid":
      return "past_due"
    case "canceled":
      return "canceled"
    default:
      // incomplete, incomplete_expired, paused, ou qualquer status novo
      return "inactive"
  }
}

// Toda gravação passa por aqui — se o update falhar (ex.: coluna ainda não
// existe porque supabase/create-stripe-webhook.sql não rodou), isso lança
// erro em vez de deixar a rota responder 200 como se tivesse dado certo.
async function applyProfileUpdate(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  profileId: string,
  update: Record<string, unknown>,
) {
  const { error } = await supabase.from("client_hub_profiles").update(update).eq("id", profileId)
  if (error) {
    throw new Error(`client_hub_profiles update failed: ${error.message}`)
  }
}

async function findProfileIdByCustomerId(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  customerId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("client_hub_profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  return (data?.id as string | undefined) ?? null
}

async function handleCheckoutSessionCompleted(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  session: Record<string, unknown>,
) {
  const userId = isString(session.client_reference_id) ? session.client_reference_id : null
  const customerId = isString(session.customer) ? session.customer : null
  const subscriptionId = isString(session.subscription) ? session.subscription : null
  const metadata = (session.metadata as Record<string, unknown> | null) ?? null
  const plan: PlanSlug | null = isPlanSlug(metadata?.plan) ? (metadata!.plan as PlanSlug) : null

  // Sem client_reference_id não há como ligar isso a um usuário — ignora
  // com segurança em vez de adivinhar.
  if (!userId || !customerId) return

  const update: Record<string, unknown> = {
    stripe_customer_id: customerId,
    updated_at: new Date().toISOString(),
  }

  if (subscriptionId) update.stripe_subscription_id = subscriptionId
  if (plan) {
    update.current_plan = plan
    update.subscription_status = "active"
  }

  await applyProfileUpdate(supabase, userId, update)
}

async function handleSubscriptionUpsert(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  subscription: Record<string, unknown>,
) {
  const customerId = isString(subscription.customer) ? subscription.customer : null
  if (!customerId) return

  const metadata = (subscription.metadata as Record<string, unknown> | null) ?? null
  const metadataUserId = isString(metadata?.user_id) ? (metadata!.user_id as string) : null
  const metadataPlan = isPlanSlug(metadata?.plan) ? (metadata!.plan as PlanSlug) : null

  const items = subscription.items as { data?: Array<{ price?: { id?: string } }> } | undefined
  const priceId = items?.data?.[0]?.price?.id
  const plan = metadataPlan ?? resolvePlanFromPriceId(priceId)

  const ourStatus = mapStripeSubscriptionStatus(subscription.status)
  const currentPeriodEnd = subscription.current_period_end
  const periodEndIso =
    typeof currentPeriodEnd === "number" ? new Date(currentPeriodEnd * 1000).toISOString() : null

  const profileId = (await findProfileIdByCustomerId(supabase, customerId)) ?? metadataUserId
  if (!profileId) return

  const update: Record<string, unknown> = {
    stripe_customer_id: customerId,
    subscription_status: ourStatus,
    current_period_end: periodEndIso,
    updated_at: new Date().toISOString(),
  }

  if (isString(subscription.id)) update.stripe_subscription_id = subscription.id

  if (ourStatus === "canceled") {
    // só volta pro free quando o Stripe confirma que já encerrou de fato —
    // enquanto for só "cancel_at_period_end" o status continua "active".
    update.current_plan = "free"
  } else if (plan) {
    update.current_plan = plan
  }
  // sem "plan" identificável e status não-cancelado: não mexe em current_plan

  await applyProfileUpdate(supabase, profileId, update)
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  subscription: Record<string, unknown>,
) {
  const customerId = isString(subscription.customer) ? subscription.customer : null
  if (!customerId) return

  const metadata = (subscription.metadata as Record<string, unknown> | null) ?? null
  const metadataUserId = isString(metadata?.user_id) ? (metadata!.user_id as string) : null

  const profileId = (await findProfileIdByCustomerId(supabase, customerId)) ?? metadataUserId
  if (!profileId) return

  // Não apaga stripe_customer_id / stripe_subscription_id — mantém o
  // histórico de a quem essa assinatura pertenceu.
  await applyProfileUpdate(supabase, profileId, {
    subscription_status: "canceled",
    current_plan: "free",
    updated_at: new Date().toISOString(),
  })
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  invoice: Record<string, unknown>,
) {
  const customerId = isString(invoice.customer) ? invoice.customer : null
  if (!customerId) return

  const profileId = await findProfileIdByCustomerId(supabase, customerId)
  if (!profileId) return

  const lines = invoice.lines as { data?: Array<{ period?: { end?: number } }> } | undefined
  const periodEnd = lines?.data?.[0]?.period?.end
  const periodEndIso = typeof periodEnd === "number" ? new Date(periodEnd * 1000).toISOString() : null

  const update: Record<string, unknown> = {
    // um pagamento bem-sucedido confirma que a assinatura está em dia,
    // mesmo que estivesse "past_due" antes.
    subscription_status: "active",
    updated_at: new Date().toISOString(),
  }
  if (periodEndIso) update.current_period_end = periodEndIso

  await applyProfileUpdate(supabase, profileId, update)
}

async function handleInvoicePaymentFailed(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  invoice: Record<string, unknown>,
) {
  const customerId = isString(invoice.customer) ? invoice.customer : null
  if (!customerId) return

  const profileId = await findProfileIdByCustomerId(supabase, customerId)
  if (!profileId) return

  // Só marca como inadimplente — não derruba o plano pra free aqui. O
  // Stripe ainda vai tentar cobrar de novo; se esgotar as tentativas, o
  // subscription.updated/deleted correspondente é que decide o fim de fato.
  await applyProfileUpdate(supabase, profileId, {
    subscription_status: "past_due",
    updated_at: new Date().toISOString(),
  })
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe Webhook Secret não configurada." }, { status: 500 })
  }

  // Corpo bruto: a verificação de assinatura precisa dos bytes exatos
  // enviados pelo Stripe, antes de qualquer parse.
  const rawBody = await request.text()
  const signature = request.headers.get("stripe-signature")

  const isValid = await verifyStripeWebhookSignature(rawBody, signature, webhookSecret)
  if (!isValid) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 })
  }

  let event: StripeEvent
  try {
    event = JSON.parse(rawBody) as StripeEvent
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }

  if (!isString(event.id) || !isString(event.type)) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 })
  }

  const supabase = createServiceRoleSupabaseClient()

  // Deduplicação: se esse event.id já foi processado (reentrega do Stripe),
  // confirma recebimento sem processar de novo.
  const { error: dedupError } = await supabase
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, event_type: event.type })

  if (dedupError) {
    if (dedupError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true })
    }
    return NextResponse.json({ error: "dedup_failed" }, { status: 500 })
  }

  try {
    const object = event.data.object

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(supabase, object)
        break
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(supabase, object)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, object)
        break
      case "invoice.paid":
        await handleInvoicePaid(supabase, object)
        break
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(supabase, object)
        break
      default:
        // Evento fora da lista mínima tratada aqui — só confirma o recebimento.
        break
    }
  } catch {
    // Desfaz o registro de dedup pra permitir um retry legítimo do Stripe
    // reprocessar depois, em vez de ficar "travado" como já processado.
    await supabase.from("stripe_webhook_events").delete().eq("event_id", event.id)
    return NextResponse.json({ error: "processing_failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
