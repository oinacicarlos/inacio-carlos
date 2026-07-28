import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "quanto-custa-um-contador-para-mei",
  title: "Quanto custa um contador para MEI (e quando vale a pena contratar)",
  metaTitle: "Quanto custa um contador para MEI? Veja quando vale a pena",
  metaDescription:
    "Entenda quanto custa a contabilidade para MEI, o que costuma estar incluso no valor mensal e em que momento contratar um contador realmente compensa.",
  excerpt:
    "Na maior parte do tempo, o MEI dá conta sozinho. Mas existem momentos em que contratar um contador passa a compensar de verdade. Veja quanto custa e quando vale a pena.",
  pillar: "mei",
  coverImage: "/blog/covers/quanto-custa-um-contador-para-mei.jpg",
  coverImageAlt: "Contador conversando com cliente sobre documentos financeiros",
  publishedAt: "2026-02-06",
  updatedAt: "2026-02-06",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "O MEI foi desenhado para ser simples o suficiente pra funcionar sem contador: o DAS é fixo, a declaração anual (DASN-SIMEI) é curta, e boa parte da rotina cabe no aplicativo MEI. Por isso, muita gente nem cogita contratar um contador — e, na maior parte do tempo, faz sentido não contratar. O ponto é que existem momentos específicos em que isso muda, e vale entender quanto custa antes de precisar decidir com pressa.",
    },
    {
      type: "heading",
      level: 2,
      text: "MEI é obrigado a ter contador?",
      id: "mei-e-obrigado-a-ter-contador",
    },
    {
      type: "paragraph",
      text: "Não. O MEI é a única categoria empresarial no Brasil dispensada da obrigatoriedade de contador para cumprir suas obrigações básicas — pagar o DAS e enviar a declaração anual. Isso foi uma escolha deliberada do legislador pra reduzir o custo de manter um MEI regular. O contador se torna útil (às vezes necessário na prática) quando a operação cresce ou fica mais complexa — não porque a lei exige, mas porque o risco de errar sozinho aumenta.",
    },
    {
      type: "heading",
      level: 2,
      text: "Quanto custa a contabilidade para MEI",
      id: "quanto-custa-a-contabilidade",
    },
    {
      type: "paragraph",
      text: "O valor varia bastante conforme a região, o volume de notas emitidas e o que está incluso no plano, mas costuma ser um valor mensal fixo e acessível — bem mais barato do que a contabilidade de uma empresa de outro porte, já que o volume de obrigações do MEI é bem menor. Em vez de comparar só o preço final, vale olhar o que está incluso:",
    },
    {
      type: "list",
      items: [
        "Emissão de nota fiscal (ou orientação de como emitir você mesmo).",
        "Acompanhamento do DAS e alerta antes do vencimento.",
        "Envio da declaração anual (DASN-SIMEI) dentro do prazo.",
        "Suporte para dúvidas do dia a dia — sem cobrança extra por pergunta.",
        "Orientação sobre quando migrar de categoria, se o faturamento crescer.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Quando contratar um contador passa a valer a pena",
      id: "quando-vale-a-pena-contratar",
    },
    {
      type: "list",
      items: [
        "Você contratou (ou está perto de contratar) um funcionário — a folha de pagamento e os encargos exigem mais atenção.",
        "Seu faturamento está se aproximando do limite anual do MEI.",
        "Você emite muitas notas fiscais por mês e perde tempo fazendo isso manualmente.",
        "Você já recebeu alguma notificação da Receita ou está com o DAS atrasado.",
        "Você está pensando em migrar para Microempresa (ME) e não sabe por onde começar.",
      ],
    },
    {
      type: "callout",
      title: "O custo-benefício muda com o tamanho do negócio",
      text: "Enquanto o MEI é pequeno e simples, o contador é opcional. Quando qualquer um dos pontos acima aparece, o custo mensal de um contador costuma ser bem menor do que o risco de uma multa, um DAS mal calculado ou uma migração feita errado.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que perguntar antes de contratar",
      id: "o-que-perguntar-antes-de-contratar",
    },
    {
      type: "paragraph",
      text: "Antes de fechar com um contador, vale confirmar três coisas: se o valor mensal é fixo ou varia conforme o número de notas emitidas, se o suporte é ilimitado ou cobrado por consulta, e se a emissão de notas está incluída ou é um serviço à parte. São esses detalhes que fazem dois planos com o mesmo preço anunciado terem experiências bem diferentes na prática.",
    },
    {
      type: "heading",
      level: 2,
      text: "Como funciona na ContaFacil",
      id: "como-funciona-na-contafacil",
    },
    {
      type: "paragraph",
      text: "Os planos da ContaFacil foram pensados pra cobrir exatamente esses momentos: emissão de nota fiscal, acompanhamento do DAS, envio de declarações, ferramentas ilimitadas de precificação e contratação, e suporte humanizado quando você precisar de uma resposta de verdade — sem esperar dias por retorno.",
    },
  ],
  faq: [
    {
      question: "MEI sem funcionário e com pouco movimento precisa de contador?",
      answer:
        "Na maioria dos casos, não é obrigatório nem necessário. O aplicativo MEI e o Portal do Simples Nacional dão conta das obrigações básicas. O contador passa a fazer diferença quando a operação cresce em volume, complexidade ou risco.",
    },
    {
      question: "Contratar contador é mais caro do que fazer sozinho?",
      answer:
        "Em valor mensal, sim — fazer sozinho é gratuito. Mas o cálculo relevante não é só o custo do contador: é o custo do contador comparado ao tempo perdido, ao risco de erro e às multas evitadas quando a situação já não é tão simples.",
    },
    {
      question: "Dá pra trocar de plano conforme o negócio cresce?",
      answer:
        "Sim. O ideal é começar com o plano que cobre suas necessidades atuais e migrar quando o negócio crescer — por exemplo, ao contratar o primeiro funcionário ou ao se aproximar do limite de faturamento do MEI.",
    },
  ],
  relatedTool: {
    title: "Ver planos da ContaFacil",
    href: "/#planos",
    description: "Compare os planos e veja o que está incluso em cada um, do MEI até a empresa com funcionários.",
  },
  relatedSlugs: ["como-trocar-de-contador", "mei-ou-me-quando-migrar", "o-que-e-das-mei-como-pagar"],
}
