import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

type PasswordResetPayload = {
  email?: unknown
  redirectTo?: unknown
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message && error.message !== "{}") return error.message
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string" && error.message !== "{}") {
    return error.message
  }
  return "Não foi possível enviar o link de alteração de senha. Verifique se o e-mail está correto e tente novamente."
}

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Sua sessão expirou. Faça login novamente." }, { status: 401 })
  }

  const payload = (await request.json().catch(() => null)) as PasswordResetPayload | null
  const email = cleanString(payload?.email) || user.email || ""
  const redirectTo = cleanString(payload?.redirectTo)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Informe um e-mail válido para receber o link." }, { status: 400 })
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || undefined,
  })

  if (error) {
    return NextResponse.json({ error: safeErrorMessage(error) }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
