import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "mei-pode-ter-funcionario",
  title: "MEI pode ter funcionário? Regras e limites",
  metaTitle: "MEI pode ter funcionário? Veja as regras",
  metaDescription:
    "Entenda se o MEI pode contratar funcionário CLT, quantos, quanto custa e o que muda nas obrigações mensais quando isso acontece.",
  excerpt:
    "O MEI pode ter um funcionário, mas só um, com regras específicas de salário e obrigações. Veja como funciona antes de contratar.",
  pillar: "contratacao",
  coverImage: "/blog/covers/mei-pode-ter-funcionario.jpg",
  coverImageAlt: "Três pessoas colaborando em um projeto com notebook",
  publishedAt: "2026-07-30",
  updatedAt: "2026-07-30",
  readingTimeMinutes: 5,
  sections: [
    {
      type: "paragraph",
      text: "Uma dúvida comum de quem está crescendo como MEI é se dá para contratar alguém para ajudar. A resposta é sim, mas com uma regra importante que muita gente não sabe: o MEI só pode ter um único funcionário registrado, não dois, não três. Entender essa e outras regras evita problema com a Receita e com o funcionário.",
    },
    {
      type: "heading",
      level: 2,
      text: "O limite de um funcionário",
      id: "limite-de-um-funcionario",
    },
    {
      type: "paragraph",
      text: "O MEI pode ter, no máximo, um funcionário contratado sob o regime CLT. Se o negócio crescer a ponto de precisar de mais de uma pessoa, é sinal de que está na hora de migrar para outro enquadramento, como Microempresa (ME) do Simples Nacional.",
    },
    {
      type: "heading",
      level: 2,
      text: "Quanto pode ser pago para esse funcionário",
      id: "quanto-pode-ser-pago",
    },
    {
      type: "paragraph",
      text: "O salário do funcionário do MEI deve respeitar o piso de um salário mínimo nacional, ou o piso da categoria profissional (definido por convenção coletiva), o que for maior. Não há um teto específico além disso, o MEI pode pagar mais do que o piso, se quiser e puder.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que muda nas obrigações do MEI ao contratar",
      id: "o-que-muda-nas-obrigacoes",
    },
    {
      type: "list",
      items: [
        "O DAS do MEI passa a incluir a contribuição previdenciária patronal de 3% sobre o salário do funcionário, somada ao valor fixo mensal já pago.",
        "Passa a ser obrigatório recolher o FGTS (8% sobre o salário) mensalmente.",
        "É preciso fazer o registro do funcionário na carteira de trabalho digital e cumprir as obrigações trabalhistas básicas (férias, 13º, rescisão quando aplicável).",
        "A folha de pagamento e os encargos passam a exigir mais atenção, muitos MEIs contam com um contador nesse momento, mesmo que não fosse necessário antes.",
      ],
    },
    {
      type: "callout",
      title: "Vale a pena calcular antes de contratar",
      text: "Mesmo com o limite de um funcionário e o piso do salário mínimo, os encargos (INSS patronal, FGTS, férias e 13º proporcionais) somam um valor considerável acima do salário combinado, vale estimar o custo total antes de decidir contratar.",
    },
    {
      type: "heading",
      level: 2,
      text: "MEI pode contratar como PJ em vez de CLT?",
      id: "mei-pode-contratar-pj",
    },
    {
      type: "paragraph",
      text: "Sim, o MEI pode contratar outros prestadores de serviço (PJ ou autônomos) para ajudar em demandas específicas, sem que isso conte como o 'funcionário CLT' permitido. A diferença é que, nesse caso, não existe vínculo empregatício, é uma relação de prestação de serviço entre duas empresas ou entre empresa e autônomo, sem os mesmos direitos trabalhistas.",
    },
    {
      type: "heading",
      level: 2,
      text: "Calcule o custo antes de contratar",
      id: "calcule-o-custo-antes",
    },
    {
      type: "paragraph",
      text: "O Simulador de Contratação da Tropa ajuda a estimar o custo real de contratar, salário, encargos e benefícios, antes de tomar a decisão, seja você MEI ou uma empresa maior.",
    },
  ],
  faq: [
    {
      question: "Se eu contratar um segundo funcionário, o que acontece?",
      answer:
        "O MEI que ultrapassa o limite de um funcionário precisa regularizar a situação migrando para outro enquadramento, como Microempresa do Simples Nacional. Manter mais de um funcionário registrado sob o MEI de forma irregular pode gerar problemas na fiscalização.",
    },
    {
      question: "O funcionário do MEI tem os mesmos direitos de um funcionário CLT comum?",
      answer:
        "Sim. O funcionário contratado por um MEI tem os mesmos direitos trabalhistas de qualquer funcionário CLT: férias, 13º salário, FGTS, aviso prévio e demais garantias previstas na legislação trabalhista.",
    },
  ],
  relatedTool: {
    title: "Simulador de Contratação",
    href: "/ferramentas/simulador-contratacao",
    description: "Veja o custo estimado de contratar antes de tomar a decisão.",
  },
  relatedSlugs: ["quanto-custa-funcionario-clt", "como-abrir-mei-passo-a-passo"],
}
