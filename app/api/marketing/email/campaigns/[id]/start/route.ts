import { NextResponse } from 'next/server'
import { requireAdminRoute } from '@/lib/admin-route'
import { sendEmail } from '@/lib/email/resend'

const EMAIL_CAMPAIGN_BATCH_SIZE = 25

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, context: RouteContext) {
  const admin = await requireAdminRoute()
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status })
  }

  const { id } = await context.params

  const { data: campaign, error: campaignError } = await admin.supabase
    .from('email_campaigns')
    .select('id,status,subject,body')
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ ok: false, error: 'Campanha não encontrada.' }, { status: 404 })
  }

  if (campaign.status !== 'ready' && campaign.status !== 'processing') {
    return NextResponse.json({ ok: false, error: 'Esta campanha já foi concluída ou não está pronta.' }, { status: 409 })
  }

  const { data: pendingRecipients, error: recipientsError } = await admin.supabase
    .from('email_campaign_recipients')
    .select('id,email')
    .eq('campaign_id', id)
    .eq('status', 'pending')
    .limit(EMAIL_CAMPAIGN_BATCH_SIZE)

  if (recipientsError) {
    return NextResponse.json({ ok: false, error: 'Não consegui carregar os destinatários.' }, { status: 500 })
  }

  if (campaign.status === 'ready') {
    await admin.supabase.from('email_campaigns').update({ status: 'processing', started_at: new Date().toISOString() }).eq('id', id)
  }

  let sent = 0
  let failed = 0

  for (const recipient of pendingRecipients ?? []) {
    const result = await sendEmail({ to: recipient.email, subject: campaign.subject, text: campaign.body })
    const now = new Date().toISOString()

    if (result.ok) {
      sent += 1
      await admin.supabase
        .from('email_campaign_recipients')
        .update({ status: 'sent', sent_at: now, resend_id: result.id })
        .eq('id', recipient.id)
    } else {
      failed += 1
      await admin.supabase
        .from('email_campaign_recipients')
        .update({ status: 'failed', failed_at: now, error_message: result.error })
        .eq('id', recipient.id)
    }
  }

  const { count: remainingPending } = await admin.supabase
    .from('email_campaign_recipients')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', id)
    .eq('status', 'pending')

  const finished = (remainingPending ?? 0) === 0
  if (finished) {
    await admin.supabase.from('email_campaigns').update({ status: 'completed', finished_at: new Date().toISOString() }).eq('id', id)
  }

  return NextResponse.json({ ok: true, processed: { sent, failed }, finished, remaining: remainingPending ?? 0 })
}
