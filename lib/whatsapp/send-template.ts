import { getCloudflareContext } from "@opennextjs/cloudflare"
import { maskWhatsAppPhone, normalizeBrazilianWhatsAppPhone } from "@/lib/whatsapp/contacts"

export const WHATSAPP_GRAPH_API_VERSION = "v26.0"

const TEMPLATE_NAME_PATTERN = /^[a-z0-9_]{1,512}$/
const LANGUAGE_CODE_PATTERN = /^[a-z]{2}(?:_[A-Z]{2})?$/
const MAX_BODY_PARAMETERS = 20
const MAX_PARAMETER_LENGTH = 1024

export type WhatsAppTemplateSendInput = {
  to: unknown
  templateName: unknown
  languageCode: unknown
  bodyParameters?: unknown
}

export type WhatsAppTemplateSendResult = {
  ok: true
  to: string
  wamid: string
  messageStatus: string | null
}

type WhatsAppTemplateParameter = {
  type: "text"
  text: string
}

type MetaSendMessageResponse = {
  messaging_product?: string
  contacts?: Array<{
    input?: string
    wa_id?: string
  }>
  messages?: Array<{
    id?: string
    message_status?: string
  }>
  error?: MetaError
}

type MetaError = {
  message?: string
  type?: string
  code?: number
  error_subcode?: number
  fbtrace_id?: string
  error_data?: {
    messaging_product?: string
    details?: string
  }
}

export class WhatsAppSendError extends Error {
  status: number
  safeError: unknown
  transient: boolean

  constructor(message: string, options: { status: number; safeError?: unknown; transient?: boolean }) {
    super(message)
    this.name = "WhatsAppSendError"
    this.status = options.status
    this.safeError = options.safeError ?? message
    this.transient = options.transient ?? false
  }
}

function readServerEnv(name: string) {
  const processValue = process.env[name]
  if (processValue) return processValue

  try {
    const context = getCloudflareContext({ async: false })
    const value = (context.env as Record<string, unknown>)[name]
    return typeof value === "string" && value ? value : undefined
  } catch {
    return undefined
  }
}

export function getWhatsAppConfig() {
  const accessToken = readServerEnv("WHATSAPP_ACCESS_TOKEN")
  const phoneNumberId = readServerEnv("WHATSAPP_PHONE_NUMBER_ID")
  const wabaId = readServerEnv("WHATSAPP_WABA_ID")

  if (!accessToken || !phoneNumberId || !wabaId) {
    return null
  }

  return { accessToken, phoneNumberId, wabaId }
}

export function cleanTemplateName(value: unknown) {
  if (typeof value !== "string") return null

  const templateName = value.trim()
  return TEMPLATE_NAME_PATTERN.test(templateName) ? templateName : null
}

export function cleanLanguageCode(value: unknown) {
  if (typeof value !== "string") return null

  const languageCode = value.trim()
  return LANGUAGE_CODE_PATTERN.test(languageCode) ? languageCode : null
}

export function cleanBodyParameters(value: unknown) {
  if (value === undefined) return []
  if (!Array.isArray(value)) return null
  if (value.length > MAX_BODY_PARAMETERS) return null

  const parameters = value.map((item) => {
    if (typeof item !== "string" && typeof item !== "number" && typeof item !== "boolean") {
      return null
    }

    const text = String(item).trim()
    if (!text || text.length > MAX_PARAMETER_LENGTH) {
      return null
    }

    return text
  })

  return parameters.every((item): item is string => item !== null) ? parameters : null
}

export function getSafeMetaError(error: MetaError | undefined) {
  if (!error) {
    return "Erro ao enviar mensagem pelo WhatsApp."
  }

  return {
    message: error.message ?? "Erro ao enviar mensagem pelo WhatsApp.",
    type: error.type ?? null,
    code: error.code ?? null,
    error_subcode: error.error_subcode ?? null,
    fbtrace_id: error.fbtrace_id ?? null,
    details: error.error_data?.details ?? null,
  }
}

function buildTemplateMessage({
  to,
  templateName,
  languageCode,
  bodyParameters,
}: {
  to: string
  templateName: string
  languageCode: string
  bodyParameters: string[]
}) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      ...(bodyParameters.length > 0
        ? {
            components: [
              {
                type: "body",
                parameters: bodyParameters.map((text): WhatsAppTemplateParameter => ({ type: "text", text })),
              },
            ],
          }
        : {}),
    },
  }
}

export function validateWhatsAppTemplateSendInput(input: WhatsAppTemplateSendInput) {
  const to = normalizeBrazilianWhatsAppPhone(input.to)
  const templateName = cleanTemplateName(input.templateName)
  const languageCode = cleanLanguageCode(input.languageCode)
  const bodyParameters = cleanBodyParameters(input.bodyParameters)

  if (!to) return { ok: false as const, error: "Destinatário inválido." }
  if (!templateName) return { ok: false as const, error: "Nome do template inválido." }
  if (!languageCode) return { ok: false as const, error: "Código de idioma inválido." }
  if (!bodyParameters) return { ok: false as const, error: "Parâmetros do template inválidos." }

  return { ok: true as const, to, templateName, languageCode, bodyParameters }
}

export async function sendWhatsAppTemplate(input: WhatsAppTemplateSendInput): Promise<WhatsAppTemplateSendResult> {
  const config = getWhatsAppConfig()
  if (!config) {
    console.error("[whatsapp:send] config.missing", {
      hasAccessToken: Boolean(readServerEnv("WHATSAPP_ACCESS_TOKEN")),
      hasPhoneNumberId: Boolean(readServerEnv("WHATSAPP_PHONE_NUMBER_ID")),
      hasWabaId: Boolean(readServerEnv("WHATSAPP_WABA_ID")),
    })

    throw new WhatsAppSendError("WhatsApp Cloud API não configurado.", {
      status: 500,
      safeError: "WhatsApp Cloud API não configurado.",
      transient: false,
    })
  }

  const validated = validateWhatsAppTemplateSendInput(input)
  if (!validated.ok) {
    throw new WhatsAppSendError(validated.error, {
      status: 400,
      safeError: validated.error,
      transient: false,
    })
  }

  const message = buildTemplateMessage(validated)

  console.info("[whatsapp:send] template.request", {
    to: maskWhatsAppPhone(validated.to),
    templateName: validated.templateName,
    languageCode: validated.languageCode,
    bodyParametersCount: validated.bodyParameters.length,
    phoneNumberId: config.phoneNumberId,
    wabaId: config.wabaId,
  })

  const response = await fetch(`https://graph.facebook.com/${WHATSAPP_GRAPH_API_VERSION}/${config.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })

  const result = (await response.json().catch(() => null)) as MetaSendMessageResponse | null
  const sentMessage = result?.messages?.[0]

  if (!response.ok || !sentMessage?.id) {
    console.error("[whatsapp:send] template.failed", {
      to: maskWhatsAppPhone(validated.to),
      templateName: validated.templateName,
      languageCode: validated.languageCode,
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

  console.info("[whatsapp:send] template.sent", {
    to: maskWhatsAppPhone(validated.to),
    templateName: validated.templateName,
    languageCode: validated.languageCode,
    wamid: sentMessage.id,
    messageStatus: sentMessage.message_status ?? null,
  })

  return {
    ok: true,
    to: validated.to,
    wamid: sentMessage.id,
    messageStatus: sentMessage.message_status ?? null,
  }
}
