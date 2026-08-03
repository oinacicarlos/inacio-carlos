import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "reforma-tributaria-prestador-servico-2026",
  title: "Reforma tributária 2026: o que prestadores devem acompanhar",
  metaTitle: "Reforma tributária 2026 para prestador de serviço",
  metaDescription:
    "Veja os principais pontos da reforma tributária que prestadores de serviço precisam acompanhar em 2026, especialmente notas e cadastros.",
  excerpt:
    "A rotina fiscal começa a mudar antes de o imposto pesar no caixa. Prestadores devem olhar nota fiscal, cadastro e organização de dados.",
  pillar: "mei",
  coverImage: "/blog/covers/mei-ou-me-quando-migrar.jpg",
  coverImageAlt: "Empreendedor analisando relatórios financeiros e fiscais",
  publishedAt: "2026-08-03",
  updatedAt: "2026-08-03",
  readingTimeMinutes: 7,
  sections: [
    {
      type: "paragraph",
      text: "A reforma tributária muda a forma como o Brasil organiza impostos sobre consumo. Para prestadores de serviço, a mudança não deve ser vista só como uma discussão distante. A preparação começa pela qualidade das notas fiscais, dos cadastros e da rotina contábil.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que muda no começo",
      id: "o-que-muda",
    },
    {
      type: "paragraph",
      text: "Em 2026, a transição passa a exigir mais atenção aos documentos fiscais eletrônicos e aos novos campos ligados aos tributos da reforma. Mesmo quando não houver impacto financeiro imediato para determinados regimes, a empresa precisa acompanhar o formato das notas e a orientação do seu sistema emissor.",
    },
    {
      type: "heading",
      level: 2,
      text: "Por que prestadores devem se preparar",
      id: "por-que-preparar",
    },
    {
      type: "list",
      items: [
        "Clientes empresas tendem a exigir notas mais corretas.",
        "Dados cadastrais inconsistentes podem travar emissão.",
        "Descrições genéricas de serviço podem gerar dúvidas fiscais.",
        "Mudanças de sistema exigem adaptação antes do vencimento das obrigações.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "O que revisar na empresa",
      id: "o-que-revisar",
    },
    {
      type: "table",
      headers: ["Área", "O que conferir"],
      rows: [
        ["CNAE", "Se a atividade cadastrada combina com o serviço prestado"],
        ["Município", "Se a inscrição municipal e o acesso ao emissor estão ativos"],
        ["Notas", "Se descrição, tomador, valor e serviço estão consistentes"],
        ["Contrato", "Se o escopo vendido combina com a nota emitida"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "MEI e Simples Nacional",
      id: "mei-simples",
    },
    {
      type: "paragraph",
      text: "MEIs e empresas do Simples precisam acompanhar as orientações oficiais porque a adaptação pode envolver emissão de nota, cadastro e sistemas. Mesmo quando o recolhimento continua simplificado, a obrigação acessória pode mudar a rotina.",
    },
    {
      type: "heading",
      level: 2,
      text: "Como se preparar sem complicar",
      id: "como-preparar",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Atualize dados cadastrais da empresa.",
        "Confira se a atividade econômica está correta.",
        "Padronize a descrição dos serviços mais vendidos.",
        "Guarde notas, contratos e comprovantes em uma rotina mensal.",
        "Peça orientação antes de mudar sistema ou atividade.",
      ],
    },
    {
      type: "callout",
      title: "Preparação evita urgência",
      text: "A pior hora para descobrir um erro fiscal é quando o cliente está esperando a nota. Revisar antes protege faturamento e reputação.",
    },
  ],
  faq: [
    {
      question: "A reforma tributária acaba com o Simples Nacional?",
      answer:
        "Não. O Simples Nacional continua existindo, mas empresas precisam acompanhar regras de transição, documentos fiscais e possíveis impactos futuros.",
    },
    {
      question: "Prestador de serviço precisa mudar nota fiscal em 2026?",
      answer:
        "Depende do município, do emissor usado e das regras aplicáveis à atividade. O ponto seguro é acompanhar orientações oficiais e manter o cadastro correto.",
    },
    {
      question: "O que fazer primeiro?",
      answer:
        "Comece revisando CNAE, inscrição municipal, acesso ao emissor de nota e padrão de descrição dos serviços vendidos.",
    },
  ],
  relatedTool: {
    title: "Gerador de Contrato",
    href: "/ferramentas/gerador-contrato",
    description: "Formalize escopo, valor e entrega para emitir notas com mais clareza.",
  },
  relatedSlugs: ["simples-nacional-prestador-servico", "inscricao-municipal-para-prestador-servico", "como-emitir-nota-fiscal-mei"],
}
