import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "como-abrir-mei-passo-a-passo",
  title: "Como abrir um MEI passo a passo",
  metaTitle: "Como abrir um MEI: passo a passo completo",
  metaDescription:
    "Veja o passo a passo completo para abrir um MEI: documentos necessários, como escolher a atividade e o que fazer depois de formalizado.",
  excerpt:
    "Abrir um MEI é gratuito e pode ser feito totalmente online, em poucos minutos. Veja o passo a passo e o que fazer logo depois de formalizar.",
  pillar: "mei",
  coverImage: "/blog/covers/como-abrir-mei-passo-a-passo.jpg",
  coverImageAlt: "Pessoa planejando o negócio em um caderno ao lado do notebook",
  publishedAt: "2026-01-26",
  updatedAt: "2026-01-26",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "O MEI (Microempreendedor Individual) é a porta de entrada mais simples para formalizar um negócio no Brasil. É gratuito, pode ser feito online e, na maioria dos casos, o CNPJ sai na hora. Mesmo assim, algumas dúvidas, qual atividade escolher, o que é preciso ter em mãos, o que fazer depois, travam quem está começando. Veja o caminho completo.",
    },
    {
      type: "heading",
      level: 2,
      text: "Quem pode abrir um MEI",
      id: "quem-pode-abrir-mei",
    },
    {
      type: "paragraph",
      text: "Para se enquadrar como MEI, é preciso atender a alguns requisitos: faturar dentro do limite anual estabelecido para a categoria, exercer uma das atividades permitidas para MEI, não ser sócio ou titular de outra empresa, e ter no máximo um funcionário contratado.",
    },
    {
      type: "heading",
      level: 2,
      text: "Documentos e informações necessárias",
      id: "documentos-necessarios",
    },
    {
      type: "list",
      items: [
        "CPF e número do título de eleitor (ou do recibo da última declaração de Imposto de Renda, se não votou na última eleição).",
        "Endereço residencial e comercial (pode ser o mesmo, inclusive residência).",
        "E-mail e telefone para contato.",
        "Definição da atividade principal e, se for o caso, atividades secundárias dentro da lista permitida para MEI.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Passo a passo da abertura",
      id: "passo-a-passo",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Acesse o Portal do Empreendedor (gov.br) e escolha a opção de formalização como MEI.",
        "Informe seus dados pessoais e o endereço onde a atividade será exercida.",
        "Escolha a atividade principal (CNAE) e, se aplicável, até 15 atividades secundárias dentro da lista permitida.",
        "Confira todos os dados informados e confirme a solicitação.",
        "Baixe o Certificado da Condição de Microempreendedor Individual (CCMEI), que já sai com o CNPJ.",
      ],
    },
    {
      type: "callout",
      title: "Atenção na escolha da atividade",
      text: "Nem toda atividade profissional pode ser MEI, algumas exigem outro tipo de enquadramento, geralmente por envolverem regulação profissional específica (como algumas atividades de saúde ou jurídicas). Antes de escolher, vale conferir se a atividade desejada está na lista de ocupações permitidas.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que fazer logo depois de abrir o MEI",
      id: "depois-de-abrir",
    },
    {
      type: "list",
      items: [
        "Guardar o CCMEI, é o documento que comprova o CNPJ e substitui o cartão CNPJ tradicional.",
        "Verificar se é preciso Inscrição Municipal ou Estadual, dependendo da atividade e do município.",
        "Organizar como e onde emitir nota fiscal, caso a atividade exija (venda para empresas ou órgãos públicos, por exemplo).",
        "Anotar o vencimento do DAS (todo dia 20) e programar o pagamento mensal.",
        "Guardar um controle simples de receitas, mesmo informal, para a Declaração Anual do MEI.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Vale abrir sozinho ou com ajuda de um contador?",
      id: "abrir-sozinho-ou-com-contador",
    },
    {
      type: "paragraph",
      text: "A abertura em si pode ser feita sozinho, sem custo. Mas contar com um contador desde o início ajuda a escolher a atividade certa (evitando ter que corrigir depois), entender rapidamente as obrigações mensais e anuais, e já deixar organizado o caminho para migrar de enquadramento no futuro, se o negócio crescer além do limite do MEI.",
    },
  ],
  faq: [
    {
      question: "Quanto custa abrir um MEI?",
      answer:
        "A abertura do MEI é 100% gratuita, feita diretamente pelo Portal do Empreendedor. Não é necessário pagar taxas de registro nem contratar ninguém para formalizar, o processo pode ser feito sozinho, em poucos minutos.",
    },
    {
      question: "Posso ser MEI e ter carteira assinada ao mesmo tempo?",
      answer:
        "Sim, é permitido ser MEI e, ao mesmo tempo, ter um emprego CLT. As duas atividades são independentes, o importante é que o faturamento do MEI respeite o limite anual da categoria.",
    },
    {
      question: "Em quanto tempo o CNPJ do MEI fica pronto?",
      answer:
        "Na grande maioria dos casos, o CNPJ é emitido imediatamente após a confirmação dos dados no Portal do Empreendedor, e o CCMEI já pode ser baixado na hora.",
    },
  ],
  relatedTool: {
    title: "Abrir minha empresa (MEI)",
    href: "/abrir-empresa/comecar",
    description: "Tire dúvidas sobre qual atividade escolher e o que organizar depois de abrir o MEI.",
  },
  relatedSlugs: ["o-que-e-das-mei-como-pagar", "como-emitir-nota-fiscal-mei", "quanto-custa-um-contador-para-mei"],
}
