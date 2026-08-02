export type PlanSlug = "free" | "bronze" | "prata" | "ouro" | "diamante"
export type CheckoutPlanSlug = "bronze" | "prata" | "ouro" | "diamante"

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
    priceLabel: "R$ 810,50",
    priceValue: "R$ 810,50",
    period: "por mês",
    benefits: [
      "ME no Simples Nacional",
      "Sem funcionário (só o pró-labore do sócio)",
      "Até 5 notas fiscais de serviço por mês",
      "Apuração mensal dos impostos",
      "Rotinas contábeis e fiscais",
      "Pró-labore de 1 sócio",
      "Ferramentas ilimitadas",
      "Pacote e-CAC completo",
      "Consulta ao Serasa",
      "Atendimento humanizado e prioritário",
    ],
    checkoutPlan: "ouro",
  },
  diamante: {
    slug: "diamante",
    label: "Diamante",
    priceLabel: "R$ 1.621,00",
    priceValue: "R$ 1.621,00",
    period: "por mês",
    benefits: [
      "ME no Simples Nacional",
      "Até 2 funcionários, além do pró-labore do sócio",
      "Até 5 notas fiscais de serviço por mês",
      "Apuração mensal dos impostos",
      "Rotinas contábeis e fiscais",
      "Folha de pagamento dos funcionários",
      "Ferramentas ilimitadas",
      "Pacote e-CAC completo",
      "Consulta ao Serasa",
      "Atendimento humanizado e prioritário",
    ],
    checkoutPlan: "diamante",
  },
}

export function isPlanSlug(value: string): value is PlanSlug {
  return value === "free" || value === "bronze" || value === "prata" || value === "ouro" || value === "diamante"
}
