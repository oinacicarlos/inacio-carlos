import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"
import { verifyStripeWebhookSignature } from "@/lib/stripe/webhook"
import { isPlanSlug, resolvePlanFromPriceId, type PlanSlug } from "@/lib/stripe/plans"
import { isProductSlug, type ProductSlug } from "@/lib/stripe/products"
import { sendEmail } from "@/lib/email/resend"
import { SOLUTI_VIDEO_LINK, CERTIFICADO_WHATSAPP_LINK } from "@/lib/onboarding/constants"

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
  // Sessões de produto avulso (mode "payment") seguem um caminho totalmente
  // diferente do de assinatura — nada de client_hub_profiles.current_plan
  // aqui, isso vira uma linha em product_purchases + onboarding_intakes.
  if (session.mode === "payment") {
    await handleProductCheckoutCompleted(supabase, session)
    return
  }

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

const CERTIFICADO_EMAIL_SUBJECT = "Próximos passos: seu Certificado Digital A1"
const CERTIFICADO_EMAIL_TEXT = `Recebemos o pagamento do seu Certificado Digital A1. Veja o passo a passo para emitir:

Passo 1 — Acesse e preencha as informações desse link: ${SOLUTI_VIDEO_LINK}
Passo 2 — Depois de preencher, você entrará na sala virtual de espera para ser atendido.
Passo 3 — Na hora que você for atendido, confirme todas as informações (CPF, data de nascimento etc.).
Passo 4 — No final da videoconferência, tire um print da SENHA PARA EMISSÃO e envie para o nosso WhatsApp: ${CERTIFICADO_WHATSAPP_LINK}

Atendimento disponível de 8h às 16h30. Com esse certificado, você não vai precisar fazer outra videoconferência.

Complete também os seus dados na aba "Serviços" do hub para agilizarmos o restante do processo.`

const ABERTURA_EMAIL_SUBJECT = "Recebemos o pagamento da abertura da sua empresa"
const ABERTURA_EMAIL_TEXT = `Recebemos o pagamento para a legalização/abertura da sua empresa.

Para seguir com o processo, acesse a aba "Serviços" no seu hub e complete a triagem: CPF, o segmento de atuação, uma breve descrição do que você quer para o CNPJ, e o envio dos documentos necessários (identidade, certidão de casamento se tiver, comprovante de residência, IPTU do imóvel onde ficará a empresa e comprovante do bombeiro se tiver).

Assim que recebermos tudo, damos sequência ao protocolo na Junta Comercial.`

const ALTERACAO_EMAIL_SUBJECT = "Recebemos o pagamento da alteração contratual"
const ALTERACAO_EMAIL_TEXT = `Recebemos o pagamento para a alteração contratual do seu CNPJ.

Para seguir com o processo, acesse a aba "Serviços" no seu hub e complete a triagem: CPF, o CNPJ atual, o que você quer alterar (razão social, endereço, atividade, sócios etc.) e o envio da sua identidade.

Assim que recebermos tudo, damos sequência ao protocolo.`

// Produtos que alimentam a triagem de onboarding (aba "Serviços" do hub).
// certificado_pj_a1 e certificado_pf_a1 caem no mesmo wants_certificado —
// o passo a passo de emissão é idêntico pra PF e PJ, só o produto cobrado
// no Stripe muda.
const ONBOARDING_WANTS_FIELD: Partial<Record<ProductSlug, string>> = {
  certificado_pj_a1: "wants_certificado",
  certificado_pf_a1: "wants_certificado",
  abertura_empresa: "wants_abertura_empresa",
  alteracao_cnpj: "wants_alteracao_cnpj",
}

// Produtos "sob encomenda": não têm formulário de triagem próprio — a compra
// já cria uma solicitação automática (ver handleProductCheckoutCompleted) na
// mesma tabela usada pela aba "Solicitações", e o cliente acompanha por lá.
const REQUEST_PRODUCT_TITLES: Partial<Record<ProductSlug, string>> = {
  serasa_pf: "Consulta Serasa PF",
  serasa_pj: "Consulta Serasa PJ",
  nota_fiscal_servico: "Nota Fiscal de Serviço",
  nota_fiscal_produto: "Nota Fiscal de Produto (DANFE)",
}

const REQUEST_PRODUCT_CATEGORY: Partial<Record<ProductSlug, string>> = {
  serasa_pf: "consulta_serasa",
  serasa_pj: "consulta_serasa",
  nota_fiscal_servico: "emissao_nota_fiscal",
  nota_fiscal_produto: "emissao_nota_fiscal",
}

function buildRequestProductEmail(title: string) {
  return {
    subject: `Recebemos o pagamento: ${title}`,
    text: `Recebemos o pagamento da sua solicitação de ${title}.\n\nJá criamos uma solicitação pra você — acesse a aba "Solicitações" no seu hub pra acompanhar. Nossa equipe vai confirmar os dados necessários por lá e te retornar assim que estiver pronto.`,
  }
}

async function sendProductWelcomeEmail(email: string, product: ProductSlug) {
  const requestTitle = REQUEST_PRODUCT_TITLES[product]
  if (requestTitle) {
    const { subject, text } = buildRequestProductEmail(requestTitle)
    await sendEmail({ to: email, subject, text })
    return
  }

  if (product === "certificado_pj_a1" || product === "certificado_pf_a1") {
    await sendEmail({ to: email, subject: CERTIFICADO_EMAIL_SUBJECT, text: CERTIFICADO_EMAIL_TEXT })
  } else if (product === "abertura_empresa") {
    await sendEmail({ to: email, subject: ABERTURA_EMAIL_SUBJECT, text: ABERTURA_EMAIL_TEXT })
  } else {
    await sendEmail({ to: email, subject: ALTERACAO_EMAIL_SUBJECT, text: ALTERACAO_EMAIL_TEXT })
  }
}

async function handleProductCheckoutCompleted(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  session: Record<string, unknown>,
) {
  const userId = isString(session.client_reference_id) ? session.client_reference_id : null
  const metadata = (session.metadata as Record<string, unknown> | null) ?? null
  const product: ProductSlug | null = isProductSlug(metadata?.product) ? (metadata!.product as ProductSlug) : null
  const paymentIntentId = isString(session.payment_intent) ? session.payment_intent : null
  const amountTotal = typeof session.amount_total === "number" ? session.amount_total : null
  const customerEmail = isString(session.customer_email) ? session.customer_email : null

  if (!userId || !product) return

  const { error: purchaseError } = await supabase.from("product_purchases").insert({
    user_id: userId,
    product,
    stripe_checkout_session_id: isString(session.id) ? session.id : null,
    stripe_payment_intent_id: paymentIntentId,
    amount_total: amountTotal,
  })
  if (purchaseError) {
    throw new Error(`product_purchases insert failed: ${purchaseError.message}`)
  }

  const wantsField = ONBOARDING_WANTS_FIELD[product]
  const requestTitle = REQUEST_PRODUCT_TITLES[product]

  if (wantsField) {
    const { data: existingIntake } = await supabase
      .from("onboarding_intakes")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (existingIntake) {
      const { error: updateError } = await supabase
        .from("onboarding_intakes")
        .update({ [wantsField]: true, updated_at: new Date().toISOString() })
        .eq("id", existingIntake.id)
      if (updateError) {
        throw new Error(`onboarding_intakes update failed: ${updateError.message}`)
      }
    } else {
      const { error: insertError } = await supabase.from("onboarding_intakes").insert({
        user_id: userId,
        [wantsField]: true,
      })
      if (insertError) {
        throw new Error(`onboarding_intakes insert failed: ${insertError.message}`)
      }
    }
  } else if (requestTitle) {
    // Produto "sob encomenda": não tem triagem própria, então a compra já
    // vira uma solicitação na mesma tabela da aba "Solicitações" do hub.
    const { error: requestError } = await supabase.from("client_requests").insert({
      user_id: userId,
      category: REQUEST_PRODUCT_CATEGORY[product] ?? "outra",
      title: requestTitle,
      description:
        "Solicitação criada automaticamente após o pagamento. Nossa equipe vai confirmar os dados necessários e retornar por aqui.",
      priority: "normal",
    })
    if (requestError) {
      throw new Error(`client_requests insert failed: ${requestError.message}`)
    }
  }

  if (customerEmail) {
    // E-mail é best-effort: se o Resend falhar, não desfaz o processamento
    // do pagamento (já gravado acima) nem marca o evento pra reprocessar.
    await sendProductWelcomeEmail(customerEmail, product).catch(() => null)
  }
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
