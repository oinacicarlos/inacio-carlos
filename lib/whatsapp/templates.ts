import { getWhatsAppConfig, WHATSAPP_GRAPH_API_VERSION } from "@/lib/whatsapp/send-template"

export type SanitizedWhatsAppTemplate = {
  name: string
  status: string
  category: string
  language: string
  body: string
  buttons: Array<{
    type: string
    text: string
  }>
  components: Array<Record<string, unknown>>
  bodyVariables: string[]
  bodyVariableCount: number
  headerFormat: "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT"
}

type MetaTemplateComponent = {
  type?: string
  text?: string
  buttons?: Array<{
    type?: string
    text?: string
  }>
  [key: string]: unknown
}

type MetaTemplate = {
  name?: string
  status?: string
  category?: string
  language?: string
  components?: MetaTemplateComponent[]
}

type MetaTemplatesResponse = {
  data?: MetaTemplate[]
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    fbtrace_id?: string
  }
}

function extractTemplateVariables(value: string) {
  const matches = value.match(/{{\s*[a-zA-Z0-9_]+\s*}}/g) ?? []
  return matches.map((token) => token.replace(/[{}]/g, "").trim())
}

function sanitizeTemplate(template: MetaTemplate): SanitizedWhatsAppTemplate | null {
  if (!template.name || !template.language) return null

  const components = Array.isArray(template.components) ? template.components : []
  const bodyComponent = components.find((component) => component.type?.toUpperCase() === "BODY")
  const buttonComponents = components.filter((component) => component.type?.toUpperCase() === "BUTTONS")
  const headerComponent = components.find((component) => component.type?.toUpperCase() === "HEADER")
  const body = typeof bodyComponent?.text === "string" ? bodyComponent.text : ""
  const headerFormatRaw = typeof headerComponent?.format === "string" ? headerComponent.format.toUpperCase() : "NONE"
  const headerFormat: SanitizedWhatsAppTemplate["headerFormat"] =
    headerFormatRaw === "IMAGE" || headerFormatRaw === "VIDEO" || headerFormatRaw === "DOCUMENT" || headerFormatRaw === "TEXT"
      ? headerFormatRaw
      : "NONE"

  return {
    name: template.name,
    status: template.status ?? "UNKNOWN",
    category: template.category ?? "UNKNOWN",
    language: template.language,
    body,
    buttons: buttonComponents.flatMap((component) =>
      (component.buttons ?? []).flatMap((button) => (
        button.type && button.text
          ? [{ type: button.type, text: button.text }]
          : []
      )),
    ),
    components: components.map((component) => ({ ...component })),
    bodyVariables: extractTemplateVariables(body),
    bodyVariableCount: extractTemplateVariables(body).length,
    headerFormat,
  }
}

export async function fetchWhatsAppTemplates() {
  const config = getWhatsAppConfig()
  if (!config) {
    return { ok: false as const, status: 500, error: "WhatsApp Cloud API não configurado." }
  }

  const url = new URL(`https://graph.facebook.com/${WHATSAPP_GRAPH_API_VERSION}/${config.wabaId}/message_templates`)
  url.searchParams.set("fields", "name,status,category,language,components")
  url.searchParams.set("limit", "100")

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
    },
  })

  const data = (await response.json().catch(() => null)) as MetaTemplatesResponse | null

  if (!response.ok) {
    console.error("[whatsapp:templates] fetch.failed", {
      status: response.status,
      metaCode: data?.error?.code ?? null,
      metaSubcode: data?.error?.error_subcode ?? null,
      fbtraceId: data?.error?.fbtrace_id ?? null,
    })

    return {
      ok: false as const,
      status: response.status,
      error: {
        message: data?.error?.message ?? "Não consegui consultar os templates do WhatsApp.",
        type: data?.error?.type ?? null,
        code: data?.error?.code ?? null,
        error_subcode: data?.error?.error_subcode ?? null,
        fbtrace_id: data?.error?.fbtrace_id ?? null,
      },
    }
  }

  return {
    ok: true as const,
    templates: (data?.data ?? []).flatMap((template) => {
      const sanitized = sanitizeTemplate(template)
      return sanitized ? [sanitized] : []
    }),
  }
}
