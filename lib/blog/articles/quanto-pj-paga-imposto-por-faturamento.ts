import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "quanto-pj-paga-de-imposto-por-faturamento",
  title: "Quanto uma PJ paga de imposto? Veja por faixa de faturamento",
  metaTitle: "Quanto uma PJ paga de imposto por faixa de faturamento",
  metaDescription:
    "Compare quanto uma PJ prestadora pode pagar de imposto em faturamentos de R$ 5 mil a R$ 30 mil por mês, considerando Anexo III, Anexo V, fator R e pró-labore.",
  excerpt:
    "O imposto de uma PJ prestadora não depende só do faturamento. Veja a estimativa por faixa e o que muda o valor líquido.",
  pillar: "mei",
  coverImage: "/blog/covers/quanto-pj-paga-imposto-por-faturamento.jpg",
  coverImageAlt: "Profissional revisando documentos fiscais com calculadora e notebook",
  publishedAt: "2026-05-01",
  updatedAt: "2026-05-01",
  readingTimeMinutes: 8,
  sections: [
    {
      type: "paragraph",
      text: "Uma PJ prestadora pode pagar valores bem diferentes de imposto dependendo da atividade, do anexo do Simples Nacional, do fator R, do pró-labore e do honorário contábil — o faturamento mensal sozinho não conta a história toda. Esta página reúne, numa tabela só, a estimativa para as faixas mais comuns: de R$ 5 mil a R$ 30 mil por mês.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que entra na conta",
      id: "o-que-entra",
    },
    {
      type: "list",
      items: [
        "DAS do Simples Nacional.",
        "INSS sobre pró-labore.",
        "Honorário contábil.",
        "Custos bancários, sistemas e ferramentas.",
        "Reserva para impostos e caixa.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Estimativa por faixa de faturamento",
      id: "estimativa-por-faixa",
    },
    {
      type: "paragraph",
      text: "O Simples Nacional calcula a alíquota com base no faturamento acumulado nos últimos 12 meses (RBT12), não no faturamento de um mês isolado. Por isso a tabela abaixo projeta cada faturamento mensal para o equivalente anual, só para efeito de estimativa da faixa e da alíquota nominal inicial.",
    },
    {
      type: "table",
      headers: ["Faturamento mensal", "Equivalente anual (RBT12)", "Faixa do Simples", "Alíquota nominal inicial"],
      rows: [
        ["R$ 5 mil", "R$ 60 mil", "1ª faixa", "Anexo III: 6% · Anexo V: 15,5%"],
        ["R$ 10 mil", "R$ 120 mil", "1ª faixa", "Anexo III: 6% · Anexo V: 15,5%"],
        ["R$ 15 mil", "R$ 180 mil", "limite da 1ª faixa", "Anexo III: 6% · Anexo V: 15,5%"],
        ["R$ 20 mil", "R$ 240 mil", "2ª faixa", "Anexo III: 11,2% · Anexo V: 18%"],
        ["R$ 30 mil", "R$ 360 mil", "limite da 2ª faixa", "Anexo III: 11,2% · Anexo V: 18%"],
      ],
    },
    {
      type: "callout",
      title: "Alíquota nominal não é o valor final do DAS",
      text: "O Simples aplica uma fórmula de redução sobre a alíquota nominal, então o percentual efetivo pago costuma ficar um pouco abaixo do valor da tabela. O anexo (III ou V) também depende do fator R, não só do faturamento.",
    },
    {
      type: "heading",
      level: 2,
      text: "Anexo III ou Anexo V",
      id: "anexo",
    },
    {
      type: "paragraph",
      text: "Muitos serviços podem cair no Anexo III ou no Anexo V conforme atividade e fator R. O Anexo III tende a ser mais barato. O Anexo V costuma pesar mais quando a empresa não tem folha suficiente para atingir o fator R.",
    },
    {
      type: "heading",
      level: 2,
      text: "Pró-labore e INSS",
      id: "pro-labore",
    },
    {
      type: "paragraph",
      text: "Sócio que trabalha na empresa normalmente deve retirar pró-labore, com contribuição ao INSS. O restante, quando há lucro apurado corretamente, pode ser distribuído como lucro, respeitando a contabilidade.",
    },
    {
      type: "table",
      headers: ["Cenário", "O que observar"],
      rows: [
        ["Anexo III", "DAS tende a ser menor, mas ainda há INSS e contabilidade"],
        ["Anexo V", "Imposto pode subir bastante sem fator R"],
        ["Com fator R", "Folha e pró-labore podem reduzir a alíquota efetiva em alguns serviços"],
        ["Sem controle", "Misturar conta pessoal e empresarial prejudica a análise do lucro"],
      ],
    },
    {
      type: "callout",
      title: "Estimativa não substitui enquadramento",
      text: "Para saber o líquido real da sua faixa, é preciso conferir CNAE, anexo, município, pró-labore, despesas e tipo de cliente.",
    },
  ],
  faq: [
    {
      question: "Toda PJ na mesma faixa de faturamento paga o mesmo imposto?",
      answer:
        "Não. O imposto depende da atividade, anexo, fator R, município e organização da retirada dos sócios — duas empresas na mesma faixa podem pagar valores diferentes.",
    },
    {
      question: "Preciso pagar INSS como PJ?",
      answer:
        "Quando o sócio trabalha e retira pró-labore, há contribuição ao INSS sobre esse valor.",
    },
    {
      question: "Honorário contábil entra no cálculo?",
      answer:
        "Sim. Para estimar líquido de verdade, considere imposto, pró-labore, INSS, contabilidade e demais custos fixos.",
    },
  ],
  relatedTool: {
    title: "Calculadora de Precificação",
    href: "/ferramentas/calculadora-precificacao",
    description: "Simule preço, custos e margem para entender quanto precisa cobrar.",
  },
  relatedSlugs: ["simples-nacional-prestador-servico", "cnae-errado-aumenta-imposto-exclui-simples", "ibs-cbs-dentro-ou-fora-do-simples-nacional"],
}
