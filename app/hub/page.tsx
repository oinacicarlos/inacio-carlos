import HubContent from "@/components/hub/hub-content"
import { canCreateClientRequest } from "@/lib/client-requests/access"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getToolUsageStatus, type ToolUsageStatus } from "@/lib/tool-usage/status"
import { TOOL_SLUGS, type ToolSlug } from "@/lib/tool-usage/tools"
import { isPlanSlug, type PlanSlug } from "@/lib/plans"

type ClientHubProfile = {
  name: string
  phone: string
  current_plan: string
  subscription_status: string
  stripe_customer_id: string | null
  current_period_end: string | null
}

const PLAN_LABELS: Record<string, string> = {
  free: "Grátis",
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
  diamante: "Diamante",
}

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  free: "Sem assinatura ativa",
  active: "Ativa",
  trialing: "Em teste",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  inactive: "Inativa",
}

export const metadata = {
  title: "Hub do Cliente | Tropa",
  description: "Área visual inicial do cliente Tropa.",
}

async function loadProfile(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  fallbackName: string,
  fallbackPhone: string,
): Promise<ClientHubProfile | null> {
  // current_period_end só existe depois que supabase/create-stripe-webhook.sql
  // for executado — tenta com a coluna nova e cai pro select básico se ela
  // ainda não existir, pra não quebrar o resto do perfil nesse meio-tempo.
  const { data, error } = await supabase
    .from("client_hub_profiles")
    .select("name, phone, current_plan, subscription_status, stripe_customer_id, current_period_end")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    const fallback = await supabase
      .from("client_hub_profiles")
      .select("name, phone, current_plan, subscription_status, stripe_customer_id")
      .eq("id", userId)
      .maybeSingle()

    return fallback.data ? { ...fallback.data, current_period_end: null } : null
  }

  if (data) {
    return data
  }

  // Primeiro acesso ao hub depois do cadastro: ainda não existe uma linha
  // de perfil pra esse usuário (o cadastro só cria a conta no Supabase Auth,
  // não a linha em client_hub_profiles). Cria agora, com o nome informado no
  // cadastro quando disponível, pra deixar o restante do fluxo pra frente
  // (assinatura, dados da conta) funcionando com um perfil real.
  const { data: inserted } = await supabase
    .from("client_hub_profiles")
    .insert({ id: userId, name: fallbackName, phone: fallbackPhone })
    .select("name, phone, current_plan, subscription_status, stripe_customer_id, current_period_end")
    .maybeSingle()

  return inserted ?? null
}

export default async function ClientHubPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const fallbackName = (user?.user_metadata?.name as string | undefined)?.trim() || user?.email?.split("@")[0] || ""
  const fallbackPhone =
    (user?.user_metadata?.phone as string | undefined)?.trim() ||
    (user?.user_metadata?.whatsapp as string | undefined)?.trim() ||
    ""
  const profile = user ? await loadProfile(supabase, user.id, fallbackName, fallbackPhone) : null

  const toolUsage: Record<ToolSlug, ToolUsageStatus> | null = user
    ? Object.fromEntries(
        await Promise.all(
          TOOL_SLUGS.map(async (tool) => [tool, await getToolUsageStatus(supabase, user.id, tool)] as const),
        ),
      ) as Record<ToolSlug, ToolUsageStatus>
    : null

  let recentRequestsCount = 0

  if (user) {
    // Tolerante à tabela ainda não existir (SQL roda manualmente — ver
    // supabase/create-client-requests.sql). Enquanto isso, mostra 0.
    const { count } = await supabase
      .from("client_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)

    recentRequestsCount = count ?? 0
  }

  const clientName = profile?.name?.trim() || fallbackName || "Cliente"
  const userPhone = profile?.phone?.trim() || ""
  const currentPlan = profile?.current_plan ?? "free"
  const subscriptionStatus = profile?.subscription_status ?? "free"
  const planLabel = PLAN_LABELS[currentPlan] ?? currentPlan
  const subscriptionStatusLabel = SUBSCRIPTION_STATUS_LABELS[subscriptionStatus] ?? subscriptionStatus
  const toolsUsedThisMonth = toolUsage
    ? Object.values(toolUsage).reduce((sum, status) => sum + status.used, 0)
    : 0
  const isUsageLimited = toolUsage ? Object.values(toolUsage).some((status) => status.limited) : false
  const planSlug: PlanSlug = isPlanSlug(currentPlan) ? currentPlan : "free"
  const hasStripeCustomer = Boolean(profile?.stripe_customer_id)
  const canCreateRequests = canCreateClientRequest(profile)
  const nextBillingDateLabel = profile?.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <HubContent
      clientName={clientName}
      userEmail={user?.email ?? "—"}
      userPhone={userPhone}
      planLabel={planLabel}
      planSlug={planSlug}
      subscriptionStatusLabel={subscriptionStatusLabel}
      toolsUsedThisMonth={toolsUsedThisMonth}
      isUsageLimited={isUsageLimited}
      toolUsage={toolUsage}
      recentRequestsCount={recentRequestsCount}
      hasStripeCustomer={hasStripeCustomer}
      canCreateRequests={canCreateRequests}
      nextBillingDateLabel={nextBillingDateLabel}
    />
  )
}
