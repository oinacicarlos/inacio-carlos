import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "o-que-e-das-mei-como-pagar",
  title: "O que é o DAS do MEI e como pagar em dia",
  metaTitle: "DAS do MEI: o que é, quanto custa e como pagar",
  metaDescription:
    "Entenda o que é o DAS do MEI, o que ele cobre, quanto custa por mês e o que acontece se você atrasar o pagamento.",
  excerpt:
    "O DAS é a guia mensal que todo MEI precisa pagar, e a dúvida mais comum de quem está começando. Veja o que ele cobre, quanto custa e o que fazer se atrasar.",
  pillar: "mei",
  coverImage: "/blog/covers/o-que-e-das-mei-como-pagar.jpg",
  coverImageAlt: "Mulher usando o celular para organizar as finanças em casa",
  publishedAt: "2026-01-15",
  updatedAt: "2026-01-15",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "Se você é MEI ou está pensando em abrir um, uma das primeiras siglas que vai aparecer no seu caminho é o DAS. É o boleto mensal que mantém o CNPJ regularizado, e entender como ele funciona evita boa parte dos problemas que MEIs enfrentam com a Receita Federal.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que é o DAS",
      id: "o-que-e-o-das",
    },
    {
      type: "paragraph",
      text: "DAS significa Documento de Arrecadação do Simples Nacional. É a guia única de pagamento mensal do MEI, que reúne em um só boleto todos os tributos que, numa empresa maior, seriam pagos separadamente: INSS, ICMS (para quem vende produtos) ou ISS (para quem presta serviço). Em vez de lidar com várias guias diferentes, o MEI paga um valor fixo mensal, simplificando bastante a rotina fiscal.",
    },
    {
      type: "heading",
      level: 2,
      text: "Quanto custa o DAS por mês",
      id: "quanto-custa-o-das",
    },
    {
      type: "paragraph",
      text: "O valor do DAS é fixo e reajustado todo ano com base no salário mínimo vigente, por isso não muda dependendo de quanto o MEI faturou naquele mês específico. O valor varia de acordo com o tipo de atividade:",
    },
    {
      type: "list",
      items: [
        "Comércio ou indústria: contribuição de INSS + ICMS.",
        "Prestação de serviços: contribuição de INSS + ISS.",
        "Comércio e serviços juntos: contribuição de INSS + ICMS + ISS.",
      ],
    },
    {
      type: "paragraph",
      text: "Como o valor exato muda todo ano (é reajustado junto com o salário mínimo), o mais seguro é sempre conferir o valor atualizado direto no Portal do Simples Nacional ou no aplicativo MEI, em vez de confiar em um número fixo publicado há tempos em algum lugar da internet.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que o DAS cobre exatamente",
      id: "o-que-o-das-cobre",
    },
    {
      type: "paragraph",
      text: "O pagamento do DAS garante dois benefícios importantes além de manter o CNPJ regular:",
    },
    {
      type: "list",
      items: [
        "Aposentadoria e benefícios do INSS, o MEI que paga o DAS em dia contribui para a previdência, tendo direito a aposentadoria por idade, auxílio-doença, salário-maternidade e pensão por morte para dependentes.",
        "Regularidade fiscal do CNPJ, sem o DAS em dia, o CNPJ pode ser bloqueado, impedindo emissão de nota fiscal e outras operações.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Até quando pagar o DAS",
      id: "ate-quando-pagar",
    },
    {
      type: "paragraph",
      text: "O vencimento do DAS é sempre até o dia 20 de cada mês, referente ao mês anterior. Se o dia 20 cair em fim de semana ou feriado, o vencimento passa automaticamente para o próximo dia útil. A guia pode ser gerada e paga pelo Portal do Simples Nacional, pelo aplicativo MEI ou diretamente pelo internet banking, usando o código de barras.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que acontece se o MEI atrasar o DAS",
      id: "o-que-acontece-se-atrasar",
    },
    {
      type: "paragraph",
      text: "Atrasar o DAS não cancela o CNPJ automaticamente, mas traz consequências reais:",
    },
    {
      type: "list",
      items: [
        "Juros e multa sobre o valor em atraso, calculados dia a dia.",
        "Perda temporária dos direitos previdenciários enquanto a guia estiver em aberto.",
        "Acúmulo de pendências que, se ultrapassar um certo período sem regularização, pode levar ao cancelamento do MEI de ofício pela Receita Federal.",
      ],
    },
    {
      type: "paragraph",
      text: "A boa notícia é que dá pra regularizar: é possível emitir o DAS em atraso (já com os juros e multa calculados automaticamente) direto pelo Portal do Simples Nacional, a qualquer momento. Quanto antes regularizar, menor o valor acumulado.",
    },
    {
      type: "heading",
      level: 2,
      text: "Como não esquecer de pagar todo mês",
      id: "como-nao-esquecer",
    },
    {
      type: "paragraph",
      text: "Como o valor não muda de mês para mês, a forma mais simples de nunca atrasar é configurar um débito automático pelo aplicativo MEI ou pelo internet banking, ou simplesmente colocar um lembrete fixo alguns dias antes do vencimento. Ter um contador acompanhando sua situação também ajuda, além de cuidar do DAS, ele avisa sobre outras obrigações que o MEI às vezes esquece, como a Declaração Anual (DASN-SIMEI).",
    },
  ],
  faq: [
    {
      question: "O DAS muda de valor se eu faturar mais em um mês?",
      answer:
        "Não. O DAS do MEI é um valor fixo mensal, definido pela atividade (comércio, serviço ou os dois) e reajustado uma vez por ano com base no salário mínimo, independentemente de quanto você faturou naquele mês específico.",
    },
    {
      question: "Posso parcelar o DAS atrasado?",
      answer:
        "Sim, é possível parcelar débitos de DAS em atraso diretamente pelo Portal do Simples Nacional, dentro das regras vigentes de parcelamento para o MEI. O ideal é regularizar o quanto antes para reduzir juros e evitar o cancelamento do CNPJ por inadimplência.",
    },
    {
      question: "O que acontece se eu não pagar o DAS nunca?",
      answer:
        "Além dos juros e multas acumulados, o MEI que fica muito tempo sem pagar o DAS pode ter o CNPJ cancelado de ofício pela Receita Federal, perdendo a regularidade para emitir notas fiscais e os direitos previdenciários vinculados às contribuições.",
    },
  ],
  relatedTool: {
    title: "Abrir meu MEI",
    href: "/abrir-cnpj",
    description: "Tire dúvidas sobre o seu MEI ou sobre trocar de contador com quem entende do assunto.",
  },
  relatedSlugs: ["como-abrir-mei-passo-a-passo", "como-emitir-nota-fiscal-mei", "mei-pode-ter-funcionario"],
}
