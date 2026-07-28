import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "ferias-clt-como-funciona-o-calculo",
  title: "Férias CLT: como funciona o cálculo (e o que é férias em dobro)",
  metaTitle: "Férias CLT: como calcular (e o que são férias em dobro)",
  metaDescription:
    "Entenda como funciona o cálculo das férias CLT, o adicional de um terço, férias proporcionais, abono pecuniário e o que são férias em dobro.",
  excerpt:
    "Férias CLT têm mais regras do que parece: adicional de 1/3, proporcionalidade, abono pecuniário e o temido pagamento em dobro. Veja como funciona cada parte.",
  pillar: "contratacao",
  coverImage: "/blog/covers/ferias-clt-como-funciona-o-calculo.jpg",
  coverImageAlt: "Mulher relaxando com um café em uma cadeira na praia",
  publishedAt: "2026-02-16",
  updatedAt: "2026-02-16",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "Todo funcionário CLT tem direito a 30 dias de férias por ano, mas o valor pago e as regras em volta disso — adicional, proporcionalidade, venda de dias, pagamento em dobro — costumam gerar mais dúvida do que o próprio período de descanso. Veja como cada parte funciona.",
    },
    {
      type: "heading",
      level: 2,
      text: "Quando o funcionário tem direito a férias",
      id: "quando-tem-direito-a-ferias",
    },
    {
      type: "paragraph",
      text: "O direito às férias nasce após 12 meses de trabalho, chamado de período aquisitivo. A partir daí, a empresa tem os 12 meses seguintes (período concessivo) para conceder os 30 dias de descanso. Ou seja: entre o início do direito e o prazo final para tirar as férias, o funcionário e a empresa têm até dois anos de janela — mas deixar para a última hora é arriscado, como você vai ver mais adiante.",
    },
    {
      type: "heading",
      level: 2,
      text: "Como calcular o valor das férias",
      id: "como-calcular-o-valor",
    },
    {
      type: "paragraph",
      text: "O valor das férias é o salário normal do funcionário acrescido de um terço constitucional — um adicional garantido pela Constituição, pago junto com as férias. A fórmula é simples: salário + (salário ÷ 3).",
    },
    {
      type: "callout",
      title: "Exemplo prático",
      text: "Um funcionário com salário de R$3.000 recebe, nas férias, R$3.000 + R$1.000 (um terço) = R$4.000 no total.",
    },
    {
      type: "heading",
      level: 2,
      text: "Férias proporcionais",
      id: "ferias-proporcionais",
    },
    {
      type: "paragraph",
      text: "Quando o funcionário é desligado antes de completar um novo período aquisitivo de 12 meses, ele tem direito às férias proporcionais aos meses trabalhados — calculadas na base de 1/12 do valor das férias integrais para cada mês completo trabalhado, também com o adicional de um terço.",
    },
    {
      type: "heading",
      level: 2,
      text: "Abono pecuniário: vender parte das férias",
      id: "abono-pecuniario",
    },
    {
      type: "paragraph",
      text: "O funcionário pode optar por vender até 1/3 dos dias de férias (10 dos 30 dias) para a empresa, recebendo o valor correspondente em dinheiro em vez de descansar esses dias. Essa opção precisa ser comunicada até 15 dias antes do fim do período aquisitivo, e cabe ao funcionário decidir — não à empresa impor.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que são férias em dobro (e quando a empresa é obrigada a pagar)",
      id: "ferias-em-dobro",
    },
    {
      type: "paragraph",
      text: "Se a empresa não conceder as férias dentro do período concessivo (os 12 meses após o funcionário completar o direito), ela é obrigada a pagar o valor das férias em dobro — ou seja, o dobro do salário mais o adicional de um terço, também dobrado. É uma penalidade prevista em lei justamente para evitar que férias fiquem acumulando indefinidamente sem serem tiradas.",
    },
    {
      type: "table",
      headers: ["Situação", "O que é pago"],
      rows: [
        ["Férias tiradas dentro do prazo", "Salário + 1/3 constitucional"],
        ["Férias proporcionais (desligamento)", "1/12 por mês trabalhado + 1/3"],
        ["Férias não concedidas no prazo", "Valor em dobro (salário + 1/3, tudo em dobro)"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Simule o custo de férias de um funcionário",
      id: "simule-o-custo",
    },
    {
      type: "paragraph",
      text: "Assim como o 13º, o custo de férias precisa entrar na conta desde a decisão de contratar — não só no mês em que elas acontecem. O Simulador de Contratação da ContaFacil já estima esse valor junto com os demais encargos.",
    },
  ],
  faq: [
    {
      question: "A empresa pode obrigar o funcionário a tirar férias em um período específico?",
      answer:
        "Sim, cabe à empresa definir o período das férias dentro do prazo concessivo, respeitando algumas restrições legais (como não iniciar férias nos dois dias que antecedem um feriado ou descanso semanal). O funcionário não escolhe a data sozinho, mas pode negociar.",
    },
    {
      question: "Funcionário em férias pode ser demitido?",
      answer:
        "A demissão durante o período de férias não é proibida por lei, mas a empresa precisa ter cuidado com a chamada estabilidade provisória em outras situações (como gestante), que são independentes das férias em si.",
    },
    {
      question: "As férias contam para o cálculo do FGTS?",
      answer:
        "Sim, o valor das férias (incluindo o adicional de um terço) sofre incidência de FGTS, que deve ser depositado pela empresa normalmente.",
    },
  ],
  relatedTool: {
    title: "Simulador de Contratação",
    href: "/ferramentas/simulador-contratacao",
    description: "Veja o custo total de um funcionário, incluindo férias, 13º e demais encargos.",
  },
  relatedSlugs: ["como-calcular-decimo-terceiro-salario", "quanto-custa-funcionario-clt", "o-que-e-aviso-previo-como-funciona"],
}
