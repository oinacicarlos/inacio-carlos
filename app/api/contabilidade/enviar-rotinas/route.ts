import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/route'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ATTACHMENTS_BUCKET = 'routine-client-attachments'

type RoutineItemAttachmentRow = {
  id: string
  file_name: string
  file_storage_path: string | null
}

export async function POST(req: NextRequest) {
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (isAdmin !== true) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    const { to, subject, text, itemIds } = await req.json()

    if (typeof to !== 'string' || !EMAIL_PATTERN.test(to.trim())) {
      return NextResponse.json(
        { error: 'E-mail do cliente inválido.' },
        { status: 400 }
      )
    }

    if (typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json(
        { error: 'Informe o assunto do e-mail.' },
        { status: 400 }
      )
    }

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Informe o conteúdo do e-mail.' },
        { status: 400 }
      )
    }

    const ids = Array.isArray(itemIds) ? itemIds.filter((id): id is string => typeof id === 'string') : []
    const attachments: Array<{ filename: string; content: string }> = []

    if (ids.length) {
      const { data: itemRows, error: itemsError } = await supabase
        .from('routine_items')
        .select('id, file_name, file_storage_path')
        .in('id', ids)

      if (itemsError) {
        return NextResponse.json({ error: 'Não consegui carregar os anexos das rotinas.' }, { status: 500 })
      }

      const rowsWithFile = ((itemRows ?? []) as RoutineItemAttachmentRow[]).filter(
        (row): row is RoutineItemAttachmentRow & { file_storage_path: string } => Boolean(row.file_storage_path)
      )
      const usedNames = new Set<string>()

      for (const row of rowsWithFile) {
        const { data: file, error: downloadError } = await supabase.storage
          .from(ATTACHMENTS_BUCKET)
          .download(row.file_storage_path)

        if (downloadError || !file) continue

        let filename = row.file_name.trim() || row.file_storage_path.split('/').pop() || 'documento'
        if (usedNames.has(filename)) {
          filename = `${row.id.slice(0, 6)}-${filename}`
        }
        usedNames.add(filename)

        const fileBuffer = Buffer.from(await file.arrayBuffer())
        attachments.push({ filename, content: fileBuffer.toString('base64') })
      }
    }

    const result = await sendEmail({
      to: to.trim(),
      subject: subject.trim(),
      text: text.trim(),
      ...(attachments.length ? { attachments } : {}),
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: result.id })
  } catch {
    return NextResponse.json({ error: 'Erro interno ao enviar e-mail.' }, { status: 500 })
  }
}
