import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "como-calcular-preco-de-servico",
  title: "Como calcular o preço de um serviço sem cobrar barato demais",
  metaTitle: "Como calcular o preço de um serviço (com exemplos)",
  metaDescription:
    "Aprenda o passo a passo para precificar um serviço corretamente: custos diretos, valor do seu tempo e margem de lucro, com exemplos práticos.",
  excerpt:
    "Cobrar barato demais é o motivo mais comum de prestadores de serviço trabalharem muito e sobrarem pouco no fim do mês. Veja o passo a passo para chegar num preço justo — pra você e pro cliente.",
  pillar: "precificacao",
  coverImage: "/blog/covers/como-calcular-preco-de-servico.jpg",
  coverImageAlt: "Mãos usando calculadora ao lado de uma nota fiscal",
  publishedAt: "2026-01-12",
  updatedAt: "2026-01-12",
  readingTimeMinutes: 7,
  sections: [
    {
      type: "paragraph",
      text: "Quem presta serviço — seja pintura, consultoria, design, aulas particulares ou qualquer outra atividade — em algum momento se pega diante da mesma pergunta: quanto eu cobro? Cobrar pouco é o erro mais comum, e o mais caro: você trabalha bastante, fatura razoável, mas no fim do mês sobra pouco ou nada. A boa notícia é que precificar não precisa ser um chute. Existe uma lógica simples por trás de um preço justo, que qualquer pessoa consegue aplicar sem precisar de curso de administração.",
    },
    {
      type: "heading",
      level: 2,
      text: "Por que cobrar 'na intuição' quase sempre sai caro",
      id: "por-que-intuicao-sai-caro",
    },
    {
      type: "paragraph",
      text: "É comum precificar olhando pro concorrente ou perguntando 'quanto que tá bom?'. O problema é que isso ignora a coisa mais importante: o que aquele serviço custa PRA VOCÊ fazer. Um preço que parece 'justo' pelo mercado pode estar bem abaixo do que cobre seus gastos e ainda deixe alguma sobra. Com o tempo, isso vira uma rotina de trabalhar muito para ganhar pouco — e é exatamente o padrão que leva gente boa a desistir do próprio negócio.",
    },
    {
      type: "heading",
      level: 2,
      text: "Os três números que formam qualquer preço",
      id: "tres-numeros-do-preco",
    },
    {
      type: "paragraph",
      text: "Todo preço de serviço, por mais simples ou complexo que pareça, nasce de três números somados:",
    },
    {
      type: "list",
      items: [
        "Custos diretos — tudo que você gasta pra entregar aquele serviço específico: materiais, insumos, deslocamento, terceiros contratados.",
        "Valor do seu tempo e trabalho — quanto vale a sua dedicação, sua técnica e sua experiência naquele serviço.",
        "Margem de lucro — o percentual que sobra de verdade, depois de cobrir tudo, pra reinvestir no negócio ou simplesmente for o seu ganho.",
      ],
    },
    {
      type: "paragraph",
      text: "A fórmula mais simples e mais usada por pequenos negócios é a margem sobre o preço final: você soma custos diretos com o valor do seu tempo, e divide pelo complemento da margem que você quer (100% menos a margem). Parece mais complicado escrito do que é na prática — veja o exemplo abaixo.",
    },
    {
      type: "callout",
      title: "Exemplo prático",
      text: "Um serviço custa R$150 em materiais e o seu tempo nele vale R$300. Custo total: R$450. Se você quer 30% de margem sobre o preço final, o cálculo é R$450 ÷ (1 − 0,30) = R$642,86. Ou seja: cobrando R$642,86, sobram exatos R$192,86 de lucro depois de pagar tudo — os 30% que você definiu, nem um centavo a menos.",
    },
    {
      type: "heading",
      level: 2,
      text: "Como estimar o valor do seu tempo",
      id: "valor-do-tempo",
    },
    {
      type: "paragraph",
      text: "Esse costuma ser o número mais difícil de definir, porque não é uma nota fiscal — é uma decisão sua. Uma forma prática de chegar nele: pense em quanto você gostaria de ganhar por mês trabalhando nesse tipo de serviço, divida por quantos dias você trabalha e por quantas horas úteis tem em cada dia. Isso te dá um valor-hora de referência, que você multiplica pelo tempo real que aquele serviço específico exige — incluindo preparação, execução e finalização, não só a 'parte visível' do trabalho.",
    },
    {
      type: "paragraph",
      text: "Um erro comum aqui é contar só a hora de execução e esquecer o tempo de planejamento, deslocamento, ajustes e atendimento ao cliente. Se um serviço leva 2 horas de execução mas exige 1 hora de preparação antes, o tempo real é 3 horas — e é isso que deve entrar na conta.",
    },
    {
      type: "heading",
      level: 2,
      text: "Qual margem de lucro é razoável cobrar",
      id: "margem-de-lucro-razoavel",
    },
    {
      type: "paragraph",
      text: "Não existe um número mágico universal, mas prestadores de serviço costumam trabalhar numa faixa entre 20% e 50% de margem, dependendo de quanto risco, exclusividade ou complexidade o serviço envolve. Serviços mais padronizados e recorrentes tendem pra faixa mais baixa (20%-30%); trabalhos personalizados, urgentes ou que exigem habilidade rara podem sustentar margens mais altas (40%-50%) sem espantar o cliente — porque o valor percebido também é maior.",
    },
    {
      type: "list",
      items: [
        "20%-25%: serviços de rotina, alta repetição, baixo risco.",
        "30%-35%: ponto de partida seguro para a maioria dos prestadores de serviço.",
        "40%-50%: trabalho personalizado, complexo ou com prazo apertado.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "O erro de confundir preço baixo com competitividade",
      id: "preco-baixo-nao-e-competitividade",
    },
    {
      type: "paragraph",
      text: "Baixar o preço parece a forma mais rápida de fechar mais clientes, mas na prática costuma sair caro: além de reduzir sua margem, um preço muito abaixo do mercado gera desconfiança ('por que tão barato?') e atrai o tipo de cliente mais propenso a pedir desconto, cancelar ou disputar cada detalhe. Um preço calculado com base nos seus custos reais — não no medo de perder a venda — tende a atrair clientes que valorizam mais o trabalho e negociam menos.",
    },
    {
      type: "heading",
      level: 2,
      text: "Calcule o seu preço agora",
      id: "calcule-agora",
    },
    {
      type: "paragraph",
      text: "Se você quer aplicar essa conta no seu próprio serviço sem fazer a matemática na mão, a Calculadora de Precificação da Tropa já faz isso por você: você informa seus custos diretos, o valor do seu tempo e a margem que quer, e ela calcula o preço sugerido, o lucro em reais e o preço por unidade — em segundos, e de graça.",
    },
  ],
  faq: [
    {
      question: "Qual a diferença entre margem de lucro e markup?",
      answer:
        "Margem de lucro é calculada sobre o preço final de venda (quanto do preço é lucro). Markup é calculado sobre o custo (quanto você soma em cima do custo). Os dois chegam a preços diferentes para a mesma porcentagem — por isso é importante saber qual dos dois você está usando. A margem sobre o preço final é mais direta para garantir exatamente o percentual de lucro que você quer.",
    },
    {
      question: "Devo cobrar por hora ou por projeto fechado?",
      answer:
        "Depende do tipo de trabalho. Serviços com escopo bem definido (uma pintura, um contrato, uma peça gráfica) costumam funcionar melhor com preço fechado, porque o cliente sabe exatamente quanto vai pagar. Serviços com escopo variável ou imprevisível (consultoria contínua, suporte técnico) costumam funcionar melhor cobrados por hora.",
    },
    {
      question: "E se o cliente disser que o preço está caro?",
      answer:
        "Antes de baixar o preço, vale entender se o cliente está comparando com um serviço realmente equivalente. Se o seu preço já reflete seus custos reais e uma margem razoável, baixá-lo sem motivo tende a comprometer sua margem sem necessariamente fechar mais vendas. Uma alternativa é ajustar o escopo (entregar menos) em vez de manter o escopo e cobrar menos.",
    },
  ],
  relatedTool: {
    title: "Calculadora de Precificação",
    href: "/ferramentas/calculadora-precificacao",
    description: "Informe seus custos, seu tempo e a margem que você quer — o preço sugerido aparece na hora.",
  },
  relatedSlugs: ["cobrar-por-hora-ou-por-projeto", "o-que-nao-pode-faltar-contrato-prestacao-servico", "o-que-e-das-mei-como-pagar"],
}
