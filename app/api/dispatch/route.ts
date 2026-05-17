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

    // Resend batch API suporta até 100 e-mails por chamada
    const BATCH_SIZE = 100
    type RecipientResult = {
      email: string
      nome: string
      empresa: string
      status: 'sent' | 'failed'
      error?: string
      sentAt?: string
    }
    const results: RecipientResult[] = []

    for (let i = 0; i < body.recipients.length; i += BATCH_SIZE) {
      const slice = body.recipients.slice(i, i + BATCH_SIZE)
      const batch = slice.map((r) => ({
        from: FROM,
        to: [r.email],
        subject: interpolate(body.subject, r),
        text: interpolate(body.message, r),
      }))

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
          const errorMsg = errData?.message ?? `HTTP ${res.status}`
          slice.forEach((r) => results.push({
            email: r.email,
            nome: r.nome,
            empresa: r.empresa,
            status: 'failed',
            error: errorMsg,
          }))
        } else {
          const now = new Date().toISOString()
          slice.forEach((r) => results.push({
            email: r.email,
            nome: r.nome,
            empresa: r.empresa,
            status: 'sent',
            sentAt: now,
          }))
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
        slice.forEach((r) => results.push({
          email: r.email,
          nome: r.nome,
          empresa: r.empresa,
          status: 'failed',
          error: errorMsg,
        }))
      }
    }

    const sent = results.filter((r) => r.status === 'sent').length
    const failed = results.filter((r) => r.status === 'failed').length

    return NextResponse.json({ sent, failed, results })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[dispatch] Erro interno:', message)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
