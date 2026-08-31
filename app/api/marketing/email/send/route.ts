import { NextResponse } from 'next/server'
import { requireAdminRoute } from '@/lib/admin-route'
import { sendEmail } from '@/lib/email/resend'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SendPayload = {
  to?: unknown
  subject?: unknown
  text?: unknown
}

export async function POST(request: Request) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json().catch(() => null)) as SendPayload | null
  if (!payload) {
    return NextResponse.json({ ok: false, error: 'Dados inválidos.' }, { status: 400 })
  }

  const to = typeof payload.to === 'string' ? payload.to.trim() : ''
  const subject = typeof payload.subject === 'string' ? payload.subject.trim() : ''
  const text = typeof payload.text === 'string' ? payload.text.trim() : ''

  if (!EMAIL_PATTERN.test(to)) {
    return NextResponse.json({ ok: false, error: 'E-mail do destinatário inválido.' }, { status: 400 })
  }
  if (!subject) {
    return NextResponse.json({ ok: false, error: 'Informe o assunto do e-mail.' }, { status: 400 })
  }
  if (!text) {
    return NextResponse.json({ ok: false, error: 'Informe o conteúdo do e-mail.' }, { status: 400 })
  }

  const result = await sendEmail({ to, subject, text })
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: result.id })
}
