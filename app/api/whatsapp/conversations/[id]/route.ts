import { NextResponse } from "next/server"
import { requireAdminRoute } from "@/lib/admin-route"
import { maskWhatsAppPhone } from "@/lib/whatsapp/contacts"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const { id } = await context.params

  const { data: conversation, error: conversationError } = await admin.supabase
    .from("whatsapp_conversations")
    .select("id,phone,name,last_message_text,last_message_at,unread_count,status,interested,opted_out,customer_service_window_expires_at,created_at,updated_at")
    .eq("id", id)
    .single()

  if (conversationError || !conversation) {
    return NextResponse.json({ ok: false, error: "Conversa não encontrada." }, { status: 404 })
  }

  const { data: messages, error: messagesError } = await admin.supabase
    .from("whatsapp_messages")
    .select("id,wamid,direction,type,text,button_text,template_name,status,error_code,error_message,meta_timestamp,created_at,updated_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(200)

  if (messagesError) {
    return NextResponse.json({ ok: false, error: "Não consegui carregar as mensagens." }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    conversation: {
      ...conversation,
      phone: maskWhatsAppPhone(conversation.phone),
    },
    messages: messages ?? [],
  })
}
