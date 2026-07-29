export type ProductSlug = "certificado_pj_a1" | "abertura_empresa"

export function isProductSlug(value: unknown): value is ProductSlug {
  return value === "certificado_pj_a1" || value === "abertura_empresa"
}

// Mesmo raciocínio de lib/stripe/plans.ts: fallback pra quando o metadata do
// evento não vier com o produto (ex.: sessão alterada manualmente), usando o
// Price ID de fato cobrado.
export function resolveProductFromPriceId(priceId: string | null | undefined): ProductSlug | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_CERTIFICADO_A1) return "certificado_pj_a1"
  if (priceId === process.env.STRIPE_PRICE_ABERTURA_EMPRESA) return "abertura_empresa"
  return null
}
