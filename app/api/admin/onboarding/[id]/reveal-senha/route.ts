import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"
import { decryptSecret } from "@/lib/onboarding/crypto"

// Só decifra sob demanda, uma vez por chamada — a rota nunca guarda a senha
// em texto puro em nenhum lugar além da resposta desta requisição. A
// autorização em si é checada duas vezes: aqui (usuário autenticado) e de
// novo dentro de admin_reveal_senha_gov (security definer, is_admin()).
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase.rpc("admin_reveal_senha_gov", { p_id: id })

  if (error) {
    return NextResponse.json({ error: "not_authorized" }, { status: 403 })
  }

  const row = (Array.isArray(data) ? data[0] : data) as { senha_gov_encrypted?: string | null; senha_gov_iv?: string | null } | null
  const ciphertext = row?.senha_gov_encrypted
  const iv = row?.senha_gov_iv

  if (!ciphertext || !iv) {
    return NextResponse.json({ error: "Nenhuma senha cadastrada para este cliente." }, { status: 404 })
  }

  try {
    const senha = await decryptSecret(ciphertext, iv)
    return NextResponse.json({ senha })
  } catch {
    return NextResponse.json({ error: "Não foi possível decifrar a senha." }, { status: 500 })
  }
}
