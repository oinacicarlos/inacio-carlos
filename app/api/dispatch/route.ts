import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const dynamic = 'force-dynamic'

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

// Lê env vars do contexto Cloudflare (bindings do Worker) com fallback para process.env
function getEnv(key: string): string {
  try {
    const { env } = getCloudflareContext()
    const val = (env as Record<string, string | undefined>)[key]
    if (val) return val
  } catch {
    // fora do contexto Cloudflare (ex: dev local)
  }
  return process.env[key] ?? ''
}

// Endpoint de diagnóstico — remover após confirmar funcionamento
export async function GET() {
  const key = getEnv('RESEND_API_KEY')
  const from = getEnv('RESEND_FROM')
  return NextResponse.json({
    RESEND_API_KEY: key ? `set (${key.slice(0, 6)}...)` : 'NOT SET',
    RESEND_FROM: from || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV ?? 'NOT SET',
  })
}

export async function POST(req: NextRequest) {
  const RESEND_API_KEY = getEnv('RESEND_API_KEY')
  const FROM = getEnv('RESEND_FROM') || 'contato@inaciocarlos.com'

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
      console.error('[dispatch] RESEND_API_KEY não encontrada em process.env')
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
    const message = err instanceof Error ? err.message : String(err)
    console.error('[dispatch] Erro interno:', message)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
