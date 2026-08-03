import { NextResponse } from "next/server"
import { ATTACHMENT_BUCKET } from "@/lib/client-requests/constants"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { data: isAdmin } = await supabase.rpc("is_admin")

  if (isAdmin !== true) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const serviceClient = createServiceRoleSupabaseClient()
  const { data: requestRow, error } = await serviceClient
    .from("client_requests")
    .select("attachment_path")
    .eq("id", id)
    .maybeSingle()

  if (error || !requestRow?.attachment_path) {
    return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 })
  }

  const { data: signedData, error: signedError } = await serviceClient.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(requestRow.attachment_path, 60)

  if (signedError || !signedData?.signedUrl) {
    return NextResponse.json({ error: "Não foi possível abrir o anexo." }, { status: 500 })
  }

  return NextResponse.redirect(signedData.signedUrl)
}
