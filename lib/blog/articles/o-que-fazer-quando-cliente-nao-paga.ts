import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "o-que-fazer-quando-cliente-nao-paga",
  title: "O que fazer quando o cliente não paga pelo serviço",
  metaTitle: "Cliente não pagou? O que fazer (com e sem contrato)",
  metaDescription:
    "Veja os passos práticos para cobrar um cliente que não pagou, e como um contrato bem feito evita esse problema desde o início.",
  excerpt:
    "Prestar o serviço e não receber é um dos maiores medos de quem trabalha por conta própria. Veja o que fazer se já aconteceu — e como evitar da próxima vez.",
  pillar: "contratos",
  coverImage: "/blog/covers/o-que-fazer-quando-cliente-nao-paga.jpg",
  coverImageAlt: "Mulher preocupada organizando contas em frente ao notebook",
  publishedAt: "2026-01-24",
  updatedAt: "2026-01-24",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "Não receber por um serviço já entregue é frustrante e, infelizmente, comum. A boa notícia é que existem passos práticos para tentar resolver a maioria dos casos sem precisar entrar na justiça — e cláusulas simples que, incluídas desde o início, reduzem bastante a chance de isso acontecer.",
    },
    {
      type: "heading",
      level: 2,
      text: "Primeiro passo: cobrar de forma formal e educada",
      id: "cobrar-formal-e-educada",
    },
    {
      type: "paragraph",
      text: "Antes de qualquer coisa, vale enviar uma cobrança por escrito — e-mail ou mensagem — deixando registrado o valor devido, a data de vencimento e uma nova data limite para o pagamento. Isso serve tanto para dar ao cliente a chance de resolver de boa-fé (às vezes é só esquecimento) quanto para criar um registro caso o caso precise avançar.",
    },
    {
      type: "heading",
      level: 2,
      text: "Segundo passo: verificar o que diz o contrato",
      id: "verificar-o-contrato",
    },
    {
      type: "paragraph",
      text: "Se existe um contrato assinado, ele já deveria prever o que acontece em caso de atraso: multa, juros, ou até suspensão de qualquer serviço adicional. Reforçar a cobrança citando essas cláusulas específicas costuma acelerar a resposta, porque deixa claro que a cobrança tem base formal, não é só um pedido informal.",
    },
    {
      type: "heading",
      level: 2,
      text: "Terceiro passo: negociar o pagamento",
      id: "negociar-o-pagamento",
    },
    {
      type: "paragraph",
      text: "Nem sempre vale a pena insistir no valor total de uma vez. Propor um parcelamento, mesmo que em duas ou três vezes, costuma ter mais chance de sucesso do que manter uma cobrança rígida que o cliente simplesmente ignora por não conseguir pagar tudo de uma vez.",
    },
    {
      type: "heading",
      level: 2,
      text: "Quando considerar as vias formais",
      id: "vias-formais",
    },
    {
      type: "paragraph",
      text: "Se a cobrança amigável não resolver, existem caminhos formais, dependendo do valor:",
    },
    {
      type: "list",
      items: [
        "Juizado Especial Cível — para causas de menor valor, sem necessidade de advogado até um certo limite, com processo mais rápido.",
        "Protesto em cartório — pode ser feito com um contrato ou nota promissória como título de crédito, pressionando o devedor sem precisar de um processo judicial completo.",
        "Ação de cobrança comum — para valores mais altos ou casos mais complexos, geralmente com acompanhamento de advogado.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Como evitar isso desde o próximo contrato",
      id: "como-evitar-desde-o-proximo-contrato",
    },
    {
      type: "paragraph",
      text: "A forma mais eficaz de lidar com calote é reduzir a chance de ele acontecer. Algumas práticas simples ajudam bastante:",
    },
    {
      type: "list",
      items: [
        "Cobrar uma entrada antes de começar o serviço, principalmente em projetos maiores.",
        "Dividir o pagamento por etapas entregues, em vez de cobrar tudo só no final.",
        "Deixar por escrito, no contrato, o que acontece em caso de atraso (multa, juros, suspensão).",
        "Evitar entregar a versão final ou os arquivos definitivos antes da confirmação do pagamento.",
      ],
    },
    {
      type: "callout",
      title: "Importante",
      text: "Um contrato não impede que o cliente atrase — mas transforma uma discussão de 'ele disse, ela disse' em algo com base documentada, o que muda completamente a força de uma cobrança formal ou de um processo, se for necessário chegar lá.",
    },
    {
      type: "heading",
      level: 2,
      text: "Proteja o próximo contrato",
      id: "proteja-o-proximo-contrato",
    },
    {
      type: "paragraph",
      text: "O Gerador de Contrato da ContaFacil já inclui, entre as opções, cláusulas de forma de pagamento, multa por atraso e condições de cancelamento — prontas para você incluir no seu próximo contrato sem precisar escrever do zero.",
    },
  ],
  faq: [
    {
      question: "Vale a pena entrar na justiça por um valor pequeno?",
      answer:
        "Para valores menores, o Juizado Especial Cível costuma ser o caminho mais viável: é mais rápido, mais barato e, até um certo limite de valor, não exige advogado. Vale pesar o tempo e o esforço envolvidos contra o valor em disputa antes de decidir.",
    },
    {
      question: "Um print de conversa serve como prova de que o serviço foi combinado?",
      answer:
        "Pode ajudar como evidência complementar, mas não substitui um contrato formal — é mais fácil de contestar e não deixa tão claro todos os termos combinados. Sempre que possível, formalizar por contrato (mesmo simples) é mais seguro.",
    },
  ],
  relatedTool: {
    title: "Gerador de Contrato",
    href: "/ferramentas/gerador-contrato",
    description: "Monte um contrato com cláusulas de pagamento, multa por atraso e cancelamento incluídas.",
  },
  relatedSlugs: ["o-que-nao-pode-faltar-contrato-prestacao-servico", "contrato-verbal-tem-validade", "como-calcular-preco-de-servico"],
}
