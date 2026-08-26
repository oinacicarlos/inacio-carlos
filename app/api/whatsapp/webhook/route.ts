import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"
import { maskWhatsAppPhone, normalizeBrazilianWhatsAppPhone } from "@/lib/whatsapp/contacts"
import {
  INTEREST_TEXT_PATTERN,
  OPTOUT_TEXT_PATTERN,
  updateWhatsAppInboxMessageStatus,
  upsertWhatsAppInboxMessage,
} from "@/lib/whatsapp/inbox"

const TRACKED_WHATSAPP_STATUSES = new Set(["sent", "delivered", "read", "failed"])

type WhatsAppWebhookPayload = {
  object?: string
  entry?: WhatsAppWebhookEntry[]
}

type WhatsAppWebhookEntry = {
  id?: string
  changes?: WhatsAppWebhookChange[]
}

type WhatsAppWebhookChange = {
  field?: string
  value?: {
    messaging_product?: string
    metadata?: {
      display_phone_number?: string
      phone_number_id?: string
    }
    contacts?: Array<{
      wa_id?: string
      profile?: {
        name?: string
      }
    }>
    messages?: WhatsAppMessage[]
    statuses?: WhatsAppStatus[]
  }
}

type WhatsAppMessage = {
  id?: string
  from?: string
  timestamp?: string
  type?: string
  text?: {
    body?: string
  }
  button?: {
    text?: string
    payload?: string
  }
  interactive?: {
    type?: string
    button_reply?: {
      id?: string
      title?: string
    }
    list_reply?: {
      id?: string
      title?: string
      description?: string
    }
  }
}

type WhatsAppStatus = {
  id?: string
  recipient_id?: string
  status?: string
  timestamp?: string
  conversation?: {
    id?: string
    origin?: {
      type?: string
    }
  }
  errors?: Array<{
    code?: number
    title?: string
    message?: string
    error_data?: {
      details?: string
    }
  }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function truncateText(value: string | undefined, maxLength = 240) {
  if (!value) return null

  return value.length <= maxLength ? value : `${value.slice(0, maxLength)}...`
}

function getMessagePreview(message: WhatsAppMessage) {
  if (message.type === "text") {
    return truncateText(message.text?.body)
  }

  if (message.type === "button") {
    return truncateText(message.button?.text)
  }

  if (message.type === "interactive") {
    return truncateText(message.interactive?.button_reply?.title ?? message.interactive?.list_reply?.title ?? message.interactive?.type)
  }

  return null
}

function getMessageType(message: WhatsAppMessage): "text" | "button" | "unsupported" {
  if (message.type === "text") return "text"
  if (message.type === "button" || message.interactive?.button_reply || message.interactive?.list_reply) return "button"
  return "unsupported"
}

function getContactName(value: WhatsAppWebhookChange["value"], from: string | undefined) {
  if (!from) return null
  const contact = value?.contacts?.find((entry) => entry.wa_id === from)
  return contact?.profile?.name ?? null
}

async function updateCampaignStatus(wamid: string | undefined, status: string | undefined, timestamp: string | undefined, errors: WhatsAppStatus["errors"]) {
  if (!wamid || !status || !TRACKED_WHATSAPP_STATUSES.has(status)) return

  try {
    const supabase = createServiceRoleSupabaseClient()
    const statusColumn =
      status === "sent" ? "sent_at" :
      status === "delivered" ? "delivered_at" :
      status === "read" ? "read_at" :
      status === "failed" ? "failed_at" :
      null
    const eventDate = timestamp ? new Date(Number(timestamp) * 1000).toISOString() : new Date().toISOString()
    const error = errors?.[0]

    await supabase
      .from("whatsapp_campaign_recipients")
      .update({
        status,
        ...(statusColumn ? { [statusColumn]: eventDate } : {}),
        ...(status === "failed"
          ? {
              error_code: error?.code ? String(error.code) : null,
              error_message: truncateText(error?.message ?? error?.title ?? error?.error_data?.details, 500),
            }
          : {}),
      })
      .eq("wamid", wamid)

    await updateWhatsAppInboxMessageStatus(supabase, wamid, status, {
      errorCode: error?.code ? String(error.code) : null,
      errorMessage: truncateText(error?.message ?? error?.title ?? error?.error_data?.details, 500),
    })
  } catch (error) {
    console.warn("[whatsapp:webhook] campaign_status.update_failed", {
      wamid,
      status,
      message: error instanceof Error ? error.message : "unknown",
    })
  }
}

async function registerOptOut(phone: string | undefined, text: string | null) {
  const normalizedPhone = normalizeBrazilianWhatsAppPhone(phone ?? "")
  if (!normalizedPhone) return

  try {
    const supabase = createServiceRoleSupabaseClient()

    await supabase
      .from("whatsapp_optouts")
      .upsert({
        phone: normalizedPhone,
        reason: truncateText(text ?? "Solicitação de opt-out recebida pelo WhatsApp", 240),
        source: "whatsapp_webhook",
      }, { onConflict: "phone" })

    await supabase
      .from("whatsapp_conversations")
      .update({ opted_out: true })
      .eq("phone", normalizedPhone)

    console.info("[whatsapp:webhook] optout.registered", {
      from: maskWhatsAppPhone(normalizedPhone),
    })
  } catch (error) {
    console.warn("[whatsapp:webhook] optout.failed", {
      from: maskWhatsAppPhone(normalizedPhone),
      message: error instanceof Error ? error.message : "unknown",
    })
  }
}

async function logWhatsAppWebhookPayload(payload: unknown) {
  if (!isRecord(payload)) {
    console.warn("[whatsapp:webhook] payload.invalid")
    return
  }

  const data = payload as WhatsAppWebhookPayload
  const entries = Array.isArray(data.entry) ? data.entry : []

  for (const entry of entries) {
    const changes = Array.isArray(entry.changes) ? entry.changes : []

    for (const change of changes) {
      const value = change.value
      const businessNumber = value?.metadata?.display_phone_number
      const phoneNumberId = value?.metadata?.phone_number_id

      for (const message of value?.messages ?? []) {
        const preview = getMessagePreview(message)
        const supabase = createServiceRoleSupabaseClient()
        const normalizedFrom = normalizeBrazilianWhatsAppPhone(message.from ?? "")

        console.info("[whatsapp:webhook] message.received", {
          entryId: entry.id ?? null,
          field: change.field ?? null,
          wamid: message.id ?? null,
          type: message.type ?? null,
          from: maskWhatsAppPhone(message.from),
          to: maskWhatsAppPhone(businessNumber),
          phoneNumberId: phoneNumberId ?? null,
          timestamp: message.timestamp ?? null,
          preview,
        })

        if (normalizedFrom) {
          await upsertWhatsAppInboxMessage(supabase, {
            phone: normalizedFrom,
            name: getContactName(value, message.from),
            wamid: message.id ?? null,
            direction: "inbound",
            type: getMessageType(message),
            text: message.type === "text" ? preview : null,
            buttonText: message.type !== "text" ? preview : null,
            status: "received",
            metaTimestamp: message.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : new Date().toISOString(),
            incrementUnread: true,
          })
        }

        if (preview && OPTOUT_TEXT_PATTERN.test(preview)) {
          await registerOptOut(message.from, preview)
        }

        if (preview && INTEREST_TEXT_PATTERN.test(preview)) {
          console.info("[whatsapp:webhook] interest.received", {
            from: maskWhatsAppPhone(message.from),
            wamid: message.id ?? null,
            preview,
          })
        }
      }

      for (const status of value?.statuses ?? []) {
        if (!status.status || !TRACKED_WHATSAPP_STATUSES.has(status.status)) {
          continue
        }

        console.info(`[whatsapp:webhook] status.${status.status}`, {
          entryId: entry.id ?? null,
          field: change.field ?? null,
          wamid: status.id ?? null,
          status: status.status,
          from: maskWhatsAppPhone(businessNumber),
          to: maskWhatsAppPhone(status.recipient_id),
          phoneNumberId: phoneNumberId ?? null,
          timestamp: status.timestamp ?? null,
          conversationId: status.conversation?.id ?? null,
          conversationOrigin: status.conversation?.origin?.type ?? null,
          errors: status.errors?.map((error) => ({
            code: error.code ?? null,
            title: error.title ?? null,
            message: truncateText(error.message),
            details: truncateText(error.error_data?.details),
          })) ?? [],
        })

        await updateCampaignStatus(status.id, status.status, status.timestamp, status.errors)
      }
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const verifyToken = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")
  const expectedVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === "subscribe" && challenge && expectedVerifyToken && verifyToken === expectedVerifyToken) {
    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  return new Response("Forbidden", { status: 403 })
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)

  await logWhatsAppWebhookPayload(payload)

  return NextResponse.json({ received: true })
}
