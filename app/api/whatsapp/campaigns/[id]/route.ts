import { NextResponse } from "next/server"
import { requireAdminRoute } from "@/lib/admin-route"
import { maskWhatsAppPhone } from "@/lib/whatsapp/contacts"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function cleanString(value: unknown, maxLength = 180) {
  if (typeof value !== "string") return null
  const text = value.trim()
  if (!text || text.length > maxLength) return null
  return text
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const { id } = await context.params

  const { data: campaign, error: campaignError } = await admin.supabase
    .from("whatsapp_campaigns")
    .select("id,name,template_name,template_language,template_category,status,test_group,total_contacts,total_queued,total_sent,total_delivered,total_read,total_failed,total_optout,total_replied,total_interested,created_at,started_at,finished_at")
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

type PatchPayload = {
  name?: unknown
  testGroup?: unknown
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const { id } = await context.params
  const payload = (await request.json().catch(() => null)) as PatchPayload | null
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 })
  }

  const update: Record<string, string | null> = {}
  if ("name" in payload) {
    const name = cleanString(payload.name, 180)
    if (!name) {
      return NextResponse.json({ ok: false, error: "Dê um nome para a campanha." }, { status: 400 })
    }
    update.name = name
  }
  if ("testGroup" in payload) {
    update.test_group = cleanString(payload.testGroup, 120)
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "Nada para atualizar." }, { status: 400 })
  }

  const { data: campaign, error } = await admin.supabase
    .from("whatsapp_campaigns")
    .update(update)
    .eq("id", id)
    .select("id,name,template_name,template_language,template_category,status,test_group,total_contacts,total_queued,total_sent,total_delivered,total_read,total_failed,total_optout,total_replied,total_interested,created_at,started_at,finished_at")
    .single()

  if (error || !campaign) {
    return NextResponse.json({ ok: false, error: "Não consegui salvar as alterações." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, campaign })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const { id } = await context.params

  const { data: campaign, error: campaignError } = await admin.supabase
    .from("whatsapp_campaigns")
    .select("id,status")
    .eq("id", id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ ok: false, error: "Campanha não encontrada." }, { status: 404 })
  }

  if (campaign.status === "processing") {
    return NextResponse.json({ ok: false, error: "Essa campanha está enviando agora, espere terminar pra apagar." }, { status: 409 })
  }

  const { error: deleteError } = await admin.supabase.from("whatsapp_campaigns").delete().eq("id", id)

  if (deleteError) {
    return NextResponse.json({ ok: false, error: "Não consegui apagar essa campanha." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
