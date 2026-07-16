import { NextRequest, NextResponse } from 'next/server'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(req: NextRequest) {
  try {
    const { to, subject, text } = await req.json()
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM

    if (!apiKey || !from) {
      return NextResponse.json(
        { error: 'Resend não está configurado neste ambiente.' },
        { status: 500 }
      )
    }

    if (typeof to !== 'string' || !EMAIL_PATTERN.test(to.trim())) {
      return NextResponse.json(
        { error: 'E-mail do cliente inválido.' },
        { status: 400 }
      )
    }

    if (typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json(
        { error: 'Informe o assunto do e-mail.' },
        { status: 400 }
      )
    }

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Informe o conteúdo do e-mail.' },
        { status: 400 }
      )
    }

    const cleanText = text.trim()
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111827;white-space:pre-wrap">${escapeHtml(cleanText)}</div>`

    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to.trim()],
        subject: subject.trim(),
        text: cleanText,
        html,
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const message = data?.message || data?.error || 'Não consegui enviar pelo Resend.'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null })
  } catch {
    return NextResponse.json({ error: 'Erro interno ao enviar e-mail.' }, { status: 500 })
  }
}
