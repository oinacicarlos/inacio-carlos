import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const { to, subject, text } = await req.json()

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

    const result = await sendEmail({ to: to.trim(), subject: subject.trim(), text: text.trim() })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: result.id })
  } catch {
    return NextResponse.json({ error: 'Erro interno ao enviar e-mail.' }, { status: 500 })
  }
}
