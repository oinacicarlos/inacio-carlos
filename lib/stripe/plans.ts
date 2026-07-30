export type PlanSlug = "bronze" | "prata" | "ouro" | "diamante"

export function isPlanSlug(value: unknown): value is PlanSlug {
  return value === "bronze" || value === "prata" || value === "ouro" || value === "diamante"
}

// Fallback para quando o metadata.plan não vier no evento (ex.: assinatura
// alterada manualmente no Dashboard do Stripe) — identifica o plano pelo
// Price ID de fato cobrado, usando os mesmos IDs já configurados no checkout.
export function resolvePlanFromPriceId(priceId: string | null | undefined): PlanSlug | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_BRONZE) return "bronze"
  if (priceId === process.env.STRIPE_PRICE_PRATA) return "prata"
  if (priceId === process.env.STRIPE_PRICE_OURO) return "ouro"
  if (priceId === process.env.STRIPE_PRICE_DIAMANTE) return "diamante"
  return null
}
