import { NextResponse } from "next/server"
import { requireAdminRoute } from "@/lib/admin-route"
import { processWhatsAppCampaignBatch } from "@/lib/whatsapp/process-campaign"

const WHATSAPP_CAMPAIGN_TEST_CAP = 5

type RouteContext = {
  params: Promise<{
    id: string
  }>
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

  const { error: updateError } = await admin.supabase
    .from("whatsapp_campaigns")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "ready")

  if (updateError) {
    return NextResponse.json({ ok: false, error: "Não consegui iniciar a campanha." }, { status: 500 })
  }

  const result = await processWhatsAppCampaignBatch(id, { limit: WHATSAPP_CAMPAIGN_TEST_CAP })
  if (!result.ok) {
    await admin.supabase
      .from("whatsapp_campaigns")
      .update({ status: "failed", finished_at: new Date().toISOString() })
      .eq("id", id)

    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: result.finished ?? "processing", processed: result.processed })
}
