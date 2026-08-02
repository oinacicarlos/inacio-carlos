import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

type EmailChangePayload = {
  email?: unknown
  redirectTo?: unknown
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message && error.message !== "{}") {
    const details = []
    if ("status" in error && error.status) details.push(`status ${String(error.status)}`)
    if ("code" in error && error.code) details.push(`code ${String(error.code)}`)
    return details.length > 0 ? `${error.message} (${details.join(", ")})` : error.message
  }
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string" && error.message !== "{}") {
    const details = []
    if ("status" in error && error.status) details.push(`status ${String(error.status)}`)
    if ("code" in error && error.code) details.push(`code ${String(error.code)}`)
    return details.length > 0 ? `${error.message} (${details.join(", ")})` : error.message
  }
  return "Não foi possível solicitar a troca de e-mail agora. Verifique o endereço e tente novamente."
}

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()
  const { data, error: sessionError } = await supabase.auth.getUser().catch(() => ({
    data: { user: null },
    error: new Error("Sessão indisponível."),
  }))
  const user = data.user

  if (!user || sessionError) {
    return NextResponse.json({ ok: false, error: "Sua sessão expirou. Faça login novamente." })
  }

  const payload = (await request.json().catch(() => null)) as EmailChangePayload | null
  const email = cleanString(payload?.email)
  const redirectTo = cleanString(payload?.redirectTo)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Informe um e-mail válido." })
  }

  try {
    const { error } = await supabase.auth.updateUser(
      { email },
      redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    )

    if (error) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(error) })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false, error: safeErrorMessage(error) })
  }
}
