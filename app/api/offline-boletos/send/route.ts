import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/resend"
import { buildOfflineBillingEmail } from "@/lib/offline-billing"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

const BUCKET = "offline-billing-slips"

type OfflineBillingSlipRow = {
  id: string
  client_name: string
  email: string
  due_date: string
  reference_month: string
  amount: number
  file_path: string | null
}

type SendType = "initial" | "reminder_5d" | "due_date" | "recovery"

const SENT_FIELD_BY_TYPE: Record<SendType, string> = {
  initial: "initial_sent_at",
  reminder_5d: "reminder_5d_sent_at",
  due_date: "due_date_sent_at",
  recovery: "recovery_sent_at",
}

function isSendType(value: unknown): value is SendType {
  return value === "initial" || value === "reminder_5d" || value === "due_date" || value === "recovery"
}

function formatAmount(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function parseEmailList(value: string) {
  return value
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { data: isAdmin } = await supabase.rpc("is_admin")
  if (isAdmin !== true) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const payload = (await request.json().catch(() => null)) as { id?: unknown; type?: unknown; testEmail?: unknown } | null
  const id = typeof payload?.id === "string" ? payload.id : ""
  const payloadType = payload?.type
  const type = isSendType(payloadType) ? payloadType : "initial"
  const testEmail = typeof payload?.testEmail === "string" ? payload.testEmail.trim() : ""
  const isTest = Boolean(testEmail)

  if (!id) {
    return NextResponse.json({ error: "Boleto inválido." }, { status: 400 })
  }

  if (isTest && !isValidEmail(testEmail)) {
    return NextResponse.json({ error: "Informe um e-mail de teste válido." }, { status: 400 })
  }

  const { data: slip, error: loadError } = await supabase
    .from("offline_billing_slips")
    .select("id, client_name, email, due_date, reference_month, amount, file_path")
    .eq("id", id)
    .maybeSingle()

  if (loadError || !slip) {
    return NextResponse.json({ error: "Boleto não encontrado." }, { status: 404 })
  }

  const row = slip as OfflineBillingSlipRow
  if (!row.file_path) {
    return NextResponse.json({ error: "Anexe o PDF do boleto antes de enviar." }, { status: 400 })
  }

  const recipients = isTest ? [testEmail] : parseEmailList(row.email)
  if (!recipients.length) {
    return NextResponse.json({ error: "O boleto não tem e-mail cadastrado." }, { status: 400 })
  }

  const { data: signed, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(row.file_path, 60 * 60 * 24 * 30)

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json({ error: "Não foi possível gerar o link do boleto." }, { status: 500 })
  }

  const email = buildOfflineBillingEmail({
    clientName: row.client_name,
    referenceMonth: row.reference_month,
    dueDate: row.due_date,
    amount: formatAmount(Number(row.amount) || 0),
    boletoUrl: signed.signedUrl,
  })

  const result = await sendEmail({
    to: recipients,
    subject: isTest ? `[TESTE] ${email.subject}` : email.subject,
    text: isTest
      ? `E-mail de teste para conferência interna.\n\nCliente real: ${row.client_name}\nDestinatário original: ${row.email}\n\n${email.text}`
      : email.text,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  if (!isTest) {
    await supabase
      .from("offline_billing_slips")
      .update({ [SENT_FIELD_BY_TYPE[type]]: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", row.id)
  }

  return NextResponse.json({ ok: true, id: result.id })
}
