import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"
import type { RequestCategory } from "@/lib/client-requests/constants"
import { PRODUCT_REQUEST_INTAKES, type RequestIntakeField } from "@/lib/client-requests/product-intake"
import type { ProductSlug } from "@/lib/stripe/products"
import type { ToolSlug } from "@/lib/tool-usage/tools"

export type RequestFlowSectorId = "legalizacao" | "pessoal" | "fiscal" | "contabil" | "comercial" | "suporte"
export type RequestFlowRouteSection = "ferramentas" | "rotinas" | "assinatura" | "conta"

export type RequestFlowTemplate = {
  label: string
  category: RequestCategory
  title: string
  body: string
  fields?: RequestIntakeField[]
}

export type RequestFlowField = RequestIntakeField

export type RequestFlowAction =
  | { actionType: "product"; label: string; product: ProductSlug }
  | { actionType: "process"; label: string; process: "abertura_mei" | "abertura_empresa" | "alteracao_cnpj" | "certificado_digital" }
  | { actionType: "route"; label: string; section: RequestFlowRouteSection; tool?: ToolSlug }
  | { actionType: "request"; label: string; template: RequestFlowTemplate }
  | { actionType: "contact"; label: string; href: string }

export type RequestFlowTopic = {
  id: string
  title: string
  description: string
  action: RequestFlowAction
}

export type RequestFlowSector = {
  id: RequestFlowSectorId
  title: string
  description: string
  topics: RequestFlowTopic[]
}

export const REQUEST_FLOW_SECTORS: RequestFlowSector[] = [
  {
    id: "legalizacao",
    title: "Legalização",
    description: "CNPJ, MEI, alterações e inscrições.",
    topics: [
      {
        id: "abrir-mei",
        title: "Abertura de MEI",
        description: "Inicie o cadastro gratuito de MEI.",
        action: { actionType: "process", label: "Começar processo", process: "abertura_mei" },
      },
      {
        id: "abrir-empresa",
        title: "Abertura de empresa",
        description: "Preencha os dados iniciais do CNPJ.",
        action: { actionType: "process", label: "Preencher dados", process: "abertura_empresa" },
      },
      {
        id: "alteracao-contratual",
        title: "Alteração contratual",
        description: "Informe o que precisa mudar na empresa.",
        action: { actionType: "process", label: "Preencher dados", process: "alteracao_cnpj" },
      },
      {
        id: "certificado-digital",
        title: "Certificado digital",
        description: "Compre certificado PF ou PJ A1.",
        action: { actionType: "process", label: "Ver certificados", process: "certificado_digital" },
      },
      {
        id: "inscricao-municipal",
        title: "Inscrição municipal",
        description: "Pendências e pedidos ligados à prefeitura.",
        action: {
          actionType: "request",
          label: "Abrir solicitação",
          template: {
            label: "Inscrição municipal",
            category: "inscricao_municipal",
            title: "Inscrição municipal",
            body: "Preciso de ajuda com inscrição municipal:",
          },
        },
      },
      {
        id: "inscricao-estadual",
        title: "Inscrição estadual",
        description: "Pendências e pedidos ligados ao estado.",
        action: {
          actionType: "request",
          label: "Abrir solicitação",
          template: {
            label: "Inscrição estadual",
            category: "inscricao_estadual",
            title: "Inscrição estadual",
            body: "Preciso de ajuda com inscrição estadual:",
          },
        },
      },
    ],
  },
  {
    id: "pessoal",
    title: "Pessoal",
    description: "Contratação, rescisão e folha.",
    topics: [
      {
        id: "simular-rescisao",
        title: "Simular rescisão",
        description: "Estime valores antes de encerrar contrato.",
        action: { actionType: "route", label: "Abrir ferramenta", section: "ferramentas", tool: "simulador-rescisao" },
      },
      {
        id: "simular-contratacao",
        title: "Simular contratação",
        description: "Calcule custo mensal de uma contratação.",
        action: { actionType: "route", label: "Abrir ferramenta", section: "ferramentas", tool: "simulador-contratacao" },
      },
      {
        id: "duvida-folha",
        title: "Dúvida de folha",
        description: "Admissão, férias, pró-labore ou encargos.",
        action: {
          actionType: "request",
          label: "Abrir solicitação",
          template: {
            label: "Dúvida de folha",
            category: "duvida_atendimento",
            title: "Dúvida sobre folha ou pessoal",
            body: "Tenho uma dúvida sobre folha, admissão, férias, pró-labore ou encargos:",
          },
        },
      },
      {
        id: "documento-pessoal",
        title: "Enviar documento",
        description: "Envie contrato, comprovante ou arquivo para análise.",
        action: {
          actionType: "request",
          label: "Enviar documento",
          template: {
            label: "Enviar documento",
            category: "envio_documento",
            title: "Envio de documento",
            body: "Estou enviando um documento para análise da equipe:",
          },
        },
      },
    ],
  },
  {
    id: "fiscal",
    title: "Fiscal",
    description: "Notas, impostos e obrigações fiscais.",
    topics: [
      {
        id: "nota-servico",
        title: "Nota fiscal de serviço",
        description: "Envie os dados necessários para confeccionar a nota.",
        action: {
          actionType: "request",
          label: "Informar dados",
          template: PRODUCT_REQUEST_INTAKES.nota_fiscal_servico,
        },
      },
      {
        id: "nota-produto",
        title: "Nota fiscal de produto",
        description: "Envie dados do comprador, produto e envio.",
        action: {
          actionType: "request",
          label: "Informar dados",
          template: PRODUCT_REQUEST_INTAKES.nota_fiscal_produto,
        },
      },
      {
        id: "rotina-fiscal",
        title: "Rotina fiscal",
        description: "Acompanhe obrigações e pendências recorrentes.",
        action: { actionType: "route", label: "Abrir rotinas", section: "rotinas" },
      },
      {
        id: "duvida-impostos",
        title: "Dúvida de impostos",
        description: "DAS, apuração, notas ou orientação fiscal.",
        action: {
          actionType: "request",
          label: "Abrir solicitação",
          template: {
            label: "Dúvida fiscal",
            category: "duvida_atendimento",
            title: "Dúvida fiscal",
            body: "Tenho uma dúvida sobre impostos, DAS, apuração ou notas fiscais:",
          },
        },
      },
    ],
  },
  {
    id: "contabil",
    title: "Contábil",
    description: "Documentos, rotina mensal e orientação.",
    topics: [
      {
        id: "rotinas-contabeis",
        title: "Rotinas contábeis",
        description: "Veja tarefas e documentos recorrentes.",
        action: { actionType: "route", label: "Abrir rotinas", section: "rotinas" },
      },
      {
        id: "enviar-documento-contabil",
        title: "Enviar documento",
        description: "Anexe arquivos para a equipe contábil.",
        action: {
          actionType: "request",
          label: "Enviar documento",
          template: {
            label: "Enviar documento",
            category: "envio_documento",
            title: "Envio de documento contábil",
            body: "Estou enviando um documento contábil para análise da equipe:",
          },
        },
      },
      {
        id: "duvida-contabil",
        title: "Dúvida contábil",
        description: "Orientação sobre rotina, declarações ou empresa.",
        action: {
          actionType: "request",
          label: "Abrir solicitação",
          template: {
            label: "Dúvida contábil",
            category: "duvida_atendimento",
            title: "Dúvida contábil",
            body: "Tenho uma dúvida contábil sobre:",
          },
        },
      },
    ],
  },
  {
    id: "comercial",
    title: "Comercial",
    description: "Planos, Serasa e contratação.",
    topics: [
      {
        id: "planos",
        title: "Planos da Tropa",
        description: "Compare assinatura e benefícios.",
        action: { actionType: "route", label: "Conhecer planos", section: "assinatura" },
      },
      {
        id: "serasa-pf",
        title: "Consulta Serasa PF",
        description: "Contrate consulta de pessoa física.",
        action: {
          actionType: "request",
          label: "Informar CPF",
          template: PRODUCT_REQUEST_INTAKES.serasa_pf,
        },
      },
      {
        id: "serasa-pj",
        title: "Consulta Serasa PJ",
        description: "Contrate consulta da empresa.",
        action: {
          actionType: "request",
          label: "Informar CNPJ",
          template: PRODUCT_REQUEST_INTAKES.serasa_pj,
        },
      },
      {
        id: "falar-comercial",
        title: "Falar com comercial",
        description: "Converse com a equipe antes de contratar.",
        action: { actionType: "contact", label: "Falar no WhatsApp", href: TROPA_WHATSAPP_LINK },
      },
    ],
  },
  {
    id: "suporte",
    title: "Suporte",
    description: "Conta, acesso e ajuda geral.",
    topics: [
      {
        id: "perfil",
        title: "Dados da conta",
        description: "Atualize nome, WhatsApp, e-mail ou senha.",
        action: { actionType: "route", label: "Abrir conta", section: "conta" },
      },
      {
        id: "cobranca",
        title: "Cobrança e assinatura",
        description: "Veja faturamento, plano e cartão.",
        action: { actionType: "route", label: "Abrir faturamento", section: "assinatura" },
      },
      {
        id: "ajuste-cobranca",
        title: "Pedir ajuste de cobrança",
        description: "Solicite alteração de vencimento ou cobrança.",
        action: {
          actionType: "request",
          label: "Abrir solicitação",
          template: {
            label: "Ajuste de cobrança",
            category: "duvida_atendimento",
            title: "Solicitar ajuste de cobrança",
            body: "Gostaria de solicitar um ajuste de cobrança:",
          },
        },
      },
      {
        id: "falar-suporte",
        title: "Falar com suporte",
        description: "Abra o canal direto com a Tropa.",
        action: { actionType: "contact", label: "Falar no WhatsApp", href: TROPA_WHATSAPP_LINK },
      },
      {
        id: "outra-solicitacao",
        title: "Outra solicitação",
        description: "Use quando nenhum caminho acima resolver.",
        action: {
          actionType: "request",
          label: "Abrir solicitação",
          template: {
            label: "Outra solicitação",
            category: "outra",
            title: "Outra solicitação",
            body: "Preciso de ajuda com:",
          },
        },
      },
    ],
  },
]

export function findRequestFlowSector(id: RequestFlowSectorId | null | undefined) {
  return REQUEST_FLOW_SECTORS.find((sector) => sector.id === id) ?? null
}
