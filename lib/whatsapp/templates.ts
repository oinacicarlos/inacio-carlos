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
  bodyVariableCount: number
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

function countTemplateVariables(value: string) {
  const matches = value.match(/{{\s*\d+\s*}}/g)
  return matches?.length ?? 0
}

function sanitizeTemplate(template: MetaTemplate): SanitizedWhatsAppTemplate | null {
  if (!template.name || !template.language) return null

  const components = Array.isArray(template.components) ? template.components : []
  const bodyComponent = components.find((component) => component.type?.toUpperCase() === "BODY")
  const buttonComponents = components.filter((component) => component.type?.toUpperCase() === "BUTTONS")
  const body = typeof bodyComponent?.text === "string" ? bodyComponent.text : ""

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
    bodyVariableCount: countTemplateVariables(body),
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
