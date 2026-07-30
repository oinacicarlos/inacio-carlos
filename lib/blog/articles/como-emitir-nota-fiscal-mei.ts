import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "como-emitir-nota-fiscal-mei",
  title: "Como emitir nota fiscal sendo MEI",
  metaTitle: "Como emitir nota fiscal MEI (passo a passo)",
  metaDescription:
    "Entenda quando o MEI precisa emitir nota fiscal, como fazer isso de graça pelo Emissor Nacional e o que guardar depois.",
  excerpt:
    "Nem todo MEI precisa emitir nota fiscal o tempo todo — mas saber quando é obrigatório evita problema com cliente e com a Receita. Veja como funciona.",
  pillar: "mei",
  coverImage: "/blog/covers/como-emitir-nota-fiscal-mei.jpg",
  coverImageAlt: "Mãos operando uma impressora portátil de recibos",
  publishedAt: "2026-01-28",
  updatedAt: "2026-01-28",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "A emissão de nota fiscal costuma ser uma das dúvidas mais recorrentes de quem é MEI — principalmente porque a obrigatoriedade muda dependendo de quem é o cliente. Entender essa regra evita tanto o transtorno de emitir nota sem precisar quanto o risco de deixar de emitir quando era obrigatório.",
    },
    {
      type: "heading",
      level: 2,
      text: "Quando o MEI é obrigado a emitir nota fiscal",
      id: "quando-e-obrigatorio",
    },
    {
      type: "paragraph",
      text: "A regra prática é simples: sempre que a venda ou o serviço for para uma empresa (pessoa jurídica) ou órgão público, a nota fiscal é obrigatória. Já para vendas a pessoas físicas, a emissão não é obrigatória por padrão — mas, se o cliente pedir a nota, o MEI é obrigado a emitir, garantindo o direito do consumidor previsto no Código de Defesa do Consumidor.",
    },
    {
      type: "list",
      items: [
        "Venda ou serviço para outra empresa (CNPJ): nota fiscal obrigatória.",
        "Venda ou serviço para órgão público: nota fiscal obrigatória.",
        "Venda ou serviço para pessoa física: obrigatória apenas se o cliente solicitar.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Como emitir a nota fiscal de serviço (NFS-e)",
      id: "como-emitir-nfse",
    },
    {
      type: "paragraph",
      text: "Desde a padronização nacional, o MEI prestador de serviço emite a NFS-e pelo Emissor Nacional, disponível gratuitamente no site oficial. O passo a passo básico é:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Acessar o Emissor Nacional de NFS-e com o CNPJ do MEI.",
        "Preencher os dados do tomador do serviço (cliente): nome ou razão social, CPF ou CNPJ e endereço.",
        "Descrever o serviço prestado e o valor cobrado.",
        "Emitir a nota, que gera um número e um arquivo em PDF e XML.",
        "Enviar o PDF ao cliente e guardar o XML para controle.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "E se o MEI vende produto em vez de serviço?",
      id: "mei-vende-produto",
    },
    {
      type: "paragraph",
      text: "Nesse caso, a nota é a NF-e (nota fiscal eletrônica de produto), emitida pela Secretaria da Fazenda do estado onde o MEI está registrado, já que envolve ICMS — diferente da nota de serviço, que é municipal. O processo de emissão varia um pouco de estado para estado, mas segue a mesma lógica: dados do cliente, descrição dos itens e valores.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que fazer com a nota depois de emitida",
      id: "o-que-fazer-depois",
    },
    {
      type: "list",
      items: [
        "Guardar o arquivo XML por pelo menos 5 anos — é o documento que comprova a operação perante a Receita.",
        "Somar o total das notas emitidas no mês, junto com as vendas sem nota, para o controle de faturamento mensal.",
        "Usar esse total na Declaração Anual do MEI (DASN-SIMEI), feita uma vez por ano.",
      ],
    },
    {
      type: "callout",
      title: "A nota fiscal não muda o valor do DAS",
      text: "Diferente de outros regimes, o valor do DAS do MEI é fixo e não muda conforme a quantidade de notas emitidas. A nota fiscal serve para documentar a operação e controlar se o faturamento está dentro do limite anual permitido — não gera cobrança adicional por nota.",
    },
    {
      type: "heading",
      level: 2,
      text: "Precisa de ajuda para organizar suas notas?",
      id: "precisa-de-ajuda",
    },
    {
      type: "paragraph",
      text: "Se a rotina de emitir e controlar notas fiscais está tomando tempo demais, um contador especializado em MEI e pequenas empresas pode assumir essa parte — deixando você focado no que realmente importa: o seu negócio.",
    },
  ],
  faq: [
    {
      question: "Emitir nota fiscal como MEI tem algum custo?",
      answer:
        "Não. A emissão de NFS-e pelo Emissor Nacional é totalmente gratuita para o MEI. Não há taxa por nota emitida.",
    },
    {
      question: "O que acontece se eu não emitir nota quando era obrigatório?",
      answer:
        "Deixar de emitir nota fiscal quando obrigatório pode gerar problemas com o cliente (que precisa da nota para lançar a despesa) e, em fiscalizações, pode ser interpretado como omissão de faturamento — o que traz risco de autuação.",
    },
    {
      question: "Preciso emitir nota mesmo recebendo por Pix ou dinheiro?",
      answer:
        "Sim, a forma de recebimento não muda a obrigatoriedade da nota fiscal. O que determina se é obrigatório é quem é o cliente (pessoa jurídica ou física) e se o cliente pessoa física solicitou o documento.",
    },
  ],
  relatedTool: {
    title: "Abrir meu MEI",
    href: "/abrir-cnpj",
    description: "Tire dúvidas sobre emissão de notas fiscais ou terceirize essa rotina para o seu MEI.",
  },
  relatedSlugs: ["o-que-e-das-mei-como-pagar", "como-abrir-mei-passo-a-passo", "quanto-custa-um-contador-para-mei"],
}
