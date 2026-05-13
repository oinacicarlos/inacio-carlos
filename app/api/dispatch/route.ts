import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const FROM = process.env.RESEND_FROM ?? 'contato@inaciocarlos.com'

type Recipient = {
  email: string
  nome: string
  empresa: string
}

type DispatchPayload = {
  recipients: Recipient[]
  subject: string
  message: string
  channel: 'E-mail' | 'WhatsApp'
}

function interpolate(template: string, vars: { nome: string; empresa: string }) {
  return template
    .replace(/\{nome\}/g, vars.nome || '')
    .replace(/\{empresa\}/g, vars.empresa || '')
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DispatchPayload

    if (body.channel !== 'E-mail') {
      return NextResponse.json(
        { error: 'Canal WhatsApp ainda não suportado via API.' },
        { status: 400 }
      )
    }

    if (!body.recipients?.length) {
      return NextResponse.json({ error: 'Nenhum destinatário.' }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY não configurada.' }, { status: 500 })
    }

    const emails = body.recipients.map((r) => ({
      from: FROM,
      to: [r.email],
      subject: interpolate(body.subject, r),
      text: interpolate(body.message, r),
    }))

    // Resend batch API suporta até 100 e-mails por chamada
    const BATCH_SIZE = 100
    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)
      try {
        const res = await fetch('https://api.resend.com/emails/batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
          failed += batch.length
          errors.push(errData?.message ?? `HTTP ${res.status}`)
        } else {
          const data = await res.json()
          sent += Array.isArray(data?.data) ? data.data.length : batch.length
        }
      } catch (err) {
        failed += batch.length
        errors.push(err instanceof Error ? err.message : 'Erro desconhecido')
      }
    }

    return NextResponse.json({ sent, failed, errors })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno.' },
      { status: 500 }
    )
  }
}
