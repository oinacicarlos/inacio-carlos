import { NextResponse } from "next/server"
import { requireAdminRoute } from "@/lib/admin-route"
import { maskWhatsAppPhone } from "@/lib/whatsapp/contacts"

const FILTERS = new Set(["all", "unread", "interested", "optout"])

export async function GET(request: Request) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")?.trim()
  const filter = searchParams.get("filter") ?? "all"

  let query = admin.supabase
    .from("whatsapp_conversations")
    .select("id,phone,name,last_message_text,last_message_at,unread_count,status,interested,opted_out,customer_service_window_expires_at,created_at,updated_at")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(80)

  if (FILTERS.has(filter)) {
    if (filter === "unread") query = query.gt("unread_count", 0)
    if (filter === "interested") query = query.eq("interested", true)
    if (filter === "optout") query = query.eq("opted_out", true)
  }

  if (search) {
    const digits = search.replace(/\D/g, "")
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${digits || search}%`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ ok: false, error: "Não consegui carregar a caixa de entrada." }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    conversations: (data ?? []).map((conversation) => ({
      ...conversation,
      phone: maskWhatsAppPhone(conversation.phone),
    })),
  })
}
