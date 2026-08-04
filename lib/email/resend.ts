// Envio de e-mail via Resend — API REST direta (sem SDK), mesmo padrão já
// usado em app/api/contabilidade/enviar-rotinas/route.ts. Extraído pra cá
// porque agora existem dois pontos do código chamando isso (o próprio
// enviar-rotinas e o webhook do Stripe, pro e-mail de onboarding).

const RESEND_ENDPOINT = "https://api.resend.com/emails"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export type SendEmailInput = {
  to: string | string[]
  subject: string
  text: string
  html?: string
  attachments?: Array<{
    filename: string
    content?: string
    path?: string
  }>
}

export type SendEmailResult = { ok: true; id: string | null } | { ok: false; error: string }

export async function sendEmail({ to, subject, text, html, attachments }: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM

  if (!apiKey || !from) {
    return { ok: false, error: "Resend não está configurado neste ambiente." }
  }

  const cleanText = text.trim()
  const recipients = Array.isArray(to) ? to : [to]
  const htmlBody = html?.trim() || `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111827;white-space:pre-wrap">${escapeHtml(cleanText)}</div>`

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      text: cleanText,
      html: htmlBody,
      ...(attachments?.length ? { attachments } : {}),
    }),
  })

  const data = (await response.json().catch(() => null)) as { id?: string; message?: string; error?: string } | null

  if (!response.ok) {
    return { ok: false, error: data?.message || data?.error || "Não consegui enviar pelo Resend." }
  }

  return { ok: true, id: data?.id ?? null }
}
