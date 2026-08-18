import type { BlogArticle } from "@/lib/blog/types"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"

export const prestadoresServicoSeoArticles: BlogArticle[] = [
  {
    slug: "aposentado-socio-paga-inss-pro-labore",
    title: "Aposentado que abre empresa precisa pagar INSS no pró-labore?",
    metaTitle: "Aposentado sócio paga INSS no pró-labore?",
    metaDescription:
      "Entenda quando aposentado sócio paga INSS sobre pró-labore, diferença entre sócio investidor e administrador, e distribuição de lucros.",
    excerpt:
      "Aposentadoria não elimina automaticamente o INSS quando o aposentado trabalha na própria empresa e recebe pró-labore.",
    pillar: "contratacao",
    coverImage: "/blog/covers/aposentado-socio-paga-inss-pro-labore.jpg",
    coverImageAlt: "Empresário sênior sorridente trabalhando no notebook",
    publishedAt: "2026-04-19",
    updatedAt: "2026-04-19",
    readingTimeMinutes: 6,
    sections: [
      {
        type: "paragraph",
        text: "Aposentado pode abrir empresa, ser sócio e até administrar o negócio. A dúvida aparece quando existe pró-labore: se ele já é aposentado, ainda precisa contribuir ao INSS? Em muitos casos, sim.",
      },
      {
        type: "heading",
        level: 2,
        text: "Sócio investidor e sócio administrador",
        id: "socio-investidor-administrador",
      },
      {
        type: "paragraph",
        text: "Sócio apenas investidor, que não trabalha na empresa, pode receber distribuição de lucros quando há lucro contábil. Sócio administrador ou sócio que trabalha na operação normalmente deve ter pró-labore.",
      },
      {
        type: "heading",
        level: 2,
        text: "INSS sobre pró-labore",
        id: "inss-pro-labore",
      },
      {
        type: "paragraph",
        text: "O pró-labore é remuneração pelo trabalho do sócio. Quando há pró-labore, existe contribuição previdenciária, mesmo se o sócio já recebe aposentadoria. Essa contribuição não costuma aumentar a aposentadoria já concedida.",
      },
      {
        type: "table",
        headers: ["Situação", "Tratamento comum"],
        rows: [
          ["Aposentado sócio investidor", "Pode receber lucros, se houver lucro apurado"],
          ["Aposentado sócio administrador", "Normalmente há pró-labore e INSS"],
          ["Distribuição de lucros", "Não substitui pró-labore quando há trabalho efetivo"],
          ["Simples Anexo III ou V", "Folha e pró-labore podem afetar fator R em algumas atividades"],
        ],
      },
      {
        type: "callout",
        title: "Não misture tudo como lucro",
        text: "Quando o sócio trabalha, pagar tudo como distribuição de lucros pode gerar risco fiscal. Pró-labore e lucro têm naturezas diferentes.",
      },
    ],
    faq: [
      {
        question: "Aposentado que trabalha na empresa paga INSS?",
        answer:
          "Quando recebe pró-labore pelo trabalho na empresa, normalmente há contribuição ao INSS.",
      },
      {
        question: "Esse INSS aumenta a aposentadoria?",
        answer:
          "Em regra, a contribuição após a aposentadoria não aumenta o benefício já concedido.",
      },
      {
        question: "Posso retirar só lucro?",
        answer:
          "Só quando a situação permite. Se o sócio trabalha na empresa, o pró-labore precisa ser analisado.",
      },
    ],
    relatedTool: {
      title: "Simulador de Contratação",
      href: "/ferramentas/simulador-contratacao",
      description: "Entenda custos trabalhistas, encargos e impacto de folha no negócio.",
    },
    relatedSlugs: ["simples-nacional-prestador-servico", "quanto-pj-paga-de-imposto-por-faturamento", "quanto-custa-funcionario-clt"],
  },
  {
    slug: "pj-para-uma-unica-empresa-pode",
    title: "Posso trabalhar como PJ para uma única empresa? Impostos e riscos",
    metaTitle: "PJ para uma única empresa pode?",
    metaDescription:
      "Entenda se trabalhar como PJ para uma única empresa é permitido, quais riscos trabalhistas existem e quanto reservar para impostos.",
    excerpt:
      "Trabalhar como PJ para um único cliente não é automaticamente ilegal, mas exclusividade, subordinação e horário fixo aumentam riscos.",
    pillar: "contratos",
    coverImage: "/blog/covers/pj-para-uma-unica-empresa-pode.jpg",
    coverImageAlt: "Homem pensativo lendo um documento com o notebook à frente",
    publishedAt: "2026-04-07",
    updatedAt: "2026-04-07",
    readingTimeMinutes: 7,
    sections: [
      {
        type: "paragraph",
        text: "Receber uma proposta para trabalhar como PJ para uma única empresa é comum entre desenvolvedores, consultores, profissionais administrativos, marketing e prestadores especializados. Isso não é automaticamente ilegal, mas precisa ser estruturado com cuidado.",
      },
      {
        type: "heading",
        level: 2,
        text: "O que gera risco trabalhista",
        id: "risco",
      },
      {
        type: "list",
        items: [
          "Subordinação direta como empregado.",
          "Horário fixo controlado como CLT.",
          "Pessoalidade absoluta, sem possibilidade real de substituição.",
          "Exclusividade prática sem autonomia.",
          "Rotina idêntica à de funcionário interno.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "O que organizar no contrato",
        id: "contrato",
      },
      {
        type: "paragraph",
        text: "O contrato deve deixar claro escopo, entregas, prazo, forma de pagamento, autonomia técnica, confidencialidade, propriedade intelectual e condições de encerramento. Quanto mais o acordo parecer prestação de serviço real, menor o risco de confusão.",
      },
      {
        type: "heading",
        level: 2,
        text: "Impostos e retirada",
        id: "impostos",
      },
      {
        type: "paragraph",
        text: "A PJ precisa reservar dinheiro para DAS, pró-labore, INSS, honorário contábil e caixa. O valor que cai na conta não é salário líquido. Sem reserva, o imposto vira surpresa.",
      },
      {
        type: "callout",
        title: "PJ não é só emitir nota",
        text: "Você precisa de CNAE correto, contrato coerente, rotina fiscal e separação entre dinheiro da empresa e dinheiro pessoal.",
      },
    ],
    faq: [
      {
        question: "PJ para uma única empresa é ilegal?",
        answer:
          "Não automaticamente. O risco aparece quando a relação tem características de emprego, como subordinação, horário fixo e ausência de autonomia.",
      },
      {
        question: "Preciso emitir nota todo mês?",
        answer:
          "Se há prestação mensal para empresa, a emissão de nota fiscal normalmente será exigida pelo contratante.",
      },
      {
        question: "Quanto devo reservar de imposto?",
        answer:
          "Depende do anexo, atividade e pró-labore. A reserva deve considerar DAS, INSS, contabilidade e caixa.",
      },
    ],
    relatedTool: {
      title: "Gerador de Contrato",
      href: "/ferramentas/gerador-contrato",
      description: "Monte um contrato de prestação de serviço com escopo, prazo e pagamento claros.",
    },
    relatedSlugs: ["o-que-nao-pode-faltar-contrato-prestacao-servico", "quanto-pj-paga-de-imposto-por-faturamento", "rpa-ou-nota-fiscal-prestador-servico"],
  },
  {
    slug: "mei-pode-receber-pix-na-conta-pessoal",
    title: "MEI pode receber Pix na conta pessoal? Veja o que entra no faturamento",
    metaTitle: "MEI pode receber Pix no CPF?",
    metaDescription:
      "Entenda se MEI pode receber Pix na conta pessoal, o que entra no faturamento, transferência própria, nota fiscal e Imposto de Renda.",
    excerpt:
      "Pix é só meio de pagamento. O que define se entra no faturamento é a natureza do valor recebido.",
    pillar: "mei",
    coverImage: "/blog/covers/mei-pode-receber-pix-na-conta-pessoal.jpg",
    coverImageAlt: "Pessoa aproximando o celular de uma maquininha de cartão para pagamento",
    publishedAt: "2026-03-26",
    updatedAt: "2026-03-26",
    readingTimeMinutes: 6,
    sections: [
      {
        type: "paragraph",
        text: "MEI pode receber por Pix, mas precisa entender uma coisa: Pix não é imposto nem categoria de receita. Pix é só o meio de pagamento. O que importa é a origem do valor.",
      },
      {
        type: "heading",
        level: 2,
        text: "Recebimento de cliente é faturamento",
        id: "cliente",
      },
      {
        type: "paragraph",
        text: "Se o Pix veio de cliente por venda ou serviço, ele entra no faturamento do MEI, mesmo que tenha caído na conta pessoal. A conta usada não muda a natureza da receita.",
      },
      {
        type: "heading",
        level: 2,
        text: "Transferência própria não é receita",
        id: "transferencia",
      },
      {
        type: "paragraph",
        text: "Transferir dinheiro entre suas próprias contas não é faturamento. O problema é quando tudo fica misturado e você não consegue provar o que veio de cliente, o que era transferência própria e o que era despesa pessoal.",
      },
      {
        type: "list",
        items: [
          "Recebimento de cliente entra no faturamento.",
          "Pix entre contas próprias não é receita.",
          "Nota fiscal segue a regra do cliente e da operação.",
          "Declaração anual do MEI deve refletir o faturamento real.",
          "Imposto de Renda da pessoa física pode exigir atenção ao lucro recebido.",
        ],
      },
      {
        type: "callout",
        title: "Conta PJ evita confusão",
        text: "Mesmo quando não é obrigatório, separar conta pessoal e conta da empresa facilita controle, declaração e prova de origem dos valores.",
      },
    ],
    faq: [
      {
        question: "Pix no CPF entra no limite do MEI?",
        answer:
          "Entra quando o valor é pagamento de cliente por venda ou serviço do MEI.",
      },
      {
        question: "Preciso emitir nota por todo Pix recebido?",
        answer:
          "Depende de quem é o cliente e da operação. Para cliente empresa, nota fiscal é obrigatória.",
      },
      {
        question: "Pix é informado na DASN-SIMEI?",
        answer:
          "A declaração anual informa faturamento, não o meio de pagamento. Receitas recebidas por Pix entram no total quando forem vendas ou serviços.",
      },
    ],
    relatedTool: {
      title: "Fale com a gente",
      href: TROPA_WHATSAPP_LINK,
      description: "Organize seu MEI para emitir nota e separar melhor as finanças.",
    },
    relatedSlugs: ["como-emitir-nota-fiscal-mei", "o-que-e-das-mei-como-pagar", "quanto-custa-um-contador-para-mei"],
  },
  {
    slug: "cnae-errado-aumenta-imposto-exclui-simples",
    title: "CNAE errado pode aumentar o imposto ou excluir sua empresa do Simples?",
    metaTitle: "CNAE errado exclui do Simples Nacional?",
    metaDescription:
      "Entenda como CNAE principal e secundário afetam anexos, licenças, inscrição municipal, imposto e permanência no Simples Nacional.",
    excerpt:
      "CNAE errado não é detalhe de cadastro. Ele pode mudar anexo, travar nota, exigir licença ou impedir o Simples.",
    pillar: "mei",
    coverImage: "/blog/covers/cnae-errado-aumenta-imposto-exclui-simples.jpg",
    coverImageAlt: "Mãos conferindo um formulário com caneta vermelha ao lado do notebook",
    publishedAt: "2026-05-13",
    updatedAt: "2026-05-13",
    readingTimeMinutes: 7,
    sections: [
      {
        type: "paragraph",
        text: "O CNAE é o código que identifica a atividade econômica da empresa. Ele influencia tributação, emissão de nota, licenças, inscrição municipal ou estadual e possibilidade de optar pelo Simples Nacional.",
      },
      {
        type: "heading",
        level: 2,
        text: "CNAE principal e secundário",
        id: "principal-secundario",
      },
      {
        type: "paragraph",
        text: "O CNAE principal representa a atividade mais relevante da empresa. CNAEs secundários permitem outras atividades. O problema aparece quando o cadastro não combina com o serviço realmente prestado.",
      },
      {
        type: "heading",
        level: 2,
        text: "Como o CNAE muda imposto",
        id: "imposto",
      },
      {
        type: "paragraph",
        text: "No Simples, o CNAE ajuda a definir anexo e tratamento tributário. Um serviço pode cair no Anexo III ou V, por exemplo, com grande diferença de alíquota. Em alguns casos, o CNAE pode ser impeditivo ao Simples.",
      },
      {
        type: "list",
        items: [
          "Atividade realmente exercida precisa bater com o cadastro.",
          "CNAE impeditivo pode barrar Simples Nacional.",
          "CNAE errado pode exigir inscrição estadual ou municipal indevida.",
          "Licenças e alvarás podem mudar conforme atividade.",
          "Correção pode exigir alteração contratual.",
        ],
      },
      {
        type: "callout",
        title: "Corrigir antes evita bloqueio",
        text: "Se a empresa mudou de atividade, revise CNAE antes de emitir notas em volume ou fazer nova opção pelo Simples.",
      },
    ],
    faq: [
      {
        question: "CNAE errado pode excluir do Simples?",
        answer:
          "Pode, se a atividade for impeditiva ou se houver inconsistência relevante entre cadastro, atividade e regra do regime.",
      },
      {
        question: "Posso ter mais de um CNAE?",
        answer:
          "Sim. A empresa pode ter CNAE principal e secundários, desde que as atividades sejam compatíveis e regularizadas.",
      },
      {
        question: "Como corrigir CNAE?",
        answer:
          "Normalmente por alteração cadastral ou contratual, com reflexos em Receita, prefeitura, estado e licenças quando necessário.",
      },
    ],
    relatedTool: {
      title: "Alteração contratual",
      href: "/hub?tab=ferramentas",
      description: "Solicite alteração de atividade e ajuste cadastral pelo Hub.",
    },
    relatedSlugs: ["simples-nacional-prestador-servico", "inscricao-municipal-para-prestador-servico", "cnpj-excluido-do-simples-pela-prefeitura"],
  },
]
