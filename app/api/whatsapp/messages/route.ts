import { NextResponse } from "next/server"
import { requireAdminRoute } from "@/lib/admin-route"
import { upsertWhatsAppInboxMessage } from "@/lib/whatsapp/inbox"
import { sendWhatsAppTextMessage } from "@/lib/whatsapp/send-text"
import { WhatsAppSendError } from "@/lib/whatsapp/send-template"

type SendInboxMessagePayload = {
  conversationId?: unknown
  text?: unknown
}

export async function POST(request: Request) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json().catch(() => null)) as SendInboxMessagePayload | null
  const conversationId = typeof payload?.conversationId === "string" ? payload.conversationId.trim() : ""
  const text = typeof payload?.text === "string" ? payload.text.trim() : ""

  if (!conversationId || !text || text.length > 4096) {
    return NextResponse.json({ ok: false, error: "Mensagem inválida." }, { status: 400 })
  }

  const { data: conversation, error: conversationError } = await admin.supabase
    .from("whatsapp_conversations")
    .select("id,phone,name,opted_out,customer_service_window_expires_at")
    .eq("id", conversationId)
    .single()

  if (conversationError || !conversation) {
    return NextResponse.json({ ok: false, error: "Conversa não encontrada." }, { status: 404 })
  }

  if (conversation.opted_out) {
    return NextResponse.json({ ok: false, error: "Este contato pediu opt-out. Não é possível responder por texto livre." }, { status: 403 })
  }

  const windowExpiresAt = conversation.customer_service_window_expires_at ? new Date(conversation.customer_service_window_expires_at).getTime() : 0
  if (!windowExpiresAt || windowExpiresAt <= Date.now()) {
    return NextResponse.json({
      ok: false,
      error: "A janela de atendimento de 24 horas terminou. Use um template aprovado para iniciar uma nova conversa.",
    }, { status: 403 })
  }

  try {
    const result = await sendWhatsAppTextMessage({ to: conversation.phone, text })

    await upsertWhatsAppInboxMessage(admin.supabase, {
      phone: result.to,
      name: conversation.name,
      wamid: result.wamid,
      direction: "outbound",
      type: "text",
      text,
      status: result.messageStatus,
      metaTimestamp: new Date().toISOString(),
      incrementUnread: false,
    })

    return NextResponse.json({
      ok: true,
      wamid: result.wamid,
      message_status: result.messageStatus,
    })
  } catch (error) {
    if (error instanceof WhatsAppSendError) {
      return NextResponse.json({ ok: false, error: error.safeError }, { status: error.status })
    }

    return NextResponse.json({ ok: false, error: "Não consegui enviar a mensagem." }, { status: 500 })
  }
}
