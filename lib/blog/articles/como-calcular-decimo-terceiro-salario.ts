import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "como-calcular-decimo-terceiro-salario",
  title: "Como calcular o 13º salário passo a passo",
  metaTitle: "Como calcular o 13º salário (passo a passo com exemplo)",
  metaDescription:
    "Aprenda a calcular o 13º salário passo a passo, incluindo a primeira e a segunda parcela, descontos e o que muda em caso de desligamento.",
  excerpt:
    "O 13º salário parece simples até a hora de calcular direito, primeira parcela, segunda parcela, descontos. Veja o passo a passo com exemplo prático.",
  pillar: "contratacao",
  coverImage: "/blog/covers/como-calcular-decimo-terceiro-salario.jpg",
  coverImageAlt: "Mulher sorrindo segurando dinheiro e um envelope",
  publishedAt: "2026-06-24",
  updatedAt: "2026-06-24",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "O 13º salário é um direito garantido a todo funcionário CLT, mas o cálculo tem mais detalhes do que parece à primeira vista, principalmente na hora de dividir entre a primeira e a segunda parcela, e de aplicar os descontos corretos. Veja o passo a passo pra calcular sem erro.",
    },
    {
      type: "heading",
      level: 2,
      text: "Como funciona o 13º salário",
      id: "como-funciona-o-13o",
    },
    {
      type: "paragraph",
      text: "Todo funcionário que trabalhou pelo menos 15 dias em um mês tem direito a 1/12 do salário referente àquele mês no cálculo do 13º. O pagamento é feito obrigatoriamente em duas parcelas: a primeira até 30 de novembro, e a segunda até 20 de dezembro (essas datas são fixas por lei, independente do ano). O 13º pode ser antecipado junto com as férias, se o funcionário solicitar.",
    },
    {
      type: "heading",
      level: 2,
      text: "A fórmula do cálculo",
      id: "formula-do-calculo",
    },
    {
      type: "paragraph",
      text: "O cálculo básico é: (salário bruto ÷ 12) × número de meses trabalhados no ano. Quem trabalhou o ano inteiro recebe o equivalente a um salário integral de 13º; quem trabalhou parte do ano recebe proporcionalmente aos meses trabalhados.",
    },
    {
      type: "callout",
      title: "Exemplo prático",
      text: "Um funcionário com salário de R$3.000 que trabalhou os 12 meses do ano tem direito a R$3.000 de 13º integral. Se tivesse trabalhado apenas 8 meses, o cálculo seria (R$3.000 ÷ 12) × 8 = R$2.000.",
    },
    {
      type: "heading",
      level: 2,
      text: "Primeira parcela vs segunda parcela",
      id: "primeira-vs-segunda-parcela",
    },
    {
      type: "paragraph",
      text: "A primeira parcela corresponde a 50% do valor bruto do 13º, paga sem nenhum desconto. A segunda parcela corresponde ao valor total do 13º, descontada a primeira parcela já paga, e é sobre essa segunda parcela que incidem os descontos de INSS e, quando aplicável, de Imposto de Renda, calculados sobre o valor cheio do 13º (não apenas sobre a segunda parcela isoladamente).",
    },
    {
      type: "heading",
      level: 2,
      text: "Descontos que incidem sobre o 13º",
      id: "descontos-sobre-o-13o",
    },
    {
      type: "list",
      items: [
        "INSS, calculado sobre o valor total do 13º, seguindo a mesma tabela progressiva usada no salário mensal.",
        "Imposto de Renda, incide apenas se o valor do 13º (já descontado o INSS) ultrapassar a faixa de isenção da tabela do IR, e é retido somente na segunda parcela.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "O que acontece com o 13º em caso de demissão",
      id: "13o-em-caso-de-demissao",
    },
    {
      type: "paragraph",
      text: "Quando o contrato é encerrado antes do fim do ano, o 13º proporcional aos meses trabalhados entra como uma das verbas da rescisão, e o tratamento varia conforme o tipo de desligamento (sem justa causa, pedido de demissão ou acordo).",
    },
    {
      type: "heading",
      level: 2,
      text: "Calcule o custo de um funcionário incluindo o 13º",
      id: "calcule-o-custo-incluindo-13o",
    },
    {
      type: "paragraph",
      text: "Se você está avaliando contratar, o 13º é um dos encargos que precisa entrar na conta desde o início, junto com férias, FGTS e demais obrigações. O Simulador de Contratação da Tropa já inclui esses valores na estimativa de custo total.",
    },
  ],
  faq: [
    {
      question: "Quem trabalhou menos de 12 meses tem direito a 13º?",
      answer:
        "Sim, desde que tenha trabalhado pelo menos 15 dias em cada mês considerado. O valor é proporcional: 1/12 do salário para cada mês trabalhado dentro desse critério.",
    },
    {
      question: "Autônomo ou MEI tem direito a 13º salário?",
      answer:
        "Não. O 13º é um direito exclusivo de quem tem vínculo empregatício CLT. Autônomos, MEIs e prestadores de serviço PJ não têm direito a essa verba, já que não há relação de emprego formal envolvida.",
    },
    {
      question: "O 13º entra no cálculo do FGTS?",
      answer:
        "Sim. O valor pago a título de 13º salário também sofre incidência de FGTS (8%), depositado pelo empregador junto com o restante da remuneração do período.",
    },
  ],
  relatedTool: {
    title: "Simulador de Contratação",
    href: "/ferramentas/simulador-contratacao",
    description: "Veja o custo total de um funcionário, incluindo 13º, férias e demais encargos.",
  },
  relatedSlugs: ["ferias-clt-como-funciona-o-calculo", "quanto-custa-funcionario-clt", "diferenca-demissao-sem-justa-causa-pedido-acordo"],
}
