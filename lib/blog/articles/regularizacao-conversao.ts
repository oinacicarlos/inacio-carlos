import type { BlogArticle } from "@/lib/blog/types"

export const regularizacaoConversaoArticles: BlogArticle[] = [
  {
    slug: "como-voltar-a-ser-mei-depois-do-desenquadramento",
    title: "Como voltar a ser MEI depois do desenquadramento",
    metaTitle: "Como voltar a ser MEI depois de desenquadrado",
    metaDescription:
      "Entenda quando é possível voltar ao MEI com o mesmo CNPJ, quais opções fazer e quais pendências regularizar antes.",
    excerpt:
      "Nem sempre é preciso fechar o CNPJ e abrir outro. Em muitos casos, a empresa pode voltar ao SIMEI quando cumpre as condições.",
    pillar: "mei",
    coverImage: "/blog/covers/mei-ou-me-quando-migrar.jpg",
    coverImageAlt: "Pessoa analisando enquadramento de uma empresa no computador",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    readingTimeMinutes: 6,
    sections: [
      {
        type: "paragraph",
        text: "Ser desenquadrado do MEI não significa, automaticamente, que o CNPJ precisa ser fechado. Se a empresa voltar a cumprir as condições do MEI, pode solicitar novamente o enquadramento no SIMEI no período correto.",
      },
      {
        type: "heading",
        level: 2,
        text: "Quando dá para voltar",
        id: "quando-da",
      },
      {
        type: "list",
        items: [
          "A atividade precisa ser permitida para MEI.",
          "O faturamento precisa estar dentro do limite permitido.",
          "A empresa não pode ter sócio.",
          "O titular não pode participar de outra empresa em situação impeditiva.",
          "Pendências fiscais e cadastrais precisam estar controladas.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Quais opções podem ser necessárias",
        id: "opcoes",
      },
      {
        type: "paragraph",
        text: "Dependendo da situação, pode ser necessário solicitar opção pelo Simples Nacional e opção pelo SIMEI. O SIMEI é o enquadramento específico do MEI dentro do Simples. Por isso, estar no Simples não significa, sozinho, estar no MEI.",
      },
      {
        type: "heading",
        level: 2,
        text: "Precisa abrir outro CNPJ?",
        id: "outro-cnpj",
      },
      {
        type: "paragraph",
        text: "Na maioria dos casos, a primeira análise deve ser feita no CNPJ atual. Fechar e abrir outro sem entender a pendência pode criar mais problemas, principalmente se houver débitos, declarações atrasadas ou notas emitidas depois do desenquadramento.",
      },
      {
        type: "callout",
        title: "Cuidado com o prazo",
        text: "A volta ao SIMEI depende do período de opção e das condições da empresa naquele momento. Não deixe para conferir a situação no último dia.",
      },
    ],
    faq: [
      {
        question: "Posso voltar ao MEI com o mesmo CNPJ?",
        answer:
          "Sim, quando a empresa volta a cumprir as condições e faz as opções necessárias no prazo aplicável.",
      },
      {
        question: "Estar no Simples é o mesmo que estar no MEI?",
        answer:
          "Não. O MEI está dentro do Simples, mas tem enquadramento próprio no SIMEI.",
      },
      {
        question: "Débitos impedem voltar ao MEI?",
        answer:
          "Podem impedir ou travar o deferimento. O ideal é consultar e regularizar antes do prazo de opção.",
      },
    ],
    relatedTool: {
      title: "Solicitar regularização",
      href: "/hub?tab=solicitacoes",
      description: "Peça uma análise da possibilidade de voltar ao MEI.",
    },
    relatedSlugs: ["fui-desenquadrado-do-mei-continuei-emitindo-notas", "mei-ultrapassou-limite-proporcional-primeiro-ano", "mei-ou-me-quando-migrar"],
  },
  {
    slug: "empresa-sem-faturamento-obrigacoes-mensais",
    title: "Empresa sem faturamento: quais declarações ainda precisam ser entregues?",
    metaTitle: "Empresa sem faturamento: obrigações mensais",
    metaDescription:
      "Veja obrigações de MEI, Simples, Lucro Presumido e empresa inativa, incluindo PGDAS-D zerado, DCTFWeb, EFD-Reinf e DEFIS.",
    excerpt:
      "Empresa sem receita não significa empresa sem obrigação. Em muitos casos, declarações zeradas continuam sendo necessárias.",
    pillar: "mei",
    coverImage: "/blog/covers/o-que-e-das-mei-como-pagar.jpg",
    coverImageAlt: "Empresário conferindo declarações fiscais em uma mesa",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
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
    relatedSlugs: ["fui-desenquadrado-do-mei-continuei-emitindo-notas", "simples-nacional-setembro-2026-quem-precisa-solicitar", "o-que-e-das-mei-como-pagar"],
  },
  {
    slug: "cnpj-excluido-do-simples-pela-prefeitura",
    title: "CNPJ excluído do Simples Nacional pela prefeitura: como descobrir e regularizar",
    metaTitle: "CNPJ excluído do Simples pela prefeitura",
    metaDescription:
      "Entenda exclusão do Simples por débito municipal, ISS, inscrição municipal irregular, alvará pendente e como regularizar.",
    excerpt:
      "Débito de ISS, inscrição municipal irregular e alvará pendente podem gerar exclusão municipal do Simples. Veja como agir.",
    pillar: "mei",
    coverImage: "/blog/covers/como-trocar-de-contador.jpg",
    coverImageAlt: "Pessoa consultando situação municipal de um CNPJ",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    readingTimeMinutes: 7,
    sections: [
      {
        type: "paragraph",
        text: "A exclusão do Simples Nacional pode ter origem municipal. Isso acontece quando a prefeitura aponta pendências como débito de ISS, inscrição municipal irregular, falta de alvará ou descumprimento de obrigação local.",
      },
      {
        type: "heading",
        level: 2,
        text: "Como descobrir o motivo",
        id: "motivo",
      },
      {
        type: "list",
        items: [
          "Consultar o termo de exclusão no Portal do Simples Nacional.",
          "Verificar débitos municipais no portal da prefeitura.",
          "Consultar inscrição municipal e alvará.",
          "Conferir notificações no DTE-SN e canais oficiais.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Débito de ISS",
        id: "iss",
      },
      {
        type: "paragraph",
        text: "Prestadores de serviço precisam olhar o ISS com cuidado. Débito municipal pode não aparecer da mesma forma que débito federal, mas ainda assim impedir permanência ou nova opção pelo Simples.",
      },
      {
        type: "heading",
        level: 2,
        text: "Impugnação ou regularização",
        id: "impugnacao",
      },
      {
        type: "paragraph",
        text: "Se a cobrança estiver errada, pode haver caminho de impugnação. Se estiver correta, a empresa precisa pagar ou parcelar. Depois, pode ser necessário acompanhar a baixa da pendência e a nova opção pelo Simples no prazo correto.",
      },
      {
        type: "callout",
        title: "Rio e Baixada merecem atenção local",
        text: "Empresas no Rio de Janeiro, Nova Iguaçu e outras cidades precisam conferir portais municipais, Nota Carioca, inscrição municipal e ISS separadamente da Receita Federal.",
      },
    ],
    faq: [
      {
        question: "Dívida municipal pode tirar empresa do Simples?",
        answer:
          "Sim. Débitos e irregularidades municipais podem fundamentar termo de exclusão.",
      },
      {
        question: "Depois de pagar, volto automaticamente?",
        answer:
          "Nem sempre. Pode ser necessário acompanhar a baixa da pendência e fazer nova opção pelo Simples no prazo aplicável.",
      },
      {
        question: "Posso contestar termo de exclusão?",
        answer:
          "Quando há erro ou discussão válida, pode haver impugnação dentro do prazo. É importante ler o termo e seus fundamentos.",
      },
    ],
    relatedTool: {
      title: "Nova solicitação",
      href: "/hub?tab=solicitacoes",
      description: "Peça ajuda para entender termo de exclusão e pendências municipais.",
    },
    relatedSlugs: ["inscricao-municipal-para-prestador-servico", "simples-nacional-setembro-2026-quem-precisa-solicitar", "como-emitir-primeira-nota-fiscal-servico-rio-de-janeiro"],
  },
  {
    slug: "cnpj-inapto-por-omissao-de-declaracoes",
    title: "CNPJ inapto por omissão de declarações: passo a passo para regularizar",
    metaTitle: "CNPJ inapto por omissão de declarações",
    metaDescription:
      "Veja como descobrir declarações faltantes, diferença entre inapto, suspenso e baixado, e como regularizar a situação cadastral.",
    excerpt:
      "CNPJ inapto costuma indicar omissão de declarações. A empresa precisa descobrir o que falta antes de tentar emitir nota ou pedir certidão.",
    pillar: "mei",
    coverImage: "/blog/covers/como-trocar-de-contador.jpg",
    coverImageAlt: "Tela com consulta cadastral de CNPJ e documentos pendentes",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    readingTimeMinutes: 7,
    sections: [
      {
        type: "paragraph",
        text: "CNPJ inapto é uma situação cadastral séria. Em muitos casos, ela aparece porque a empresa deixou de entregar declarações obrigatórias por períodos seguidos. Enquanto não regulariza, pode ter dificuldade para emitir nota, abrir conta, obter certidão e operar normalmente.",
      },
      {
        type: "heading",
        level: 2,
        text: "Inapto, suspenso e baixado",
        id: "diferenca",
      },
      {
        type: "table",
        headers: ["Situação", "O que indica"],
        rows: [
          ["Inapto", "Omissão de declarações ou irregularidade cadastral relevante"],
          ["Suspenso", "Cadastro com pendência temporária ou análise"],
          ["Baixado", "CNPJ encerrado"],
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Como descobrir o que falta",
        id: "descobrir",
      },
      {
        type: "list",
        items: [
          "Consultar situação cadastral do CNPJ.",
          "Acessar o e-CAC com certificado ou procuração.",
          "Verificar pendências fiscais e omissões de declarações.",
          "Separar períodos faltantes por regime tributário.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Precisa pagar todas as dívidas primeiro?",
        id: "dividas",
      },
      {
        type: "paragraph",
        text: "Nem sempre a situação inapta é resolvida só com pagamento. Quando o problema é cadastral por omissão, entregar as declarações faltantes costuma ser o primeiro passo. Dívidas podem continuar existindo e precisar de pagamento ou parcelamento depois.",
      },
      {
        type: "callout",
        title: "Regularização tem ordem",
        text: "Descubra declarações faltantes, entregue o que estiver pendente, acompanhe a situação cadastral e só então trate certidões e débitos remanescentes.",
      },
    ],
    faq: [
      {
        question: "CNPJ inapto pode emitir nota?",
        answer:
          "Normalmente encontra bloqueios ou restrições. O ideal é regularizar a situação cadastral antes de tentar faturar.",
      },
      {
        question: "Quanto tempo demora para voltar a ativo?",
        answer:
          "Depende do volume de declarações, processamento dos sistemas e existência de outras pendências.",
      },
      {
        question: "Inapto é o mesmo que baixado?",
        answer:
          "Não. Inapto indica irregularidade. Baixado indica encerramento do CNPJ.",
      },
    ],
    relatedTool: {
      title: "Fale com a Tropa",
      href: "/hub?tab=solicitacoes",
      description: "Envie o CNPJ para análise das pendências e próximo passo.",
    },
    relatedSlugs: ["empresa-sem-faturamento-obrigacoes-mensais", "cnpj-excluido-do-simples-pela-prefeitura", "como-voltar-a-ser-mei-depois-do-desenquadramento"],
  },
  {
    slug: "como-emitir-primeira-nota-fiscal-servico-rio-de-janeiro",
    title: "Como emitir a primeira nota fiscal de serviço no Rio de Janeiro",
    metaTitle: "Primeira nota fiscal de serviço no Rio de Janeiro",
    metaDescription:
      "Veja como emitir a primeira nota fiscal de serviço no RJ, incluindo Nota Carioca, MEI, Simples, inscrição municipal e erros comuns.",
    excerpt:
      "Empresa recém-aberta no Rio pode estar no Simples e ainda não conseguir emitir nota. O problema costuma estar na inscrição municipal ou no emissor.",
    pillar: "mei",
    coverImage: "/blog/covers/como-emitir-nota-fiscal-mei.jpg",
    coverImageAlt: "Empreendedor emitindo nota fiscal de serviço no computador",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
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
    relatedSlugs: ["inscricao-municipal-para-prestador-servico", "como-emitir-nota-fiscal-mei", "cnpj-excluido-do-simples-pela-prefeitura"],
  },
]
