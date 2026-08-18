import type { BlogArticle } from "@/lib/blog/types"

// como-voltar-a-ser-mei-depois-do-desenquadramento, cnpj-excluido-do-simples-pela-prefeitura
// e cnpj-inapto-por-omissao-de-declaracoes ficaram temporariamente fora deste
// array (não removidos do repo, só desconectados do índice em ./index.ts) —
// têm "CNPJ"/"MEI" no título, o que a política de Documentos e Serviços
// Governamentais do Google Ads restringe. Religar quando resolver isso.
export const regularizacaoConversaoArticles: BlogArticle[] = [
  {
    slug: "empresa-sem-faturamento-obrigacoes-mensais",
    title: "Empresa sem faturamento: quais declarações ainda precisam ser entregues?",
    metaTitle: "Empresa sem faturamento: obrigações mensais",
    metaDescription:
      "Veja obrigações de MEI, Simples, Lucro Presumido e empresa inativa, incluindo PGDAS-D zerado, DCTFWeb, EFD-Reinf e DEFIS.",
    excerpt:
      "Empresa sem receita não significa empresa sem obrigação. Em muitos casos, declarações zeradas continuam sendo necessárias.",
    pillar: "mei",
    coverImage: "/blog/covers/empresa-sem-faturamento-obrigacoes-mensais.jpg",
    coverImageAlt: "Mesas de escritório modernas com notebooks, sem ninguém por perto",
    publishedAt: "2026-06-06",
    updatedAt: "2026-06-06",
    readingTimeMinutes: 7,
    sections: [
      {
        type: "paragraph",
        text: "Ficar um mês sem faturar não encerra as obrigações da empresa. A Receita e os sistemas fiscais precisam saber que não houve receita, movimento ou fato gerador. Por isso existem declarações zeradas e obrigações sem movimento.",
      },
      {
        type: "heading",
        level: 2,
        text: "Sem faturamento não é sempre inativa",
        id: "sem-faturamento-inativa",
      },
      {
        type: "paragraph",
        text: "Empresa sem faturamento é aquela que não vendeu no período. Empresa realmente inativa é uma situação mais restrita, sem atividade operacional, patrimonial, financeira ou não operacional. Essa diferença muda obrigações.",
      },
      {
        type: "table",
        headers: ["Tipo de empresa", "Atenção principal"],
        rows: [
          ["MEI", "DAS mensal e DASN-SIMEI anual, mesmo sem receita"],
          ["Simples Nacional", "PGDAS-D zerado quando não há receita no mês"],
          ["Lucro Presumido", "Obrigações federais e acessórias conforme movimento"],
          ["Sem movimento", "DCTFWeb e EFD-Reinf podem exigir envio em situações específicas"],
          ["Inativa", "Declaração de inatividade depende do enquadramento e do período"],
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "PGDAS-D zerado",
        id: "pgdas-zerado",
      },
      {
        type: "paragraph",
        text: "Empresa do Simples sem receita no mês continua obrigada a transmitir o PGDAS-D com valor zero. Não transmitir pode gerar pendência e atrapalhar certidões, opção pelo Simples e regularidade.",
      },
      {
        type: "heading",
        level: 2,
        text: "Multas e pendências",
        id: "multas",
      },
      {
        type: "paragraph",
        text: "Declarações atrasadas podem gerar multa mesmo quando não havia imposto a pagar. Por isso, a rotina mensal não deve parar só porque a empresa ficou sem faturamento.",
      },
    ],
    faq: [
      {
        question: "Empresa do Simples sem faturamento entrega PGDAS-D?",
        answer: "Sim. Quando não há receita, o PGDAS-D deve ser transmitido zerado.",
      },
      {
        question: "MEI sem faturamento paga DAS?",
        answer:
          "Sim. O DAS do MEI é mensal e fixo, mesmo quando não houve faturamento.",
      },
      {
        question: "DCTFWeb sem movimento é mensal?",
        answer:
          "A regra depende da situação e do período. Em geral, o envio sem movimento costuma ser exigido em momentos específicos, mas precisa ser conferido no caso concreto.",
      },
    ],
    relatedTool: {
      title: "Faturamento",
      href: "/hub?tab=assinatura",
      description: "Organize vencimentos, plano e cobranças em um só lugar.",
    },
    relatedSlugs: ["simples-nacional-setembro-2026-quem-precisa-solicitar", "o-que-e-das-mei-como-pagar"],
  },
  {
    slug: "como-emitir-primeira-nota-fiscal-servico-rio-de-janeiro",
    title: "Como emitir a primeira nota fiscal de serviço no Rio de Janeiro",
    metaTitle: "Primeira nota fiscal de serviço no Rio de Janeiro",
    metaDescription:
      "Veja como emitir a primeira nota fiscal de serviço no RJ, incluindo Nota Carioca, MEI, Simples, inscrição municipal e erros comuns.",
    excerpt:
      "No Rio de Janeiro, empresa recém-aberta às vezes não consegue emitir nota mesmo estando regular no Simples. Veja onde costuma travar: inscrição municipal ou emissor.",
    pillar: "mei",
    coverImage: "/blog/covers/como-emitir-primeira-nota-fiscal-servico-rio-de-janeiro.jpg",
    coverImageAlt: "Vista aérea do Rio de Janeiro com o Pão de Açúcar ao fundo",
    publishedAt: "2026-02-18",
    updatedAt: "2026-02-18",
    readingTimeMinutes: 7,
    sections: [
      {
        type: "paragraph",
        text: "Emitir a primeira nota fiscal de serviço no Rio de Janeiro pode parecer simples, mas empresas recém-abertas enfrentam travas comuns: inscrição municipal ainda não sincronizada, código de serviço incorreto, alíquota zerada ou emissor liberado apenas para MEI.",
      },
      {
        type: "heading",
        level: 2,
        text: "Nota Carioca ou Emissor Nacional",
        id: "nota-carioca-emissor",
      },
      {
        type: "paragraph",
        text: "MEI prestador pode usar o Emissor Nacional de NFS-e. Empresas do Simples que não são MEI normalmente precisam observar a regra municipal e o acesso à Nota Carioca, conforme atividade, inscrição e cadastro.",
      },
      {
        type: "heading",
        level: 2,
        text: "O que conferir antes da primeira emissão",
        id: "conferir",
      },
      {
        type: "list",
        items: [
          "CNPJ ativo.",
          "Opção pelo Simples, quando aplicável.",
          "Inscrição municipal liberada.",
          "Alvará ou viabilidade, quando exigido.",
          "Código de serviço correto.",
          "Acesso ao portal da prefeitura ou emissor correto.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Erros comuns",
        id: "erros",
      },
      {
        type: "table",
        headers: ["Erro", "Possível causa"],
        rows: [
          ["Emissão permitida somente para MEI", "Empresa tentando usar emissor incompatível"],
          ["Alíquota zerada ou bloqueada", "Cadastro municipal ou código de serviço pendente"],
          ["Empresa não encontrada", "Tempo de sincronização após abertura"],
          ["ISS incorreto", "Código de serviço ou regime informado errado"],
        ],
      },
      {
        type: "callout",
        title: "Não espere o cliente cobrar",
        text: "Teste o acesso ao emissor logo após a abertura. Se a primeira nota travar, ainda há tempo de corrigir cadastro antes do vencimento do pagamento.",
      },
    ],
    faq: [
      {
        question: "Empresa no RJ pode emitir pelo Emissor Nacional?",
        answer:
          "MEI prestador usa o Emissor Nacional. Empresas do Simples que não são MEI precisam verificar a regra municipal e a Nota Carioca.",
      },
      {
        question: "Minha empresa aparece no Simples, mas não emite nota. O que fazer?",
        answer:
          "Confira inscrição municipal, liberação da prefeitura, código de serviço e prazo de sincronização após a abertura.",
      },
      {
        question: "Alíquota zerada significa isenção?",
        answer:
          "Não necessariamente. Pode ser erro de cadastro ou bloqueio operacional do emissor.",
      },
    ],
    relatedTool: {
      title: "Nota fiscal avulsa",
      href: "/hub?tab=ferramentas",
      description: "Envie os dados da nota para a equipe revisar e emitir.",
    },
    relatedSlugs: ["inscricao-municipal-para-prestador-servico", "como-emitir-nota-fiscal-mei"],
  },
]
