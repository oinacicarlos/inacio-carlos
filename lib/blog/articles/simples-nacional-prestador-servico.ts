import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "simples-nacional-prestador-servico",
  title: "Simples Nacional para prestador de serviço: como funciona",
  metaTitle: "Simples Nacional para prestador de serviço",
  metaDescription:
    "Veja como funciona o Simples Nacional para prestadores de serviço, por que o anexo importa e o que muda no imposto mensal.",
  excerpt:
    "Nem todo prestador paga o mesmo imposto no Simples. A atividade, o anexo e a folha de pagamento mudam bastante a conta.",
  pillar: "mei",
  coverImage: "/blog/covers/quanto-custa-um-contador-para-mei.jpg",
  coverImageAlt: "Empreendedor analisando documentos contábeis no computador",
  publishedAt: "2026-08-03",
  updatedAt: "2026-08-03",
  readingTimeMinutes: 7,
  sections: [
    {
      type: "paragraph",
      text: "O Simples Nacional é um regime tributário criado para pequenas empresas. Para quem presta serviço, ele pode simplificar bastante a rotina, mas não significa que todo mundo paga o mesmo percentual. A atividade da empresa e o anexo correto fazem muita diferença.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que o Simples Nacional reúne",
      id: "o-que-reune",
    },
    {
      type: "paragraph",
      text: "Em vez de pagar vários tributos em guias separadas, a empresa paga uma guia mensal chamada DAS. Essa guia pode reunir impostos federais, estaduais e municipais, dependendo da atividade. Para prestadores de serviço, o ISS costuma ser um dos pontos centrais.",
    },
    {
      type: "heading",
      level: 2,
      text: "Por que o anexo importa",
      id: "por-que-anexo-importa",
    },
    {
      type: "paragraph",
      text: "As atividades do Simples são organizadas por anexos. Cada anexo tem faixas e alíquotas próprias. Serviços de tecnologia, consultoria, saúde, engenharia, marketing, design e manutenção podem cair em regras diferentes. Por isso, escolher o CNAE certo na abertura do CNPJ não é só burocracia, é imposto.",
    },
    {
      type: "table",
      headers: ["Ponto analisado", "Por que importa"],
      rows: [
        ["CNAE", "Define se a atividade pode entrar no Simples e em qual anexo"],
        ["Faturamento", "Define a faixa de imposto aplicada no mês"],
        ["Folha de pagamento", "Pode influenciar o fator R em alguns serviços"],
        ["Município", "Impacta inscrição municipal e emissão de nota de serviço"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "O que é fator R",
      id: "fator-r",
    },
    {
      type: "paragraph",
      text: "Algumas atividades podem pagar menos imposto quando a folha de pagamento representa uma parte relevante do faturamento. Essa relação é conhecida como fator R. Quando a folha é baixa, a empresa pode cair em um anexo mais caro. Quando a folha passa do percentual exigido, pode migrar para um anexo mais favorável.",
    },
    {
      type: "heading",
      level: 2,
      text: "Erros comuns de quem abre sozinho",
      id: "erros-comuns",
    },
    {
      type: "list",
      items: [
        "Escolher CNAE genérico sem entender a tributação.",
        "Achar que todo prestador paga a mesma alíquota.",
        "Emitir nota com descrição diferente da atividade cadastrada.",
        "Não acompanhar o faturamento acumulado dos últimos 12 meses.",
      ],
    },
    {
      type: "callout",
      title: "O barato pode virar caro",
      text: "Abrir a empresa rápido é bom, mas abrir com atividade errada pode gerar imposto maior, nota travada e retrabalho na prefeitura ou na Receita.",
    },
  ],
  faq: [
    {
      question: "Todo prestador de serviço pode ser Simples Nacional?",
      answer:
        "Não. A maioria das pequenas empresas de serviço consegue optar pelo Simples, mas existem exceções por atividade, composição societária e outras regras.",
    },
    {
      question: "O imposto do Simples é sempre sobre o faturamento?",
      answer:
        "Sim, a base principal é o faturamento. Mas a alíquota efetiva depende do faturamento acumulado, da atividade, do anexo e, em alguns casos, do fator R.",
    },
    {
      question: "MEI também é Simples Nacional?",
      answer:
        "Sim. O MEI é uma forma simplificada dentro do Simples Nacional, com regras próprias, limite menor e DAS fixo.",
    },
  ],
  relatedTool: {
    title: "Calculadora de Precificação",
    href: "/ferramentas/calculadora-precificacao",
    description: "Inclua custos, margem e impostos para chegar a um preço mais seguro.",
  },
  relatedSlugs: ["mei-ou-me-quando-migrar", "como-abrir-mei-passo-a-passo", "quanto-custa-um-contador-para-mei"],
}
