// Cards de exibição da seção "Nossos Planos" — vitrine comercial usada na
// home e nas páginas de sitelink, independente dos planos/preços de
// app/api/stripe/checkout e lib/plans.ts (esses seguem sendo a fonte de
// verdade pro checkout e pro hub de clientes já assinantes). Por isso o CTA
// aqui leva pro WhatsApp em vez de Stripe, e não exibe valor em R$.
export const pricingPlans = [
  {
    tier: "bronze" as const,
    name: "Bronze",
    description: "Contabilidade essencial para quem está começando e precisa manter a empresa organizada.",
    featured: false,
    features: [
      "Contabilidade completa",
      "Apuração dos impostos",
      "Obrigações mensais e anuais",
      "Pró-labore de 1 sócio",
      "Folha de até 1 funcionário",
      "Acompanhamento para MEI",
      "Análise tributária inicial",
      "Suporte pelo WhatsApp",
      "Suporte pelo E-mail",
      "Assessor Exclusivo",
      "Migração do contador anterior sem burocracia",
      "Sem fidelidade",
    ],
  },
  {
    tier: "prata" as const,
    name: "Prata",
    description: "Assessoria completa para empresas que estão crescendo e precisam de mais acompanhamento.",
    featured: true,
    features: [
      "Contabilidade completa",
      "Apuração dos impostos",
      "Obrigações mensais e anuais",
      "Pró-labore de até 3 sócios",
      "Folha de até 5 funcionários",
      "Acompanhamento para Simples Nacional",
      "Análise tributária inicial",
      "Suporte pelo WhatsApp",
      "Suporte pelo E-mail",
      "Assessor Exclusivo",
      "Migração do contador anterior sem burocracia",
      "Sem fidelidade",
    ],
  },
  {
    tier: "ouro" as const,
    name: "Ouro",
    description: "Gestão contábil estratégica para empresas que precisam de acompanhamento próximo e decisões mais seguras.",
    featured: false,
    features: [
      "Contabilidade completa",
      "Apuração dos impostos",
      "Obrigações mensais e anuais",
      "Pró-labore de até 5 sócios",
      "Folha de até 10 funcionários",
      "Acompanhamento para Simples Nacional",
      "Análise tributária inicial",
      "Suporte pelo WhatsApp",
      "Suporte pelo E-mail",
      "Assessor Exclusivo",
      "Migração do contador anterior sem burocracia",
      "Sem fidelidade",
    ],
  },
]

export function buildPlanWhatsAppLink(whatsappLink: string, planName: string) {
  const message = `Olá, gostaria de saber mais sobre como funciona para virar cliente da Tropa. Tenho interesse no plano ${planName}.`
  return `${whatsappLink}?text=${encodeURIComponent(message)}`
}
