import { NextResponse } from "next/server"
import { requireAdminRoute } from "@/lib/admin-route"
import { maskWhatsAppPhone, normalizeBrazilianWhatsAppPhone, parseWhatsAppContactsText } from "@/lib/whatsapp/contacts"

type ValidateContactsPayload = {
  contactsText?: unknown
}

export async function POST(request: Request) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json().catch(() => null)) as ValidateContactsPayload | null
  const contactsText = typeof payload?.contactsText === "string" ? payload.contactsText : ""

  if (!contactsText.trim()) {
    return NextResponse.json({ ok: false, error: "Arquivo vazio. Importe uma planilha com Nome e Telefone." }, { status: 400 })
  }

  const contacts = parseWhatsAppContactsText(contactsText)
  if (!contacts.length) {
    return NextResponse.json({ ok: false, error: "Nenhuma linha encontrada na planilha." }, { status: 400 })
  }

  const normalizedPhones = Array.from(new Set(contacts.flatMap((contact) => contact.normalizedPhone ? [contact.normalizedPhone] : [])))
  const { data: optouts, error: optoutError } = await admin.supabase
    .from("whatsapp_optouts")
    .select("phone")
    .in("phone", normalizedPhones.length ? normalizedPhones : ["__empty__"])

  if (optoutError) {
    return NextResponse.json({ ok: false, error: "Não consegui consultar a lista de opt-out." }, { status: 500 })
  }

  const optoutPhones = new Set((optouts ?? []).flatMap((row) => {
    const phone = normalizeBrazilianWhatsAppPhone(row.phone)
    return phone ? [phone] : []
  }))

  const rows = contacts.map((contact) => {
    const isOptout = Boolean(contact.normalizedPhone && optoutPhones.has(contact.normalizedPhone))
    const situation =
      !contact.name || !contact.normalizedPhone ? "invalid" :
      contact.duplicate ? "duplicate" :
      isOptout ? "optout" :
      "ready"

    return {
      name: contact.name || "Sem nome",
      phone: maskWhatsAppPhone(contact.normalizedPhone || contact.phone),
      situation,
      error: situation === "invalid" ? contact.error ?? "Linha inválida" : situation === "duplicate" ? "Duplicado" : situation === "optout" ? "Opt-out" : null,
    }
  })

  return NextResponse.json({
    ok: true,
    summary: {
      totalImported: rows.length,
      ready: rows.filter((row) => row.situation === "ready").length,
      invalid: rows.filter((row) => row.situation === "invalid").length,
      duplicates: rows.filter((row) => row.situation === "duplicate").length,
      optouts: rows.filter((row) => row.situation === "optout").length,
    },
    rows,
  })
}
