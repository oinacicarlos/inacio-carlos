import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"
import { sendWhatsAppTemplate, WhatsAppSendError, type WhatsAppTemplateSendInput } from "@/lib/whatsapp/send-template"

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const { data: isAdmin } = await supabase.rpc("is_admin")
  if (isAdmin !== true) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  const payload = (await request.json().catch(() => null)) as WhatsAppTemplateSendInput | null
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 })
  }

  try {
    const result = await sendWhatsAppTemplate(payload)

    return NextResponse.json({
      ok: true,
      wamid: result.wamid,
      message_status: result.messageStatus,
    })
  } catch (error) {
    if (error instanceof WhatsAppSendError) {
      return NextResponse.json({ ok: false, error: error.safeError }, { status: error.status })
    }

    console.error("[whatsapp:send] unexpected", {
      message: error instanceof Error ? error.message : "unknown",
    })

    return NextResponse.json({ ok: false, error: "Não consegui enviar a mensagem." }, { status: 500 })
  }
}
