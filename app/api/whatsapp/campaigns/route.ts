import { NextResponse } from "next/server"
import { requireAdminRoute } from "@/lib/admin-route"
import { normalizeBrazilianWhatsAppPhone, parseWhatsAppContactsText, maskWhatsAppPhone } from "@/lib/whatsapp/contacts"
import { fetchWhatsAppTemplates } from "@/lib/whatsapp/templates"

const WHATSAPP_CAMPAIGN_TEST_CAP = 5

type CampaignPayload = {
  name?: unknown
  templateName?: unknown
  templateLanguage?: unknown
  templateCategory?: unknown
  contactsText?: unknown
}

function cleanString(value: unknown, maxLength = 180) {
  if (typeof value !== "string") return null
  const text = value.trim()
  if (!text || text.length > maxLength) return null
  return text
}

function buildBodyParameters(variableCount: number, contactName: string) {
  if (variableCount <= 0) return []
  return Array.from({ length: variableCount }, (_, index) => (index === 0 ? contactName : ""))
}

export async function GET() {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const { data, error } = await admin.supabase
    .from("whatsapp_campaigns")
    .select("id,name,template_name,template_language,template_category,status,total_contacts,total_queued,total_sent,total_delivered,total_read,total_failed,total_optout,created_at,started_at,finished_at")
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ ok: false, error: "Não consegui carregar as campanhas." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, campaigns: data ?? [] })
}

export async function POST(request: Request) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json().catch(() => null)) as CampaignPayload | null
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 })
  }

  const name = cleanString(payload.name)
  const templateName = cleanString(payload.templateName, 512)
  const templateLanguage = cleanString(payload.templateLanguage, 32)
  const templateCategory = cleanString(payload.templateCategory, 80)
  const contactsText = typeof payload.contactsText === "string" ? payload.contactsText : ""

  if (!name || !templateName || !templateLanguage || !templateCategory) {
    return NextResponse.json({ ok: false, error: "Campanha ou template inválido." }, { status: 400 })
  }

  const templatesResult = await fetchWhatsAppTemplates()
  if (!templatesResult.ok) {
    return NextResponse.json({ ok: false, error: templatesResult.error }, { status: templatesResult.status })
  }

  const selectedTemplate = templatesResult.templates.find((template) =>
    template.name === templateName &&
    template.language === templateLanguage &&
    template.category === templateCategory
  )

  if (!selectedTemplate) {
    return NextResponse.json({ ok: false, error: "Template não encontrado na Meta." }, { status: 400 })
  }

  if (selectedTemplate.status !== "APPROVED") {
    return NextResponse.json({ ok: false, error: "Apenas templates aprovados podem virar campanha." }, { status: 400 })
  }

  const parsedContacts = parseWhatsAppContactsText(contactsText)
  const normalizedPhones = Array.from(new Set(parsedContacts.flatMap((contact) => contact.normalizedPhone ? [contact.normalizedPhone] : [])))

  const { data: optouts, error: optoutError } = await admin.supabase
    .from("whatsapp_optouts")
    .select("phone")
    .in("phone", normalizedPhones.length ? normalizedPhones : ["__empty__"])

  if (optoutError) {
    return NextResponse.json({ ok: false, error: "Não consegui validar opt-outs." }, { status: 500 })
  }

  const optoutPhones = new Set((optouts ?? []).flatMap((row) => {
    const phone = normalizeBrazilianWhatsAppPhone(row.phone)
    return phone ? [phone] : []
  }))

  const recipients = parsedContacts.flatMap((contact) => {
    if (!contact.normalizedPhone || !contact.name) return []

    const isOptout = optoutPhones.has(contact.normalizedPhone)
    return [{
      name: contact.name,
      phone: contact.normalizedPhone,
      status: isOptout ? "optout" : contact.duplicate ? "skipped" : "pending",
      error_message: isOptout ? "Bloqueado / opt-out" : contact.duplicate ? "Duplicado na lista" : null,
      body_parameters: buildBodyParameters(selectedTemplate.bodyVariableCount, contact.name),
    }]
  })

  const sendableCount = recipients.filter((recipient) => recipient.status === "pending").length
  if (sendableCount < 1) {
    return NextResponse.json({ ok: false, error: "Nenhum contato apto para envio." }, { status: 400 })
  }

  if (sendableCount > WHATSAPP_CAMPAIGN_TEST_CAP) {
    return NextResponse.json({
      ok: false,
      error: `Trava inicial ativa: use até ${WHATSAPP_CAMPAIGN_TEST_CAP} contatos aptos para o primeiro teste.`,
    }, { status: 400 })
  }

  const invalidCount = parsedContacts.filter((contact) => !contact.normalizedPhone || !contact.name).length
  const duplicateCount = parsedContacts.filter((contact) => contact.duplicate).length
  const optoutCount = recipients.filter((recipient) => recipient.status === "optout").length

  const { data: campaign, error: campaignError } = await admin.supabase
    .from("whatsapp_campaigns")
    .insert({
      name,
      template_name: selectedTemplate.name,
      template_language: selectedTemplate.language,
      template_category: selectedTemplate.category,
      status: "ready",
      created_by: admin.user.id,
      total_contacts: recipients.length,
      total_optout: optoutCount,
    })
    .select("id,name,template_name,template_language,template_category,status,total_contacts,total_queued,total_sent,total_delivered,total_read,total_failed,total_optout,created_at")
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ ok: false, error: "Não consegui criar a campanha." }, { status: 500 })
  }

  const { data: insertedRecipients, error: recipientsError } = await admin.supabase
    .from("whatsapp_campaign_recipients")
    .insert(recipients.map((recipient) => ({
      campaign_id: campaign.id,
      name: recipient.name,
      phone: recipient.phone,
      status: recipient.status,
      error_message: recipient.error_message,
      body_parameters: recipient.body_parameters,
    })))
    .select("id,name,phone,status,error_message,wamid,attempts,queued_at,sent_at,delivered_at,read_at,failed_at,created_at")
    .order("created_at", { ascending: true })

  if (recipientsError) {
    return NextResponse.json({ ok: false, error: "Campanha criada, mas não consegui salvar destinatários." }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    campaign,
    template: selectedTemplate,
    summary: {
      totalImported: parsedContacts.length,
      valid: parsedContacts.filter((contact) => contact.valid).length,
      invalid: invalidCount,
      duplicates: duplicateCount,
      optouts: optoutCount,
      sendable: sendableCount,
      testCap: WHATSAPP_CAMPAIGN_TEST_CAP,
    },
    recipients: (insertedRecipients ?? []).map((recipient) => ({
      ...recipient,
      phone: maskWhatsAppPhone(recipient.phone),
    })),
  })
}
