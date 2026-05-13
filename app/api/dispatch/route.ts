import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
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

    const emails = body.recipients.map((r) => ({
      from: FROM,
      to: [r.email],
      subject: interpolate(body.subject, r),
      text: interpolate(body.message, r),
    }))

    // Resend batch suporta até 100 e-mails por chamada
    const BATCH_SIZE = 100
    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)
      try {
        const { data, error } = await resend.batch.send(batch)
        if (error) {
          failed += batch.length
          errors.push(error.message)
        } else {
          sent += data?.data?.length ?? batch.length
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
