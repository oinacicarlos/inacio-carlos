export type RequestAccessProfile = {
  current_plan?: string | null
  subscription_status?: string | null
}

export const REQUEST_ALLOWED_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const

export function canCreateClientRequest(profile: RequestAccessProfile | null | undefined) {
  const plan = profile?.current_plan ?? "free"
  const status = profile?.subscription_status ?? "free"

  return plan !== "free" && REQUEST_ALLOWED_SUBSCRIPTION_STATUSES.includes(status as (typeof REQUEST_ALLOWED_SUBSCRIPTION_STATUSES)[number])
}
