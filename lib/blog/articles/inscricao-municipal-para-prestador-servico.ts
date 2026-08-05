import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "inscricao-municipal-para-prestador-servico",
  title: "Inscrição municipal: por que prestador de serviço precisa",
  metaTitle: "Inscrição municipal para prestador de serviço",
  metaDescription:
    "Entenda o que é inscrição municipal, por que ela é necessária para emitir nota de serviço e como evitar bloqueios na prefeitura.",
  excerpt:
    "Abrir empresa não resolve tudo sozinho. Para emitir nota de serviço, muitos prestadores precisam regularizar a inscrição municipal.",
  pillar: "mei",
  coverImage: "/blog/covers/como-trocar-de-contador.jpg",
  coverImageAlt: "Pessoa conferindo cadastro empresarial em um notebook",
  publishedAt: "2026-08-03",
  updatedAt: "2026-08-03",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "A inscrição municipal é o cadastro da empresa na prefeitura. Para prestadores de serviço, ela costuma ser essencial porque o ISS é um imposto municipal e a nota fiscal de serviço passa pelo sistema da cidade ou pelo padrão nacional integrado a ela.",
    },
    {
      type: "heading",
      level: 2,
      text: "CNPJ e inscrição municipal não são a mesma coisa",
      id: "cnpj-e-inscricao",
    },
    {
      type: "paragraph",
      text: "O CNPJ nasce na Receita Federal. A inscrição municipal liga esse CNPJ à prefeitura. Em muitos casos, a empresa até existe, mas ainda não consegue emitir nota de serviço porque falta concluir o cadastro municipal.",
    },
    {
      type: "heading",
      level: 2,
      text: "Quando ela é necessária",
      id: "quando-necessaria",
    },
    {
      type: "list",
      items: [
        "Quando a empresa presta serviço sujeito ao ISS.",
        "Quando precisa emitir nota fiscal de serviço.",
        "Quando a prefeitura exige cadastro para liberar o emissor.",
        "Quando o cliente exige nota e o CNPJ ainda não aparece habilitado.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "O que pode travar a inscrição",
      id: "o-que-trava",
    },
    {
      type: "paragraph",
      text: "Cada cidade tem seu próprio procedimento. Alguns municípios liberam rapidamente. Outros pedem documentos do imóvel, viabilidade, senha web, certificado digital, comprovante de endereço ou análise manual.",
    },
    {
      type: "table",
      headers: ["Problema comum", "Consequência"],
      rows: [
        ["Endereço incompatível", "Cadastro pode ficar em análise ou ser recusado"],
        ["Atividade errada", "Nota fiscal pode sair com serviço incorreto"],
        ["Senha da prefeitura pendente", "Empresa não consegue acessar o emissor"],
        ["Dados divergentes", "Cliente não consegue validar a nota"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Como evitar retrabalho",
      id: "como-evitar",
    },
    {
      type: "paragraph",
      text: "Antes de abrir ou alterar o CNPJ, confira se a atividade escolhida combina com o serviço real, se o endereço pode receber aquele tipo de empresa e qual portal a prefeitura usa para nota fiscal. Isso reduz muito a chance de abrir a empresa e só descobrir o problema quando precisar faturar.",
    },
    {
      type: "callout",
      title: "Nota fiscal depende do cadastro certo",
      text: "Se o objetivo é prestar serviço para empresas, pense no caminho completo: CNPJ, inscrição municipal, acesso ao emissor e rotina de notas.",
    },
  ],
  faq: [
    {
      question: "Todo MEI precisa de inscrição municipal?",
      answer:
        "MEIs prestadores de serviço geralmente precisam estar cadastrados no município para emitir nota de serviço. A forma de liberação varia conforme a prefeitura.",
    },
    {
      question: "Posso emitir nota sem inscrição municipal?",
      answer:
        "Em muitos municípios, não. A inscrição é justamente o cadastro que habilita a empresa para emitir nota de serviço.",
    },
    {
      question: "Inscrição municipal tem custo?",
      answer:
        "Depende da cidade e do tipo de processo. A abertura do MEI é gratuita, mas alguns municípios podem ter procedimentos próprios para liberação de acesso.",
    },
  ],
  relatedTool: {
    title: "Abrir Empresa",
    href: "/abrir-empresa",
    description: "Comece com o enquadramento certo para não travar na hora de emitir nota.",
  },
  relatedSlugs: ["como-abrir-mei-passo-a-passo", "como-emitir-nota-fiscal-mei", "simples-nacional-prestador-servico"],
}
