import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "mei-ou-me-quando-migrar",
  title: "MEI ou Microempresa (ME): quando migrar e o que muda",
  metaTitle: "MEI ou ME: quando migrar e o que muda na prática",
  metaDescription:
    "Entenda a diferença entre MEI e Microempresa (ME), os sinais de que é hora de migrar e o que muda em impostos, funcionários e obrigações.",
  excerpt:
    "Todo MEI que cresce chega numa bifurcação: continuar como MEI ou virar Microempresa. Veja os sinais de que é hora de migrar e o que muda na prática.",
  pillar: "mei",
  coverImage: "/blog/covers/mei-ou-me-quando-migrar.jpg",
  coverImageAlt: "Colegas discutindo gráficos de crescimento em um quadro branco",
  publishedAt: "2026-02-11",
  updatedAt: "2026-08-03",
  readingTimeMinutes: 7,
  sections: [
    {
      type: "paragraph",
      text: "Quando o negócio começa a crescer, o MEI que antes era suficiente começa a apertar em algum ponto: o limite de faturamento, o número de funcionários, o tipo de atividade. É nesse momento que aparece a dúvida sobre migrar para Microempresa (ME). Entender a diferença entre as duas categorias ajuda a decidir com base em números, não em achismo.",
    },
    {
      type: "heading",
      level: 2,
      text: "A diferença entre MEI e ME",
      id: "diferenca-entre-mei-e-me",
    },
    {
      type: "paragraph",
      text: "O MEI (Microempreendedor Individual) é um enquadramento simplificado dentro do Simples Nacional, criado para formalizar quem trabalha sozinho com faturamento baixo. A ME (Microempresa) é uma categoria maior dentro do próprio Simples Nacional, com limite de faturamento bem mais alto, sem restrição rígida de número de funcionários e com um leque maior de atividades permitidas, mas também com uma rotina fiscal mais robusta.",
    },
    {
      type: "table",
      headers: ["Ponto", "MEI", "Microempresa (ME)"],
      rows: [
        ["Limite de faturamento anual", "Mais baixo, fixo por lei", "Bem mais alto"],
        ["Funcionários", "No máximo 1", "Sem limite rígido"],
        ["Tributação", "Valor fixo mensal (DAS)", "Percentual sobre o faturamento (Simples Nacional)"],
        ["Obrigações contábeis", "Bem simplificadas", "Exigem contabilidade regular"],
        ["Emissão de notas", "Permitida, com limites da atividade", "Mais ampla, conforme a atividade"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Sinais de que é hora de migrar",
      id: "sinais-de-que-e-hora-de-migrar",
    },
    {
      type: "list",
      items: [
        "Seu faturamento já ultrapassou (ou está muito perto de ultrapassar) o limite anual do MEI.",
        "Você precisa contratar mais de um funcionário.",
        "Você quer exercer uma atividade que não está na lista permitida para MEI.",
        "Você precisa ter sócio, o que o MEI não permite.",
        "Seu negócio já lida com um volume de notas e clientes que pede uma estrutura contábil mais completa.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "O que acontece se ultrapassar o limite sem migrar",
      id: "o-que-acontece-se-ultrapassar-sem-migrar",
    },
    {
      type: "paragraph",
      text: "Ultrapassar o limite de faturamento do MEI não gera punição automática, mas obriga a analisar o desenquadramento. O efeito depende do tamanho do excesso. Quando o excesso fica dentro da margem de até 20%, a saída tende a produzir efeitos no ano seguinte. Quando passa de 20%, pode haver efeito retroativo ao início do ano ou à data de abertura no primeiro ano de atividade.",
    },
    {
      type: "paragraph",
      text: "Essa diferença muda tudo: impostos, declarações, multas e juros. Por isso, antes de retificar DASN-SIMEI ou comunicar o desenquadramento, vale calcular mês a mês o faturamento e confirmar se o excesso foi de até 20% ou acima disso.",
    },
    {
      type: "callout",
      title: "Migrar antes costuma sair mais barato",
      text: "Migrar de forma planejada, antes de estourar o limite, evita cálculo retroativo de impostos e dá tempo de organizar a contabilidade da nova categoria com calma, em vez de resolver tudo sob pressão de um prazo da Receita.",
    },
    {
      type: "heading",
      level: 2,
      text: "Como funciona a migração na prática",
      id: "como-funciona-a-migracao",
    },
    {
      type: "paragraph",
      text: "A migração passa por três frentes: a comunicação de desenquadramento do MEI (feita pelo próprio empreendedor ou pelo contador), a opção formal pelo Simples Nacional como ME, e o ajuste da contabilidade, que passa a exigir escrituração regular, já que a ME não tem a mesma dispensa contábil simplificada do MEI. É nesse ponto que ter um contador acompanhando deixa de ser opcional na prática, mesmo sem ser uma exigência do MEI original.",
    },
    {
      type: "heading",
      level: 2,
      text: "Vale a pena migrar antes de ser obrigado?",
      id: "vale-a-pena-migrar-antes",
    },
    {
      type: "paragraph",
      text: "Se os sinais de crescimento já apareceram, mais de um funcionário necessário, faturamento subindo mês a mês, necessidade de sócio, migrar de forma planejada tende a ser mais barato e menos estressante do que esperar o limite estourar. O primeiro passo prático costuma ser entender o custo real de ter mais funcionários, já que é o gatilho mais comum para a migração.",
    },
    {
      type: "heading",
      level: 2,
      text: "Dá para voltar ao MEI depois?",
      id: "da-para-voltar",
    },
    {
      type: "paragraph",
      text: "Sim, pode ser possível voltar ao SIMEI com o mesmo CNPJ quando a empresa volta a cumprir todas as condições do MEI e faz as opções necessárias no prazo correto. Não é automaticamente necessário fechar o CNPJ e abrir outro.",
    },
  ],
  faq: [
    {
      question: "Migrar de MEI para ME é definitivo?",
      answer:
        "Não necessariamente. O retorno não é automático, mas pode ser possível solicitar novamente o enquadramento no SIMEI com o mesmo CNPJ quando a empresa cumpre as condições e faz as opções no prazo correto.",
    },
    {
      question: "Preciso de contador para migrar de MEI para ME?",
      answer:
        "Não é uma exigência legal para iniciar o processo de desenquadramento, mas a ME exige contabilidade regular a partir da migração, o que na prática torna o acompanhamento de um contador necessário para manter tudo em dia.",
    },
    {
      question: "O que acontece com as notas fiscais já emitidas como MEI depois da migração?",
      answer:
        "Elas continuam válidas e fazem parte do seu histórico fiscal. A migração muda o enquadramento daí em diante, não invalida o que já foi emitido antes.",
    },
  ],
  relatedTool: {
    title: "Simulador de Contratação",
    href: "/ferramentas/simulador-contratacao",
    description: "Se a migração é por causa de funcionários, veja o custo estimado de contratar antes de decidir.",
  },
  relatedSlugs: ["mei-pode-ter-funcionario", "quanto-custa-um-contador-para-mei", "como-abrir-mei-passo-a-passo"],
}
