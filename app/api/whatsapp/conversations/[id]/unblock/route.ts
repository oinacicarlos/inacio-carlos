import { NextResponse } from "next/server"
import { requireAdminRoute } from "@/lib/admin-route"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(_request: Request, context: RouteContext) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const { id } = await context.params
  const { error } = await admin.supabase.from("whatsapp_conversations").update({ status: "open" }).eq("id", id)

  if (error) {
    return NextResponse.json({ ok: false, error: "Não consegui desbloquear essa conversa." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
