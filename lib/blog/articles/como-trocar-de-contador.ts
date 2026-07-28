import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "como-trocar-de-contador",
  title: "Como trocar de contador sem dor de cabeça (passo a passo)",
  metaTitle: "Como trocar de contador: passo a passo sem burocracia",
  metaDescription:
    "Veja o passo a passo para trocar de contador com segurança: documentos, procuração no e-CAC, comunicação e como evitar problemas na transição.",
  excerpt:
    "Trocar de contador parece mais complicado do que realmente é. Veja o passo a passo pra migrar sem perder prazo, sem perder documento e sem dor de cabeça.",
  pillar: "mei",
  coverImage: "/blog/covers/como-trocar-de-contador.jpg",
  coverImageAlt: "Profissionais trocando documentos durante uma reunião",
  publishedAt: "2026-02-09",
  updatedAt: "2026-02-09",
  readingTimeMinutes: 6,
  sections: [
    {
      type: "paragraph",
      text: "Falta de atendimento, atraso em obrigações, preço fora da realidade do negócio ou simplesmente a sensação de que ninguém do outro lado está prestando atenção — os motivos pra trocar de contador são variados, mas a hesitação é sempre a mesma: 'será que vai dar trabalho?'. Na prática, a troca é bem mais simples do que parece, desde que você siga a ordem certa.",
    },
    {
      type: "heading",
      level: 2,
      text: "Você pode trocar de contador a qualquer momento",
      id: "pode-trocar-a-qualquer-momento",
    },
    {
      type: "paragraph",
      text: "Não existe período de fidelidade nem necessidade de justificar a troca. A relação entre empresa (ou MEI) e contador é um serviço contratado, e você pode encerrá-lo quando quiser — respeitando apenas o aviso combinado no contrato, se houver algum prazo formal definido. O importante é organizar a transição pra não deixar nenhuma obrigação sem responsável no meio do caminho.",
    },
    {
      type: "heading",
      level: 2,
      text: "Passo a passo para trocar de contador",
      id: "passo-a-passo",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Escolha o novo contador antes de encerrar com o atual — nunca fique sem nenhum dos dois no meio do processo.",
        "Peça ao contador atual os documentos e acessos: XML das notas emitidas, folha de pagamento (se tiver funcionário), balancetes e relatórios do período.",
        "Comunique o encerramento formalmente, de preferência por escrito (e-mail), registrando a data de corte.",
        "Transfira a procuração digital no e-CAC para o novo contador — sem isso, o novo responsável não consegue acessar suas informações na Receita Federal.",
        "Confirme que todas as obrigações da competência atual (DAS, folha, declarações) estão em dia antes da transição efetivamente acontecer.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Documentos que você precisa migrar",
      id: "documentos-para-migrar",
    },
    {
      type: "list",
      items: [
        "Certificado digital (se tiver) e senha do Portal do Simples Nacional.",
        "XML de todas as notas fiscais emitidas nos últimos anos.",
        "Guias de DAS pagas e eventuais parcelamentos em aberto.",
        "Dados da folha de pagamento, se houver funcionário registrado.",
        "Declarações anuais já enviadas (DASN-SIMEI ou equivalente).",
      ],
    },
    {
      type: "callout",
      title: "O melhor momento pra trocar",
      text: "Sempre que possível, feche a transição logo após o encerramento de uma competência (mês) — assim nenhuma obrigação fica pela metade entre o contador antigo e o novo, e a confusão sobre 'quem cuidou de quê' desaparece.",
    },
    {
      type: "heading",
      level: 2,
      text: "Quanto tempo leva a transição",
      id: "quanto-tempo-leva",
    },
    {
      type: "paragraph",
      text: "Na maioria dos casos, entre alguns dias e duas semanas — o tempo necessário pra reunir os documentos, transferir a procuração no e-CAC e o novo contador revisar a situação atual antes de assumir. Negócios mais simples, como um MEI sem funcionário, costumam migrar mais rápido do que empresas com folha de pagamento e histórico fiscal mais longo.",
    },
    {
      type: "heading",
      level: 2,
      text: "Erros comuns na troca de contador",
      id: "erros-comuns",
    },
    {
      type: "list",
      items: [
        "Encerrar com o contador atual antes de ter o próximo confirmado.",
        "Esquecer de transferir a procuração digital no e-CAC.",
        "Perder o acesso às senhas do Portal do Simples Nacional ou do certificado digital.",
        "Trocar no meio de uma competência, deixando obrigações sem responsável claro.",
      ],
    },
  ],
  faq: [
    {
      question: "Preciso avisar a Receita Federal quando troco de contador?",
      answer:
        "Não existe um aviso formal obrigatório à Receita — o que precisa acontecer é a atualização da procuração digital no e-CAC, transferindo o acesso do contador anterior para o novo responsável.",
    },
    {
      question: "O contador antigo pode reter meus documentos?",
      answer:
        "Não. Os documentos fiscais e contábeis pertencem à empresa ou ao MEI, não ao contador. Ele pode cobrar por eventuais serviços pendentes, mas não pode se recusar a entregar os documentos e informações da sua própria operação.",
    },
    {
      question: "Posso trocar de contador mesmo estando com obrigações atrasadas?",
      answer:
        "Sim, mas o ideal é deixar isso claro para o novo contador logo no início, pra que ele já entre sabendo o que precisa ser regularizado e em que prazo.",
    },
  ],
  relatedTool: {
    title: "Falar com um especialista",
    href: "/diagnostico",
    description: "Tire dúvidas sobre a transição e veja como fica sua contabilidade com a ContaFacil.",
  },
  relatedSlugs: ["quanto-custa-um-contador-para-mei", "o-que-e-das-mei-como-pagar", "como-abrir-mei-passo-a-passo"],
}
