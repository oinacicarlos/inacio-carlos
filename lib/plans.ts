export type PlanSlug = "free" | "bronze" | "prata" | "ouro"
export type CheckoutPlanSlug = "bronze" | "prata"

export type PlanDetails = {
  slug: PlanSlug
  label: string
  priceLabel: string
  priceValue: string | null
  period: string | null
  benefits: string[]
  // Planos com checkout automático via Stripe. Ouro e Grátis não têm.
  checkoutPlan: CheckoutPlanSlug | null
}

// Mesmos preços e benefícios já usados na landing page (app/page.tsx),
// reaproveitados aqui pro hub sem duplicar a página pública em si.
export const PLAN_DETAILS: Record<PlanSlug, PlanDetails> = {
  free: {
    slug: "free",
    label: "Grátis",
    priceLabel: "R$ 0",
    priceValue: "R$ 0",
    period: null,
    benefits: ["Acesso a todas as ferramentas do hub", "3 utilizações gratuitas por mês em cada ferramenta"],
    checkoutPlan: null,
  },
  bronze: {
    slug: "bronze",
    label: "Bronze",
    priceLabel: "R$ 162,10",
    priceValue: "R$ 162,10",
    period: "por mês",
    benefits: [
      "MEI, sem funcionário",
      "Até 1 nota fiscal de serviço por mês",
      "Emissão de DAS",
      "Orientação contábil",
      "Ferramentas ilimitadas",
      "Atendimento humanizado por WhatsApp",
    ],
    checkoutPlan: "bronze",
  },
  prata: {
    slug: "prata",
    label: "Prata",
    priceLabel: "R$ 405,25",
    priceValue: "R$ 405,25",
    period: "por mês",
    benefits: [
      "MEI, com 1 funcionário",
      "Até 2 notas fiscais de serviço por mês",
      "Emissão de DAS",
      "Ferramentas ilimitadas",
      "Pacote e-CAC incluso",
      "Atendimento prioritário e humanizado",
      "Orientação especializada",
    ],
    checkoutPlan: "prata",
  },
  ouro: {
    slug: "ouro",
    label: "Ouro",
    priceLabel: "A partir de R$ 810,50",
    priceValue: null,
    period: "por mês",
    benefits: [
      "ME no Simples Nacional",
      "Até 5 notas fiscais de serviço por mês",
      "Apuração mensal dos impostos",
      "Rotinas contábeis e fiscais",
      "Pró-labore de 1 sócio",
      "Ferramentas ilimitadas",
      "Pacote e-CAC completo",
      "Consulta ao Serasa",
      "Atendimento humanizado e prioritário",
    ],
    checkoutPlan: null,
  },
}

export function isPlanSlug(value: string): value is PlanSlug {
  return value === "free" || value === "bronze" || value === "prata" || value === "ouro"
}
