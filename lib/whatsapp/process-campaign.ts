import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"
import { upsertWhatsAppInboxMessage } from "@/lib/whatsapp/inbox"
import { maskWhatsAppPhone } from "@/lib/whatsapp/contacts"
import { sendWhatsAppTemplate, WhatsAppSendError } from "@/lib/whatsapp/send-template"

const MAX_CAMPAIGN_ATTEMPTS = 3

type CampaignRecord = {
  id: string
  template_name: string
  template_language: string
  status: string
}

type RecipientRecord = {
  id: string
  campaign_id: string
  name: string
  phone: string
  status: string
  wamid: string | null
  attempts: number | null
  body_parameters: unknown
}

function getBodyParameters(value: unknown, fallbackName: string) {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (typeof item === "string" && item.trim()) return [item.trim()]
    if (typeof item === "number" || typeof item === "boolean") return [String(item)]
    return []
  }).map((item) => item || fallbackName)
}

export async function processWhatsAppCampaignBatch(campaignId: string, options: { limit?: number } = {}) {
  const limit = Math.max(1, Math.min(options.limit ?? 1, 5))
  const supabase = createServiceRoleSupabaseClient()

  const { data: campaignData, error: campaignError } = await supabase
    .from("whatsapp_campaigns")
    .select("id,template_name,template_language,status")
    .eq("id", campaignId)
    .single()
  const campaign = campaignData as CampaignRecord | null

  if (campaignError || !campaign) {
    console.error("[whatsapp:campaign] campaign.not_found", { campaignId })
    return { ok: false as const, processed: 0, error: "Campanha não encontrada." }
  }

  if (campaign.status !== "processing") {
    console.info("[whatsapp:campaign] campaign.not_processing", { campaignId, status: campaign.status })
    return { ok: true as const, processed: 0, finished: campaign.status }
  }

  const { data: recipients, error: recipientsError } = await supabase
    .from("whatsapp_campaign_recipients")
    .select("id,campaign_id,name,phone,status,wamid,attempts,body_parameters")
    .eq("campaign_id", campaignId)
    .in("status", ["pending", "queued"])
    .is("wamid", null)
    .lt("attempts", MAX_CAMPAIGN_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(limit)
    .returns<RecipientRecord[]>()

  if (recipientsError) {
    console.error("[whatsapp:campaign] recipients.failed", { campaignId })
    return { ok: false as const, processed: 0, error: "Destinatários indisponíveis." }
  }

  if (!recipients?.length) {
    await supabase
      .from("whatsapp_campaigns")
      .update({ status: "completed", finished_at: new Date().toISOString() })
      .eq("id", campaignId)
      .eq("status", "processing")

    return { ok: true as const, processed: 0, finished: "completed" }
  }

  let processed = 0

  for (const recipient of recipients) {
    if (recipient.wamid) continue

    const attempts = Number(recipient.attempts ?? 0) + 1
    const now = new Date().toISOString()

    const { error: lockError } = await supabase
      .from("whatsapp_campaign_recipients")
      .update({ status: "queued", attempts, queued_at: now })
      .eq("id", recipient.id)
      .is("wamid", null)
      .in("status", ["pending", "queued"])

    if (lockError) {
      console.warn("[whatsapp:campaign] recipient.lock_failed", {
        campaignId,
        recipientId: recipient.id,
        phone: maskWhatsAppPhone(recipient.phone),
      })
      continue
    }

    try {
      const result = await sendWhatsAppTemplate({
        to: recipient.phone,
        templateName: campaign.template_name,
        languageCode: campaign.template_language,
        bodyParameters: getBodyParameters(recipient.body_parameters, recipient.name),
      })

      await supabase
        .from("whatsapp_campaign_recipients")
        .update({
          status: result.messageStatus === "accepted" ? "accepted" : "sent",
          wamid: result.wamid,
          sent_at: new Date().toISOString(),
          error_code: null,
          error_message: null,
        })
        .eq("id", recipient.id)
        .is("wamid", null)

      await upsertWhatsAppInboxMessage(supabase, {
        phone: recipient.phone,
        name: recipient.name,
        wamid: result.wamid,
        direction: "outbound",
        type: "template",
        templateName: campaign.template_name,
        status: result.messageStatus ?? "accepted",
        metaTimestamp: new Date().toISOString(),
        incrementUnread: false,
      })

      processed += 1
    } catch (error) {
      const isSendError = error instanceof WhatsAppSendError
      const failedPermanently = !isSendError || !error.transient || attempts >= MAX_CAMPAIGN_ATTEMPTS

      await supabase
        .from("whatsapp_campaign_recipients")
        .update({
          status: failedPermanently ? "failed" : "pending",
          error_code: isSendError ? String(error.status) : null,
          error_message: isSendError ? JSON.stringify(error.safeError).slice(0, 500) : "Erro inesperado no envio.",
          failed_at: failedPermanently ? new Date().toISOString() : null,
        })
        .eq("id", recipient.id)
        .is("wamid", null)

      console.warn("[whatsapp:campaign] recipient.send_failed", {
        campaignId,
        recipientId: recipient.id,
        phone: maskWhatsAppPhone(recipient.phone),
        transient: isSendError ? error.transient : false,
        attempts,
      })
    }
  }

  return { ok: true as const, processed }
}
