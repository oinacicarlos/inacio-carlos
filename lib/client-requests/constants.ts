export type RequestCategory =
  | "emissao_nota_fiscal"
  | "inscricao_municipal"
  | "inscricao_estadual"
  | "alteracao_cadastral"
  | "envio_documento"
  | "duvida_atendimento"
  | "outra"

export type RequestPriority = "normal" | "urgente"

export type RequestStatus =
  | "recebida"
  | "em_analise"
  | "aguardando_cliente"
  | "em_andamento"
  | "concluida"
  | "cancelada"

export const CATEGORY_OPTIONS: { value: RequestCategory; label: string }[] = [
  { value: "emissao_nota_fiscal", label: "Emissão de nota fiscal" },
  { value: "inscricao_municipal", label: "Inscrição municipal" },
  { value: "inscricao_estadual", label: "Inscrição estadual" },
  { value: "alteracao_cadastral", label: "Alteração cadastral" },
  { value: "envio_documento", label: "Envio de documento" },
  { value: "duvida_atendimento", label: "Dúvida ou atendimento" },
  { value: "outra", label: "Outra solicitação" },
]

export const CATEGORY_LABELS: Record<RequestCategory, string> = CATEGORY_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {} as Record<RequestCategory, string>,
)

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  normal: "Normal",
  urgente: "Urgente",
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  recebida: "Recebida",
  em_analise: "Em análise",
  aguardando_cliente: "Aguardando cliente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
}

export const ATTACHMENT_BUCKET = "client-request-attachments"
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024
export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export type ClientRequest = {
  id: string
  category: RequestCategory
  title: string
  description: string
  priority: RequestPriority
  status: RequestStatus
  attachment_path: string | null
  created_at: string
}
