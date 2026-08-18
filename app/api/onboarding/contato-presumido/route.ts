import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"
import { sendEmail } from "@/lib/email/resend"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type ContatoPayload = {
  name?: string
  whatsapp?: string
  email?: string
  company_description?: string
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

// Formulário público (sem login) do card "Lucro Presumido ou Real" em
// /abrir-empresa/comecar — esses regimes não têm processo automatizado, então essa
// rota só registra o lead pro time (via service_role, já que não há sessão
// de usuário) e dispara uma notificação por e-mail. O cliente não recebe
// e-mail nenhum aqui, só a equipe.
export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as ContatoPayload | null
  if (!payload) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }

  const name = cleanString(payload.name)
  const whatsapp = cleanString(payload.whatsapp)
  const email = cleanString(payload.email)
  const companyDescription = cleanString(payload.company_description)

  if (name.length < 2) {
    return NextResponse.json({ error: "Digite um nome válido." }, { status: 400 })
  }
  if (whatsapp.length < 8) {
    return NextResponse.json({ error: "Digite um WhatsApp válido." }, { status: 400 })
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Digite um e-mail válido." }, { status: 400 })
  }

  const serviceClient = createServiceRoleSupabaseClient()

  const { error } = await serviceClient.from("presumido_real_leads").insert({
    name,
    whatsapp,
    email,
    company_description: companyDescription,
  })

  if (error) {
    return NextResponse.json({ error: "Não foi possível enviar seu contato. Tente novamente." }, { status: 500 })
  }

  const teamEmail = process.env.TEAM_NOTIFICATION_EMAIL
  if (teamEmail) {
    await sendEmail({
      to: teamEmail,
      subject: "Novo contato: Lucro Presumido/Real",
      text: `Novo pedido de contato pelo site (regime Lucro Presumido ou Real):\n\nNome: ${name}\nWhatsApp: ${whatsapp}\nE-mail: ${email}\nSobre a empresa: ${companyDescription || "(não informado)"}`,
    }).catch(() => null)
  }

  return NextResponse.json({ ok: true })
}
