import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "rpa-ou-nota-fiscal-prestador-servico",
  title: "RPA ou nota fiscal: o que usar como prestador de serviço",
  metaTitle: "RPA ou nota fiscal para prestador de serviço",
  metaDescription:
    "Entenda quando usar RPA, quando abrir CNPJ e por que a nota fiscal costuma ser melhor para prestadores que atendem empresas.",
  excerpt:
    "RPA resolve alguns trabalhos pontuais, mas pode sair caro e limitar contratos com empresas. Veja quando a nota fiscal faz mais sentido.",
  pillar: "mei",
  coverImage: "/blog/covers/como-emitir-nota-fiscal-mei.jpg",
  coverImageAlt: "Pessoa organizando documentos fiscais em uma mesa de trabalho",
  publishedAt: "2026-08-03",
  updatedAt: "2026-08-03",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "Quem presta serviço sem CNPJ costuma ouvir duas opções do cliente: emitir um RPA ou mandar uma nota fiscal. As duas formas servem para formalizar o pagamento, mas elas têm impactos bem diferentes no bolso, na relação com o contratante e na imagem profissional.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que é RPA",
      id: "o-que-e-rpa",
    },
    {
      type: "paragraph",
      text: "RPA significa Recibo de Pagamento Autônomo. Ele é usado quando uma pessoa física presta serviço sem empresa aberta. Na prática, o contratante registra aquele pagamento e faz os descontos de impostos e contribuições quando aplicável.",
    },
    {
      type: "heading",
      level: 2,
      text: "Quando o RPA pode fazer sentido",
      id: "quando-rpa-faz-sentido",
    },
    {
      type: "list",
      items: [
        "Serviço pontual, sem recorrência mensal.",
        "Primeiro teste com um cliente antes de formalizar uma rotina.",
        "Atividade que ainda não virou uma fonte constante de renda.",
      ],
    },
    {
      type: "paragraph",
      text: "Mesmo nesses casos, é importante conferir os descontos. Dependendo do valor, o RPA pode ter retenção de INSS, imposto de renda e ISS, o que reduz bastante o líquido recebido.",
    },
    {
      type: "heading",
      level: 2,
      text: "Por que empresas preferem nota fiscal",
      id: "por-que-empresas-preferem-nota",
    },
    {
      type: "paragraph",
      text: "Empresas costumam preferir nota fiscal porque o lançamento contábil fica mais simples, a despesa fica melhor documentada e o risco trabalhista diminui. Para o prestador, a nota também melhora a percepção profissional e facilita contratos recorrentes.",
    },
    {
      type: "table",
      headers: ["Situação", "RPA", "Nota fiscal"],
      rows: [
        ["Trabalho eventual", "Pode resolver", "Também funciona"],
        ["Cliente empresa", "Pode gerar mais burocracia", "Costuma ser o caminho preferido"],
        ["Prestação recorrente", "Pode ficar caro e arriscado", "Mais profissional e organizado"],
        ["Controle de faturamento", "Fica espalhado", "Fica centralizado no CNPJ"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Quando vale abrir CNPJ",
      id: "quando-abrir-cnpj",
    },
    {
      type: "paragraph",
      text: "Se você presta serviço todo mês, atende empresas ou já perdeu cliente por não emitir nota, abrir CNPJ deixa de ser detalhe. O MEI pode ser suficiente para atividades permitidas e faturamento dentro do limite. Quando a atividade não cabe no MEI, a Microempresa no Simples Nacional costuma ser o próximo caminho.",
    },
    {
      type: "callout",
      title: "Pense no líquido, não só no valor combinado",
      text: "Um serviço de R$ 2.000 como pessoa física pode ter descontos relevantes. Antes de aceitar por RPA ou abrir CNPJ, compare quanto realmente sobra em cada cenário.",
    },
  ],
  faq: [
    {
      question: "RPA substitui nota fiscal?",
      answer:
        "Não exatamente. RPA formaliza pagamento para pessoa física autônoma. Nota fiscal documenta uma operação feita por empresa ou MEI.",
    },
    {
      question: "Prestador de serviço precisa abrir CNPJ?",
      answer:
        "Não em todo caso. Mas quando a prestação vira recorrente, quando o cliente exige nota ou quando o imposto como pessoa física pesa demais, o CNPJ costuma fazer sentido.",
    },
    {
      question: "MEI pode emitir nota fiscal de serviço?",
      answer:
        "Sim, desde que a atividade seja permitida no MEI. Para serviço prestado a empresa, a nota fiscal é obrigatória.",
    },
  ],
  relatedTool: {
    title: "Abrir CNPJ",
    href: "/abrir-cnpj",
    description: "Veja qual enquadramento combina com o seu momento e comece pelo caminho certo.",
  },
  relatedSlugs: ["como-emitir-nota-fiscal-mei", "como-abrir-mei-passo-a-passo", "mei-ou-me-quando-migrar"],
}
