import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "diferenca-demissao-sem-justa-causa-pedido-acordo",
  title: "Demissão sem justa causa, pedido de demissão ou acordo: qual a diferença",
  metaTitle: "Demissão sem justa causa vs. pedido vs. acordo: diferenças",
  metaDescription:
    "Entenda a diferença entre demissão sem justa causa, pedido de demissão e rescisão por acordo, e o que cada uma muda no valor final da rescisão.",
  excerpt:
    "O tipo de desligamento muda completamente o valor que a pessoa recebe (ou paga) na rescisão. Veja a diferença entre as três formas mais comuns de encerrar um contrato CLT.",
  pillar: "rescisao",
  coverImage: "/blog/covers/diferenca-demissao-sem-justa-causa-pedido-acordo.jpg",
  coverImageAlt: "Profissional organizando pertences em uma caixa no escritório",
  publishedAt: "2026-03-20",
  updatedAt: "2026-03-20",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "Encerrar um contrato de trabalho CLT parece simples até a hora de calcular o que é devido, porque o valor final muda bastante dependendo de quem tomou a iniciativa e de como. As três formas mais comuns de desligamento sem justa causa por parte do funcionário são bem diferentes entre si, e confundir uma com a outra é a maior fonte de erro (e de expectativa frustrada) na hora do acerto final.",
    },
    {
      type: "heading",
      level: 2,
      text: "Demissão sem justa causa",
      id: "demissao-sem-justa-causa",
    },
    {
      type: "paragraph",
      text: "É quando a empresa decide encerrar o contrato, sem que o funcionário tenha cometido nenhuma falta grave. É o cenário mais completo em termos de direitos: o funcionário recebe saldo de salário, 13º proporcional, férias proporcionais mais um terço, aviso prévio (trabalhado ou indenizado) e a multa de 40% sobre o saldo do FGTS, além de ter direito a sacar o FGTS e solicitar o seguro-desemprego, se atender aos requisitos.",
    },
    {
      type: "heading",
      level: 2,
      text: "Pedido de demissão",
      id: "pedido-de-demissao",
    },
    {
      type: "paragraph",
      text: "É quando o próprio funcionário decide sair. Nesse caso, os direitos são bem mais limitados: recebe saldo de salário, 13º proporcional e férias proporcionais mais um terço, mas não tem direito à multa de 40% do FGTS, não pode sacar o saldo do FGTS (salvo exceções específicas) e não tem direito ao seguro-desemprego. Além disso, se o funcionário não cumprir o aviso prévio de 30 dias (ou não for dispensado dele pela empresa), o valor correspondente pode ser descontado das verbas rescisórias.",
    },
    {
      type: "heading",
      level: 2,
      text: "Rescisão por acordo (distrato)",
      id: "rescisao-por-acordo",
    },
    {
      type: "paragraph",
      text: "É um meio-termo criado pela reforma trabalhista: empresa e funcionário concordam em encerrar o contrato juntos. Nesse formato, o funcionário recebe metade do aviso prévio indenizado (se não for trabalhado) e metade da multa do FGTS (20% em vez de 40%). Também pode movimentar até 80% do saldo do FGTS, mas não tem direito ao seguro-desemprego. É uma opção útil quando as duas partes já concordam que o vínculo deve terminar, evitando desgaste.",
    },
    {
      type: "heading",
      level: 2,
      text: "Comparando as três, lado a lado",
      id: "comparando-lado-a-lado",
    },
    {
      type: "table",
      headers: ["Verba", "Sem justa causa", "Pedido de demissão", "Acordo"],
      rows: [
        ["Saldo de salário", "Sim", "Sim", "Sim"],
        ["13º e férias proporcionais", "Sim", "Sim", "Sim"],
        ["Multa do FGTS", "40%", "Não tem", "20%"],
        ["Saque do FGTS", "Integral", "Não (regra geral)", "Até 80%"],
        ["Seguro-desemprego", "Sim, se elegível", "Não", "Não"],
        ["Aviso prévio indenizado", "Integral", "Só se dispensado pela empresa", "Metade"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Por que isso muda tanto o valor final",
      id: "por-que-muda-o-valor",
    },
    {
      type: "paragraph",
      text: "A multa do FGTS costuma ser a maior verba de toda a rescisão, então a diferença entre 40%, 20% e zero já explica boa parte da distância entre os três cenários. Some a isso o aviso prévio (integral, parcial ou nenhum) e o acesso ou não ao seguro-desemprego, e fica claro por que a mesma pessoa, com o mesmo salário e tempo de casa, pode receber valores bem diferentes dependendo apenas de quem tomou a decisão de encerrar o contrato, e como.",
    },
    {
      type: "heading",
      level: 2,
      text: "Simule o valor da sua rescisão",
      id: "simule-o-valor",
    },
    {
      type: "paragraph",
      text: "Em vez de tentar calcular tudo isso na mão, o Simulador de Rescisão da Tropa já aplica essas regras automaticamente: você escolhe o tipo de desligamento e informa salário, datas e saldo do FGTS, e recebe uma estimativa das principais verbas, incluindo o custo estimado para a empresa.",
    },
  ],
  faq: [
    {
      question: "Quem pede demissão tem direito a algum aviso prévio?",
      answer:
        "Quem pede demissão precisa cumprir 30 dias de aviso prévio trabalhado, a não ser que a empresa dispense esse cumprimento. Se o funcionário simplesmente não comparecer, a empresa pode descontar o valor correspondente das verbas rescisórias.",
    },
    {
      question: "A rescisão por acordo pode ser proposta pelo funcionário?",
      answer:
        "Sim. A rescisão por acordo pode partir tanto da empresa quanto do funcionário, o ponto central é que as duas partes precisam concordar formalmente com essa modalidade para que ela seja válida.",
    },
    {
      question: "Justa causa entra nessa comparação?",
      answer:
        "Não é um desses três casos. Na demissão por justa causa, o funcionário perde a maior parte dos direitos rescisórios (inclusive a multa do FGTS e o saque) por ter cometido uma falta grave prevista em lei, como comprovada indisciplina ou má conduta.",
    },
  ],
  relatedTool: {
    title: "Simulador de Rescisão",
    href: "/ferramentas/simulador-rescisao",
    description: "Escolha o tipo de desligamento e veja uma estimativa das principais verbas em segundos.",
  },
  relatedSlugs: ["o-que-e-aviso-previo-como-funciona", "quanto-custa-funcionario-clt", "como-calcular-preco-de-servico"],
}
