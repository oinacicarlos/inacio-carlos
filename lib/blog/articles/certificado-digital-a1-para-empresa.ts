import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "certificado-digital-a1-para-empresa",
  title: "Certificado digital A1: quando sua empresa precisa",
  metaTitle: "Certificado digital A1 para empresa",
  metaDescription:
    "Entenda para que serve o certificado digital A1, quando ele é necessário e por que empresas usam para nota fiscal e assinaturas.",
  excerpt:
    "O certificado A1 funciona como uma identidade digital da empresa. Ele pode ser necessário para emitir notas, assinar documentos e acessar sistemas.",
  pillar: "mei",
  coverImage: "/blog/covers/como-abrir-mei-passo-a-passo.jpg",
  coverImageAlt: "Pessoa usando notebook com documentos digitais abertos",
  publishedAt: "2026-08-03",
  updatedAt: "2026-08-03",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "Certificado digital é uma identidade eletrônica. Para empresas, ele confirma que quem está acessando um sistema, assinando um documento ou emitindo uma nota é realmente aquele CNPJ. O modelo A1 é um arquivo digital, normalmente válido por um ano.",
    },
    {
      type: "heading",
      level: 2,
      text: "Para que serve o certificado A1",
      id: "para-que-serve",
    },
    {
      type: "list",
      items: [
        "Emitir nota fiscal em sistemas que exigem certificado.",
        "Assinar contratos e documentos digitalmente.",
        "Acessar portais públicos com mais segurança.",
        "Automatizar rotinas fiscais e contábeis com autorização da empresa.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Diferença entre A1 e A3",
      id: "diferenca-a1-a3",
    },
    {
      type: "paragraph",
      text: "O certificado A1 fica instalado como arquivo no computador ou em sistemas autorizados. O A3 depende de token, cartão ou dispositivo físico. Para rotinas online e integrações, o A1 costuma ser mais prático, porque permite automações sem depender de um item físico conectado.",
    },
    {
      type: "table",
      headers: ["Modelo", "Como funciona", "Uso mais comum"],
      rows: [
        ["A1", "Arquivo digital com validade anual", "Emissão de notas e rotinas integradas"],
        ["A3", "Token ou cartão físico", "Assinaturas e acessos pontuais"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "MEI precisa de certificado digital?",
      id: "mei-precisa",
    },
    {
      type: "paragraph",
      text: "Depende do município, do tipo de nota e do sistema usado. Muitos MEIs conseguem emitir nota de serviço pelo emissor nacional sem certificado. Mesmo assim, alguns portais, prefeituras, clientes ou operações específicas podem exigir certificado digital.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que preparar antes de emitir",
      id: "o-que-preparar",
    },
    {
      type: "list",
      items: [
        "Documento de identificação do responsável.",
        "CPF e dados cadastrais atualizados.",
        "CNPJ ativo e sem divergências cadastrais.",
        "Acesso ao e-mail e telefone usados na validação.",
      ],
    },
    {
      type: "callout",
      title: "Guarde o arquivo com cuidado",
      text: "O A1 representa a identidade digital da empresa. Não envie o arquivo e a senha para qualquer pessoa. Use apenas com fornecedores e sistemas confiáveis.",
    },
  ],
  faq: [
    {
      question: "Certificado A1 é obrigatório para toda empresa?",
      answer:
        "Não. A obrigação depende do tipo de empresa, do sistema usado e das operações realizadas. Mesmo quando não é obrigatório, pode facilitar emissão de notas e assinaturas.",
    },
    {
      question: "Certificado digital substitui assinatura em papel?",
      answer:
        "Em muitos casos, sim. Ele permite assinatura eletrônica com validade jurídica, desde que o documento e a plataforma estejam adequados.",
    },
    {
      question: "Posso usar certificado PF para minha empresa?",
      answer:
        "Certificado PF identifica a pessoa física. Para operações do CNPJ, normalmente o correto é usar certificado PJ.",
    },
  ],
  relatedTool: {
    title: "Comprar certificado",
    href: "/hub?tab=ferramentas",
    description: "Contrate certificado digital pelo Hub e siga o passo a passo com a equipe.",
  },
  relatedSlugs: ["como-emitir-nota-fiscal-mei", "simples-nacional-prestador-servico", "como-abrir-mei-passo-a-passo"],
}
