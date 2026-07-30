import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "cobrar-por-hora-ou-por-projeto",
  title: "Cobrar por hora ou por projeto fechado: como decidir",
  metaTitle: "Cobrar por hora ou projeto fechado? Como escolher",
  metaDescription:
    "Veja as vantagens e desvantagens de cobrar por hora versus por projeto fechado, e como escolher o melhor modelo para o seu tipo de serviço.",
  excerpt:
    "Não existe modelo certo ou errado — existe o modelo certo para cada tipo de serviço. Veja como decidir entre cobrar por hora ou por projeto fechado.",
  pillar: "precificacao",
  coverImage: "/blog/covers/cobrar-por-hora-ou-por-projeto.jpg",
  coverImageAlt: "Mesa de trabalho organizada com notebook e relógio analógico",
  publishedAt: "2026-01-30",
  updatedAt: "2026-01-30",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "Uma das primeiras decisões na hora de precificar um serviço é: cobro por hora trabalhada ou fecho um valor único pelo projeto inteiro? Os dois modelos são igualmente válidos, mas funcionam melhor em situações diferentes — e escolher o modelo errado para o tipo de trabalho é uma fonte comum de frustração, tanto para quem presta quanto para quem contrata.",
    },
    {
      type: "heading",
      level: 2,
      text: "Cobrar por hora: quando faz sentido",
      id: "cobrar-por-hora",
    },
    {
      type: "paragraph",
      text: "Cobrar por hora funciona bem quando o escopo do trabalho é difícil de prever com precisão — situações em que o tempo necessário pode variar bastante dependendo de imprevistos, complexidade descoberta ao longo do caminho, ou mudanças frequentes de direção pedidas pelo cliente.",
    },
    {
      type: "list",
      items: [
        "Consultoria contínua, sem um entregável fixo definido de antemão.",
        "Suporte técnico ou manutenção sob demanda.",
        "Projetos exploratórios, onde nem o cliente sabe exatamente o resultado final esperado.",
      ],
    },
    {
      type: "paragraph",
      text: "A vantagem: você é remunerado por todo o tempo dedicado, mesmo que o projeto tome mais tempo do que o esperado. A desvantagem: o cliente não sabe o valor final até o trabalho terminar, o que pode gerar desconforto ou desconfiança se não houver transparência sobre as horas.",
    },
    {
      type: "heading",
      level: 2,
      text: "Cobrar por projeto fechado: quando faz sentido",
      id: "cobrar-por-projeto-fechado",
    },
    {
      type: "paragraph",
      text: "O preço fechado funciona melhor quando o escopo é claro e bem definido — o cliente sabe exatamente o que vai receber, e você consegue estimar com razoável precisão quanto tempo e recurso o trabalho vai exigir.",
    },
    {
      type: "list",
      items: [
        "Serviços com entregável específico: uma identidade visual, um contrato, uma pintura de ambiente.",
        "Trabalhos que você já fez várias vezes e sabe estimar bem o tempo necessário.",
        "Situações em que o cliente valoriza previsibilidade de custo mais do que flexibilidade de escopo.",
      ],
    },
    {
      type: "paragraph",
      text: "A vantagem: o cliente sabe o valor total desde o início, o que facilita a decisão de compra. A desvantagem: se o trabalho tomar mais tempo do que o estimado (por imprevisto ou por escopo mal definido), esse tempo extra sai do seu bolso, não do cliente.",
    },
    {
      type: "callout",
      title: "Um risco do preço fechado: o 'escopo que cresce'",
      text: "É comum, num contrato de preço fechado, o cliente ir pedindo pequenos ajustes 'a mais' ao longo do caminho, achando que ainda está dentro do combinado. Por isso, contratos com preço fechado precisam descrever bem o que está incluído — e o que é considerado extra, cobrado à parte.",
    },
    {
      type: "heading",
      level: 2,
      text: "Um caminho do meio: preço fechado com limite de revisões",
      id: "caminho-do-meio",
    },
    {
      type: "paragraph",
      text: "Muitos prestadores de serviço combinam os dois modelos: cobram um valor fechado pelo escopo principal, mas definem um número de revisões ou ajustes incluídos — e cobram por hora (ou por pacote adicional) qualquer coisa além disso. Esse modelo dá previsibilidade ao cliente e proteção a você contra o 'escopo que cresce'.",
    },
    {
      type: "heading",
      level: 2,
      text: "Na dúvida, calcule os dois e compare",
      id: "calcule-os-dois-e-compare",
    },
    {
      type: "paragraph",
      text: "Se não tiver certeza de qual modelo escolher, vale estimar o tempo total do projeto, multiplicar pelo seu valor-hora, e comparar com o que cobraria fechado. Isso ajuda a verificar se o preço fechado realmente compensa — ou se está, sem perceber, cobrando abaixo do que o tempo investido vale.",
    },
    {
      type: "paragraph",
      text: "A Calculadora de Precificação da Tropa ajuda nessa conta: você informa seus custos, o valor do seu tempo e a margem que quer, e vê o preço sugerido — seja para um projeto fechado ou para calcular quanto vale a sua hora de trabalho.",
    },
  ],
  faq: [
    {
      question: "Posso cobrar por hora e ainda assim dar um valor estimado ao cliente?",
      answer:
        "Sim, e é recomendado. Mesmo cobrando por hora, é possível (e saudável) dar uma faixa estimada de horas e valor total ao cliente, com base em projetos parecidos anteriores — isso reduz a sensação de imprevisibilidade sem abrir mão da flexibilidade do modelo.",
    },
    {
      question: "Como sei quanto vale a minha hora de trabalho?",
      answer:
        "Uma forma prática: defina quanto quer ganhar por mês, divida pelos dias que trabalha e pelas horas úteis de cada dia. Isso dá um valor-hora de referência, que pode ser ajustado conforme a complexidade de cada tipo de serviço.",
    },
  ],
  relatedTool: {
    title: "Calculadora de Precificação",
    href: "/ferramentas/calculadora-precificacao",
    description: "Informe seus custos, seu tempo e a margem que você quer — o preço sugerido aparece na hora.",
  },
  relatedSlugs: ["como-calcular-preco-de-servico", "o-que-nao-pode-faltar-contrato-prestacao-servico"],
}
