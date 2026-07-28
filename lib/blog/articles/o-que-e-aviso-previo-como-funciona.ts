import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "o-que-e-aviso-previo-como-funciona",
  title: "O que é aviso prévio e como ele funciona na prática",
  metaTitle: "Aviso prévio: o que é, tipos e como calcular",
  metaDescription:
    "Entenda o que é aviso prévio, a diferença entre trabalhado e indenizado, e como ele varia conforme o tempo de casa do funcionário.",
  excerpt:
    "O aviso prévio é uma das partes mais confusas da rescisão — porque muda de acordo com quem pede o desligamento e quanto tempo de casa a pessoa tem. Veja como funciona.",
  pillar: "rescisao",
  coverImage: "/blog/covers/o-que-e-aviso-previo-como-funciona.jpg",
  coverImageAlt: "Mulher planejando a agenda em um calendário de mesa",
  publishedAt: "2026-02-02",
  updatedAt: "2026-02-02",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "O aviso prévio existe para dar tempo de ajuste para as duas partes de um contrato de trabalho: a empresa se organizar para substituir a pessoa, ou o funcionário se organizar para buscar uma nova oportunidade. Na prática, porém, é uma das partes da rescisão que mais gera dúvida — porque muda de formato dependendo de quem tomou a iniciativa de encerrar o contrato.",
    },
    {
      type: "heading",
      level: 2,
      text: "Aviso prévio trabalhado x indenizado",
      id: "trabalhado-x-indenizado",
    },
    {
      type: "paragraph",
      text: "Existem duas formas do aviso prévio acontecer:",
    },
    {
      type: "list",
      items: [
        "Trabalhado — o funcionário continua trabalhando normalmente durante o período do aviso (geralmente 30 dias), recebendo o salário normal desse período.",
        "Indenizado — a empresa dispensa o funcionário de cumprir o período, mas paga o valor correspondente como se ele tivesse trabalhado. O funcionário já sai da empresa, mas recebe o valor equivalente.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Quem decide se o aviso é trabalhado ou indenizado",
      id: "quem-decide",
    },
    {
      type: "paragraph",
      text: "Na demissão sem justa causa, a decisão é da empresa: ela pode optar por manter o funcionário trabalhando durante o aviso ou dispensá-lo do cumprimento, pagando o valor de forma indenizada. Já no pedido de demissão, a regra é diferente: o funcionário deve cumprir os 30 dias trabalhados, a não ser que a empresa o dispense dessa exigência.",
    },
    {
      type: "heading",
      level: 2,
      text: "O aviso prévio cresce com o tempo de casa",
      id: "aviso-previo-cresce-com-tempo-de-casa",
    },
    {
      type: "paragraph",
      text: "O período padrão de aviso prévio é de 30 dias, mas ele aumenta 3 dias para cada ano completo de trabalho na mesma empresa, até o limite de 90 dias. Ou seja, quanto mais tempo de casa, maior o aviso prévio a que o funcionário tem direito.",
    },
    {
      type: "table",
      headers: ["Tempo de casa", "Dias de aviso prévio"],
      rows: [
        ["Até 1 ano", "30 dias"],
        ["2 anos completos", "33 dias"],
        ["5 anos completos", "45 dias"],
        ["10 anos completos ou mais", "60 dias"],
        ["20 anos completos", "90 dias (limite máximo)"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Aviso prévio no aviso trabalhado: redução da jornada",
      id: "reducao-da-jornada",
    },
    {
      type: "paragraph",
      text: "Quando o aviso é trabalhado, o funcionário tem direito a uma redução na jornada durante esse período — 2 horas por dia a menos, ou a opção de faltar os últimos 7 dias corridos do aviso, sem prejuízo do salário. Isso serve justamente para dar tempo de buscar uma nova colocação enquanto ainda está empregado.",
    },
    {
      type: "heading",
      level: 2,
      text: "Aviso prévio na rescisão por acordo",
      id: "aviso-previo-na-rescisao-por-acordo",
    },
    {
      type: "paragraph",
      text: "Na rescisão por acordo (quando empresa e funcionário concordam em encerrar juntos), o aviso prévio indenizado é pago pela metade, caso não seja trabalhado. É uma das reduções que compõem o modelo de acordo, junto com a multa reduzida do FGTS.",
    },
    {
      type: "heading",
      level: 2,
      text: "Simule o valor da sua rescisão com aviso prévio incluído",
      id: "simule-com-aviso-previo",
    },
    {
      type: "paragraph",
      text: "O Simulador de Rescisão da ContaFacil já considera o tipo de aviso prévio de acordo com o tipo de desligamento escolhido, junto com as demais verbas — saldo de salário, 13º, férias e multa do FGTS — para dar uma estimativa completa em segundos.",
    },
  ],
  faq: [
    {
      question: "O aviso prévio é descontado do FGTS?",
      answer:
        "Não. O aviso prévio, seja trabalhado ou indenizado, integra a remuneração para efeito de FGTS e demais verbas — inclusive conta como tempo de serviço para o cálculo de 13º e férias proporcionais, mesmo quando indenizado.",
    },
    {
      question: "Posso ser dispensado de cumprir o aviso prévio quando peço demissão?",
      answer:
        "Sim, mas depende da empresa concordar. Se a empresa dispensar o cumprimento, o funcionário não precisa trabalhar os 30 dias, mas também não recebe o valor correspondente de forma indenizada — diferente de quando é a empresa que demite.",
    },
  ],
  relatedTool: {
    title: "Simulador de Rescisão",
    href: "/ferramentas/simulador-rescisao",
    description: "Escolha o tipo de desligamento e veja uma estimativa das principais verbas, incluindo aviso prévio.",
  },
  relatedSlugs: ["diferenca-demissao-sem-justa-causa-pedido-acordo", "quanto-custa-funcionario-clt", "como-calcular-decimo-terceiro-salario"],
}
