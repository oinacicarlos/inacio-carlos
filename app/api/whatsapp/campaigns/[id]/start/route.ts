import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextResponse } from "next/server"
import { requireAdminRoute } from "@/lib/admin-route"

const WHATSAPP_CAMPAIGN_TEST_CAP = 5

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type CloudflareQueue = {
  send: (message: unknown, options?: { contentType?: string }) => Promise<void>
}

function getCampaignQueue() {
  try {
    const context = getCloudflareContext({ async: false })
    return (context.env as Record<string, unknown>).WHATSAPP_CAMPAIGN_QUEUE as CloudflareQueue | undefined
  } catch {
    return undefined
  }
}

export async function POST(_request: Request, context: RouteContext) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const { id } = await context.params

  const { data: campaign, error: campaignError } = await admin.supabase
    .from("whatsapp_campaigns")
    .select("id,status,template_name,template_language,total_contacts")
    .eq("id", id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ ok: false, error: "Campanha não encontrada." }, { status: 404 })
  }

  if (campaign.status !== "ready") {
    return NextResponse.json({ ok: false, error: "Esta campanha já foi iniciada ou não está pronta." }, { status: 409 })
  }

  const { data: pendingRecipients, error: recipientsError } = await admin.supabase
    .from("whatsapp_campaign_recipients")
    .select("id")
    .eq("campaign_id", id)
    .eq("status", "pending")
    .limit(WHATSAPP_CAMPAIGN_TEST_CAP + 1)

  if (recipientsError) {
    return NextResponse.json({ ok: false, error: "Não consegui validar destinatários." }, { status: 500 })
  }

  const pendingCount = pendingRecipients?.length ?? 0
  if (pendingCount < 1) {
    return NextResponse.json({ ok: false, error: "Não há destinatários pendentes aptos." }, { status: 400 })
  }

  if (pendingCount > WHATSAPP_CAMPAIGN_TEST_CAP) {
    return NextResponse.json({
      ok: false,
      error: `Trava inicial ativa: esta campanha tem mais de ${WHATSAPP_CAMPAIGN_TEST_CAP} destinatários aptos.`,
    }, { status: 400 })
  }

  const queue = getCampaignQueue()
  if (!queue) {
    return NextResponse.json({
      ok: false,
      error: "Fila Cloudflare WHATSAPP_CAMPAIGN_QUEUE ainda não configurada no Worker.",
    }, { status: 503 })
  }

  const { error: updateError } = await admin.supabase
    .from("whatsapp_campaigns")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "ready")

  if (updateError) {
    return NextResponse.json({ ok: false, error: "Não consegui iniciar a campanha." }, { status: 500 })
  }

  await queue.send({
    type: "whatsapp_campaign",
    campaignId: id,
    requestedBy: admin.user.id,
  })

  return NextResponse.json({ ok: true, status: "processing" })
}
