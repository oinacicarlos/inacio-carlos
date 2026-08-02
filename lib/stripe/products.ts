export type ProductSlug =
  | "certificado_pj_a1"
  | "certificado_pf_a1"
  | "abertura_empresa"
  | "alteracao_cnpj"
  | "serasa_pf"
  | "serasa_pj"
  | "nota_fiscal_servico"
  | "nota_fiscal_produto"

const PRODUCT_SLUGS: ProductSlug[] = [
  "certificado_pj_a1",
  "certificado_pf_a1",
  "abertura_empresa",
  "alteracao_cnpj",
  "serasa_pf",
  "serasa_pj",
  "nota_fiscal_servico",
  "nota_fiscal_produto",
]

export function isProductSlug(value: unknown): value is ProductSlug {
  return typeof value === "string" && (PRODUCT_SLUGS as string[]).includes(value)
}

// Mesmo raciocínio de lib/stripe/plans.ts: fallback pra quando o metadata do
// evento não vier com o produto (ex.: sessão alterada manualmente), usando o
// Price ID de fato cobrado.
export function resolveProductFromPriceId(priceId: string | null | undefined): ProductSlug | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_CERTIFICADO_A1) return "certificado_pj_a1"
  if (priceId === process.env.STRIPE_PRICE_CERTIFICADO_PF_A1) return "certificado_pf_a1"
  if (priceId === process.env.STRIPE_PRICE_ABERTURA_EMPRESA) return "abertura_empresa"
  if (priceId === process.env.STRIPE_PRICE_ALTERACAO_CNPJ) return "alteracao_cnpj"
  if (priceId === process.env.STRIPE_PRICE_SERASA_PF) return "serasa_pf"
  if (priceId === process.env.STRIPE_PRICE_SERASA_PJ) return "serasa_pj"
  if (priceId === process.env.STRIPE_PRICE_NOTA_FISCAL_SERVICO) return "nota_fiscal_servico"
  if (priceId === process.env.STRIPE_PRICE_NOTA_FISCAL_PRODUTO) return "nota_fiscal_produto"
  return null
}
