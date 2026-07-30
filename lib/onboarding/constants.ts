export type CertificadoStatus = "nao_iniciado" | "aguardando_agendamento" | "em_atendimento" | "senha_recebida" | "concluido"
export type AberturaStatus = "nao_iniciado" | "triagem_enviada" | "em_analise" | "protocolado_junta" | "concluido"
export type MeiStatus = "nao_iniciado" | "triagem_enviada" | "em_analise" | "concluido"
export type AlteracaoStatus = "nao_iniciado" | "triagem_enviada" | "em_analise" | "protocolado" | "concluido"

export const CERTIFICADO_STATUS_LABELS: Record<CertificadoStatus, string> = {
  nao_iniciado: "Não iniciado",
  aguardando_agendamento: "Aguardando agendamento do vídeo",
  em_atendimento: "Em atendimento",
  senha_recebida: "Senha de emissão recebida",
  concluido: "Concluído",
}

export const ABERTURA_STATUS_LABELS: Record<AberturaStatus, string> = {
  nao_iniciado: "Não iniciado",
  triagem_enviada: "Triagem enviada",
  em_analise: "Em análise",
  protocolado_junta: "Protocolado na Junta Comercial",
  concluido: "Concluído",
}

export const MEI_STATUS_LABELS: Record<MeiStatus, string> = {
  nao_iniciado: "Não iniciado",
  triagem_enviada: "Triagem enviada",
  em_analise: "Em análise",
  concluido: "Concluído",
}

export const ALTERACAO_STATUS_LABELS: Record<AlteracaoStatus, string> = {
  nao_iniciado: "Não iniciado",
  triagem_enviada: "Triagem enviada",
  em_analise: "Em análise",
  protocolado: "Protocolado",
  concluido: "Concluído",
}

export type EstadoCivil = "" | "solteiro" | "casado" | "uniao_estavel" | "divorciado" | "viuvo"
export type RegimeBens = "" | "comunhao_parcial" | "comunhao_universal" | "separacao_total" | "participacao_final_aquestos"

export const ESTADO_CIVIL_LABELS: Record<Exclude<EstadoCivil, "">, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  uniao_estavel: "União estável",
  divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)",
}

export const REGIME_BENS_LABELS: Record<Exclude<RegimeBens, "">, string> = {
  comunhao_parcial: "Comunhão parcial de bens",
  comunhao_universal: "Comunhão universal de bens",
  separacao_total: "Separação total de bens",
  participacao_final_aquestos: "Participação final nos aquestos",
}

export const DOCUMENT_BUCKET = "onboarding-documents"
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"]

export type DocumentField =
  | "doc_identidade_path"
  | "doc_certidao_casamento_path"
  | "doc_comprovante_residencia_path"
  | "doc_iptu_path"
  | "doc_comprovante_bombeiro_path"

export const DOCUMENT_FIELDS: { field: DocumentField; label: string; optionalFlag?: "has_certidao_casamento" | "has_comprovante_bombeiro" }[] = [
  { field: "doc_identidade_path", label: "Identidade (RG ou CNH)" },
  { field: "doc_certidao_casamento_path", label: "Certidão de casamento", optionalFlag: "has_certidao_casamento" },
  { field: "doc_comprovante_residencia_path", label: "Comprovante de residência" },
  { field: "doc_iptu_path", label: "IPTU do imóvel onde ficará a empresa" },
  { field: "doc_comprovante_bombeiro_path", label: "Comprovante do bombeiro", optionalFlag: "has_comprovante_bombeiro" },
]

export const SOLUTI_VIDEO_LINK = "https://vline.soluti.com.br/arsoluti?token=U29sdXRpSURUZWNo"
export const CERTIFICADO_WHATSAPP_LINK = "https://wa.me/5521979080457"

export type OnboardingIntake = {
  id: string
  cpf: string
  wants_certificado: boolean
  wants_abertura_empresa: boolean
  wants_abertura_mei: boolean
  wants_alteracao_cnpj: boolean
  segmento: string
  descricao_cnpj: string
  estado_civil: EstadoCivil
  regime_bens: RegimeBens
  razao_social: string
  tem_nome_fantasia: boolean | null
  nome_fantasia: string
  quantidade_socios: number | null
  cnpj_atual: string
  descricao_alteracao: string
  has_certidao_casamento: boolean | null
  has_comprovante_bombeiro: boolean | null
  doc_identidade_path: string | null
  doc_certidao_casamento_path: string | null
  doc_comprovante_residencia_path: string | null
  doc_iptu_path: string | null
  doc_comprovante_bombeiro_path: string | null
  certificado_status: CertificadoStatus
  abertura_status: AberturaStatus
  mei_status: MeiStatus
  alteracao_status: AlteracaoStatus
  created_at: string
  updated_at: string
}
