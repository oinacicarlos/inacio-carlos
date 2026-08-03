import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "o-que-nao-pode-faltar-contrato-prestacao-servico",
  title: "O que não pode faltar em um contrato de prestação de serviço",
  metaTitle: "Contrato de prestação de serviço: o que incluir",
  metaDescription:
    "Veja as cláusulas essenciais de um contrato de prestação de serviço para se proteger de calote, retrabalho e mal-entendido com o cliente.",
  excerpt:
    "Fechar um serviço só no combinado verbal é a receita mais comum para dor de cabeça. Veja o que um contrato de prestação de serviço precisa ter para te proteger de verdade.",
  pillar: "contratos",
  coverImage: "/blog/covers/o-que-nao-pode-faltar-contrato-prestacao-servico.jpg",
  coverImageAlt: "Mão assinando um contrato com caneta sobre a mesa",
  publishedAt: "2026-01-22",
  updatedAt: "2026-01-22",
  readingTimeMinutes: 7,
  sections: [
    {
      type: "paragraph",
      text: "Muita gente só sente falta de um contrato quando algo já deu errado: o cliente não paga, pede alterações fora do combinado ou discorda do que foi entregue. Um contrato de prestação de serviço bem feito não precisa ser complicado nem caro, mas precisa ter alguns pontos específicos para realmente proteger as duas partes, não só existir no papel.",
    },
    {
      type: "heading",
      level: 2,
      text: "Identificação completa das partes",
      id: "identificacao-das-partes",
    },
    {
      type: "paragraph",
      text: "Parece óbvio, mas é o ponto mais esquecido em contratos informais: nome completo (ou razão social), CPF ou CNPJ, e endereço de quem contrata e de quem presta o serviço. Sem isso, o contrato perde força caso seja necessário usá-lo formalmente mais tarde.",
    },
    {
      type: "heading",
      level: 2,
      text: "Descrição clara do que será feito",
      id: "descricao-clara-do-servico",
    },
    {
      type: "paragraph",
      text: "Essa é a cláusula que evita mais conflito: descrever com detalhes o que está incluído no serviço, e, se possível, o que NÃO está incluído. Um contrato vago do tipo 'prestação de serviços de design' abre margem para o cliente pedir revisões e entregas extras achando que tudo está incluso no mesmo valor.",
    },
    {
      type: "list",
      items: [
        "O que exatamente será entregue (quantidade, formato, prazo).",
        "O que está fora do escopo (e, se o cliente quiser, como isso é cobrado à parte).",
        "Quantas revisões ou ajustes estão incluídos, se for o caso.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Valor, forma e prazo de pagamento",
      id: "valor-forma-prazo-pagamento",
    },
    {
      type: "paragraph",
      text: "Além do valor total, o contrato deve deixar claro como o pagamento será feito: à vista, parcelado, com entrada e saldo, ou por etapa. E, principalmente, o que acontece em caso de atraso, se há multa, juros, suspensão do serviço ou qualquer outra consequência combinada.",
    },
    {
      type: "heading",
      level: 2,
      text: "Prazo de entrega e o que acontece se atrasar",
      id: "prazo-de-entrega",
    },
    {
      type: "paragraph",
      text: "Vale definir a data (ou o prazo) de entrega, e também deixar claro se esse prazo depende de alguma ação do cliente, como envio de materiais, aprovações ou acesso a algum sistema. Sem essa cláusula, um atraso causado pelo próprio cliente pode ser injustamente atribuído ao prestador.",
    },
    {
      type: "heading",
      level: 2,
      text: "Condições de cancelamento",
      id: "condicoes-de-cancelamento",
    },
    {
      type: "paragraph",
      text: "O que acontece se alguma das partes quiser encerrar o contrato antes do fim? Vale prever: se é preciso avisar com antecedência, se o que já foi feito precisa ser pago, se a entrada é devolvida, e se há alguma multa por cancelamento. Essa cláusula é a que mais evita discussão quando o serviço precisa ser interrompido no meio do caminho.",
    },
    {
      type: "callout",
      title: "Dica",
      text: "Sempre que o serviço tiver risco de o cliente 'sumir' no meio (comum em projetos de longo prazo ou por etapas), vale detalhar o que já foi produzido e é devido em caso de cancelamento, isso evita ter que provar depois quanto do trabalho já estava pronto.",
    },
    {
      type: "heading",
      level: 2,
      text: "Assinatura e validade",
      id: "assinatura-e-validade",
    },
    {
      type: "paragraph",
      text: "Um contrato de prestação de serviço não precisa de reconhecimento em cartório para ter validade jurídica, o que importa é que as duas partes concordem e assinem (à mão ou eletronicamente). Ter testemunhas é opcional, mas reforça a segurança em casos de valor mais alto.",
    },
    {
      type: "heading",
      level: 2,
      text: "Monte o seu contrato agora",
      id: "monte-o-seu-contrato",
    },
    {
      type: "paragraph",
      text: "O Gerador de Contrato da Tropa já organiza todas essas cláusulas por você: você responde perguntas simples sobre o serviço, o pagamento, o prazo e o cancelamento, e recebe um documento pronto para revisar, copiar ou baixar em PDF.",
    },
  ],
  faq: [
    {
      question: "Um contrato de prestação de serviço precisa de advogado?",
      answer:
        "Não é obrigatório. Contratos simples de prestação de serviço podem ser feitos sem advogado, desde que cubram os pontos essenciais (partes, objeto, valor, prazo, cancelamento). Para negócios de maior valor ou complexidade jurídica específica, vale uma revisão profissional.",
    },
    {
      question: "Contrato assinado digitalmente tem validade?",
      answer:
        "Sim. Um contrato assinado eletronicamente (por e-mail, aplicativo de assinatura ou até por troca de mensagens com concordância expressa) tem validade jurídica no Brasil, desde que seja possível identificar as partes envolvidas.",
    },
  ],
  relatedTool: {
    title: "Gerador de Contrato",
    href: "/ferramentas/gerador-contrato",
    description: "Monte um contrato de prestação de serviço, venda ou parceria em poucos passos.",
  },
  relatedSlugs: ["o-que-fazer-quando-cliente-nao-paga", "como-calcular-preco-de-servico", "contrato-verbal-tem-validade"],
}
