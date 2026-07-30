import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route"

type ProfilePayload = {
  name?: unknown
  company_name?: unknown
  phone?: unknown
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function PATCH(request: Request) {
  const authClient = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Sua sessão expirou. Faça login novamente." }, { status: 401 })
  }

  const payload = (await request.json().catch(() => null)) as ProfilePayload | null

  if (!payload) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
  }

  const name = cleanString(payload.name)
  const companyName = cleanString(payload.company_name)
  const phone = cleanString(payload.phone)

  if (name.length < 2) {
    return NextResponse.json({ error: "Informe um nome válido." }, { status: 400 })
  }

  try {
    let { data, error } = await authClient
      .from("client_hub_profiles")
      .update({
        name,
        company_name: companyName,
        phone,
      })
      .eq("id", user.id)
      .select("name, company_name, phone")
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message || "Não foi possível atualizar seu perfil." }, { status: 500 })
    }

    if (!data) {
      const inserted = await authClient
        .from("client_hub_profiles")
        .insert({
          id: user.id,
          name,
          company_name: companyName,
          phone,
        })
        .select("name, company_name, phone")
        .single()

      data = inserted.data
      error = inserted.error
    }

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Não foi possível atualizar seu perfil." }, { status: 500 })
    }

    await authClient.auth.updateUser({ data: { name } }).catch(() => null)

    return NextResponse.json({
      name: data.name,
      company_name: data.company_name,
      phone: data.phone,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível atualizar seu perfil." },
      { status: 500 },
    )
  }
}
