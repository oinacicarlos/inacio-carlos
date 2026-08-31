import { NextResponse } from 'next/server'
import { requireAdminRoute } from '@/lib/admin-route'
import { parseEmailContactsText } from '@/lib/email/contacts'

type CampaignPayload = {
  name?: unknown
  subject?: unknown
  body?: unknown
  contactsText?: unknown
}

function cleanString(value: unknown, maxLength = 200) {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text || text.length > maxLength) return null
  return text
}

export async function GET() {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const { data, error } = await admin.supabase
    .from('email_campaigns')
    .select('id,name,subject,status,total_contacts,total_sent,total_failed,created_at,started_at,finished_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ ok: false, error: 'Não consegui carregar as campanhas.' }, { status: 500 })
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
    return NextResponse.json({ ok: false, error: 'Dados inválidos.' }, { status: 400 })
  }

  const name = cleanString(payload.name)
  const subject = cleanString(payload.subject, 200)
  const body = typeof payload.body === 'string' ? payload.body.trim() : ''
  const contactsText = typeof payload.contactsText === 'string' ? payload.contactsText : ''

  if (!name || !subject || !body) {
    return NextResponse.json({ ok: false, error: 'Preencha nome, assunto e mensagem.' }, { status: 400 })
  }

  const parsedContacts = parseEmailContactsText(contactsText)
  const recipients = parsedContacts.flatMap(contact => {
    if (!contact.normalizedEmail || !contact.name) return []
    return [
      {
        name: contact.name,
        email: contact.normalizedEmail,
        status: contact.duplicate ? 'skipped' : 'pending',
        error_message: contact.duplicate ? 'Duplicado na lista' : null,
      },
    ]
  })

  const sendableCount = recipients.filter(recipient => recipient.status === 'pending').length
  if (sendableCount < 1) {
    return NextResponse.json({ ok: false, error: 'Nenhum contato apto para envio.' }, { status: 400 })
  }

  const invalidCount = parsedContacts.filter(contact => !contact.normalizedEmail || !contact.name).length
  const duplicateCount = parsedContacts.filter(contact => contact.duplicate).length

  const { data: campaign, error: campaignError } = await admin.supabase
    .from('email_campaigns')
    .insert({
      name,
      subject,
      body,
      status: 'ready',
      created_by: admin.user.id,
      total_contacts: recipients.length,
    })
    .select('id,name,subject,status,total_contacts,total_sent,total_failed,created_at')
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ ok: false, error: 'Não consegui criar a campanha.' }, { status: 500 })
  }

  const { data: insertedRecipients, error: recipientsError } = await admin.supabase
    .from('email_campaign_recipients')
    .insert(
      recipients.map(recipient => ({
        campaign_id: campaign.id,
        name: recipient.name,
        email: recipient.email,
        status: recipient.status,
        error_message: recipient.error_message,
      })),
    )
    .select('id,name,email,status,error_message,sent_at,failed_at,created_at')
    .order('created_at', { ascending: true })

  if (recipientsError) {
    return NextResponse.json({ ok: false, error: 'Campanha criada, mas não consegui salvar destinatários.' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    campaign,
    summary: {
      totalImported: parsedContacts.length,
      valid: parsedContacts.filter(contact => contact.valid).length,
      invalid: invalidCount,
      duplicates: duplicateCount,
      sendable: sendableCount,
    },
    recipients: insertedRecipients ?? [],
  })
}
