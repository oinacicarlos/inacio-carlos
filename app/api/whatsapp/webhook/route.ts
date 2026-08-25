import { NextResponse } from "next/server"

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
  }
  interactive?: {
    type?: string
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

function maskPhone(value: string | undefined) {
  if (!value) return null

  const digits = value.replace(/\D/g, "")
  if (!digits) return null

  return digits.length <= 4 ? "*".repeat(digits.length) : `${"*".repeat(digits.length - 4)}${digits.slice(-4)}`
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
    return message.interactive?.type ?? "interactive"
  }

  return null
}

function logWhatsAppWebhookPayload(payload: unknown) {
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
        console.info("[whatsapp:webhook] message.received", {
          entryId: entry.id ?? null,
          field: change.field ?? null,
          wamid: message.id ?? null,
          type: message.type ?? null,
          from: maskPhone(message.from),
          to: maskPhone(businessNumber),
          phoneNumberId: phoneNumberId ?? null,
          timestamp: message.timestamp ?? null,
          preview: getMessagePreview(message),
        })
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
          from: maskPhone(businessNumber),
          to: maskPhone(status.recipient_id),
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

  logWhatsAppWebhookPayload(payload)

  return NextResponse.json({ received: true })
}
