import { maskWhatsAppPhone, normalizeBrazilianWhatsAppPhone } from "@/lib/whatsapp/contacts"
import { getSafeMetaError, getWhatsAppConfig, WHATSAPP_GRAPH_API_VERSION, WhatsAppSendError } from "@/lib/whatsapp/send-template"

type MetaTextMessageResponse = {
  messages?: Array<{
    id?: string
    message_status?: string
  }>
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    fbtrace_id?: string
    error_data?: {
      details?: string
    }
  }
}

export async function sendWhatsAppTextMessage(input: { to: unknown; text: unknown }) {
  const config = getWhatsAppConfig()
  if (!config) {
    throw new WhatsAppSendError("WhatsApp Cloud API não configurado.", {
      status: 500,
      safeError: "WhatsApp Cloud API não configurado.",
      transient: false,
    })
  }

  const to = normalizeBrazilianWhatsAppPhone(input.to)
  const text = typeof input.text === "string" ? input.text.trim() : ""

  if (!to) {
    throw new WhatsAppSendError("Destinatário inválido.", { status: 400, safeError: "Destinatário inválido." })
  }

  if (!text || text.length > 4096) {
    throw new WhatsAppSendError("Mensagem inválida.", { status: 400, safeError: "Mensagem inválida." })
  }

  console.info("[whatsapp:text] message.request", {
    to: maskWhatsAppPhone(to),
    length: text.length,
    phoneNumberId: config.phoneNumberId,
  })

  const response = await fetch(`https://graph.facebook.com/${WHATSAPP_GRAPH_API_VERSION}/${config.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: false,
        body: text,
      },
    }),
  })

  const result = (await response.json().catch(() => null)) as MetaTextMessageResponse | null
  const sentMessage = result?.messages?.[0]

  if (!response.ok || !sentMessage?.id) {
    console.error("[whatsapp:text] message.failed", {
      to: maskWhatsAppPhone(to),
      status: response.status,
      metaCode: result?.error?.code ?? null,
      metaSubcode: result?.error?.error_subcode ?? null,
      fbtraceId: result?.error?.fbtrace_id ?? null,
    })

    throw new WhatsAppSendError("Erro ao enviar mensagem pelo WhatsApp.", {
      status: response.ok ? 502 : response.status,
      safeError: getSafeMetaError(result?.error),
      transient: response.status === 408 || response.status === 429 || response.status >= 500,
    })
  }

  return {
    to,
    wamid: sentMessage.id,
    messageStatus: sentMessage.message_status ?? "accepted",
  }
}
