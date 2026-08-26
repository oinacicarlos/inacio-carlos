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

  const { data: campaign, error: campaignError } = await admin.supabase
    .from("whatsapp_campaigns")
    .select("id,name,template_name,template_language,template_category,status,total_contacts,total_queued,total_sent,total_delivered,total_read,total_failed,total_optout,created_at,started_at,finished_at")
    .eq("id", id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ ok: false, error: "Campanha não encontrada." }, { status: 404 })
  }

  const { data: recipients, error: recipientsError } = await admin.supabase
    .from("whatsapp_campaign_recipients")
    .select("id,name,phone,status,error_code,error_message,wamid,attempts,queued_at,sent_at,delivered_at,read_at,failed_at,created_at")
    .eq("campaign_id", id)
    .order("created_at", { ascending: true })

  if (recipientsError) {
    return NextResponse.json({ ok: false, error: "Não consegui carregar destinatários." }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    campaign,
    recipients: (recipients ?? []).map((recipient) => ({
      ...recipient,
      phone: maskWhatsAppPhone(recipient.phone),
    })),
  })
}
