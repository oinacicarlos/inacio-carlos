import { NextResponse } from "next/server"
import { requireAdminRoute } from "@/lib/admin-route"
import { fetchWhatsAppTemplates } from "@/lib/whatsapp/templates"

export async function GET() {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const result = await fetchWhatsAppTemplates()
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status })
  }

  return NextResponse.json({ ok: true, templates: result.templates })
}
