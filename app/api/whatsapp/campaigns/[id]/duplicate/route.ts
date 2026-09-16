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

  const { data: original, error: originalError } = await admin.supabase
    .from("whatsapp_campaigns")
    .select("id,name,template_name,template_language,template_category,test_group")
    .eq("id", id)
    .single()

  if (originalError || !original) {
    return NextResponse.json({ ok: false, error: "Campanha não encontrada." }, { status: 404 })
  }

  const { data: originalRecipients, error: recipientsError } = await admin.supabase
    .from("whatsapp_campaign_recipients")
    .select("name,phone,status,body_parameters")
    .eq("campaign_id", id)
    .neq("status", "optout")

  if (recipientsError) {
    return NextResponse.json({ ok: false, error: "Não consegui ler os destinatários originais." }, { status: 500 })
  }

  if (!originalRecipients?.length) {
    return NextResponse.json({ ok: false, error: "Essa campanha não tem destinatários pra duplicar (todos eram opt-out)." }, { status: 400 })
  }

  const { data: newCampaign, error: createError } = await admin.supabase
    .from("whatsapp_campaigns")
    .insert({
      name: `${original.name} (cópia)`,
      template_name: original.template_name,
      template_language: original.template_language,
      template_category: original.template_category,
      test_group: original.test_group,
      status: "ready",
      created_by: admin.user.id,
      total_contacts: originalRecipients.length,
    })
    .select("id,name,template_name,template_language,template_category,status,test_group,total_contacts,total_queued,total_sent,total_delivered,total_read,total_failed,total_optout,total_replied,total_interested,created_at")
    .single()

  if (createError || !newCampaign) {
    return NextResponse.json({ ok: false, error: "Não consegui criar a cópia da campanha." }, { status: 500 })
  }

  const { error: insertError } = await admin.supabase
    .from("whatsapp_campaign_recipients")
    .insert(originalRecipients.map((recipient) => ({
      campaign_id: newCampaign.id,
      name: recipient.name,
      phone: recipient.phone,
      status: "pending",
      body_parameters: recipient.body_parameters,
    })))

  if (insertError) {
    await admin.supabase.from("whatsapp_campaigns").delete().eq("id", newCampaign.id)
    return NextResponse.json({ ok: false, error: "Não consegui copiar os destinatários." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, campaign: newCampaign })
}
