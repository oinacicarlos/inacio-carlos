'use client'

import { type ChangeEvent, type DragEvent, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBillingReference, getBillingDueDateFromDueMonth, getBillingReferenceFromDueMonth } from '@/lib/offline-billing'
import { supabase } from '@/lib/supabaseClient'
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type RequestCategory,
  type RequestPriority,
  type RequestStatus,
} from '@/lib/client-requests/constants'
import {
  ABERTURA_STATUS_LABELS,
  ALTERACAO_STATUS_LABELS,
  CERTIFICADO_STATUS_LABELS,
  DOCUMENT_BUCKET,
  DOCUMENT_FIELDS,
  ESTADO_CIVIL_LABELS,
  MEI_STATUS_LABELS,
  REGIME_BENS_LABELS,
  type AberturaStatus,
  type AlteracaoStatus,
  type CertificadoStatus,
  type DocumentField,
  type EstadoCivil,
  type MeiStatus,
  type RegimeBens,
} from '@/lib/onboarding/constants'
import { maskWhatsAppPhone, parseWhatsAppContactsText } from '@/lib/whatsapp/contacts'

type AdminModule =
  | 'Contabilidade'
  | 'PFX'
  | 'Boletos'
  | 'Disparazap'

type AdminDashboardClientProps = {
  initialModule?: AdminModule
}

// ─── PFX ────────────────────────────────────────────────────────────────────
type PfxClientType = 'PJ' | 'PF'
type PfxBirdStatus = 'Feito' | 'Não Feito'
type PfxValidityStatus = 'valid' | 'soon' | 'expired' | 'missing'
type PfxWhatsAppIntent = 'Cobrança' | 'Feedback' | 'Renovação'

type PfxClient = {
  id: string
  clientName: string
  clientType: PfxClientType
  birdIdDone: boolean
  document: string
  pfxFileName: string
  pfxFileUrl: string
  pfxFileSize: number
  validityDate: string
  whatsapp: string
  notes: string
  createdAt: string
  updatedAt: string
}

type PfxClientRow = {
  id: string
  client_name: string
  client_type: string
  bird_id_done: boolean
  document: string
  pfx_file_name: string
  pfx_file_url: string
  pfx_file_size: number
  validity_date: string | null
  whatsapp: string
  notes: string
  created_at: string
  updated_at: string
}

type PfxClientFormData = {
  clientName: string
  clientType: PfxClientType
  birdIdDone: boolean
  document: string
  pfxFileName: string
  pfxFileUrl: string
  pfxFileSize: number
  validityDate: string
  whatsapp: string
  notes: string
}

const PFX_CLIENTS_TABLE = 'pfx_clients'
const PFX_BIRD_OPTIONS: PfxBirdStatus[] = ['Feito', 'Não Feito']
const PFX_WHATSAPP_INTENTS: PfxWhatsAppIntent[] = ['Cobrança', 'Feedback', 'Renovação']
const PFX_FILE_LIMIT_BYTES = 5 * 1024 * 1024

// ─── Boletos Offline ───────────────────────────────────────────────────────
type OfflineBillingStatus = 'pendente' | 'pago' | 'vencido'

type OfflineBillingSlip = {
  id: string
  clientId: string
  clientName: string
  email: string
  whatsapp: string
  dueDate: string
  referenceMonth: string
  amount: number
  status: OfflineBillingStatus
  fileName: string
  filePath: string
  fileSize: number
  initialSentAt: string
  reminder5dSentAt: string
  dueDateSentAt: string
  recoverySentAt: string
  paidAt: string
  createdAt: string
  updatedAt: string
}

type OfflineBillingSlipRow = {
  id: string
  client_id: string | null
  client_name: string
  email: string
  whatsapp: string
  due_date: string
  reference_month: string
  amount: number
  status: string
  file_name: string
  file_path: string | null
  file_size: number
  initial_sent_at: string | null
  reminder_5d_sent_at: string | null
  due_date_sent_at: string | null
  recovery_sent_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

type OfflineBillingFormData = {
  clientName: string
  email: string
  whatsapp: string
  dueDay: string
  amount: string
}

type OfflineBillingSlipEditData = {
  clientName: string
  email: string
  whatsapp: string
  dueDate: string
  amount: string
  status: OfflineBillingStatus
}

type OfflineBillingClient = {
  id: string
  clientName: string
  email: string
  whatsapp: string
  dueDay: number
  defaultAmount: number
  active: boolean
  createdAt: string
  updatedAt: string
}

type OfflineBillingClientRow = {
  id: string
  client_name: string
  email: string
  whatsapp: string
  due_day: number
  default_amount: number
  active: boolean
  created_at: string
  updated_at: string
}

// ─── Disparazap ────────────────────────────────────────────────────────────
type DisparazapTemplate = {
  name: string
  status: string
  category: string
  language: string
  body: string
  buttons: Array<{ type: string; text: string }>
  bodyVariableCount: number
  components: Array<Record<string, unknown>>
}

type DisparazapSendResult = {
  phone: string
  status: string
  wamid: string
}

type DisparazapMode = 'individual' | 'bulk' | 'inbox'
type DisparazapBulkStep = 'contacts' | 'template' | 'review' | 'send' | 'result'

type DisparazapCampaignSummary = {
  totalImported: number
  valid: number
  invalid: number
  duplicates: number
  optouts: number
  sendable: number
  testCap: number
}

type DisparazapCampaignRecipient = {
  id: string
  name: string
  phone: string | null
  status: string
  error_message: string | null
  wamid: string | null
  attempts: number
  queued_at: string | null
  sent_at: string | null
  delivered_at: string | null
  read_at: string | null
  failed_at: string | null
  created_at: string
}

type DisparazapContactValidationRow = {
  name: string
  phone: string | null
  situation: 'ready' | 'invalid' | 'duplicate' | 'optout'
  error: string | null
}

type DisparazapContactValidationSummary = {
  totalImported: number
  ready: number
  invalid: number
  duplicates: number
  optouts: number
}

type DisparazapCampaign = {
  id: string
  name: string
  template_name: string
  template_language: string
  template_category: string
  status: string
  total_contacts: number
  total_queued: number
  total_sent: number
  total_delivered: number
  total_read: number
  total_failed: number
  total_optout: number
  created_at: string
  started_at?: string | null
  finished_at?: string | null
}

type DisparazapInboxFilter = 'all' | 'unread' | 'interested' | 'optout'

type DisparazapConversation = {
  id: string
  phone: string | null
  name: string | null
  last_message_text: string | null
  last_message_at: string | null
  unread_count: number
  status: string
  interested: boolean
  opted_out: boolean
  customer_service_window_expires_at: string | null
  created_at: string
  updated_at: string
}

type DisparazapInboxMessage = {
  id: string
  wamid: string | null
  direction: 'inbound' | 'outbound'
  type: 'text' | 'button' | 'template' | 'system' | 'unsupported'
  text: string | null
  button_text: string | null
  template_name: string | null
  status: string | null
  error_code: string | null
  error_message: string | null
  meta_timestamp: string | null
  created_at: string
  updated_at: string
}

const OFFLINE_BILLING_TABLE = 'offline_billing_slips'
const OFFLINE_BILLING_BUCKET = 'offline-billing-slips'
const OFFLINE_BILLING_FILE_LIMIT_BYTES = 10 * 1024 * 1024

// ─── Contabilidade ─────────────────────────────────────────────────────────
type RoutineRegime = 'MEI' | 'Simples Nacional'
type RoutineClientStatus = 'Ativo' | 'Inativo'
type RoutineItemStatus = 'Pendente' | 'Não precisa' | 'Anexado' | 'Enviado'
type RoutineArea = 'Clientes' | 'Competências'
type RoutineDepartment = 'Obrigatoriedade' | 'Fiscal' | 'Atualização Cadastral' | 'Departamento Pessoal' | 'Obrigações específicas'
type RoutineDepartmentStatus = 'Enviado' | 'Anexado' | 'Inacabado' | 'Não se aplica'
type RoutineDepartmentFilter = 'Todos' | 'Feito' | 'Pendente' | 'Não se aplica'
type RoutineBroadcastAudience = 'Folha' | 'Geral'
type RoutineAttachmentCategory = 'socios' | 'endereco' | 'contratos' | 'cnpj_inscricoes' | 'licencas' | 'procuracao'
type RoutineEmailScope = RoutineDepartment | 'Geral'

type RoutineEmailDraft = {
  subject: string
  text: string
}

type RoutineClientDocument = {
  id: string
  name: string
  url: string
  size: number
  type: string
}

type RoutineClient = {
  id: string
  name: string
  cnpj: string
  partnerName: string
  partnerCpf: string
  regime: RoutineRegime
  hasPayroll: boolean
  hasEmployees: boolean
  hasProLabore: boolean
  issuesInvoices: boolean
  needsFiscalTracking: boolean
  whatsapp: string
  email: string
  monthlyFee: number
  notes: string
  status: RoutineClientStatus
  documents: RoutineClientDocument[]
  createdAt: string
  updatedAt: string
}

type RoutineClientAttachment = {
  id: string
  clientId: string
  category: RoutineAttachmentCategory
  displayName: string
  fileName: string
  storagePath: string
  mimeType: string
  fileSize: number
  createdAt: string
  updatedAt: string
}

type RoutineCompetence = {
  id: string
  clientId: string
  competenceMonth: string
  createdAt: string
  updatedAt: string
}

type RoutineItem = {
  id: string
  competenceId: string
  routineName: string
  department: RoutineDepartment
  category: string
  status: RoutineItemStatus
  fileName: string
  fileUrl: string
  fileStoragePath: string
  notes: string
  requiresFile: boolean
  isCustom: boolean
  customObligationId: string
  sortOrder: number
  sentAt: string
  updatedAt: string
}

type RoutineClientCustomObligation = {
  id: string
  clientId: string
  name: string
  department: RoutineDepartment
  category: string
  requiresFile: boolean
  active: boolean
  notes: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

type RoutineDefinition = {
  name: string
  department: RoutineDepartment
  category: string
  regimes: RoutineRegime[]
  requiresFile: boolean
  sortOrder: number
  requiresPayroll?: boolean
  requiresInvoices?: boolean
  requiresFiscalTracking?: boolean
}

type RoutineItemInsertPayload = {
  competence_id: string
  routine_name: string
  department: RoutineDepartment
  category: string
  requires_file: boolean
  is_custom: boolean
  custom_obligation_id: string | null
  sort_order: number
  status: RoutineItemStatus
}

type RoutineCompetenceStatus = 'Enviado' | 'Inacabado'

type RoutineClientRow = {
  id: string
  name: string
  cnpj: string
  partner_name?: string
  partner_cpf?: string
  regime: string
  has_payroll?: boolean
  has_employees?: boolean
  has_pro_labore?: boolean
  issues_invoices?: boolean
  needs_fiscal_tracking?: boolean
  whatsapp: string
  email: string
  monthly_fee: number
  notes: string
  status?: string
  documents?: unknown
  created_at: string
  updated_at: string
}

type RoutineCompetenceRow = {
  id: string
  client_id: string
  competence_month: string
  created_at: string
  updated_at: string
}

type RoutineItemRow = {
  id: string
  competence_id: string
  routine_name: string
  department?: string
  category?: string
  status: string
  file_name: string
  file_url: string
  file_storage_path?: string
  notes: string
  requires_file?: boolean
  is_custom?: boolean
  custom_obligation_id?: string | null
  sort_order?: number | null
  sent_at: string | null
  updated_at: string
}

type RoutineClientCustomObligationRow = {
  id: string
  client_id: string
  name: string
  department: string
  category: string
  requires_file: boolean | null
  active: boolean | null
  notes: string | null
  sort_order: number | null
  created_at: string
  updated_at: string
}

type RoutineClientAttachmentRow = {
  id: string
  client_id: string
  category: string
  display_name: string
  file_name: string
  storage_path: string
  mime_type: string | null
  file_size: number | null
  created_at: string
  updated_at: string
}

type RoutineEmailDraftRow = {
  id: string
  competence_id: string
  scope: string
  subject: string
  body: string
  created_at: string
  updated_at: string
}

type RoutineClientFormData = {
  name: string
  cnpj: string
  partnerName: string
  partnerCpf: string
  regime: RoutineRegime
  hasPayroll: boolean
  hasEmployees: boolean
  hasProLabore: boolean
  issuesInvoices: boolean
  needsFiscalTracking: boolean
  whatsapp: string
  email: string
  monthlyFee: number
  notes: string
  status: RoutineClientStatus
  documents: RoutineClientDocument[]
}

const ROUTINE_CLIENTS_TABLE = 'routine_clients'
const ROUTINE_COMPETENCES_TABLE = 'routine_competences'
const ROUTINE_ITEMS_TABLE = 'routine_items'
const ROUTINE_CLIENT_CUSTOM_OBLIGATIONS_TABLE = 'routine_client_custom_obligations'
const ROUTINE_CLIENT_ATTACHMENTS_TABLE = 'routine_client_attachments'
const ROUTINE_EMAIL_DRAFTS_TABLE = 'routine_email_drafts'
const ROUTINE_CLIENT_ATTACHMENTS_BUCKET = 'routine-client-attachments'
const ROUTINE_ATTACHMENT_LIMIT_BYTES = 10 * 1024 * 1024
const ROUTINE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ROUTINE_AREAS: RoutineArea[] = ['Clientes', 'Competências']
const ROUTINE_REGIMES: RoutineRegime[] = ['MEI', 'Simples Nacional']
const ROUTINE_ITEM_STATUSES: RoutineItemStatus[] = ['Pendente', 'Não precisa', 'Anexado', 'Enviado']
const ROUTINE_DEPARTMENTS: RoutineDepartment[] = ['Obrigatoriedade', 'Fiscal', 'Atualização Cadastral', 'Departamento Pessoal', 'Obrigações específicas']
const ROUTINE_ATTACHMENT_CATEGORIES: Array<{
  key: RoutineAttachmentCategory
  label: string
  description: string
}> = [
  { key: 'socios', label: 'Sócios', description: 'Documentos dos sócios, CPF, RG e dados pessoais.' },
  { key: 'endereco', label: 'Endereço', description: 'Comprovantes, IPTU, contrato de locação e afins.' },
  { key: 'contratos', label: 'Contratos', description: 'Contrato social, alterações e documentos societários.' },
  { key: 'cnpj_inscricoes', label: 'CNPJ e Inscrições', description: 'Cartão CNPJ, inscrição municipal e estadual.' },
  { key: 'licencas', label: 'Licenças', description: 'Alvarás, licenças e autorizações específicas.' },
  { key: 'procuracao', label: 'Procuração', description: 'Procurações digitais, autorizações e acessos.' },
]

const ROUTINE_DEFINITIONS: RoutineDefinition[] = [
  { name: 'DAS', department: 'Obrigatoriedade', category: 'Obrigação mensal', regimes: ['MEI'], requiresFile: true, sortOrder: 10 },

  { name: 'Soma de NF', department: 'Fiscal', category: 'Notas fiscais', regimes: ['MEI'], requiresFile: true, requiresInvoices: true, sortOrder: 100 },
  { name: 'Soma de NF', department: 'Fiscal', category: 'Notas fiscais', regimes: ['Simples Nacional'], requiresFile: true, sortOrder: 100 },
  { name: 'Declaração Simples', department: 'Fiscal', category: 'Apuração', regimes: ['Simples Nacional'], requiresFile: true, sortOrder: 110 },
  { name: 'Recibo de Declaração', department: 'Fiscal', category: 'Apuração', regimes: ['Simples Nacional'], requiresFile: true, sortOrder: 120 },
  { name: 'Guia PGDAS', department: 'Fiscal', category: 'Guias', regimes: ['Simples Nacional'], requiresFile: true, sortOrder: 130 },
  { name: 'Optante Simples', department: 'Fiscal', category: 'Conferência', regimes: ['Simples Nacional'], requiresFile: true, sortOrder: 140 },

  { name: 'Cartão CNPJ', department: 'Atualização Cadastral', category: 'Cadastro', regimes: ['MEI', 'Simples Nacional'], requiresFile: true, sortOrder: 200 },
  { name: 'QSA', department: 'Atualização Cadastral', category: 'Cadastro', regimes: ['MEI', 'Simples Nacional'], requiresFile: true, sortOrder: 210 },
  { name: 'Certidão CADIN', department: 'Atualização Cadastral', category: 'Certidões', regimes: ['MEI', 'Simples Nacional'], requiresFile: true, sortOrder: 220 },
  { name: 'Situação Fiscal', department: 'Atualização Cadastral', category: 'Certidões', regimes: ['MEI', 'Simples Nacional'], requiresFile: true, sortOrder: 230 },
  { name: 'Serasa', department: 'Atualização Cadastral', category: 'Conferência', regimes: ['MEI', 'Simples Nacional'], requiresFile: true, sortOrder: 240 },

  { name: 'Folha de PG', department: 'Departamento Pessoal', category: 'Folha', regimes: ['MEI'], requiresFile: true, requiresPayroll: true, sortOrder: 300 },
  { name: 'DAE', department: 'Departamento Pessoal', category: 'Guias', regimes: ['MEI'], requiresFile: true, requiresPayroll: true, sortOrder: 310 },
  { name: 'Folha de PG', department: 'Departamento Pessoal', category: 'Folha', regimes: ['Simples Nacional'], requiresFile: true, requiresPayroll: true, sortOrder: 300 },
  { name: 'Extrato Mensal de Folha', department: 'Departamento Pessoal', category: 'Folha', regimes: ['Simples Nacional'], requiresFile: true, requiresPayroll: true, sortOrder: 310 },
  { name: 'Guia FGTS', department: 'Departamento Pessoal', category: 'Guias', regimes: ['Simples Nacional'], requiresFile: true, requiresPayroll: true, sortOrder: 320 },
  { name: 'Guia INSS', department: 'Departamento Pessoal', category: 'Guias', regimes: ['Simples Nacional'], requiresFile: true, requiresPayroll: true, sortOrder: 330 },
  { name: 'Relatório de Consignado', department: 'Departamento Pessoal', category: 'Relatórios', regimes: ['Simples Nacional'], requiresFile: true, requiresPayroll: true, sortOrder: 340 },
  { name: 'Detalhamento de Guia', department: 'Departamento Pessoal', category: 'Guias', regimes: ['Simples Nacional'], requiresFile: true, requiresPayroll: true, sortOrder: 350 },
]
const ROUTINE_NAMES = Array.from(new Set(ROUTINE_DEFINITIONS.map(definition => definition.name)))

const ROUTINE_STATUS_DOT: Record<RoutineItemStatus, string> = {
  'Pendente': '#f59e0b',
  'Não precisa': '#71717a',
  'Anexado': '#60a5fa',
  'Enviado': '#22c55e',
}

function formatCrmDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function mapPfxClient(row: PfxClientRow): PfxClient {
  return {
    id: row.id,
    clientName: row.client_name ?? '',
    clientType: row.client_type === 'PF' ? 'PF' : 'PJ',
    birdIdDone: row.bird_id_done === true,
    document: row.document ?? '',
    pfxFileName: row.pfx_file_name ?? '',
    pfxFileUrl: row.pfx_file_url ?? '',
    pfxFileSize: Number(row.pfx_file_size ?? 0),
    validityDate: row.validity_date ?? '',
    whatsapp: row.whatsapp ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function maskPfxDocument(value: string, type: PfxClientType) {
  const digits = onlyDigits(value).slice(0, type === 'PF' ? 11 : 14)

  if (type === 'PF') {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
}

function maskPfxWhatsapp(value: string) {
  const digits = onlyDigits(value).slice(0, 13)
  const localDigits = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits

  if (localDigits.length <= 10) {
    return localDigits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return localDigits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function normalizePfxWhatsapp(value: string) {
  const digits = onlyDigits(value)
  if (!digits) return ''
  if (digits.startsWith('55')) return digits
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  return digits
}

function normalizeDisparazapPhone(value: string) {
  const digits = onlyDigits(value)
  if (!digits) return ''
  const normalized = digits.startsWith('55') ? digits : digits.length === 10 || digits.length === 11 ? `55${digits}` : digits
  if (normalized.length !== 12 && normalized.length !== 13) return ''
  return normalized
}

function maskDisparazapPhone(value: string) {
  return maskWhatsAppPhone(value) ?? ''
}

function getDisparazapSafeError(error: unknown) {
  if (typeof error === 'string' && error.trim()) return error.trim()
  if (error && typeof error === 'object') {
    const payload = error as { message?: unknown; details?: unknown }
    if (typeof payload.message === 'string' && payload.message.trim()) return payload.message.trim()
    if (typeof payload.details === 'string' && payload.details.trim()) return payload.details.trim()
  }
  return 'Não consegui enviar a mensagem.'
}

function normalizeDisparazapSpreadsheetHeader(value: unknown) {
  return String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function buildDisparazapContactsTextFromRows(rows: unknown[][]) {
  if (!rows.length) {
    throw new Error('Arquivo vazio. Importe uma planilha com Nome e Telefone.')
  }

  const [headerRow, ...dataRows] = rows
  const headers = headerRow.map(normalizeDisparazapSpreadsheetHeader)
  const nameIndex = headers.indexOf('nome')
  const phoneIndex = headers.indexOf('telefone')

  if (nameIndex < 0) {
    throw new Error('Não encontramos a coluna Nome. Baixe nosso modelo e tente novamente.')
  }

  if (phoneIndex < 0) {
    throw new Error('Não encontramos a coluna Telefone. Baixe nosso modelo e tente novamente.')
  }

  const lines = dataRows
    .map(row => {
      const name = String(row[nameIndex] ?? '').trim()
      const phone = String(row[phoneIndex] ?? '').trim()
      return { name, phone }
    })
    .filter(row => row.name || row.phone)

  if (!lines.length) {
    throw new Error('Nenhuma linha válida encontrada na planilha.')
  }

  return `nome,telefone\n${lines.map(row => `${row.name},${row.phone}`).join('\n')}`
}

const DISPARAZAP_CONTACT_STATUS_LABEL: Record<DisparazapContactValidationRow['situation'], string> = {
  ready: 'Apto',
  invalid: 'Inválido',
  duplicate: 'Duplicado',
  optout: 'Opt-out',
}

function formatDisparazapRelativeTime(iso: string | null | undefined) {
  if (!iso) return 'Sem atividade'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Sem atividade'
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))
  if (diffMinutes < 1) return 'Agora'
  if (diffMinutes < 60) return `Há ${diffMinutes} min`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Há ${diffHours}h`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function getDisparazapWindowState(expiresAt: string | null | undefined) {
  if (!expiresAt) {
    return { active: false, label: 'Janela encerrada', detail: 'Use um template aprovado para iniciar uma nova conversa.' }
  }

  const remainingMs = new Date(expiresAt).getTime() - Date.now()
  if (remainingMs <= 0 || Number.isNaN(remainingMs)) {
    return { active: false, label: 'Janela encerrada', detail: 'Use um template aprovado para iniciar uma nova conversa.' }
  }

  const hours = Math.floor(remainingMs / 3600000)
  const minutes = Math.floor((remainingMs % 3600000) / 60000)
  return { active: true, label: 'Janela de atendimento ativa', detail: `${hours}h ${minutes}min restantes` }
}

function getDisparazapMessageText(message: DisparazapInboxMessage) {
  return message.text || message.button_text || (message.template_name ? `Template: ${message.template_name}` : 'Mensagem não suportada')
}

function mapRoutineClient(row: RoutineClientRow): RoutineClient {
  const hasEmployees = row.has_employees === true
  const hasProLabore = row.has_pro_labore === true
  const hasPayroll = row.has_payroll === true || hasEmployees || hasProLabore

  return {
    id: row.id,
    name: row.name ?? '',
    cnpj: row.cnpj ?? '',
    partnerName: row.partner_name ?? '',
    partnerCpf: row.partner_cpf ?? '',
    regime: row.regime === 'Simples Nacional' ? 'Simples Nacional' : 'MEI',
    hasPayroll,
    hasEmployees,
    hasProLabore,
    issuesInvoices: row.issues_invoices !== false,
    needsFiscalTracking: row.needs_fiscal_tracking !== false,
    whatsapp: row.whatsapp ?? '',
    email: row.email ?? '',
    monthlyFee: Number(row.monthly_fee ?? 0),
    notes: row.notes ?? '',
    status: row.status === 'Inativo' ? 'Inativo' : 'Ativo',
    documents: parseRoutineClientDocuments(row.documents),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function parseRoutineClientDocuments(value: unknown): RoutineClientDocument[] {
  if (!Array.isArray(value)) return []

  return value.flatMap(document => {
    if (!document || typeof document !== 'object') return []
    const entry = document as Partial<RoutineClientDocument>
    if (!entry.name || !entry.url) return []
    return [{
      id: entry.id || crypto.randomUUID(),
      name: entry.name,
      url: entry.url,
      size: Number(entry.size ?? 0),
      type: entry.type || '',
    }]
  })
}

function normalizeRoutineDepartment(value: string | null | undefined): RoutineDepartment {
  return ROUTINE_DEPARTMENTS.includes(value as RoutineDepartment) ? value as RoutineDepartment : 'Atualização Cadastral'
}

function getRoutineDefinitionByName(name: string, client?: RoutineClient | null) {
  return ROUTINE_DEFINITIONS.find(definition =>
    definition.name === name && (!client || definition.regimes.includes(client.regime))
  ) ?? ROUTINE_DEFINITIONS.find(definition => definition.name === name)
}

function isRoutineDefinitionApplicableToClient(client: RoutineClient | null | undefined, definition: RoutineDefinition) {
  if (!client) return false
  if (!definition.regimes.includes(client.regime)) return false
  if (definition.requiresPayroll && !(client.hasPayroll || client.hasEmployees || client.hasProLabore)) return false
  if (definition.requiresInvoices && !client.issuesInvoices) return false
  if (definition.requiresFiscalTracking && !client.needsFiscalTracking) return false
  return true
}

function isRoutineApplicableToClient(client: RoutineClient | null | undefined, routineName: string) {
  const definition = getRoutineDefinitionByName(routineName, client)
  if (!definition) return true
  return isRoutineDefinitionApplicableToClient(client, definition)
}

function getApplicableRoutineNames(client: RoutineClient | null | undefined) {
  return ROUTINE_DEFINITIONS
    .filter(definition => isRoutineDefinitionApplicableToClient(client, definition))
    .map(definition => definition.name)
}

function getApplicableRoutineDefinitions(client: RoutineClient | null | undefined) {
  return ROUTINE_DEFINITIONS.filter(definition => isRoutineDefinitionApplicableToClient(client, definition))
}

function getRoutineItemDepartment(item: Pick<RoutineItem, 'routineName' | 'department'>, client?: RoutineClient | null) {
  if (item.department) return item.department
  return getRoutineDefinitionByName(item.routineName, client)?.department ?? 'Atualização Cadastral'
}

function getRoutineItemCategory(item: Pick<RoutineItem, 'routineName' | 'category'>, client?: RoutineClient | null) {
  if (item.category) return item.category
  return getRoutineDefinitionByName(item.routineName, client)?.category ?? 'Rotina mensal'
}

function buildRoutineItemsPayload(
  client: RoutineClient | null | undefined,
  competenceId: string,
  customObligations: RoutineClientCustomObligation[]
): RoutineItemInsertPayload[] {
  const standardPayload = getApplicableRoutineDefinitions(client).map(definition => ({
    competence_id: competenceId,
    routine_name: definition.name,
    department: definition.department,
    category: definition.category,
    requires_file: definition.requiresFile,
    is_custom: false,
    custom_obligation_id: null,
    sort_order: definition.sortOrder,
    status: 'Pendente' as RoutineItemStatus,
  }))

  const customPayload = customObligations
    .filter(obligation => obligation.active && (!client || obligation.clientId === client.id))
    .map((obligation, index) => ({
      competence_id: competenceId,
      routine_name: obligation.name,
      department: obligation.department,
      category: obligation.category || 'Personalizada',
      requires_file: obligation.requiresFile,
      is_custom: true,
      custom_obligation_id: obligation.id,
      sort_order: obligation.sortOrder || 900 + index,
      status: 'Pendente' as RoutineItemStatus,
    }))

  return [...standardPayload, ...customPayload]
}

function isRoutineItemApplicableToClient(client: RoutineClient | null | undefined, item: RoutineItem) {
  if (item.isCustom) return true
  return isRoutineApplicableToClient(client, item.routineName)
}

function mapRoutineCompetence(row: RoutineCompetenceRow): RoutineCompetence {
  return {
    id: row.id,
    clientId: row.client_id,
    competenceMonth: row.competence_month,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRoutineItem(row: RoutineItemRow): RoutineItem {
  const status = ROUTINE_ITEM_STATUSES.includes(row.status as RoutineItemStatus)
    ? row.status as RoutineItemStatus
    : 'Pendente'
  const fallbackDefinition = getRoutineDefinitionByName(row.routine_name ?? '')

  return {
    id: row.id,
    competenceId: row.competence_id,
    routineName: row.routine_name ?? '',
    department: normalizeRoutineDepartment(row.department ?? fallbackDefinition?.department),
    category: row.category ?? fallbackDefinition?.category ?? 'Rotina mensal',
    status,
    fileName: row.file_name ?? '',
    fileUrl: row.file_url ?? '',
    fileStoragePath: row.file_storage_path ?? '',
    notes: row.notes ?? '',
    requiresFile: row.requires_file ?? fallbackDefinition?.requiresFile ?? true,
    isCustom: row.is_custom === true,
    customObligationId: row.custom_obligation_id ?? '',
    sortOrder: Number(row.sort_order ?? fallbackDefinition?.sortOrder ?? 500),
    sentAt: row.sent_at ?? '',
    updatedAt: row.updated_at,
  }
}

function mapRoutineClientCustomObligation(row: RoutineClientCustomObligationRow): RoutineClientCustomObligation {
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name ?? '',
    department: normalizeRoutineDepartment(row.department),
    category: row.category ?? 'Personalizada',
    requiresFile: row.requires_file !== false,
    active: row.active !== false,
    notes: row.notes ?? '',
    sortOrder: Number(row.sort_order ?? 900),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRoutineClientAttachment(row: RoutineClientAttachmentRow): RoutineClientAttachment {
  const category = ROUTINE_ATTACHMENT_CATEGORIES.some(item => item.key === row.category)
    ? row.category as RoutineAttachmentCategory
    : 'contratos'

  return {
    id: row.id,
    clientId: row.client_id,
    category,
    displayName: row.display_name || row.file_name || 'Documento',
    fileName: row.file_name || row.display_name || 'documento',
    storagePath: row.storage_path,
    mimeType: row.mime_type ?? '',
    fileSize: Number(row.file_size ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function sanitizeRoutineAttachmentFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120) || 'documento'
}

function maskRoutineCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
}

function maskRoutineCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

function maskRoutineWhatsapp(value: string) {
  return maskPfxWhatsapp(value)
}

function readRoutineDocumentFile(file: File): Promise<RoutineClientDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não consegui ler o documento.'))
    reader.onload = () => {
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        url: String(reader.result ?? ''),
        size: file.size,
        type: file.type,
      })
    }
    reader.readAsDataURL(file)
  })
}

function formatRoutineMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

function getRoutineClientInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const [first, second] = parts
  return `${first?.[0] ?? 'C'}${second?.[0] ?? ''}`.toUpperCase()
}

function getRoutineRegimeClass(regime: string) {
  return regime
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
}

function getRoutinePaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const pages: Array<number | 'ellipsis'> = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) pages.push('ellipsis')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < totalPages - 1) pages.push('ellipsis')
  pages.push(totalPages)

  return pages
}

function parseRoutineMoney(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function getCurrentRoutineCompetenceMonth() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

function normalizeRoutineCompetenceMonth(value: string) {
	return value ? `${value}-01` : getCurrentRoutineCompetenceMonth()
}

function hasRoutineCompetenceForMonth(
	competences: RoutineCompetence[],
	clientId: string,
	monthValue: string
) {
	const competenceMonth = normalizeRoutineCompetenceMonth(monthValue)
	return competences.some(competence => competence.clientId === clientId && competence.competenceMonth === competenceMonth)
}

function getRoutineMonthInputValue(competenceMonth: string) {
	return competenceMonth ? competenceMonth.slice(0, 7) : getCurrentRoutineCompetenceMonth().slice(0, 7)
}

function shiftRoutineMonthValue(value: string, offset: number) {
  const current = value || getCurrentRoutineCompetenceMonth().slice(0, 7)
  const [year, month] = current.split('-').map(Number)
  const date = new Date(year, (month || 1) - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatRoutineCompetence(competenceMonth: string) {
  if (!competenceMonth) return 'Sem competência'
  const date = new Date(`${competenceMonth.slice(0, 10)}T00:00:00`)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, letter => letter.toUpperCase())
}

function getRoutineBroadcastDefaults(audience: RoutineBroadcastAudience, monthValue: string) {
  const competenceLabel = formatRoutineCompetence(normalizeRoutineCompetenceMonth(monthValue)).toUpperCase()
  if (audience === 'Folha') {
    return {
      subject: `LANÇAMENTO FOLHA - ${competenceLabel}`,
      text: 'Olá amigo cliente, temos lançamentos na folha de pagamento como admissões, demissões, férias, afastamentos e etc para esse mês ou podemos processar a folha de pagamento?',
    }
  }

  return {
    subject: `COMUNICADO TROPA - ${competenceLabel}`,
    text: 'Olá amigo cliente,',
  }
}

function hasValidRoutineEmail(client: RoutineClient) {
  return ROUTINE_EMAIL_PATTERN.test(client.email.trim())
}

function formatRoutineSentDate(value: string) {
  if (!value) return 'Não enviado'
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function buildRoutineMessage(client: RoutineClient, competence: RoutineCompetence, items: RoutineItem[], scopeDepartment: RoutineDepartment | null) {
  const applicableItems = items.filter(item => isRoutineItemApplicableToClient(client, item))
  const attached = applicableItems.filter(item => item.status === 'Anexado' || item.status === 'Enviado').map(item => item.routineName)
  const pending = applicableItems.filter(item => item.status === 'Pendente').map(item => item.routineName)
  const skipped = applicableItems.filter(item => item.status === 'Não precisa').map(item => item.routineName)
  const scopeLabel = scopeDepartment ? ` do setor ${scopeDepartment}` : ''
  const lines = [
    `Olá, seguem as rotinas${scopeLabel} da competência ${formatRoutineCompetence(competence.competenceMonth)} da empresa ${client.name}.`,
    '',
    'Anexados:',
    ...(attached.length ? attached.map(name => `• ${name}`) : ['• Nenhum item anexado até o momento.']),
    '',
    'Pendentes:',
    ...(pending.length ? pending.map(name => `• ${name}`) : ['• Nenhuma pendência no momento.']),
    '',
    'Rotinas que não se aplicam:',
    ...(skipped.length ? skipped.map(name => `• ${name}`) : ['• Nenhuma rotina marcada como não aplicável.']),
    '',
    'Qualquer dúvida, fico à disposição.',
  ]

  return lines.join('\n')
}

function getRoutineCompetenceStatus(client: RoutineClient | null | undefined, items: RoutineItem[]): RoutineCompetenceStatus {
  const applicableItems = items.filter(item => isRoutineItemApplicableToClient(client, item))
  if (!applicableItems.length) return 'Inacabado'
  return applicableItems.every(item => item.status === 'Enviado' || item.status === 'Não precisa') ? 'Enviado' : 'Inacabado'
}

function isRoutineItemReady(item: RoutineItem) {
  return item.status === 'Anexado' || item.status === 'Enviado' || item.status === 'Não precisa' || Boolean(item.fileName || item.fileStoragePath)
}

function getRoutineDepartmentStatus(client: RoutineClient | null | undefined, items: RoutineItem[], department: RoutineDepartment): RoutineDepartmentStatus {
  const departmentItems = items.filter(item =>
    getRoutineItemDepartment(item, client) === department &&
    isRoutineItemApplicableToClient(client, item)
  )

  if (!departmentItems.length) return 'Não se aplica'
  if (departmentItems.every(item => item.status === 'Enviado' || item.status === 'Não precisa')) return 'Enviado'
  if (departmentItems.every(item => isRoutineItemReady(item))) return 'Anexado'
  return 'Inacabado'
}

function matchesRoutineDepartmentFilter(status: RoutineDepartmentStatus, filter: RoutineDepartmentFilter) {
  if (filter === 'Todos') return true
  if (filter === 'Feito') return status === 'Enviado' || status === 'Anexado'
  if (filter === 'Pendente') return status === 'Inacabado'
  return status === 'Não se aplica'
}

function getRoutineDepartmentStatusClass(status: RoutineDepartmentStatus) {
  if (status === 'Não se aplica') return 'not-applicable'
  if (status === 'Inacabado') return 'no'
  if (status === 'Anexado') return 'attached'
  return 'yes'
}

function buildRoutineEmailSubject(client: RoutineClient, competence: RoutineCompetence, scopeDepartment: RoutineDepartment | null) {
  if (scopeDepartment === 'Fiscal') return `Documentos fiscais - ${formatRoutineCompetence(competence.competenceMonth)}`
  if (scopeDepartment === 'Departamento Pessoal') return `Documentos de folha - ${formatRoutineCompetence(competence.competenceMonth)}`
  const scopeLabel = scopeDepartment ? ` - ${scopeDepartment}` : ''
  return `Rotinas contábeis - ${client.name} - ${formatRoutineCompetence(competence.competenceMonth)}${scopeLabel}`
}

function getRoutineEmailScopeKey(competenceId: string, scope: RoutineEmailScope) {
  return `${competenceId}:${scope}`
}

function getRoutineEmailScopeTitle(scope: RoutineEmailScope) {
  if (scope === 'Geral') return 'E-mail geral'
  return 'E-mail do setor'
}

function getPfxValidityStatus(validityDate: string): PfxValidityStatus {
  if (!validityDate) return 'missing'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${validityDate}T00:00:00`)
  const days = Math.ceil((target.getTime() - today.getTime()) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 30) return 'soon'
  return 'valid'
}

function getPfxValidityLabel(validityDate: string) {
  const status = getPfxValidityStatus(validityDate)
  if (status === 'missing') return 'Sem validade'
  const formatted = new Date(`${validityDate}T00:00:00`).toLocaleDateString('pt-BR')
  if (status === 'expired') return `Vencido em ${formatted}`
  if (status === 'soon') return `Vence em ${formatted}`
  return formatted
}

function formatPfxFileSize(size: number) {
  if (!size) return ''
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

function getPfxWhatsappMessage(client: PfxClient, intent: PfxWhatsAppIntent) {
  const name = client.clientName || 'tudo bem'
  const document = client.document ? ` documento ${client.document}` : ''
  const validity = client.validityDate
    ? new Date(`${client.validityDate}T00:00:00`).toLocaleDateString('pt-BR')
    : 'em breve'

  if (intent === 'Cobrança') {
    return `Olá, ${name}! Tudo bem? Passando para falar sobre o certificado digital/PFX${document}. Podemos seguir com a regularização?`
  }

  if (intent === 'Feedback') {
    return `Olá, ${name}! Tudo bem? Gostaria de saber se deu tudo certo com o certificado digital/PFX e se você precisa de algum ajuste.`
  }

  return `Olá, ${name}! Tudo bem? O certificado digital/PFX${document} vence em ${validity}. Podemos iniciar a renovação?`
}

function getPfxWhatsappUrl(client: PfxClient, intent: PfxWhatsAppIntent) {
  const phone = normalizePfxWhatsapp(client.whatsapp)
  const message = encodeURIComponent(getPfxWhatsappMessage(client, intent))
  return `https://wa.me/${phone}?text=${message}`
}

function mapOfflineBillingSlip(row: OfflineBillingSlipRow): OfflineBillingSlip {
  return {
    id: row.id,
    clientId: row.client_id ?? '',
    clientName: row.client_name,
    email: row.email,
    whatsapp: row.whatsapp,
    dueDate: row.due_date,
    referenceMonth: row.reference_month,
    amount: Number(row.amount) || 0,
    status: row.status === 'pago' || row.status === 'vencido' ? row.status : 'pendente',
    fileName: row.file_name,
    filePath: row.file_path ?? '',
    fileSize: Number(row.file_size) || 0,
    initialSentAt: row.initial_sent_at ?? '',
    reminder5dSentAt: row.reminder_5d_sent_at ?? '',
    dueDateSentAt: row.due_date_sent_at ?? '',
    recoverySentAt: row.recovery_sent_at ?? '',
    paidAt: row.paid_at ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapOfflineBillingClient(row: OfflineBillingClientRow): OfflineBillingClient {
  return {
    id: row.id,
    clientName: row.client_name,
    email: row.email,
    whatsapp: row.whatsapp,
    dueDay: Number(row.due_day) || 15,
    defaultAmount: Number(row.default_amount) || 0,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function parseOfflineBillingAmount(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatOfflineBillingAmount(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

function formatOfflineBillingDate(value: string) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR')
}

function formatOfflineBillingSentAt(value: string) {
  if (!value) return 'Não enviado'
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function parseOfflineBillingEmails(value: string) {
  return value
    .split(/[,\n;]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function isValidOfflineBillingEmailList(value: string) {
  const emails = parseOfflineBillingEmails(value)
  return emails.length > 0 && emails.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

const MODULES: Array<{
  name: AdminModule
  label: string
  icon: 'routines' | 'pfx' | 'clients' | 'billing' | 'message'
}> = [
  { name: 'Contabilidade', label: 'Clientes', icon: 'routines' },
  { name: 'PFX', label: 'PFX', icon: 'pfx' },
  { name: 'Boletos', label: 'Boletos', icon: 'billing' },
  { name: 'Disparazap', label: 'Disparazap', icon: 'message' },
]

const MODULE_ROUTES: Partial<Record<AdminModule, string>> = {
  Contabilidade: '/clientes',
  PFX: '/pfx',
  Boletos: '/boletos',
  Disparazap: '/disparazap',
}

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

function getProfileInitials(name: string) {
  const cleanName = name.trim()

  if (cleanName.toLowerCase().startsWith('inácio') || cleanName.toLowerCase().startsWith('inacio')) {
    return 'IC'
  }

  const parts = cleanName
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const initials = parts.length > 1
    ? parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join('')
    : parts[0]?.slice(0, 2).toUpperCase()

  return initials || 'IC'
}

function loadProfileImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

async function createAdjustedProfilePhoto(src: string, zoom: number, offsetX: number, offsetY: number) {
  const image = await loadProfileImage(src)
  const size = 384
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Não foi possível processar a imagem.')
  }

  canvas.width = size
  canvas.height = size

  const safeZoom = Math.max(1, Math.min(2.4, zoom))
  const scale = Math.max(size / image.width, size / image.height) * safeZoom
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const drawX = (size - drawWidth) / 2 + (offsetX / 100) * size
  const drawY = (size - drawHeight) / 2 + (offsetY / 100) * size

  context.clearRect(0, 0, size, size)
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight)

  let quality = 0.84
  let result = canvas.toDataURL('image/jpeg', quality)

  while (result.length > 900_000 && quality > 0.52) {
    quality -= 0.08
    result = canvas.toDataURL('image/jpeg', quality)
  }

  return result
}

function clampProfilePhotoOffset(aspect: number, zoom: number, offsetX: number, offsetY: number) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1
  const safeZoom = Math.max(1, Math.min(2.4, zoom))
  const baseWidth = safeAspect >= 1 ? safeAspect * 100 : 100
  const baseHeight = safeAspect >= 1 ? 100 : (100 / safeAspect)
  const displayWidth = baseWidth * safeZoom
  const displayHeight = baseHeight * safeZoom
  const maxX = Math.max(0, (displayWidth - 100) / 2)
  const maxY = Math.max(0, (displayHeight - 100) / 2)

  return {
    x: Math.min(maxX, Math.max(-maxX, offsetX)),
    y: Math.min(maxY, Math.max(-maxY, offsetY)),
  }
}

function getProfilePhotoPreviewSize(aspect: number, zoom: number) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1
  const safeZoom = Math.max(1, Math.min(2.4, zoom))

  return safeAspect >= 1
    ? { width: safeAspect * 100 * safeZoom, height: 100 * safeZoom }
    : { width: 100 * safeZoom, height: (100 / safeAspect) * safeZoom }
}

export default function DashboardPage({ initialModule = 'Contabilidade' }: AdminDashboardClientProps) {
  const router = useRouter()
  const [checkingSession, setCheckingSession] = useState(true)
  const [activeModule, setActiveModule] = useState<AdminModule>(initialModule)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileName, setProfileName] = useState('Inácio')
  const [profileEmail, setProfileEmail] = useState('')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [profileDraftName, setProfileDraftName] = useState('Inácio')
  const [profileDraftEmail, setProfileDraftEmail] = useState('')
  const [profileDraftPhoto, setProfileDraftPhoto] = useState<string | null>(null)
  const [profileDraftPhotoSource, setProfileDraftPhotoSource] = useState<string | null>(null)
  const [profilePhotoAspect, setProfilePhotoAspect] = useState(1)
  const [profilePhotoZoom, setProfilePhotoZoom] = useState(1)
  const [profilePhotoOffsetX, setProfilePhotoOffsetX] = useState(0)
  const [profilePhotoOffsetY, setProfilePhotoOffsetY] = useState(0)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileResetSending, setProfileResetSending] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const profilePhotoDragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace('/login')
        return
      }

      const userName =
        typeof data.session.user.user_metadata?.full_name === 'string'
          ? data.session.user.user_metadata.full_name
          : typeof data.session.user.user_metadata?.name === 'string'
            ? data.session.user.user_metadata.name
            : 'Inácio'
      const userPhoto =
        typeof data.session.user.user_metadata?.avatar_url === 'string'
          ? data.session.user.user_metadata.avatar_url
          : null

      setProfileName(userName)
      setProfileEmail(data.session.user.email ?? '')
      setProfilePhoto(userPhoto)
      setCheckingSession(false)
    })
  }, [router])

  useEffect(() => {
    if (!profileMenuOpen) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as globalThis.Node)) {
        setProfileMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', closeOnOutsideClick)
    return () => window.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [profileMenuOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const openProfileModal = () => {
    setProfileDraftName(profileName)
    setProfileDraftEmail(profileEmail)
    setProfileDraftPhoto(profilePhoto)
    setProfileDraftPhotoSource(null)
    setProfilePhotoAspect(1)
    setProfilePhotoZoom(1)
    setProfilePhotoOffsetX(0)
    setProfilePhotoOffsetY(0)
    setProfileError('')
    setProfileMessage('')
    setProfileMenuOpen(false)
    setProfileModalOpen(true)
  }

  const handleProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileError('Escolha uma imagem válida.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Use uma imagem com até 5 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        void loadProfileImage(reader.result).then(image => {
          setProfilePhotoAspect(image.width / image.height)
        })
        setProfileDraftPhotoSource(reader.result)
        setProfileDraftPhoto(reader.result)
        setProfilePhotoZoom(1)
        setProfilePhotoOffsetX(0)
        setProfilePhotoOffsetY(0)
        setProfileError('')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const cleanName = profileDraftName.trim()
    const cleanEmail = profileDraftEmail.trim()

    if (!cleanName) {
      setProfileError('Informe um nome.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setProfileError('Informe um e-mail válido.')
      return
    }

    setProfileSaving(true)
    setProfileError('')
    setProfileMessage('')

    let finalProfilePhoto = profileDraftPhoto

    if (profileDraftPhotoSource) {
      try {
        const clampedOffset = clampProfilePhotoOffset(
          profilePhotoAspect,
          profilePhotoZoom,
          profilePhotoOffsetX,
          profilePhotoOffsetY
        )
        finalProfilePhoto = await createAdjustedProfilePhoto(
          profileDraftPhotoSource,
          profilePhotoZoom,
          clampedOffset.x,
          clampedOffset.y
        )
      } catch {
        setProfileSaving(false)
        setProfileError('Não foi possível ajustar essa imagem. Tente outra foto.')
        return
      }
    }

    const updatePayload: {
      email?: string
      password?: string
      data: Record<string, string | null>
    } = {
      data: {
        full_name: cleanName,
        avatar_url: finalProfilePhoto,
      },
    }

    if (cleanEmail !== profileEmail) updatePayload.email = cleanEmail

    const { error } = await supabase.auth.updateUser(updatePayload)

    setProfileSaving(false)

    if (error) {
      setProfileError(error.message)
      return
    }

    setProfileName(cleanName)
    setProfileEmail(cleanEmail)
    setProfilePhoto(finalProfilePhoto)
    setProfileDraftPhoto(finalProfilePhoto)
    setProfileDraftPhotoSource(null)
    setProfileMessage(cleanEmail !== profileEmail ? 'Perfil salvo. Confirme o novo e-mail se o Supabase solicitar.' : 'Perfil salvo.')
  }

  const updateProfilePhotoZoom = (zoom: number) => {
    const nextZoom = Math.max(1, Math.min(2.4, zoom))
    const clampedOffset = clampProfilePhotoOffset(
      profilePhotoAspect,
      nextZoom,
      profilePhotoOffsetX,
      profilePhotoOffsetY
    )

    setProfilePhotoZoom(nextZoom)
    setProfilePhotoOffsetX(clampedOffset.x)
    setProfilePhotoOffsetY(clampedOffset.y)
  }

  const handleProfilePhotoPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!profileDraftPhotoSource) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    profilePhotoDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: profilePhotoOffsetX,
      offsetY: profilePhotoOffsetY,
    }
  }

  const handleProfilePhotoPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = profilePhotoDragRef.current
    if (!drag) return

    const rect = event.currentTarget.getBoundingClientRect()
    const nextOffsetX = drag.offsetX + ((event.clientX - drag.startX) / rect.width) * 100
    const nextOffsetY = drag.offsetY + ((event.clientY - drag.startY) / rect.height) * 100
    const clampedOffset = clampProfilePhotoOffset(
      profilePhotoAspect,
      profilePhotoZoom,
      nextOffsetX,
      nextOffsetY
    )

    setProfilePhotoOffsetX(clampedOffset.x)
    setProfilePhotoOffsetY(clampedOffset.y)
  }

  const stopProfilePhotoDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (profilePhotoDragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      profilePhotoDragRef.current = null
    }
  }

  const handleSendPasswordReset = async () => {
    const cleanEmail = profileDraftEmail.trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setProfileError('Informe um e-mail válido para receber o link.')
      return
    }

    setProfileResetSending(true)
    setProfileError('')
    setProfileMessage('')

    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/redefinir-senha`
      : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    })

    setProfileResetSending(false)

    if (error) {
      setProfileError(error.message)
      return
    }

    setProfileMessage('Enviamos um link de redefinição para o e-mail informado.')
  }

  if (checkingSession) {
    return <main className="admin-dashboard-page" data-theme="dark" />
  }

  return (
    <main className="admin-dashboard-page collapsed" data-theme="dark">
      <aside className="admin-sidebar" aria-label="Módulos administrativos">
        <nav className="admin-module-nav" aria-label="Navegação dos módulos">
          {MODULES.map(module => (
            <button
              className={activeModule === module.name ? 'admin-module-button active' : 'admin-module-button'}
              key={module.name}
              onClick={() => {
                const moduleRoute = MODULE_ROUTES[module.name]
                setActiveModule(module.name)

                // Só atualiza a URL na barra do navegador (pra refresh/link direto
                // continuar caindo no módulo certo) sem passar pelo router do
                // Next.js — router.push aqui desmontava a página inteira e refazia
                // todas as buscas de novo, mesmo sendo o mesmo componente.
                if (moduleRoute && window.location.pathname !== moduleRoute) {
                  window.history.replaceState(null, '', moduleRoute)
                }
              }}
              type="button"
              title={module.label}
            >
              <span className="module-icon-wrap">
                <ModuleIcon type={module.icon} />
              </span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-user-wrap" ref={profileMenuRef}>
          <button
            className="admin-sidebar-user"
            title="Inácio"
            type="button"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            onPointerDown={(event) => {
              event.stopPropagation()
              setProfileMenuOpen(open => !open)
            }}
          >
            <div className="admin-sidebar-avatar">
              {profilePhoto ? <img src={profilePhoto} alt="" /> : getProfileInitials(profileName)}
            </div>
          </button>

          {profileMenuOpen && (
            <div className="admin-profile-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={openProfileModal}
              >
                <span className="admin-profile-menu-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                Meu perfil
              </button>
              <button type="button" role="menuitem" onClick={handleSignOut}>
                <span className="admin-profile-menu-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                Sair
              </button>
            </div>
          )}
        </div>

      </aside>

      {profileModalOpen && (
        <div className="crm-modal-backdrop" onClick={() => setProfileModalOpen(false)}>
          <div className="admin-profile-modal" onClick={event => event.stopPropagation()}>
            <div className="crm-modal-header">
              <h3>Meu perfil</h3>
              <button onClick={() => setProfileModalOpen(false)} type="button" className="crm-modal-close">
                <CloseIcon />
              </button>
            </div>

            <form className="admin-profile-form" onSubmit={handleProfileSubmit}>
              <div className="admin-profile-modal-body">
                <div className="admin-profile-modal-avatar">
                  {profileDraftPhoto ? (
                    <img
                      src={profileDraftPhotoSource ?? profileDraftPhoto}
                      alt=""
                    />
                  ) : getProfileInitials(profileDraftName)}
                </div>
                <div>
                  <strong>{profileDraftName || 'Meu perfil'}</strong>
                  <span>Admin</span>
                </div>
                <label className="admin-profile-photo-action">
                  Trocar foto
                  <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
                </label>
              </div>

              {profileDraftPhotoSource && (
                <div className="admin-profile-photo-editor">
                  <div
                    className="admin-profile-photo-preview"
                    onPointerDown={handleProfilePhotoPointerDown}
                    onPointerMove={handleProfilePhotoPointerMove}
                    onPointerUp={stopProfilePhotoDrag}
                    onPointerCancel={stopProfilePhotoDrag}
                  >
                    {(() => {
                      const photoSize = getProfilePhotoPreviewSize(profilePhotoAspect, profilePhotoZoom)

                      return (
                        <img
                          src={profileDraftPhotoSource}
                          alt=""
                          draggable={false}
                          style={{
                            width: `${photoSize.width}%`,
                            height: `${photoSize.height}%`,
                            left: `calc(50% + ${profilePhotoOffsetX}%)`,
                            top: `calc(50% + ${profilePhotoOffsetY}%)`,
                          }}
                        />
                      )
                    })()}
                  </div>
                  <p className="admin-profile-photo-hint">Arraste a foto para ajustar o enquadramento.</p>

                  <label>
                    Aproximar
                    <input
                      type="range"
                      min="1"
                      max="2.4"
                      step="0.05"
                      value={profilePhotoZoom}
                      onChange={event => updateProfilePhotoZoom(Number(event.target.value))}
                    />
                  </label>
                </div>
              )}

              <div className="admin-profile-fields">
                <label>
                  Nome
                  <input
                    value={profileDraftName}
                    onChange={event => setProfileDraftName(event.target.value)}
                    placeholder="Seu nome"
                  />
                </label>
                <label>
                  Redefinir e-mail
                  <input
                    type="email"
                    value={profileDraftEmail}
                    onChange={event => setProfileDraftEmail(event.target.value)}
                    placeholder="seuemail@empresa.com"
                  />
                </label>
                <label>
                  Redefinir senha
                  <button
                    className="admin-profile-reset-button"
                    disabled={profileResetSending}
                    type="button"
                    onClick={handleSendPasswordReset}
                  >
                    {profileResetSending ? 'Enviando...' : 'Enviar link por e-mail'}
                  </button>
                </label>
              </div>

              {profileError && <p className="crm-modal-error">{profileError}</p>}
              {profileMessage && <p className="admin-profile-message">{profileMessage}</p>}

              <div className="crm-modal-footer">
                <button type="button" onClick={() => setProfileModalOpen(false)} className="crm-modal-cancel">
                  Cancelar
                </button>
                <button type="submit" disabled={profileSaving} className="crm-modal-submit">
                  {profileSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section
        className={activeModule === 'Contabilidade' || activeModule === 'PFX' || activeModule === 'Boletos' || activeModule === 'Disparazap' ? 'admin-module-stage forms-module-stage' : 'admin-module-stage'}
        aria-labelledby="active-module-title"
      >
        {activeModule === 'Contabilidade' ? (
          <RoutineControlModule />
        ) : activeModule === 'PFX' ? (
          <PfxModule />
        ) : activeModule === 'Boletos' ? (
          <OfflineBillingModule />
        ) : activeModule === 'Disparazap' ? (
          <DisparazapModule />
        ) : (
          <div className="admin-module-empty">
            <h2 id="active-module-title">{activeModule}</h2>
          </div>
        )}
      </section>
    </main>
  )
}

function RoutineControlModule() {
  const [clients, setClients] = useState<RoutineClient[]>([])
  const [competences, setCompetences] = useState<RoutineCompetence[]>([])
  const [items, setItems] = useState<RoutineItem[]>([])
  const [customObligations, setCustomObligations] = useState<RoutineClientCustomObligation[]>([])
  const [attachments, setAttachments] = useState<RoutineClientAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeArea, setActiveArea] = useState<RoutineArea>('Clientes')
  const [clientSearch, setClientSearch] = useState('')
  const [regimeFilter, setRegimeFilter] = useState<'Todos' | RoutineRegime>('Todos')
  const [payrollFilter, setPayrollFilter] = useState<'Todos' | 'Sim' | 'Não'>('Todos')
  const [clientsPage, setClientsPage] = useState(1)
  const [clientsPageSize, setClientsPageSize] = useState(10)
  const [competenceClientFilter, setCompetenceClientFilter] = useState('Todos')
  const [competenceRegimeFilter, setCompetenceRegimeFilter] = useState<'Todos' | RoutineRegime>('Todos')
  const [competenceFiscalFilter, setCompetenceFiscalFilter] = useState<RoutineDepartmentFilter>('Todos')
  const [competencePayrollFilter, setCompetencePayrollFilter] = useState<RoutineDepartmentFilter>('Todos')
  const [competenceStatusFilter, setCompetenceStatusFilter] = useState<'Todos' | RoutineCompetenceStatus>('Todos')
  const [competenceMonthFilter, setCompetenceMonthFilter] = useState(getCurrentRoutineCompetenceMonth().slice(0, 7))
  const [selectedCompetenceId, setSelectedCompetenceId] = useState<string | null>(null)
  const [clientModal, setClientModal] = useState<RoutineClient | null | 'new'>(null)
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false)
  const [attachmentsClient, setAttachmentsClient] = useState<RoutineClient | null>(null)
  const [competenceModalOpen, setCompetenceModalOpen] = useState(false)
  const [quickCompetenceModalOpen, setQuickCompetenceModalOpen] = useState(false)
  const [emailModalScope, setEmailModalScope] = useState<RoutineEmailScope | null>(null)
  const [routineEmailDrafts, setRoutineEmailDrafts] = useState<Record<string, RoutineEmailDraft>>({})
  const [routineEmailDraftPersistence, setRoutineEmailDraftPersistence] = useState(true)
  const [routineEmailSending, setRoutineEmailSending] = useState(false)
  const [routineEmailFeedback, setRoutineEmailFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [routineFileUploading, setRoutineFileUploading] = useState<Record<string, boolean>>({})
  const [routineFileErrors, setRoutineFileErrors] = useState<Record<string, string>>({})

  const loadRoutineData = async () => {
    setLoading(true)
    setError('')

    const [clientsResult, competencesResult, itemsResult] = await Promise.all([
      supabase.from(ROUTINE_CLIENTS_TABLE).select('*').order('name', { ascending: true }),
      supabase.from(ROUTINE_COMPETENCES_TABLE).select('*').order('competence_month', { ascending: false }),
      supabase.from(ROUTINE_ITEMS_TABLE).select('*').order('routine_name', { ascending: true }),
    ])

    if (clientsResult.error || competencesResult.error || itemsResult.error) {
      setError('Não consegui carregar Clientes. Execute o SQL de criação das tabelas.')
      setLoading(false)
      return
    }

    setClients((clientsResult.data ?? []).map(row => mapRoutineClient(row as RoutineClientRow)))
    setCompetences((competencesResult.data ?? []).map(row => mapRoutineCompetence(row as RoutineCompetenceRow)))
    setItems((itemsResult.data ?? []).map(row => mapRoutineItem(row as RoutineItemRow)))

    const attachmentsResult = await supabase
      .from(ROUTINE_CLIENT_ATTACHMENTS_TABLE)
      .select('*')
      .order('updated_at', { ascending: false })

    const customObligationsResult = await supabase
      .from(ROUTINE_CLIENT_CUSTOM_OBLIGATIONS_TABLE)
      .select('*')
      .order('sort_order', { ascending: true })

    const emailDraftsResult = await supabase
      .from(ROUTINE_EMAIL_DRAFTS_TABLE)
      .select('*')
      .order('updated_at', { ascending: false })

    if (attachmentsResult.error) {
      setAttachments([])
      setError('Clientes carregados. Execute o SQL de anexos para liberar as pastas de documentos.')
    } else {
      setAttachments((attachmentsResult.data ?? []).map(row => mapRoutineClientAttachment(row as RoutineClientAttachmentRow)))
    }

    if (customObligationsResult.error) {
      setCustomObligations([])
      setError('Clientes carregados. Execute o SQL de competências para liberar obrigações específicas.')
    } else {
      setCustomObligations((customObligationsResult.data ?? []).map(row => mapRoutineClientCustomObligation(row as RoutineClientCustomObligationRow)))
    }

    if (emailDraftsResult.error) {
      setRoutineEmailDraftPersistence(false)
      setRoutineEmailDrafts({})
    } else {
      setRoutineEmailDraftPersistence(true)
      setRoutineEmailDrafts((emailDraftsResult.data ?? []).reduce<Record<string, RoutineEmailDraft>>((drafts, row) => {
        const draft = row as RoutineEmailDraftRow
        drafts[getRoutineEmailScopeKey(draft.competence_id, draft.scope as RoutineEmailScope)] = {
          subject: draft.subject ?? '',
          text: draft.body ?? '',
        }
        return drafts
      }, {}))
    }

    setLoading(false)
  }

  useEffect(() => { void loadRoutineData() }, [])

  useEffect(() => {
    setRoutineEmailFeedback(null)
    setEmailModalScope(null)
  }, [selectedCompetenceId])

  const selectedCompetence = selectedCompetenceId ? competences.find(competence => competence.id === selectedCompetenceId) ?? null : null
  const selectedClient = selectedCompetence ? clients.find(client => client.id === selectedCompetence.clientId) ?? null : null
  const selectedItems = selectedCompetence ? items.filter(item => item.competenceId === selectedCompetence.id) : []
  const selectedVisibleItems = selectedClient
    ? selectedItems.filter(item =>
        isRoutineItemApplicableToClient(selectedClient, item) ||
        item.status !== 'Pendente' ||
        Boolean(item.fileName || item.notes || item.sentAt)
      ).sort((a, b) =>
        ROUTINE_DEPARTMENTS.indexOf(getRoutineItemDepartment(a, selectedClient)) - ROUTINE_DEPARTMENTS.indexOf(getRoutineItemDepartment(b, selectedClient)) ||
        a.sortOrder - b.sortOrder ||
        a.routineName.localeCompare(b.routineName)
      )
    : selectedItems
  const selectedItemsByDepartment = selectedClient
    ? ROUTINE_DEPARTMENTS.map(department => ({
        department,
        items: selectedVisibleItems.filter(item => getRoutineItemDepartment(item, selectedClient) === department),
      })).filter(group => group.items.length > 0)
    : []

  const getClient = (clientId: string) => clients.find(client => client.id === clientId) ?? null
  const getCompetenceItems = (competenceId: string) => items.filter(item => item.competenceId === competenceId)

  const filteredClients = useMemo(() => {
    const search = clientSearch.toLowerCase().trim()
    return clients.filter(client => {
      const matchesSearch = !search || [client.name, client.cnpj, client.partnerName, client.partnerCpf, client.whatsapp, client.email].some(value => value.toLowerCase().includes(search))
      const matchesRegime = regimeFilter === 'Todos' || client.regime === regimeFilter
      const matchesPayroll = payrollFilter === 'Todos' || (payrollFilter === 'Sim' ? client.hasPayroll : !client.hasPayroll)
      return matchesSearch && matchesRegime && matchesPayroll
    })
  }, [clients, clientSearch, regimeFilter, payrollFilter])

  useEffect(() => {
    setClientsPage(1)
  }, [clientSearch, regimeFilter, payrollFilter, clientsPageSize])

  const clientsPageCount = Math.max(1, Math.ceil(filteredClients.length / clientsPageSize))

  useEffect(() => {
    setClientsPage(current => Math.min(Math.max(current, 1), clientsPageCount))
  }, [clientsPageCount])

  const paginatedClients = useMemo(() => {
    const start = (clientsPage - 1) * clientsPageSize
    return filteredClients.slice(start, start + clientsPageSize)
  }, [filteredClients, clientsPage, clientsPageSize])

  const clientsRangeStart = filteredClients.length ? (clientsPage - 1) * clientsPageSize + 1 : 0
  const clientsRangeEnd = filteredClients.length ? Math.min(clientsPage * clientsPageSize, filteredClients.length) : 0

  const clientsSummary = useMemo(() => {
    const activeClients = clients.filter(client => client.status === 'Ativo').length
    const inactiveClients = clients.filter(client => client.status === 'Inativo').length
    const payrollClients = clients.filter(client => client.hasPayroll).length
    const monthlyRevenue = clients.reduce((total, client) => total + client.monthlyFee, 0)

    return {
      totalClients: clients.length,
      activeClients,
      inactiveClients,
      payrollClients,
      payrollPercentage: clients.length ? Math.round((payrollClients / clients.length) * 100) : 0,
      monthlyRevenue,
      totalAttachments: attachments.length,
    }
  }, [clients, attachments])

  const filteredCompetences = useMemo(() => {
    const month = competenceMonthFilter ? normalizeRoutineCompetenceMonth(competenceMonthFilter) : ''
    return competences.filter(competence => {
      const client = getClient(competence.clientId)
      const competenceItems = getCompetenceItems(competence.id)
      const competenceStatus = getRoutineCompetenceStatus(client, competenceItems)
      const fiscalStatus = getRoutineDepartmentStatus(client, competenceItems, 'Fiscal')
      const payrollStatus = getRoutineDepartmentStatus(client, competenceItems, 'Departamento Pessoal')
      const matchesClient = competenceClientFilter === 'Todos' || competence.clientId === competenceClientFilter
      const matchesMonth = !month || competence.competenceMonth === month
      const matchesRegime = competenceRegimeFilter === 'Todos' || client?.regime === competenceRegimeFilter
      const matchesFiscal = matchesRoutineDepartmentFilter(fiscalStatus, competenceFiscalFilter)
      const matchesPayroll = matchesRoutineDepartmentFilter(payrollStatus, competencePayrollFilter)
      const matchesStatus = competenceStatusFilter === 'Todos' || competenceStatus === competenceStatusFilter
      return matchesClient && matchesMonth && matchesRegime && matchesFiscal && matchesPayroll && matchesStatus
    })
  }, [competences, clients, items, competenceClientFilter, competenceRegimeFilter, competenceFiscalFilter, competencePayrollFilter, competenceStatusFilter, competenceMonthFilter])

  const getClientAttachmentCount = (clientId: string) => attachments.filter(attachment => attachment.clientId === clientId).length

  const getClientCustomObligations = (clientId: string) => customObligations.filter(obligation => obligation.clientId === clientId && obligation.active)

  const handleAddCustomObligation = async (
    client: RoutineClient,
    draft: {
      name: string
      department: RoutineDepartment
      category: string
      requiresFile: boolean
      notes: string
    }
  ) => {
    const cleanName = draft.name.trim()
    if (!cleanName) throw new Error('Informe o nome da obrigação específica.')

    const { data, error: insertError } = await supabase
      .from(ROUTINE_CLIENT_CUSTOM_OBLIGATIONS_TABLE)
      .insert({
        client_id: client.id,
        name: cleanName,
        department: draft.department,
        category: draft.category.trim() || 'Personalizada',
        requires_file: draft.requiresFile,
        active: true,
        notes: draft.notes.trim(),
        sort_order: 900 + getClientCustomObligations(client.id).length,
      })
      .select('*')
      .single()

    if (insertError || !data) {
      throw new Error(insertError?.message || 'Não consegui criar a obrigação específica.')
    }

    const createdObligation = mapRoutineClientCustomObligation(data as RoutineClientCustomObligationRow)
    setCustomObligations(current => [...current, createdObligation])

    if (selectedCompetence?.clientId === client.id) {
      const [payload] = buildRoutineItemsPayload(client, selectedCompetence.id, [createdObligation]).filter(item => item.custom_obligation_id === createdObligation.id)
      if (payload) {
        const { data: itemData } = await supabase.from(ROUTINE_ITEMS_TABLE).insert(payload).select('*')
        if (itemData?.length) {
          setItems(current => [...itemData.map(row => mapRoutineItem(row as RoutineItemRow)), ...current])
        }
      }
    }
  }

  const handleDeleteCustomObligation = async (obligation: RoutineClientCustomObligation) => {
    const { error: deleteError } = await supabase
      .from(ROUTINE_CLIENT_CUSTOM_OBLIGATIONS_TABLE)
      .delete()
      .eq('id', obligation.id)

    if (deleteError) {
      throw new Error(deleteError.message || 'Não consegui remover a obrigação específica.')
    }

    setCustomObligations(current => current.filter(currentObligation => currentObligation.id !== obligation.id))
  }

  const handleUploadClientAttachments = async (
    client: RoutineClient,
    category: RoutineAttachmentCategory,
    files: File[]
  ) => {
    if (!files.length) return

    const oversizedFile = files.find(file => file.size > ROUTINE_ATTACHMENT_LIMIT_BYTES)
    if (oversizedFile) {
      throw new Error(`O arquivo ${oversizedFile.name} passou de 10MB.`)
    }

    const createdAttachments: RoutineClientAttachment[] = []

    for (const file of files) {
      const safeName = sanitizeRoutineAttachmentFileName(file.name)
      const storagePath = `${client.id}/${category}/${Date.now()}-${genId()}-${safeName}`
      const { error: uploadError } = await supabase.storage
        .from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET)
        .upload(storagePath, file)

      if (uploadError) {
        throw new Error(uploadError.message || 'Não consegui enviar o arquivo.')
      }

      const { data, error: insertError } = await supabase
        .from(ROUTINE_CLIENT_ATTACHMENTS_TABLE)
        .insert({
          client_id: client.id,
          category,
          display_name: file.name,
          file_name: file.name,
          storage_path: storagePath,
          mime_type: file.type || null,
          file_size: file.size,
        })
        .select('*')
        .single()

      if (insertError || !data) {
        await supabase.storage.from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET).remove([storagePath])
        throw new Error(insertError?.message || 'Arquivo enviado, mas não consegui registrar o anexo.')
      }

      createdAttachments.push(mapRoutineClientAttachment(data as RoutineClientAttachmentRow))
    }

    setAttachments(current => [...createdAttachments, ...current])
  }

  const handleDownloadClientAttachment = async (attachment: RoutineClientAttachment) => {
    const { data, error: downloadError } = await supabase.storage
      .from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET)
      .createSignedUrl(attachment.storagePath, 60 * 5)

    if (downloadError || !data?.signedUrl) {
      throw new Error(downloadError?.message || 'Não consegui gerar o link de download.')
    }

    const link = document.createElement('a')
    link.href = data.signedUrl
    link.download = attachment.displayName || attachment.fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleRenameClientAttachment = async (attachment: RoutineClientAttachment, nextName: string) => {
    const cleanName = nextName.trim()
    if (!cleanName) throw new Error('Informe um nome para o anexo.')

    const updatedAt = new Date().toISOString()
    const { data, error: renameError } = await supabase
      .from(ROUTINE_CLIENT_ATTACHMENTS_TABLE)
      .update({ display_name: cleanName, updated_at: updatedAt })
      .eq('id', attachment.id)
      .select('*')
      .single()

    if (renameError || !data) {
      throw new Error(renameError?.message || 'Não consegui renomear o anexo.')
    }

    const renamedAttachment = mapRoutineClientAttachment(data as RoutineClientAttachmentRow)
    setAttachments(current => current.map(currentAttachment => currentAttachment.id === attachment.id ? renamedAttachment : currentAttachment))
  }

  const handleDeleteClientAttachment = async (attachment: RoutineClientAttachment) => {
    const { error: deleteStorageError } = await supabase.storage
      .from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET)
      .remove([attachment.storagePath])

    if (deleteStorageError) {
      throw new Error(deleteStorageError.message || 'Não consegui excluir o arquivo.')
    }

    const { error: deleteRowError } = await supabase
      .from(ROUTINE_CLIENT_ATTACHMENTS_TABLE)
      .delete()
      .eq('id', attachment.id)

    if (deleteRowError) {
      throw new Error(deleteRowError.message || 'Arquivo excluído, mas não consegui remover o registro.')
    }

    setAttachments(current => current.filter(currentAttachment => currentAttachment.id !== attachment.id))
  }

  const handleSaveClient = async (formData: RoutineClientFormData, clientId?: string) => {
    const payload = {
      name: formData.name,
      cnpj: formData.cnpj,
      partner_name: formData.partnerName,
      partner_cpf: formData.partnerCpf,
      regime: formData.regime,
      has_payroll: formData.hasPayroll,
      has_employees: formData.hasEmployees,
      has_pro_labore: formData.hasProLabore,
      issues_invoices: formData.issuesInvoices,
      needs_fiscal_tracking: formData.needsFiscalTracking,
      whatsapp: formData.whatsapp,
      email: formData.email,
      monthly_fee: formData.monthlyFee,
      notes: formData.notes,
      status: formData.status,
      documents: formData.documents,
      updated_at: new Date().toISOString(),
    }

    if (clientId) {
      const { data, error: saveError } = await supabase.from(ROUTINE_CLIENTS_TABLE).update(payload).eq('id', clientId).select('*').single()
      if (saveError || !data) throw new Error('Não consegui salvar o cliente.')
      const updatedClient = mapRoutineClient(data as RoutineClientRow)
      setClients(current => current.map(client => client.id === clientId ? updatedClient : client))
      return
    }

    const { data, error: saveError } = await supabase.from(ROUTINE_CLIENTS_TABLE).insert(payload).select('*').single()
    if (saveError || !data) throw new Error('Não consegui cadastrar o cliente.')
    setClients(current => [mapRoutineClient(data as RoutineClientRow), ...current])
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Excluir este cliente e suas competências?')) return
    await supabase.from(ROUTINE_CLIENTS_TABLE).delete().eq('id', clientId)
    const removedCompetenceIds = competences.filter(competence => competence.clientId === clientId).map(competence => competence.id)
    setClients(current => current.filter(client => client.id !== clientId))
    setCompetences(current => current.filter(competence => competence.clientId !== clientId))
    setItems(current => current.filter(item => !removedCompetenceIds.includes(item.competenceId)))
    if (selectedCompetence && selectedCompetence.clientId === clientId) setSelectedCompetenceId(null)
  }

  const handleCreateCompetence = async (clientId: string, monthValue: string) => {
	const competenceMonth = normalizeRoutineCompetenceMonth(monthValue)
	const exists = competences.find(competence => competence.clientId === clientId && competence.competenceMonth === competenceMonth)
	if (exists) {
		throw new Error('Essa empresa já tem rotinas cadastradas nessa competência.')
	}

    const { data, error: competenceError } = await supabase
      .from(ROUTINE_COMPETENCES_TABLE)
      .insert({ client_id: clientId, competence_month: competenceMonth, updated_at: new Date().toISOString() })
      .select('*')
      .single()

    if (competenceError || !data) throw new Error('Não consegui criar a competência.')

    const createdCompetence = mapRoutineCompetence(data as RoutineCompetenceRow)
    const client = clients.find(entry => entry.id === clientId) ?? null
    const routinePayload = buildRoutineItemsPayload(client, createdCompetence.id, getClientCustomObligations(clientId))
    const { data: createdItems, error: itemsError } = await supabase.from(ROUTINE_ITEMS_TABLE).insert(routinePayload).select('*')

    if (itemsError) throw new Error('Competência criada, mas não consegui gerar a checklist.')

    setCompetences(current => [createdCompetence, ...current])
    setItems(current => [...(createdItems ?? []).map(row => mapRoutineItem(row as RoutineItemRow)), ...current])
    setSelectedCompetenceId(createdCompetence.id)
    setActiveArea('Competências')
  }

  const handleCreateCompetencesBulk = async (clientIds: string[], monthValue: string) => {
    const competenceMonth = normalizeRoutineCompetenceMonth(monthValue)
    const uniqueClientIds = Array.from(new Set(clientIds)).filter(Boolean)
    if (!uniqueClientIds.length) throw new Error('Selecione pelo menos uma empresa.')

    const existingClientIds = new Set(
      competences
        .filter(competence => competence.competenceMonth === competenceMonth && uniqueClientIds.includes(competence.clientId))
        .map(competence => competence.clientId)
    )
    const missingClientIds = uniqueClientIds.filter(clientId => !existingClientIds.has(clientId))

    if (!missingClientIds.length) {
      setCompetenceMonthFilter(monthValue)
      setCompetenceClientFilter('Todos')
      setActiveArea('Competências')
      return
    }

    const now = new Date().toISOString()
    const { data, error: competenceError } = await supabase
      .from(ROUTINE_COMPETENCES_TABLE)
      .insert(missingClientIds.map(clientId => ({
        client_id: clientId,
        competence_month: competenceMonth,
        updated_at: now,
      })))
      .select('*')

    if (competenceError || !data) throw new Error('Não consegui criar as competências em lote.')

    const createdCompetences = data.map(row => mapRoutineCompetence(row as RoutineCompetenceRow))
    const routinePayload = createdCompetences.flatMap(competence => {
      const client = clients.find(entry => entry.id === competence.clientId) ?? null
      return buildRoutineItemsPayload(client, competence.id, getClientCustomObligations(competence.clientId))
    })

    let createdItems: RoutineItem[] = []
    if (routinePayload.length) {
      const { data: itemsData, error: itemsError } = await supabase.from(ROUTINE_ITEMS_TABLE).insert(routinePayload).select('*')
      if (itemsError) throw new Error('Competências criadas, mas não consegui gerar as rotinas.')
      createdItems = (itemsData ?? []).map(row => mapRoutineItem(row as RoutineItemRow))
    }

    setCompetences(current => [...createdCompetences, ...current])
    setItems(current => [...createdItems, ...current])
    setCompetenceMonthFilter(monthValue)
    setCompetenceClientFilter('Todos')
    setActiveArea('Competências')
  }

  const handleDeleteCompetence = async (competenceId: string) => {
    if (!confirm('Excluir esta competência?')) return
    await supabase.from(ROUTINE_COMPETENCES_TABLE).delete().eq('id', competenceId)
    setCompetences(current => current.filter(competence => competence.id !== competenceId))
    setItems(current => current.filter(item => item.competenceId !== competenceId))
    if (selectedCompetenceId === competenceId) setSelectedCompetenceId(null)
  }

  const handleUpdateItem = async (itemId: string, updates: Partial<RoutineItem>) => {
    const currentItem = items.find(item => item.id === itemId)
    if (!currentItem) return
    const nextItem = { ...currentItem, ...updates }
    let sentAt = nextItem.sentAt
    if (updates.status === 'Enviado') sentAt = currentItem.sentAt || new Date().toISOString()
    if (updates.status && updates.status !== 'Enviado') sentAt = ''
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.fileName !== undefined) dbUpdates.file_name = updates.fileName
    if (updates.fileUrl !== undefined) dbUpdates.file_url = updates.fileUrl
    if (updates.fileStoragePath !== undefined) dbUpdates.file_storage_path = updates.fileStoragePath
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes
    dbUpdates.sent_at = sentAt || null

    setItems(current => current.map(item => item.id === itemId ? { ...nextItem, sentAt, updatedAt: new Date().toISOString() } : item))
    await supabase.from(ROUTINE_ITEMS_TABLE).update(dbUpdates).eq('id', itemId)
  }

  const openRoutineCompetence = async (competenceId: string) => {
    const competence = competences.find(entry => entry.id === competenceId)
    const client = competence ? clients.find(entry => entry.id === competence.clientId) : null
    const existingItems = items.filter(item => item.competenceId === competenceId)
    const existingKeys = new Set(existingItems.map(item => item.customObligationId ? `custom:${item.customObligationId}` : `standard:${item.routineName}`))
    const missingPayload = competence
      ? buildRoutineItemsPayload(client, competenceId, getClientCustomObligations(competence.clientId))
          .filter(item => {
            const customId = typeof item.custom_obligation_id === 'string' ? item.custom_obligation_id : ''
            const key = customId ? `custom:${customId}` : `standard:${item.routine_name}`
            return !existingKeys.has(key)
          })
      : []

    if (missingPayload.length) {
      const { data } = await supabase.from(ROUTINE_ITEMS_TABLE).insert(missingPayload).select('*')
      if (data?.length) {
        setItems(current => [...data.map(row => mapRoutineItem(row as RoutineItemRow)), ...current])
      }
    }

    setSelectedCompetenceId(competenceId)
    setActiveArea('Competências')
  }

  const handleRoutineFile = async (client: RoutineClient, item: RoutineItem, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (file.size > ROUTINE_ATTACHMENT_LIMIT_BYTES) {
      setRoutineFileErrors(current => ({ ...current, [item.id]: 'O arquivo passou de 10MB.' }))
      return
    }

    setRoutineFileErrors(current => {
      const { [item.id]: _removed, ...rest } = current
      return rest
    })
    setRoutineFileUploading(current => ({ ...current, [item.id]: true }))

    try {
      const safeName = sanitizeRoutineAttachmentFileName(file.name)
      const storagePath = `${client.id}/routine-items/${item.id}/${Date.now()}-${genId()}-${safeName}`
      const previousPath = item.fileStoragePath

      const { error: uploadError } = await supabase.storage
        .from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET)
        .upload(storagePath, file)

      if (uploadError) {
        throw new Error(uploadError.message || 'Não consegui enviar o arquivo.')
      }

      await handleUpdateItem(item.id, { fileName: file.name, fileStoragePath: storagePath, status: 'Anexado' })

      if (previousPath) {
        await supabase.storage.from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET).remove([previousPath])
      }
    } catch (uploadError) {
      setRoutineFileErrors(current => ({
        ...current,
        [item.id]: uploadError instanceof Error ? uploadError.message : 'Não consegui anexar o arquivo.',
      }))
    } finally {
      setRoutineFileUploading(current => {
        const { [item.id]: _removed, ...rest } = current
        return rest
      })
    }
  }

  const handleExportRoutineClients = async () => {
    const headers = ['Cliente', 'Sócio', 'CPF', 'CNPJ', 'Regime', 'Folha', 'Funcionários', 'Pró-labore', 'Notas fiscais', 'Fiscal mensal', 'WhatsApp', 'E-mail', 'Mensalidade', 'Observação']
    const escapeCsvValue = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const rows = filteredClients.map(client => [
      client.name,
      client.partnerName,
      client.partnerCpf,
      client.cnpj,
      client.regime,
      client.hasPayroll ? 'Sim' : 'Não',
      client.hasEmployees ? 'Sim' : 'Não',
      client.hasProLabore ? 'Sim' : 'Não',
      client.issuesInvoices ? 'Sim' : 'Não',
      client.needsFiscalTracking ? 'Sim' : 'Não',
      client.whatsapp,
      client.email,
      formatRoutineMoney(client.monthlyFee),
      client.notes,
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(value => escapeCsvValue(value)).join(';'))
      .join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clientes-contabilidade-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const getEmailScopeItems = (scope: RoutineEmailScope) => scope === 'Geral'
    ? selectedVisibleItems
    : selectedVisibleItems.filter(item => getRoutineItemDepartment(item, selectedClient) === scope)

  const emailScopeItems = emailModalScope ? getEmailScopeItems(emailModalScope) : []
  const emailScopeAttachmentCount = emailScopeItems.filter(item => item.fileStoragePath).length
  const selectedCompetenceStatus = selectedClient && selectedCompetence
    ? getRoutineCompetenceStatus(selectedClient, selectedItems)
    : 'Inacabado'

  const getRoutineEmailDraft = (scope: RoutineEmailScope, scopedItems = getEmailScopeItems(scope)): RoutineEmailDraft => {
    if (!selectedClient || !selectedCompetence) return { subject: '', text: '' }
    const key = getRoutineEmailScopeKey(selectedCompetence.id, scope)
    return routineEmailDrafts[key] ?? {
      subject: buildRoutineEmailSubject(selectedClient, selectedCompetence, scope === 'Geral' ? null : scope),
      text: buildRoutineMessage(selectedClient, selectedCompetence, scopedItems, scope === 'Geral' ? null : scope),
    }
  }

  const updateRoutineEmailDraft = (scope: RoutineEmailScope, updates: Partial<RoutineEmailDraft>, scopedItems = getEmailScopeItems(scope)) => {
    if (!selectedCompetence) return
    setRoutineEmailDrafts(current => {
      const key = getRoutineEmailScopeKey(selectedCompetence.id, scope)
      const fallback = getRoutineEmailDraft(scope, scopedItems)
      return {
        ...current,
        [key]: { ...fallback, ...current[key], ...updates },
      }
    })
  }

  const saveRoutineEmailDraft = async (scope: RoutineEmailScope, scopedItems = getEmailScopeItems(scope)) => {
    if (!selectedCompetence || !routineEmailDraftPersistence) return
    const draft = getRoutineEmailDraft(scope, scopedItems)
    const { error: saveError } = await supabase
      .from(ROUTINE_EMAIL_DRAFTS_TABLE)
      .upsert({
        competence_id: selectedCompetence.id,
        scope,
        subject: draft.subject,
        body: draft.text,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'competence_id,scope' })

    if (saveError) {
      setRoutineEmailDraftPersistence(false)
      setRoutineEmailFeedback({ type: 'error', text: 'Rascunho mantido só nesta tela. Execute o SQL de rascunhos para salvar no banco.' })
    }
  }

  const emailModalDraft = emailModalScope ? getRoutineEmailDraft(emailModalScope, emailScopeItems) : { subject: '', text: '' }

  const openRoutineEmailModal = (scope: RoutineEmailScope) => {
    if (!selectedClient || !selectedCompetence) return
    setRoutineEmailFeedback(null)
    setEmailModalScope(scope)
  }

  const handleSendRoutineEmail = async (scope: RoutineEmailScope) => {
    if (!selectedClient || !selectedCompetence) return
    const scopedItems = getEmailScopeItems(scope)
    const emailDraft = getRoutineEmailDraft(scope, scopedItems)

    if (!selectedClient.email.trim()) {
      setRoutineEmailFeedback({ type: 'error', text: 'Este cliente não tem e-mail cadastrado.' })
      return
    }

    if (!emailDraft.subject.trim()) {
      setRoutineEmailFeedback({ type: 'error', text: 'Informe o assunto do e-mail.' })
      return
    }

    if (!emailDraft.text.trim()) {
      setRoutineEmailFeedback({ type: 'error', text: 'Informe o corpo do e-mail.' })
      return
    }

    setRoutineEmailSending(true)
    setRoutineEmailFeedback(null)
    void saveRoutineEmailDraft(scope, scopedItems)

    try {
      const sentItemIds = scopedItems
        .filter(item => isRoutineItemApplicableToClient(selectedClient, item) && item.status !== 'Não precisa')
        .map(item => item.id)

      const response = await fetch('/api/contabilidade/enviar-rotinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedClient.email.trim(),
          subject: emailDraft.subject,
          text: emailDraft.text,
          itemIds: sentItemIds,
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Não consegui enviar o e-mail.')
      }

      const now = new Date().toISOString()

      if (sentItemIds.length) {
        const { error: updateError } = await supabase
          .from(ROUTINE_ITEMS_TABLE)
          .update({ status: 'Enviado', sent_at: now, updated_at: now })
          .in('id', sentItemIds)

        if (updateError) throw new Error('E-mail enviado, mas não consegui atualizar o status das rotinas.')

        setItems(current => current.map(item => sentItemIds.includes(item.id)
          ? { ...item, status: 'Enviado', sentAt: now, updatedAt: now }
          : item
        ))
      }

      setRoutineEmailFeedback({ type: 'success', text: `E-mail enviado para ${selectedClient.email}.` })
    } catch (sendError) {
      setRoutineEmailFeedback({
        type: 'error',
        text: sendError instanceof Error ? sendError.message : 'Não consegui enviar o e-mail.',
      })
    } finally {
      setRoutineEmailSending(false)
    }
  }

  return (
    <div className="routine-module crm-module">
      <div className="crm-module-inner routine-module-inner">
        <div className="crm-module-header">
          <div>
            <h2>Clientes</h2>
            <p>Gerencie seus clientes e acompanhe suas informações.</p>
          </div>
          <div className="crm-header-right">
            {error && <span className="crm-global-error">{error}</span>}
            {activeArea === 'Clientes' && (
              <button
                className="crm-add-btn crm-add-icon-btn routine-top-action"
                onClick={() => void handleExportRoutineClients()}
                type="button"
                aria-label="Exportar clientes"
                title="Exportar clientes"
              >
                <DownloadTemplateIcon />
                <span>Exportar</span>
              </button>
            )}
            {activeArea === 'Competências' && (
              <button
                className="crm-add-btn crm-add-icon-btn routine-top-action"
                onClick={() => setQuickCompetenceModalOpen(true)}
                type="button"
                aria-label="Processar competências em massa"
                title="Processar em massa"
              >
                <RoutineBulkIcon />
                <span>Processar em massa</span>
              </button>
            )}
            <button
              className="crm-add-btn crm-add-icon-btn routine-top-action"
              onClick={() => setBroadcastModalOpen(true)}
              type="button"
              aria-label="Criar disparo"
              title="Disparos"
            >
              <RoutineBroadcastIcon />
              <span>Disparos</span>
            </button>
            <button
              className="crm-add-btn crm-add-icon-btn routine-top-action"
              onClick={() => setCompetenceModalOpen(true)}
              type="button"
              aria-label="Criar novo período"
              title="Novo período"
            >
              <RoutineCalendarIcon />
              <span>Novo período</span>
            </button>
            <button
              className="crm-add-btn crm-add-icon-btn routine-top-action routine-top-action-primary"
              onClick={() => setClientModal('new')}
              type="button"
              aria-label="Cadastrar cliente"
              title="Cadastrar cliente"
            >
              <UserPlusIcon />
              <span>Novo cliente</span>
            </button>
          </div>
        </div>

        <div className="routine-tabs" aria-label="Áreas de Clientes">
          {ROUTINE_AREAS.map(area => (
            <button
              key={area}
              type="button"
              className={activeArea === area ? 'active' : ''}
              onClick={() => {
                setActiveArea(area)
                setSelectedCompetenceId(null)
              }}
            >
              {area}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="crm-loading">Carregando rotinas...</div>
        ) : activeArea === 'Clientes' ? (
          <>
            <div className="routine-summary-grid" aria-label="Resumo de clientes">
              <article className="routine-summary-card">
                <span className="routine-summary-icon"><ModuleIcon type="clients" /></span>
                <div>
                  <span>Total de clientes</span>
                  <strong>{clientsSummary.totalClients}</strong>
                  <p><em>Ativos</em> {clientsSummary.activeClients} <span>Inativos</span> {clientsSummary.inactiveClients}</p>
                </div>
              </article>
              <article className="routine-summary-card">
                <span className="routine-summary-icon"><UserPlusIcon /></span>
                <div>
                  <span>Clientes com folha</span>
                  <strong>{clientsSummary.payrollClients}</strong>
                  <p>{clientsSummary.payrollPercentage}% do total</p>
                </div>
              </article>
              <article className="routine-summary-card">
                <span className="routine-summary-icon routine-summary-icon-text">R$</span>
                <div>
                  <span>Receita mensal recorrente</span>
                  <strong>{formatRoutineMoney(clientsSummary.monthlyRevenue)}</strong>
                  <p>Mensalidades cadastradas</p>
                </div>
              </article>
              <article className="routine-summary-card">
                <span className="routine-summary-icon"><FolderIcon /></span>
                <div>
                  <span>Anexos totais</span>
                  <strong>{clientsSummary.totalAttachments}</strong>
                  <p>Documentos</p>
                </div>
              </article>
            </div>

            <RoutineFilters className="routine-client-filters">
              <label className="routine-search-field">
                <svg aria-hidden viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16.5 16.5 4 4" />
                </svg>
                <input value={clientSearch} onChange={event => setClientSearch(event.target.value)} placeholder="Buscar por nome, CNPJ, WhatsApp ou e-mail" />
              </label>
              <select value={regimeFilter} onChange={event => setRegimeFilter(event.target.value as 'Todos' | RoutineRegime)}>
                <option value="Todos">Todos os regimes</option>
                {ROUTINE_REGIMES.map(regime => <option key={regime} value={regime}>{regime}</option>)}
              </select>
              <select value={payrollFilter} onChange={event => setPayrollFilter(event.target.value as 'Todos' | 'Sim' | 'Não')}>
                <option value="Todos">Com ou sem folha</option>
                <option value="Sim">Com folha</option>
                <option value="Não">Sem folha</option>
              </select>
            </RoutineFilters>
            <div className="pfx-table-card routine-table-card routine-clients-card">
              <table className="pfx-table routine-table routine-clients-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>CNPJ</th>
                    <th>Regime</th>
                    <th>Folha</th>
                    <th>E-mail</th>
                    <th>Mensalidade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClients.map(client => {
                    const attachmentCount = getClientAttachmentCount(client.id)
                    return (
                    <tr key={client.id} className="routine-clickable-row" onClick={() => setClientModal(client)}>
                      <td data-label="Cliente">
                        <div className="routine-client-identity">
                          <span className="routine-client-avatar" aria-hidden="true">{getRoutineClientInitials(client.name)}</span>
                          <strong>{client.name}</strong>
                        </div>
                      </td>
                      <td data-label="CNPJ"><span className="routine-muted-value">{client.cnpj || 'Não informado'}</span></td>
                      <td data-label="Regime"><span className={`routine-regime-badge ${getRoutineRegimeClass(client.regime)}`}>{client.regime}</span></td>
                      <td data-label="Folha"><span className={`routine-payroll-badge ${client.hasPayroll ? 'yes' : 'no'}`}>{client.hasPayroll ? 'Sim' : 'Não'}</span></td>
                      <td data-label="E-mail"><span className="routine-email-value" title={client.email || 'Não informado'}>{client.email || 'Não informado'}</span></td>
                      <td data-label="Mensalidade"><strong className="routine-money-value">{formatRoutineMoney(client.monthlyFee)}</strong></td>
                      <td data-label="Ações">
                        <div className="routine-row-actions">
                          <button
                            className="routine-icon-action"
                            type="button"
                            onClick={event => {
                              event.stopPropagation()
                              setAttachmentsClient(client)
                            }}
                            aria-label={`Anexos${attachmentCount ? ` (${attachmentCount})` : ''}`}
                            title={`Anexos${attachmentCount ? ` (${attachmentCount})` : ''}`}
                          >
                            <FolderIcon />
                            {attachmentCount > 0 && <span className="routine-action-count">{attachmentCount}</span>}
                          </button>
                          <button className="routine-icon-action" type="button" onClick={event => { event.stopPropagation(); setClientModal(client) }} aria-label="Editar" title="Editar"><PencilIcon /></button>
                          <button className="routine-icon-action routine-icon-action-danger" type="button" onClick={event => { event.stopPropagation(); void handleDeleteClient(client.id) }} aria-label="Excluir" title="Excluir"><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredClients.length === 0 && <div className="pfx-empty-state"><strong>Nenhum cliente encontrado.</strong><span>Cadastre ou ajuste os filtros para visualizar.</span></div>}
              {filteredClients.length > 0 && (
                <div className="routine-pagination" aria-label="Paginação de clientes">
                  <span>Mostrando {clientsRangeStart} a {clientsRangeEnd} de {filteredClients.length} clientes</span>
                  <div className="routine-pagination-controls">
                    <button type="button" onClick={() => setClientsPage(page => Math.max(1, page - 1))} disabled={clientsPage === 1} aria-label="Página anterior">‹</button>
                    {getRoutinePaginationPages(clientsPage, clientsPageCount).map((page, index) => page === 'ellipsis' ? (
                      <em key={`ellipsis-${index}`}>...</em>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        className={clientsPage === page ? 'active' : ''}
                        onClick={() => setClientsPage(page)}
                        aria-label={`Página ${page}`}
                        aria-current={clientsPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                    <button type="button" onClick={() => setClientsPage(page => Math.min(clientsPageCount, page + 1))} disabled={clientsPage === clientsPageCount} aria-label="Próxima página">›</button>
                  </div>
                  <label>
                    <select value={clientsPageSize} onChange={event => setClientsPageSize(Number(event.target.value))}>
                      <option value={10}>10 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                    </select>
                  </label>
                </div>
              )}
            </div>
          </>
        ) : activeArea === 'Competências' && selectedCompetence && selectedClient ? (
          <div className="routine-checklist">
            <div className="routine-checklist-header">
              <button type="button" onClick={() => setSelectedCompetenceId(null)}>Voltar</button>
              <div>
                <span>{selectedClient.name}</span>
                <strong>{formatRoutineCompetence(selectedCompetence.competenceMonth)}</strong>
              </div>
              <span className={`routine-competence-badge ${selectedCompetenceStatus === 'Enviado' ? 'sent' : 'unfinished'}`}>
                {selectedCompetenceStatus}
              </span>
              <button type="button" onClick={() => setClientModal(selectedClient)}>Obrigação específica</button>
              <button type="button" onClick={() => openRoutineEmailModal('Geral')}>Enviar tudo</button>
            </div>
            {routineEmailFeedback && <p className={`routine-email-feedback ${routineEmailFeedback.type}`}>{routineEmailFeedback.text}</p>}
            <div className="routine-checklist-list">
              {selectedItemsByDepartment.map(group => {
                const departmentDraft = getRoutineEmailDraft(group.department, group.items)
                const departmentAttachedItems = group.items.filter(item => item.fileStoragePath)
                return (
                <section key={group.department} className="routine-department-group">
                  <div className="routine-department-header">
                    <div>
                      <strong>{group.department}</strong>
                      <span>{group.items.length} {group.items.length === 1 ? 'obrigação' : 'obrigações'} no setor</span>
                    </div>
                    <div className="routine-department-header-meta">
                      <span>{departmentAttachedItems.length} {departmentAttachedItems.length === 1 ? 'arquivo' : 'arquivos'}</span>
                      <button type="button" className="routine-department-send" disabled={routineEmailSending} onClick={() => { void handleSendRoutineEmail(group.department) }}>
                        {routineEmailSending ? 'Enviando...' : 'Enviar setor'}
                      </button>
                    </div>
                  </div>
                  <div className="routine-department-workspace">
                    <div className="routine-department-items">
                      {group.items.map(item => {
                  const applicable = isRoutineItemApplicableToClient(selectedClient, item)
                  const fileError = routineFileErrors[item.id]
                  const isUploading = Boolean(routineFileUploading[item.id])
                  return (
                    <div key={item.id} className={`routine-checklist-item${!applicable ? ' routine-not-applicable' : ''}`}>
                      <div className="routine-checklist-title">
                        <span style={{ background: applicable ? ROUTINE_STATUS_DOT[item.status] : '#71717a' }} />
                        <div>
                          <strong>{item.routineName}</strong>
                          <em>{getRoutineItemCategory(item, selectedClient)}{item.isCustom ? ' · personalizada' : ''}</em>
                        </div>
                        {!applicable && <em>Não se aplica</em>}
                      </div>
                      <select value={item.status} onChange={event => void handleUpdateItem(item.id, { status: event.target.value as RoutineItemStatus })}>
                        {ROUTINE_ITEM_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <label className={`routine-file-control${fileError ? ' has-error' : ''}`} title={fileError || item.fileName || undefined}>
                        <input type="file" disabled={isUploading} onChange={event => void handleRoutineFile(selectedClient, item, event)} />
                        {isUploading ? 'Enviando...' : fileError ? 'Falha ao anexar' : (item.fileName || 'Anexar arquivo')}
                      </label>
                      <input value={item.notes} onChange={event => setItems(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, notes: event.target.value } : currentItem))} onBlur={event => void handleUpdateItem(item.id, { notes: event.target.value })} placeholder="Observação interna" />
                      <span>{formatRoutineSentDate(item.sentAt)}</span>
                    </div>
                  )
                      })}
                    </div>
                    <aside className="routine-sector-email-card">
                      <div className="routine-sector-email-header">
                        <div>
                          <span>{getRoutineEmailScopeTitle(group.department)}</span>
                          <strong>{selectedClient.email || 'E-mail não cadastrado'}</strong>
                        </div>
                        <em>{departmentAttachedItems.length} {departmentAttachedItems.length === 1 ? 'arquivo' : 'arquivos'}</em>
                      </div>
                      <label>
                        Assunto
                        <input
                          value={departmentDraft.subject}
                          onChange={event => updateRoutineEmailDraft(group.department, { subject: event.target.value }, group.items)}
                          onBlur={() => { void saveRoutineEmailDraft(group.department, group.items) }}
                        />
                      </label>
                      <label>
                        Corpo do e-mail
                        <textarea
                          value={departmentDraft.text}
                          onChange={event => updateRoutineEmailDraft(group.department, { text: event.target.value }, group.items)}
                          onBlur={() => { void saveRoutineEmailDraft(group.department, group.items) }}
                        />
                      </label>
                      <div className="routine-sector-attachments">
                        <div>
                          <strong>Arquivos anexados do setor</strong>
                          <span>{departmentAttachedItems.length ? `${departmentAttachedItems.length} arquivo${departmentAttachedItems.length === 1 ? '' : 's'}` : 'Nenhum arquivo anexado'}</span>
                        </div>
                        {departmentAttachedItems.length > 0 && (
                          <ul>
                            {departmentAttachedItems.slice(0, 3).map(item => (
                              <li key={item.id}>
                                <FolderIcon />
                                <span>{item.fileName || item.routineName}</span>
                              </li>
                            ))}
                            {departmentAttachedItems.length > 3 && <li className="routine-sector-more">+{departmentAttachedItems.length - 3} mais</li>}
                          </ul>
                        )}
                      </div>
                      <button type="button" className="routine-sector-send" disabled={routineEmailSending} onClick={() => { void handleSendRoutineEmail(group.department) }}>
                        {routineEmailSending ? 'Enviando...' : 'Enviar setor'}
                      </button>
                    </aside>
                  </div>
                </section>
                )
              })}
            </div>
          </div>
        ) : activeArea === 'Competências' ? (
          <>
            <RoutineFilters className="routine-competence-filters">
              <select value={competenceClientFilter} onChange={event => setCompetenceClientFilter(event.target.value)}>
                <option value="Todos">Todos os clientes</option>
                {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
              <select value={competenceRegimeFilter} onChange={event => setCompetenceRegimeFilter(event.target.value as 'Todos' | RoutineRegime)}>
                <option value="Todos">Todos os regimes</option>
                {ROUTINE_REGIMES.map(regime => <option key={regime} value={regime}>{regime}</option>)}
              </select>
              <select value={competenceFiscalFilter} onChange={event => setCompetenceFiscalFilter(event.target.value as RoutineDepartmentFilter)}>
                <option value="Todos">Fiscal: todos</option>
                <option value="Feito">Fiscal: feito</option>
                <option value="Pendente">Fiscal: pendente</option>
                <option value="Não se aplica">Fiscal: não se aplica</option>
              </select>
              <select value={competencePayrollFilter} onChange={event => setCompetencePayrollFilter(event.target.value as RoutineDepartmentFilter)}>
                <option value="Todos">DP: todos</option>
                <option value="Feito">DP: feito</option>
                <option value="Pendente">DP: pendente</option>
                <option value="Não se aplica">DP: não se aplica</option>
              </select>
              <select value={competenceStatusFilter} onChange={event => setCompetenceStatusFilter(event.target.value as 'Todos' | RoutineCompetenceStatus)}>
                <option value="Todos">Todos os status</option>
                <option value="Enviado">Enviado</option>
                <option value="Inacabado">Inacabado</option>
              </select>
              <div className="routine-month-control">
                <button type="button" onClick={() => setCompetenceMonthFilter(current => shiftRoutineMonthValue(current, -1))} aria-label="Competência anterior">‹</button>
                <span>{formatRoutineCompetence(normalizeRoutineCompetenceMonth(competenceMonthFilter))}</span>
                <button type="button" onClick={() => setCompetenceMonthFilter(current => shiftRoutineMonthValue(current, 1))} aria-label="Próxima competência">›</button>
              </div>
            </RoutineFilters>
            <div className="pfx-table-card routine-table-card routine-competences-card">
              <table className="pfx-table routine-table routine-competences-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Competência</th>
                    <th>Fiscal</th>
                    <th>DP</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompetences.map(competence => {
                    const client = getClient(competence.clientId)
                    const competenceItems = getCompetenceItems(competence.id)
                    const competenceStatus = getRoutineCompetenceStatus(client, competenceItems)
                    const fiscalStatus = getRoutineDepartmentStatus(client, competenceItems, 'Fiscal')
                    const payrollStatus = getRoutineDepartmentStatus(client, competenceItems, 'Departamento Pessoal')
                    return (
                      <tr
                        key={competence.id}
                        className="routine-clickable-row"
                        onClick={() => { void openRoutineCompetence(competence.id) }}
                      >
                        <td data-label="Cliente">
                          <div className="routine-client-identity">
                            <span className="routine-client-avatar" aria-hidden="true">{getRoutineClientInitials(client?.name ?? 'Cliente removido')}</span>
                            <button type="button" className="routine-client-open" onClick={event => { event.stopPropagation(); void openRoutineCompetence(competence.id) }}>
                              {client?.name ?? 'Cliente removido'}
                            </button>
                          </div>
                        </td>
                        <td data-label="Competência"><span className="routine-muted-value">{formatRoutineCompetence(competence.competenceMonth)}</span></td>
                        <td data-label="Fiscal"><span className={`routine-service-badge ${getRoutineDepartmentStatusClass(fiscalStatus)}`}>{fiscalStatus}</span></td>
                        <td data-label="DP"><span className={`routine-service-badge ${getRoutineDepartmentStatusClass(payrollStatus)}`}>{payrollStatus}</span></td>
                        <td data-label="Status">
                          <span className={`routine-competence-badge ${competenceStatus === 'Enviado' ? 'sent' : 'unfinished'}`}>
                            {competenceStatus}
                          </span>
                        </td>
                        <td data-label="Ações">
                          <div className="routine-row-actions">
                            <button type="button" className="routine-open-action" onClick={event => { event.stopPropagation(); void openRoutineCompetence(competence.id) }}>Abrir</button>
                            <button type="button" className="routine-icon-action routine-icon-action-danger" onClick={event => { event.stopPropagation(); void handleDeleteCompetence(competence.id) }} aria-label="Excluir" title="Excluir"><TrashIcon /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredCompetences.length === 0 && <div className="pfx-empty-state"><strong>Nenhuma competência encontrada.</strong><span>Use o botão no canto superior direito para criar uma competência mensal.</span></div>}
            </div>
          </>
        ) : (
          <div className="pfx-empty-state routine-empty-center"><strong>Nenhuma área selecionada.</strong><span>Escolha Clientes ou Competências.</span></div>
        )}
      </div>

      {clientModal && (
        <RoutineClientModal
          client={clientModal === 'new' ? null : clientModal}
          customObligations={clientModal !== 'new' ? getClientCustomObligations(clientModal.id) : []}
          onClose={() => setClientModal(null)}
          onOpenAttachments={clientModal !== 'new' ? () => {
            setAttachmentsClient(clientModal)
            setClientModal(null)
          } : undefined}
          onAddCustomObligation={handleAddCustomObligation}
          onDeleteCustomObligation={handleDeleteCustomObligation}
          onSave={async (formData, clientId) => {
            await handleSaveClient(formData, clientId)
            setClientModal(null)
          }}
        />
      )}

      {attachmentsClient && (
        <RoutineAttachmentsModal
          client={attachmentsClient}
          attachments={attachments.filter(attachment => attachment.clientId === attachmentsClient.id)}
          legacyDocuments={attachmentsClient.documents}
          onClose={() => setAttachmentsClient(null)}
          onUpload={handleUploadClientAttachments}
          onRename={handleRenameClientAttachment}
          onDelete={handleDeleteClientAttachment}
          onDownload={handleDownloadClientAttachment}
        />
      )}

      {competenceModalOpen && (
				<RoutineCompetenceModal
					clients={clients}
					competences={competences}
					currentMonth={competenceMonthFilter}
					onClose={() => setCompetenceModalOpen(false)}
					onCreate={async (clientId, monthValue) => {
						await handleCreateCompetence(clientId, monthValue)
            setCompetenceModalOpen(false)
          }}
        />
      )}

      {quickCompetenceModalOpen && (
				<RoutineQuickCompetenceModal
					clients={clients}
					competences={competences}
					currentMonth={competenceMonthFilter}
					onClose={() => setQuickCompetenceModalOpen(false)}
					onCreate={async (clientIds, monthValue) => {
            await handleCreateCompetencesBulk(clientIds, monthValue)
            setQuickCompetenceModalOpen(false)
          }}
        />
      )}

      {broadcastModalOpen && (
        <RoutineBroadcastModal
          clients={clients}
          currentMonth={competenceMonthFilter}
          onClose={() => setBroadcastModalOpen(false)}
        />
      )}

      {emailModalScope && selectedClient && selectedCompetence && (
        <div className="crm-modal-backdrop" onClick={() => setEmailModalScope(null)}>
          <div className="crm-modal routine-message-modal" onClick={event => event.stopPropagation()}>
            <div className="crm-modal-header">
              <h3>{emailModalScope === 'Geral' ? 'Enviar tudo por e-mail' : `Enviar setor ${emailModalScope}`}</h3>
              <button type="button" className="crm-modal-close" onClick={() => setEmailModalScope(null)}><CloseIcon /></button>
            </div>
            <div className="crm-modal-form">
              <div className="routine-email-meta">
                <span>Para</span>
                <strong>{selectedClient.email || 'E-mail não cadastrado'}</strong>
              </div>
              <div className="routine-email-meta">
                <span>Assunto</span>
                <input
                  value={emailModalDraft.subject}
                  onChange={event => emailModalScope && updateRoutineEmailDraft(emailModalScope, { subject: event.target.value }, emailScopeItems)}
                  onBlur={() => { if (emailModalScope) void saveRoutineEmailDraft(emailModalScope, emailScopeItems) }}
                />
              </div>
              <textarea
                value={emailModalDraft.text}
                onChange={event => emailModalScope && updateRoutineEmailDraft(emailModalScope, { text: event.target.value }, emailScopeItems)}
                onBlur={() => { if (emailModalScope) void saveRoutineEmailDraft(emailModalScope, emailScopeItems) }}
              />
              <p className="routine-email-attachments-note">
                {emailScopeAttachmentCount
                  ? `${emailScopeAttachmentCount} arquivo${emailScopeAttachmentCount === 1 ? '' : 's'} anexado${emailScopeAttachmentCount === 1 ? '' : 's'} será${emailScopeAttachmentCount === 1 ? '' : 'ão'} enviado${emailScopeAttachmentCount === 1 ? '' : 's'} junto.`
                  : 'Nenhum arquivo anexado nesse escopo até o momento.'}
              </p>
              {routineEmailFeedback && <p className={`routine-email-feedback ${routineEmailFeedback.type}`}>{routineEmailFeedback.text}</p>}
            </div>
            <div className="crm-modal-footer">
              <button type="button" className="crm-modal-cancel" onClick={() => setEmailModalScope(null)}>Cancelar</button>
              <button
                type="button"
                className="crm-modal-submit"
                disabled={routineEmailSending}
                onClick={() => { if (emailModalScope) void handleSendRoutineEmail(emailModalScope) }}
              >
                {routineEmailSending ? 'Enviando...' : 'Enviar e-mail'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RoutineFilters({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`routine-filters${className ? ` ${className}` : ''}`}>{children}</div>
}

function RoutineClientModal({
  client,
  customObligations,
  onClose,
  onOpenAttachments,
  onAddCustomObligation,
  onDeleteCustomObligation,
  onSave,
}: {
  client: RoutineClient | null
  customObligations: RoutineClientCustomObligation[]
  onClose: () => void
  onOpenAttachments?: () => void
  onAddCustomObligation: (
    client: RoutineClient,
    draft: { name: string; department: RoutineDepartment; category: string; requiresFile: boolean; notes: string }
  ) => Promise<void>
  onDeleteCustomObligation: (obligation: RoutineClientCustomObligation) => Promise<void>
  onSave: (formData: RoutineClientFormData, clientId?: string) => Promise<void>
}) {
  const [name, setName] = useState(client?.name ?? '')
  const [cnpj, setCnpj] = useState(client?.cnpj ?? '')
  const [partnerName, setPartnerName] = useState(client?.partnerName ?? '')
  const [partnerCpf, setPartnerCpf] = useState(client?.partnerCpf ?? '')
  const [regime, setRegime] = useState<RoutineRegime>(client?.regime ?? 'MEI')
  const [hasEmployees, setHasEmployees] = useState(client?.hasEmployees ?? false)
  const [hasProLabore, setHasProLabore] = useState(client?.hasProLabore ?? false)
  const [issuesInvoices, setIssuesInvoices] = useState(client?.issuesInvoices ?? true)
  const [needsFiscalTracking, setNeedsFiscalTracking] = useState(client?.needsFiscalTracking ?? true)
  const [whatsapp, setWhatsapp] = useState(client?.whatsapp ?? '')
  const [email, setEmail] = useState(client?.email ?? '')
  const [monthlyFee, setMonthlyFee] = useState(client ? formatRoutineMoney(client.monthlyFee) : '')
  const [notes, setNotes] = useState(client?.notes ?? '')
  const [customName, setCustomName] = useState('')
  const [customDepartment, setCustomDepartment] = useState<RoutineDepartment>('Fiscal')
  const [customCategory, setCustomCategory] = useState('Personalizada')
  const [customRequiresFile, setCustomRequiresFile] = useState(true)
  const [customNotes, setCustomNotes] = useState('')
  const [customSaving, setCustomSaving] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Informe o nome do cliente.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSave({
        name: name.trim(),
        cnpj,
        partnerName,
        partnerCpf,
        regime,
        hasPayroll: hasEmployees || hasProLabore,
        hasEmployees,
        hasProLabore,
        issuesInvoices,
        needsFiscalTracking,
        whatsapp,
        email,
        monthlyFee: parseRoutineMoney(monthlyFee),
        notes,
        status: client?.status ?? 'Ativo',
        documents: client?.documents ?? [],
      }, client?.id)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não consegui salvar o cliente.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCustom = async () => {
    if (!client) return
    setCustomSaving(true)
    setError('')

    try {
      await onAddCustomObligation(client, {
        name: customName,
        department: customDepartment,
        category: customCategory,
        requiresFile: customRequiresFile,
        notes: customNotes,
      })
      setCustomName('')
      setCustomCategory('Personalizada')
      setCustomRequiresFile(true)
      setCustomNotes('')
    } catch (customError) {
      setError(customError instanceof Error ? customError.message : 'Não consegui criar a obrigação específica.')
    } finally {
      setCustomSaving(false)
    }
  }

  const handleDeleteCustom = async (obligation: RoutineClientCustomObligation) => {
    if (!confirm(`Remover "${obligation.name}" das próximas competências?`)) return
    setCustomSaving(true)
    setError('')

    try {
      await onDeleteCustomObligation(obligation)
    } catch (customError) {
      setError(customError instanceof Error ? customError.message : 'Não consegui remover a obrigação específica.')
    } finally {
      setCustomSaving(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal pfx-modal routine-client-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>{client ? 'Editar cliente' : 'Novo cliente'}</h3>
          <button type="button" className="crm-modal-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <form className="crm-modal-form" onSubmit={event => void handleSubmit(event)}>
          <div className="routine-client-main-grid">
            <label>Nome/Razão Social *<input value={name} onChange={event => setName(event.target.value)} placeholder="Empresa Exemplo LTDA" autoFocus /></label>
            <label>Sócio<input value={partnerName} onChange={event => setPartnerName(event.target.value)} placeholder="Nome do sócio" /></label>
            <label>CPF<input value={partnerCpf} onChange={event => setPartnerCpf(maskRoutineCpf(event.target.value))} placeholder="000.000.000-00" /></label>
            <label>CNPJ<input value={cnpj} onChange={event => setCnpj(maskRoutineCnpj(event.target.value))} placeholder="00.000.000/0000-00" /></label>
            <label>Regime<select value={regime} onChange={event => setRegime(event.target.value as RoutineRegime)}>{ROUTINE_REGIMES.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
            <label>Mensalidade<input value={monthlyFee} onChange={event => setMonthlyFee(event.target.value)} onBlur={() => setMonthlyFee(formatRoutineMoney(parseRoutineMoney(monthlyFee)))} placeholder="R$ 0,00" /></label>
            <label>WhatsApp<input value={whatsapp} onChange={event => setWhatsapp(maskRoutineWhatsapp(event.target.value))} placeholder="(00) 00000-0000" /></label>
            <label className="routine-client-field-wide">E-mail<input value={email} onChange={event => setEmail(event.target.value)} placeholder="cliente@empresa.com" /></label>
          </div>
          <div className="routine-client-question-grid">
            <label className={hasEmployees ? 'routine-check-option active' : 'routine-check-option'}>
              <input type="checkbox" checked={hasEmployees} onChange={event => setHasEmployees(event.target.checked)} />
              <span>Funcionário registrado</span>
            </label>
            <label className={hasProLabore ? 'routine-check-option active' : 'routine-check-option'}>
              <input type="checkbox" checked={hasProLabore} onChange={event => setHasProLabore(event.target.checked)} />
              <span>Pró-labore mensal</span>
            </label>
            <label className={issuesInvoices ? 'routine-check-option active' : 'routine-check-option'}>
              <input type="checkbox" checked={issuesInvoices} onChange={event => setIssuesInvoices(event.target.checked)} />
              <span>Emite nota fiscal</span>
            </label>
            <label className={needsFiscalTracking ? 'routine-check-option active' : 'routine-check-option'}>
              <input type="checkbox" checked={needsFiscalTracking} onChange={event => setNeedsFiscalTracking(event.target.checked)} />
              <span>Apuração Fiscal</span>
            </label>
          </div>
          {client && onOpenAttachments ? (
            <div className="routine-client-compact-row">
              <div className="routine-client-compact-panel">
                <span>Anexos</span>
                <button type="button" className="routine-attachments-open" onClick={onOpenAttachments}>
                  <FolderIcon /> Abrir anexos
                </button>
              </div>
              <label className="routine-client-notes-field">Observação<textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Detalhes internos..." /></label>
            </div>
          ) : (
            <label>Observação<textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Detalhes internos..." /></label>
          )}
          {client && (
            <div className="routine-custom-obligations-field">
              <div className="routine-custom-obligations-header">
                <span>Obrigações específicas mensais</span>
                <em>Entram automaticamente nas próximas competências.</em>
              </div>
              {customObligations.length > 0 && (
                <div className="routine-custom-obligation-list">
                  {customObligations.map(obligation => (
                    <div key={obligation.id} className="routine-custom-obligation-chip">
                      <span>
                        <strong>{obligation.name}</strong>
                        <em>{obligation.department} · {obligation.category}</em>
                      </span>
                      <button type="button" disabled={customSaving} onClick={() => void handleDeleteCustom(obligation)}>Remover</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="routine-custom-obligation-form">
                <input value={customName} onChange={event => setCustomName(event.target.value)} placeholder="Ex.: Enviar relatório para franquia" />
                <select value={customDepartment} onChange={event => setCustomDepartment(event.target.value as RoutineDepartment)}>
                  {ROUTINE_DEPARTMENTS.filter(department => department !== 'Obrigatoriedade').map(department => <option key={department} value={department}>{department}</option>)}
                </select>
                <input value={customCategory} onChange={event => setCustomCategory(event.target.value)} placeholder="Categoria" />
                <select value={customRequiresFile ? 'Sim' : 'Não'} onChange={event => setCustomRequiresFile(event.target.value === 'Sim')}>
                  <option value="Sim">Exige anexo</option>
                  <option value="Não">Não exige anexo</option>
                </select>
                <textarea value={customNotes} onChange={event => setCustomNotes(event.target.value)} placeholder="Observação padrão dessa obrigação" />
                <button type="button" disabled={customSaving} onClick={() => void handleAddCustom()} aria-label="Acrescentar obrigação específica" title="Acrescentar obrigação específica">
                  +
                </button>
              </div>
            </div>
          )}
          {error && <p className="crm-modal-error">{error}</p>}
          <div className="crm-modal-footer">
            <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
            <button type="submit" disabled={saving} className="crm-modal-submit">{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RoutineAttachmentsModal({
  client,
  attachments,
  legacyDocuments,
  onClose,
  onUpload,
  onRename,
  onDelete,
  onDownload,
}: {
  client: RoutineClient
  attachments: RoutineClientAttachment[]
  legacyDocuments: RoutineClientDocument[]
  onClose: () => void
  onUpload: (client: RoutineClient, category: RoutineAttachmentCategory, files: File[]) => Promise<void>
  onRename: (attachment: RoutineClientAttachment, nextName: string) => Promise<void>
  onDelete: (attachment: RoutineClientAttachment) => Promise<void>
  onDownload: (attachment: RoutineClientAttachment) => Promise<void>
}) {
  const [activeCategory, setActiveCategory] = useState<RoutineAttachmentCategory>('socios')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const activeCategoryMeta = ROUTINE_ATTACHMENT_CATEGORIES.find(category => category.key === activeCategory) ?? ROUTINE_ATTACHMENT_CATEGORIES[0]
  const activeAttachments = attachments.filter(attachment => attachment.category === activeCategory)
  const totalAttachments = attachments.length + legacyDocuments.length

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return

    setBusy(true)
    setError('')
    try {
      await onUpload(client, activeCategory, files)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Não consegui anexar os arquivos.')
    } finally {
      setBusy(false)
    }
  }

  const handleRename = async (attachment: RoutineClientAttachment) => {
    const nextName = window.prompt('Novo nome do anexo', attachment.displayName)
    if (nextName === null || nextName.trim() === attachment.displayName) return

    setBusy(true)
    setError('')
    try {
      await onRename(attachment, nextName)
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : 'Não consegui renomear o anexo.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (attachment: RoutineClientAttachment) => {
    if (!window.confirm(`Excluir "${attachment.displayName}"?`)) return

    setBusy(true)
    setError('')
    try {
      await onDelete(attachment)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não consegui excluir o anexo.')
    } finally {
      setBusy(false)
    }
  }

  const handleDownload = async (attachment: RoutineClientAttachment) => {
    setBusy(true)
    setError('')
    try {
      await onDownload(attachment)
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Não consegui baixar o anexo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal routine-attachments-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header routine-attachments-header">
          <div>
            <h3>Anexos</h3>
            <span>{client.name} · {totalAttachments} {totalAttachments === 1 ? 'arquivo' : 'arquivos'}</span>
          </div>
          <button type="button" className="crm-modal-close" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="routine-attachments-body">
          <aside className="routine-attachment-folders" aria-label="Pastas de anexos">
            {ROUTINE_ATTACHMENT_CATEGORIES.map(category => {
              const count = attachments.filter(attachment => attachment.category === category.key).length
              return (
                <button
                  key={category.key}
                  type="button"
                  className={activeCategory === category.key ? 'active' : ''}
                  onClick={() => {
                    setActiveCategory(category.key)
                    setError('')
                  }}
                >
                  <span className="routine-folder-icon"><FolderIcon /></span>
                  <span>
                    <strong>{category.label}</strong>
                    <em>{category.description}</em>
                  </span>
                  <b>{count}</b>
                </button>
              )
            })}
          </aside>

          <section className="routine-attachment-panel">
            <div className="routine-attachment-panel-head">
              <div>
                <strong>{activeCategoryMeta.label}</strong>
                <span>{activeCategoryMeta.description}</span>
              </div>
              <label className="routine-attachment-upload">
                {busy ? 'Aguarde...' : 'Anexar'}
                <input type="file" multiple disabled={busy} onChange={event => void handleUpload(event)} />
              </label>
            </div>

            {error && <p className="crm-modal-error routine-attachment-error">{error}</p>}

            <div className="routine-attachment-list">
              {activeAttachments.length > 0 ? (
                activeAttachments.map(attachment => (
                  <article key={attachment.id} className="routine-attachment-item">
                    <div>
                      <strong>{attachment.displayName}</strong>
                      <span>{formatPfxFileSize(attachment.fileSize) || 'Tamanho não informado'} · Atualizado em {formatCrmDate(attachment.updatedAt)}</span>
                    </div>
                    <div className="routine-attachment-actions">
                      <button type="button" disabled={busy} onClick={() => void handleDownload(attachment)}>Baixar</button>
                      <button type="button" disabled={busy} onClick={() => void handleRename(attachment)}>Renomear</button>
                      <button type="button" disabled={busy} onClick={() => void handleDelete(attachment)}>Excluir</button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="routine-attachment-empty">
                  <strong>Nenhum arquivo nesta pasta.</strong>
                  <span>Anexe os documentos de {activeCategoryMeta.label.toLowerCase()} aqui.</span>
                </div>
              )}
            </div>

            {legacyDocuments.length > 0 && (
              <div className="routine-legacy-documents">
                <strong>Documentos antigos</strong>
                <p>Arquivos do cadastro anterior. Eles continuam disponíveis, mas os próximos anexos entram nas pastas acima.</p>
                <div className="routine-document-list">
                  {legacyDocuments.map(document => (
                    <div key={document.id} className="routine-document-chip">
                      <a href={document.url} download={document.name}>{document.name}</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function RoutineCompetenceModal({ clients, competences, currentMonth, onClose, onCreate }: {
  clients: RoutineClient[]
  competences: RoutineCompetence[]
  currentMonth: string
  onClose: () => void
  onCreate: (clientId: string, monthValue: string) => Promise<void>
}) {
  const [clientId, setClientId] = useState('')
  const [monthValue, setMonthValue] = useState(currentMonth || getCurrentRoutineCompetenceMonth().slice(0, 7))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const availableClients = useMemo(() => (
    clients.filter(client => !hasRoutineCompetenceForMonth(competences, client.id, monthValue))
  ), [clients, competences, monthValue])

  useEffect(() => {
    if (clientId && availableClients.some(client => client.id === clientId)) {
      return
    }

    setClientId(availableClients[0]?.id ?? '')
  }, [availableClients, clientId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!clientId) {
      setError(clients.length ? 'Todas as empresas já têm rotinas cadastradas nessa competência.' : 'Cadastre um cliente antes de criar a competência.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onCreate(clientId, monthValue)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não consegui criar a competência.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>Novo período</h3>
          <button type="button" className="crm-modal-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <form className="crm-modal-form" onSubmit={event => void handleSubmit(event)}>
          <label>Competência<input type="month" value={monthValue} onChange={event => { setMonthValue(event.target.value); setError('') }} /></label>
          <label>Cliente
            {availableClients.length > 0 ? (
              <select value={clientId} onChange={event => setClientId(event.target.value)}>
                {availableClients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            ) : (
              <div className="routine-modal-empty-option">Todas as empresas já têm rotinas cadastradas nessa competência.</div>
            )}
          </label>
          {error && <p className="crm-modal-error">{error}</p>}
          <div className="crm-modal-footer">
            <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
            <button type="submit" disabled={saving || availableClients.length === 0} className="crm-modal-submit">{saving ? 'Criando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RoutineQuickCompetenceModal({ clients, competences, currentMonth, onClose, onCreate }: {
  clients: RoutineClient[]
  competences: RoutineCompetence[]
  currentMonth: string
  onClose: () => void
  onCreate: (clientIds: string[], monthValue: string) => Promise<void>
}) {
  const [monthValue, setMonthValue] = useState(currentMonth || getCurrentRoutineCompetenceMonth().slice(0, 7))
  const [regimeFilter, setRegimeFilter] = useState<'Todos' | RoutineRegime>('Todos')
  const [payrollFilter, setPayrollFilter] = useState<'Todos' | 'Sim' | 'Não'>('Todos')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const availableClients = useMemo(() => (
    clients.filter(client => !hasRoutineCompetenceForMonth(competences, client.id, monthValue))
  ), [clients, competences, monthValue])

  useEffect(() => {
    setSelectedIds(availableClients.map(client => client.id))
  }, [availableClients])

  const visibleClients = useMemo(() => {
    const query = search.toLowerCase().trim()
    return availableClients.filter(client => {
      const matchesSearch = !query || [client.name, client.partnerName, client.cnpj, client.partnerCpf].some(value => value.toLowerCase().includes(query))
      const matchesRegime = regimeFilter === 'Todos' || client.regime === regimeFilter
      const matchesPayroll = payrollFilter === 'Todos' || (payrollFilter === 'Sim' ? client.hasPayroll : !client.hasPayroll)
      return matchesSearch && matchesRegime && matchesPayroll
    })
  }, [availableClients, search, regimeFilter, payrollFilter])

  const toggleClient = (clientId: string) => {
    setSelectedIds(current => current.includes(clientId)
      ? current.filter(id => id !== clientId)
      : [...current, clientId]
    )
  }

  const selectVisibleClients = () => {
    setSelectedIds(current => Array.from(new Set([...current, ...visibleClients.map(client => client.id)])))
  }

  const clearVisibleClients = () => {
    const visibleIds = new Set(visibleClients.map(client => client.id))
    setSelectedIds(current => current.filter(clientId => !visibleIds.has(clientId)))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedIds.length) {
      setError(availableClients.length ? 'Selecione pelo menos uma empresa.' : 'Todas as empresas já têm rotinas cadastradas nessa competência.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onCreate(selectedIds, monthValue)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não consegui configurar as competências.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal routine-quick-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>Processar em massa</h3>
          <button type="button" className="crm-modal-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <form className="crm-modal-form" onSubmit={event => void handleSubmit(event)}>
          <div className="crm-modal-row">
            <label>Competência<input type="month" value={monthValue} onChange={event => { setMonthValue(event.target.value); setError('') }} /></label>
            <label>Buscar<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Empresa, sócio, CPF ou CNPJ" /></label>
          </div>
          <div className="crm-modal-row">
            <label>Regime<select value={regimeFilter} onChange={event => setRegimeFilter(event.target.value as 'Todos' | RoutineRegime)}>
              <option value="Todos">Todos os regimes</option>
              {ROUTINE_REGIMES.map(regime => <option key={regime} value={regime}>{regime}</option>)}
            </select></label>
            <label>Folha<select value={payrollFilter} onChange={event => setPayrollFilter(event.target.value as 'Todos' | 'Sim' | 'Não')}>
              <option value="Todos">Com ou sem folha</option>
              <option value="Sim">Com folha</option>
              <option value="Não">Sem folha</option>
            </select></label>
          </div>

          <div className="routine-quick-toolbar">
            <span>{selectedIds.length} selecionada(s) · {visibleClients.length} disponível(is)</span>
            <div>
              <button type="button" onClick={selectVisibleClients}>Selecionar visíveis</button>
              <button type="button" onClick={clearVisibleClients}>Limpar visíveis</button>
            </div>
          </div>

          <div className="routine-quick-client-list">
            {visibleClients.map(client => (
              <label key={client.id} className="routine-quick-client">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(client.id)}
                  onChange={() => toggleClient(client.id)}
                />
                <span>
                  <strong>{client.name}</strong>
                  <em>{client.regime} · Folha: {client.hasPayroll ? 'Sim' : 'Não'}</em>
                </span>
              </label>
            ))}
            {visibleClients.length === 0 && (
              <p>{availableClients.length === 0 ? 'Todas as empresas já têm rotinas cadastradas nessa competência.' : 'Nenhuma empresa disponível com esses filtros.'}</p>
            )}
          </div>

          {error && <p className="crm-modal-error">{error}</p>}
          <div className="crm-modal-footer">
            <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
            <button type="submit" disabled={saving || selectedIds.length === 0} className="crm-modal-submit">
              {saving ? 'Configurando...' : 'Criar competências'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RoutineBroadcastModal({ clients, currentMonth, onClose }: {
  clients: RoutineClient[]
  currentMonth: string
  onClose: () => void
}) {
  const [audience, setAudience] = useState<RoutineBroadcastAudience>('Folha')
  const [monthValue, setMonthValue] = useState(currentMonth || getCurrentRoutineCompetenceMonth().slice(0, 7))
  const [draft, setDraft] = useState(() => getRoutineBroadcastDefaults('Folha', currentMonth || getCurrentRoutineCompetenceMonth().slice(0, 7)))
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const activeClients = useMemo(() => clients.filter(client => client.status === 'Ativo'), [clients])
  const eligibleClients = useMemo(() => (
    activeClients.filter(client => audience === 'Geral' || client.hasPayroll)
  ), [activeClients, audience])
  const emailableClients = useMemo(() => eligibleClients.filter(hasValidRoutineEmail), [eligibleClients])
  const selectedClients = useMemo(() => emailableClients.filter(client => selectedIds.includes(client.id)), [emailableClients, selectedIds])
  const clientsWithoutEmail = eligibleClients.length - emailableClients.length

  useEffect(() => {
    setDraft(getRoutineBroadcastDefaults(audience, monthValue))
    setFeedback(null)
  }, [audience, monthValue])

  useEffect(() => {
    setSelectedIds(emailableClients.map(client => client.id))
  }, [emailableClients])

  const toggleClient = (clientId: string) => {
    setSelectedIds(current => current.includes(clientId)
      ? current.filter(id => id !== clientId)
      : [...current, clientId]
    )
  }

  const handleSend = async () => {
    if (!selectedClients.length) {
      setFeedback({ type: 'error', text: 'Selecione pelo menos um cliente com e-mail válido.' })
      return
    }

    if (!draft.subject.trim()) {
      setFeedback({ type: 'error', text: 'Informe o assunto do disparo.' })
      return
    }

    if (!draft.text.trim()) {
      setFeedback({ type: 'error', text: 'Informe o texto do disparo.' })
      return
    }

    setSending(true)
    setFeedback(null)

    let sentCount = 0
    const failedClients: string[] = []

    for (const client of selectedClients) {
      try {
        const response = await fetch('/api/contabilidade/enviar-rotinas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: client.email.trim(),
            subject: draft.subject,
            text: draft.text,
            itemIds: [],
          }),
        })

        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(typeof result.error === 'string' ? result.error : 'Falha no envio.')
        }

        sentCount += 1
      } catch {
        failedClients.push(client.name)
      }
    }

    setSending(false)
    if (failedClients.length) {
      setFeedback({ type: 'error', text: `${sentCount} enviado(s). Falhou para: ${failedClients.slice(0, 3).join(', ')}${failedClients.length > 3 ? '...' : ''}` })
      return
    }

    setFeedback({ type: 'success', text: `${sentCount} disparo(s) enviado(s) com sucesso.` })
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal routine-broadcast-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>Disparos</h3>
          <button type="button" className="crm-modal-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="crm-modal-form">
          <div className="routine-broadcast-segments">
            <button type="button" className={audience === 'Folha' ? 'active' : ''} onClick={() => setAudience('Folha')}>Folha</button>
            <button type="button" className={audience === 'Geral' ? 'active' : ''} onClick={() => setAudience('Geral')}>Geral</button>
          </div>
          <div className="crm-modal-row">
            <label>Competência<input type="month" value={monthValue} onChange={event => setMonthValue(event.target.value)} /></label>
            <label>Assunto<input value={draft.subject} onChange={event => setDraft(current => ({ ...current, subject: event.target.value }))} /></label>
          </div>
          <label>Texto<textarea value={draft.text} onChange={event => setDraft(current => ({ ...current, text: event.target.value }))} /></label>
          <div className="routine-quick-toolbar routine-broadcast-toolbar">
            <span>{selectedClients.length} selecionado(s) · {emailableClients.length} com e-mail válido{clientsWithoutEmail ? ` · ${clientsWithoutEmail} sem e-mail` : ''}</span>
            <div>
              <button type="button" onClick={() => setSelectedIds(emailableClients.map(client => client.id))}>Selecionar todos</button>
              <button type="button" onClick={() => setSelectedIds([])}>Limpar</button>
            </div>
          </div>
          <div className="routine-broadcast-client-list">
            {emailableClients.map(client => (
              <label key={client.id} className="routine-quick-client">
                <input type="checkbox" checked={selectedIds.includes(client.id)} onChange={() => toggleClient(client.id)} />
                <span>
                  <strong>{client.name}</strong>
                  <em>{client.email}</em>
                </span>
              </label>
            ))}
            {emailableClients.length === 0 && (
              <p>{audience === 'Folha' ? 'Nenhum cliente com folha e e-mail válido.' : 'Nenhum cliente ativo com e-mail válido.'}</p>
            )}
          </div>
          {feedback && <p className={`routine-email-feedback ${feedback.type}`}>{feedback.text}</p>}
        </div>
        <div className="crm-modal-footer">
          <button type="button" className="crm-modal-cancel" onClick={onClose}>Cancelar</button>
          <button type="button" className="crm-modal-submit" disabled={sending || selectedClients.length === 0} onClick={() => { void handleSend() }}>
            {sending ? 'Enviando...' : 'Enviar disparo'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DisparazapModule() {
  const [mode, setMode] = useState<DisparazapMode>('individual')
  const [templates, setTemplates] = useState<DisparazapTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templatesError, setTemplatesError] = useState('')
  const [phone, setPhone] = useState('')
  const [templateKey, setTemplateKey] = useState('')
  const [bodyParameters, setBodyParameters] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DisparazapSendResult | null>(null)
  const [bulkStep, setBulkStep] = useState<DisparazapBulkStep>('contacts')
  const [bulkName, setBulkName] = useState(`Campanha ${new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}`)
  const [bulkContactsText, setBulkContactsText] = useState('')
  const [bulkContactsFileName, setBulkContactsFileName] = useState('')
  const [bulkContactsValidated, setBulkContactsValidated] = useState(false)
  const [bulkContactRows, setBulkContactRows] = useState<DisparazapContactValidationRow[]>([])
  const [bulkContactSummary, setBulkContactSummary] = useState<DisparazapContactValidationSummary | null>(null)
  const [bulkContactFilter, setBulkContactFilter] = useState<'all' | DisparazapContactValidationRow['situation']>('all')
  const [bulkManualOpen, setBulkManualOpen] = useState(false)
  const [bulkDragActive, setBulkDragActive] = useState(false)
  const [bulkValidatingContacts, setBulkValidatingContacts] = useState(false)
  const [bulkCampaign, setBulkCampaign] = useState<DisparazapCampaign | null>(null)
  const [bulkSummary, setBulkSummary] = useState<DisparazapCampaignSummary | null>(null)
  const [bulkRecipients, setBulkRecipients] = useState<DisparazapCampaignRecipient[]>([])
  const [bulkWorking, setBulkWorking] = useState(false)
  const [inboxConversations, setInboxConversations] = useState<DisparazapConversation[]>([])
  const [inboxSelectedId, setInboxSelectedId] = useState('')
  const [inboxSelected, setInboxSelected] = useState<DisparazapConversation | null>(null)
  const [inboxMessages, setInboxMessages] = useState<DisparazapInboxMessage[]>([])
  const [inboxSearch, setInboxSearch] = useState('')
  const [inboxFilter, setInboxFilter] = useState<DisparazapInboxFilter>('all')
  const [inboxLoading, setInboxLoading] = useState(false)
  const [inboxConversationLoading, setInboxConversationLoading] = useState(false)
  const [inboxError, setInboxError] = useState('')
  const [inboxReply, setInboxReply] = useState('')
  const [inboxSending, setInboxSending] = useState(false)

  const templateOptions = useMemo(() => templates.map(template => ({
    key: `${template.name}::${template.language}::${template.category}`,
    template,
  })), [templates])
  const approvedTemplateOptions = templateOptions.filter(({ template }) => template.status === 'APPROVED')
  const selectedTemplateOption = templateOptions.find(option => option.key === templateKey) ?? approvedTemplateOptions[0] ?? templateOptions[0]
  const selectedTemplate = selectedTemplateOption?.template ?? null
  const normalizedPhone = normalizeDisparazapPhone(phone)
  const previewPhone = normalizedPhone ? maskDisparazapPhone(normalizedPhone) : 'Informe o telefone'
  const parameterValues = Array.from({ length: selectedTemplate?.bodyVariableCount ?? 0 }, (_, index) => bodyParameters[`body_${index}`]?.trim() ?? '')
  const phoneHasError = Boolean(error) && (error.startsWith('Informe o telefone') || error.startsWith('Informe um telefone'))
  const parsedBulkContacts = useMemo(() => parseWhatsAppContactsText(bulkContactsText), [bulkContactsText])
  const localBulkSummary = useMemo(() => ({
    totalImported: bulkContactSummary?.totalImported ?? parsedBulkContacts.length,
    valid: bulkContactSummary?.ready ?? parsedBulkContacts.filter(contact => contact.valid).length,
    invalid: bulkContactSummary?.invalid ?? parsedBulkContacts.filter(contact => !contact.name || !contact.normalizedPhone).length,
    duplicates: bulkContactSummary?.duplicates ?? parsedBulkContacts.filter(contact => contact.duplicate).length,
    optouts: bulkContactSummary?.optouts ?? bulkSummary?.optouts ?? 0,
    sendable: bulkContactSummary?.ready ?? bulkSummary?.sendable ?? parsedBulkContacts.filter(contact => contact.valid).length,
    testCap: bulkSummary?.testCap ?? 5,
  }), [bulkContactSummary, bulkSummary, parsedBulkContacts])
  const filteredBulkContactRows = bulkContactFilter === 'all' ? bulkContactRows : bulkContactRows.filter(row => row.situation === bulkContactFilter)
  const selectedInboxWindow = getDisparazapWindowState(inboxSelected?.customer_service_window_expires_at)

  useEffect(() => {
    let mounted = true

    async function loadTemplates() {
      setTemplatesLoading(true)
      setTemplatesError('')

      try {
        const response = await fetch('/api/whatsapp/templates')
        const data = (await response.json().catch(() => null)) as { ok?: boolean; templates?: DisparazapTemplate[]; error?: unknown } | null

        if (!response.ok || !data?.ok || !Array.isArray(data.templates)) {
          throw new Error(getDisparazapSafeError(data?.error))
        }

        if (!mounted) return

        setTemplates(data.templates)
        const firstApproved = data.templates.find(template => template.status === 'APPROVED') ?? data.templates[0]
        if (firstApproved) {
          setTemplateKey(`${firstApproved.name}::${firstApproved.language}::${firstApproved.category}`)
        }
      } catch (loadError) {
        if (mounted) setTemplatesError(loadError instanceof Error ? loadError.message : 'Não consegui carregar os templates.')
      } finally {
        if (mounted) setTemplatesLoading(false)
      }
    }

    void loadTemplates()

    return () => {
      mounted = false
    }
  }, [])

  const loadInboxConversations = async (options: { silent?: boolean } = {}) => {
    if (!options.silent) setInboxLoading(true)
    setInboxError('')

    try {
      const params = new URLSearchParams()
      params.set('filter', inboxFilter)
      if (inboxSearch.trim()) params.set('search', inboxSearch.trim())

      const response = await fetch(`/api/whatsapp/conversations?${params.toString()}`)
      const data = (await response.json().catch(() => null)) as { ok?: boolean; conversations?: DisparazapConversation[]; error?: unknown } | null

      if (!response.ok || !data?.ok || !Array.isArray(data.conversations)) {
        throw new Error(getDisparazapSafeError(data?.error))
      }

      setInboxConversations(data.conversations)
      if (!inboxSelectedId && data.conversations[0]) {
        setInboxSelectedId(data.conversations[0].id)
      }
    } catch (loadError) {
      setInboxError(loadError instanceof Error ? loadError.message : 'Não consegui carregar a caixa de entrada.')
    } finally {
      if (!options.silent) setInboxLoading(false)
    }
  }

  const loadInboxConversation = async (conversationId: string, options: { silent?: boolean } = {}) => {
    if (!conversationId) return
    if (!options.silent) setInboxConversationLoading(true)
    setInboxError('')

    try {
      const response = await fetch(`/api/whatsapp/conversations/${conversationId}`)
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean
        conversation?: DisparazapConversation
        messages?: DisparazapInboxMessage[]
        error?: unknown
      } | null

      if (!response.ok || !data?.ok || !data.conversation || !Array.isArray(data.messages)) {
        throw new Error(getDisparazapSafeError(data?.error))
      }

      setInboxSelected(data.conversation)
      setInboxMessages(data.messages)

      if (data.conversation.unread_count > 0) {
        void fetch(`/api/whatsapp/conversations/${conversationId}/read`, { method: 'POST' })
        setInboxConversations(current => current.map(conversation => conversation.id === conversationId ? { ...conversation, unread_count: 0 } : conversation))
      }
    } catch (loadError) {
      setInboxError(loadError instanceof Error ? loadError.message : 'Não consegui abrir a conversa.')
    } finally {
      if (!options.silent) setInboxConversationLoading(false)
    }
  }

  useEffect(() => {
    if (mode !== 'inbox') return
    void loadInboxConversations()
    const intervalId = window.setInterval(() => {
      void loadInboxConversations({ silent: true })
      if (inboxSelectedId) void loadInboxConversation(inboxSelectedId, { silent: true })
    }, 6000)

    return () => window.clearInterval(intervalId)
  }, [mode, inboxFilter, inboxSearch, inboxSelectedId])

  useEffect(() => {
    if (mode !== 'inbox' || !inboxSelectedId) return
    void loadInboxConversation(inboxSelectedId)
  }, [mode, inboxSelectedId])

  const updateTemplate = (nextTemplateKey: string) => {
    setTemplateKey(nextTemplateKey)
    setBodyParameters({})
    setError('')
    setResult(null)
  }

  const handleSendInboxReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!inboxSelected || inboxSending) return

    const text = inboxReply.trim()
    if (!text) return

    setInboxSending(true)
    setInboxError('')

    try {
      const response = await fetch('/api/whatsapp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: inboxSelected.id, text }),
      })
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: unknown } | null

      if (!response.ok || !data?.ok) {
        throw new Error(getDisparazapSafeError(data?.error))
      }

      setInboxReply('')
      await loadInboxConversation(inboxSelected.id, { silent: true })
      await loadInboxConversations({ silent: true })
    } catch (sendError) {
      setInboxError(sendError instanceof Error ? sendError.message : 'Não consegui enviar a resposta.')
    } finally {
      setInboxSending(false)
    }
  }

  const getPreviewBody = (template: DisparazapTemplate | null, values: string[]) => {
    if (!template) return 'Selecione um template aprovado'
    return template.body.replace(/{{\s*(\d+)\s*}}/g, (_match, index: string) => values[Number(index) - 1] || `{{${index}}}`)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return

    setError('')
    setResult(null)

    if (!selectedTemplate || selectedTemplate.status !== 'APPROVED') {
      setError('Selecione um template aprovado.')
      return
    }

    if (!phone.trim()) {
      setError('Informe o telefone do destinatário.')
      return
    }

    if (!normalizedPhone) {
      setError('Informe um telefone válido com DDD e código do país quando necessário.')
      return
    }

    if (selectedTemplate.bodyVariableCount > 0 && parameterValues.some(value => !value)) {
      setError('Preencha todos os parâmetros do template.')
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone,
          templateName: selectedTemplate.name,
          languageCode: selectedTemplate.language,
          bodyParameters: parameterValues,
        }),
      })
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: unknown
        wamid?: string
        message_status?: string | null
      } | null

      if (!response.ok || !data?.ok) {
        throw new Error(getDisparazapSafeError(data?.error))
      }

      setResult({
        phone: maskDisparazapPhone(normalizedPhone),
        status: data.message_status ?? 'accepted',
        wamid: data.wamid ?? '',
      })
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Não consegui enviar a mensagem.')
    } finally {
      setSending(false)
    }
  }

  const resetBulkDraftContacts = () => {
    setBulkContactsText('')
    setBulkContactsFileName('')
    setBulkContactsValidated(false)
    setBulkContactRows([])
    setBulkContactSummary(null)
    setBulkContactFilter('all')
    setBulkSummary(null)
    setBulkCampaign(null)
    setBulkRecipients([])
    setBulkStep('contacts')
  }

  const validateBulkContactsText = async (contactsText: string) => {
    setBulkValidatingContacts(true)
    setError('')

    try {
      const response = await fetch('/api/whatsapp/contacts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactsText }),
      })
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: unknown
        summary?: DisparazapContactValidationSummary
        rows?: DisparazapContactValidationRow[]
      } | null

      if (!response.ok || !data?.ok || !data.summary || !Array.isArray(data.rows)) {
        throw new Error(getDisparazapSafeError(data?.error))
      }

      setBulkContactSummary(data.summary)
      setBulkContactRows(data.rows)
      setBulkContactsValidated(true)
      setBulkContactFilter('all')
    } catch (validationError) {
      setBulkContactsValidated(false)
      setBulkContactRows([])
      setBulkContactSummary(null)
      setError(validationError instanceof Error ? validationError.message : 'Não consegui validar a planilha.')
    } finally {
      setBulkValidatingContacts(false)
    }
  }

  const handleDownloadContactModel = async () => {
    const XLSX = await import('xlsx')
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Nome', 'Telefone'],
      ['João da Silva', '21999999999'],
      ['Maria Souza', '5521988887777'],
    ])
    sheet['!cols'] = [{ wch: 28 }, { wch: 20 }]
    ;(sheet as { '!freeze'?: unknown })['!freeze'] = { xSplit: 0, ySplit: 1 }

    for (const cellAddress of ['A1', 'B1']) {
      const cell = sheet[cellAddress]
      if (cell) cell.s = { font: { bold: true } }
    }

    for (const cellAddress of ['B2', 'B3']) {
      const cell = sheet[cellAddress]
      if (cell) {
        cell.t = 's'
        cell.z = '@'
      }
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Contatos')
    XLSX.writeFile(workbook, 'modelo_disparazap.xlsx')
  }

  const importBulkContactsFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !['xlsx', 'xls', 'csv'].includes(extension)) {
      setError('Formato não suportado. Use .xlsx, .xls ou .csv.')
      return
    }

    setBulkWorking(true)
    setError('')

    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array', raw: false })
      const sheetName = workbook.SheetNames.includes('Contatos') ? 'Contatos' : workbook.SheetNames[0]

      if (!sheetName) {
        throw new Error('Arquivo vazio. Importe uma planilha com Nome e Telefone.')
      }

      const sheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false }) as unknown[][]
      const contactsText = buildDisparazapContactsTextFromRows(rows.filter(row => Array.isArray(row) && row.some(cell => String(cell ?? '').trim())))

      setBulkContactsText(contactsText)
      setBulkContactsFileName(file.name)
      setBulkSummary(null)
      setBulkCampaign(null)
      setBulkRecipients([])
      await validateBulkContactsText(contactsText)
    } catch (importError) {
      setBulkContactsValidated(false)
      setBulkContactRows([])
      setBulkContactSummary(null)
      setBulkContactsFileName('')
      setError(importError instanceof Error ? importError.message : 'Não conseguimos ler a planilha. O arquivo pode estar corrompido.')
    } finally {
      setBulkWorking(false)
    }
  }

  const handleSpreadsheetImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) void importBulkContactsFile(file)
    event.target.value = ''
  }

  const handleContactsDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setBulkDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void importBulkContactsFile(file)
  }

  const handleCreateCampaignReview = async () => {
    if (bulkWorking) return
    setError('')

    if (!selectedTemplate || selectedTemplate.status !== 'APPROVED') {
      setError('Escolha um template aprovado para revisar a campanha.')
      return
    }

    if (!bulkContactsText.trim()) {
      setError('Cole ou importe ao menos um contato.')
      return
    }

    setBulkWorking(true)

    try {
      const response = await fetch('/api/whatsapp/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bulkName,
          templateName: selectedTemplate.name,
          templateLanguage: selectedTemplate.language,
          templateCategory: selectedTemplate.category,
          contactsText: bulkContactsText,
        }),
      })
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: unknown
        campaign?: DisparazapCampaign
        summary?: DisparazapCampaignSummary
        recipients?: DisparazapCampaignRecipient[]
      } | null

      if (!response.ok || !data?.ok || !data.campaign || !data.summary) {
        throw new Error(getDisparazapSafeError(data?.error))
      }

      setBulkCampaign(data.campaign)
      setBulkSummary(data.summary)
      setBulkRecipients(data.recipients ?? [])
      setBulkStep('review')
    } catch (campaignError) {
      setError(campaignError instanceof Error ? campaignError.message : 'Não consegui preparar a campanha.')
    } finally {
      setBulkWorking(false)
    }
  }

  const handleStartCampaign = async () => {
    if (!bulkCampaign || bulkWorking) return
    setBulkWorking(true)
    setError('')

    try {
      const response = await fetch(`/api/whatsapp/campaigns/${bulkCampaign.id}/start`, { method: 'POST' })
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: unknown; status?: string } | null

      if (!response.ok || !data?.ok) {
        throw new Error(getDisparazapSafeError(data?.error))
      }

      setBulkCampaign(current => current ? { ...current, status: data.status ?? 'processing' } : current)
      setBulkStep('send')
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Não consegui iniciar a campanha.')
    } finally {
      setBulkWorking(false)
    }
  }

  const renderTemplateSelect = (disabled = false) => (
    <select value={selectedTemplateOption?.key ?? ''} onChange={event => updateTemplate(event.target.value)} disabled={disabled || templatesLoading || !templateOptions.length}>
      {templateOptions.map(({ key, template }) => (
        <option key={key} value={key} disabled={template.status !== 'APPROVED'}>
          {template.name} · {template.language}{template.status === 'APPROVED' ? '' : ' · Em análise'}
        </option>
      ))}
    </select>
  )

  const renderPreview = (template: DisparazapTemplate | null, values: string[], destination = previewPhone) => (
    <aside className="disparazap-card disparazap-preview" aria-label="Prévia da mensagem">
      <div className="disparazap-card-header">
        <span className="disparazap-card-icon is-whatsapp">
          <ModuleIcon type="message" />
        </span>
        <div>
          <strong>Prévia da mensagem</strong>
          <span>Representação do template antes do envio.</span>
        </div>
      </div>

      <div className="disparazap-phone-preview">
        <span>Destinatário</span>
        <strong><DisparazapIcon type="user" />{destination}</strong>
      </div>

      <div className="disparazap-chat-preview">
        <div className="disparazap-chat-header">
          <span />
          <strong>WhatsApp API Oficial</strong>
          <em><DisparazapIcon type="verified" /></em>
        </div>
        <div className="disparazap-chat-body">
          <div className="disparazap-bubble">
            <strong>{getPreviewBody(template, values)}</strong>
            <small>12:30 <DisparazapIcon type="checks" /></small>
          </div>
        </div>
      </div>

      <div className="pfx-detail-list disparazap-preview-details">
        <div>
          <span>Template</span>
          <strong>{template?.name ?? 'Nenhum'}</strong>
        </div>
        <div>
          <span>Idioma</span>
          <strong>{template?.language ?? '-'}</strong>
        </div>
        <div>
          <span>Parâmetros</span>
          <strong>{values.length ? values.join(', ') : 'Nenhum'}</strong>
        </div>
      </div>

      {result && mode === 'individual' && (
        <div className="disparazap-success-card" role="status">
          <strong>Mensagem enviada com sucesso</strong>
          <span>Telefone: {result.phone}</span>
          <span>Status: {result.status}</span>
          {result.wamid && <small>wamid: {result.wamid}</small>}
        </div>
      )}
    </aside>
  )

  return (
    <div className="disparazap-module crm-module">
      <div className="crm-module-inner disparazap-inner">
        <div className="crm-module-header">
          <div>
            <p>Offline</p>
            <h2 id="active-module-title">Disparazap</h2>
            <span className="disparazap-header-copy">
              {mode === 'individual' ? 'Envio individual via WhatsApp API Oficial.' : mode === 'bulk' ? 'Campanhas em massa com revisão e fila controlada.' : 'Atendimento das respostas recebidas pelo número oficial.'}
            </span>
          </div>
          <div className="crm-header-right">
            {templatesError && <span className="crm-global-error">{templatesError}</span>}
            {error && <span className="crm-global-error">{error}</span>}
            {result && <span className="offline-billing-message">Mensagem enviada com sucesso</span>}
          </div>
        </div>

        <div className="disparazap-mode-tabs" role="tablist" aria-label="Modo de envio">
          <button type="button" className={mode === 'individual' ? 'is-active' : ''} onClick={() => setMode('individual')}>Envio individual</button>
          <button type="button" className={mode === 'bulk' ? 'is-active' : ''} onClick={() => setMode('bulk')}>Disparo em massa</button>
          <button type="button" className={mode === 'inbox' ? 'is-active' : ''} onClick={() => setMode('inbox')}>Caixa de entrada</button>
        </div>

        {mode === 'individual' ? (
          <>
            <div className="disparazap-summary-grid" aria-label="Resumo do envio">
              <div className="disparazap-summary-card is-destination">
                <span className="disparazap-summary-icon"><DisparazapIcon type="user" /></span>
                <div>
                  <span>Destino</span>
                  <strong>{previewPhone}</strong>
                </div>
              </div>
              <div className="disparazap-summary-card is-template">
                <span className="disparazap-summary-icon"><DisparazapIcon type="template" /></span>
                <div>
                  <span>Template</span>
                  <strong>{selectedTemplate?.name ?? 'Carregando'}</strong>
                </div>
              </div>
              <div className="disparazap-summary-card is-language">
                <span className="disparazap-summary-icon"><DisparazapIcon type="globe" /></span>
                <div>
                  <span>Idioma</span>
                  <strong>{selectedTemplate?.language ?? '-'}</strong>
                </div>
              </div>
              <div className="disparazap-summary-card is-params">
                <span className="disparazap-summary-icon"><DisparazapIcon type="sliders" /></span>
                <div>
                  <span>Parâmetros</span>
                  <strong>{selectedTemplate?.bodyVariableCount ?? 0}</strong>
                </div>
              </div>
            </div>

            <div className="disparazap-grid">
              <form className="disparazap-card disparazap-form" onSubmit={handleSubmit} noValidate>
                <div className="disparazap-card-header">
                  <span className="disparazap-card-icon">
                    <ModuleIcon type="message" />
                  </span>
                  <div>
                    <strong>Envio individual</strong>
                    <span>Preencha o destinatário e confira a prévia antes de enviar.</span>
                  </div>
                </div>

                <label className={`disparazap-field${phoneHasError ? ' is-invalid' : ''}`}>
                  <span>Telefone</span>
                  <div className="disparazap-input-wrap">
                    <DisparazapIcon type="phone" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={event => {
                        setPhone(event.target.value)
                        setError('')
                        setResult(null)
                      }}
                      placeholder="(21) 99999-9999"
                      autoComplete="tel"
                    />
                  </div>
                  {phoneHasError && <small>{error}</small>}
                </label>

                <div className="disparazap-field-row">
                  <label className="disparazap-field">
                    <span>Template</span>
                    {renderTemplateSelect()}
                  </label>

                  <label className="disparazap-field">
                    <span>Idioma</span>
                    <input value={selectedTemplate?.language ?? ''} readOnly />
                  </label>
                </div>

                <div className="disparazap-parameters">
                  <div className="disparazap-section-title">
                    <strong>Parâmetros do template</strong>
                    <span>{selectedTemplate?.bodyVariableCount ? `${selectedTemplate.bodyVariableCount} campo(s)` : 'Nenhum parâmetro para este template'}</span>
                  </div>

                  {selectedTemplate?.bodyVariableCount ? (
                    Array.from({ length: selectedTemplate.bodyVariableCount }, (_, index) => (
                      <label className="disparazap-field" key={index}>
                        <span>Variável {index + 1}</span>
                        <input
                          value={bodyParameters[`body_${index}`] ?? ''}
                          onChange={event => {
                            setBodyParameters(current => ({ ...current, [`body_${index}`]: event.target.value }))
                            setError('')
                            setResult(null)
                          }}
                          placeholder={index === 0 ? 'Nome do destinatário' : `Valor ${index + 1}`}
                        />
                      </label>
                    ))
                  ) : (
                    <div className="disparazap-empty-params">
                      <DisparazapIcon type="info" />
                      <span>Este template não exige variáveis.</span>
                    </div>
                  )}
                </div>

                <button className="crm-add-btn disparazap-submit" type="submit" disabled={sending || !selectedTemplate || selectedTemplate.status !== 'APPROVED'}>
                  <DisparazapIcon type="send" />
                  {sending ? 'Enviando...' : 'Enviar mensagem'}
                </button>
              </form>

              {renderPreview(selectedTemplate, parameterValues)}
            </div>
          </>
        ) : mode === 'bulk' ? (
          <>
            <div className="disparazap-steps" aria-label="Fluxo do disparo em massa">
              {(['contacts', 'template', 'review', 'send', 'result'] as DisparazapBulkStep[]).map((step, index) => (
                <button key={step} type="button" className={bulkStep === step ? 'is-active' : ''} onClick={() => setBulkStep(step)} disabled={step === 'review' && !bulkCampaign}>
                  <span>{index + 1}</span>
                  {step === 'contacts' ? 'Contatos' : step === 'template' ? 'Template' : step === 'review' ? 'Revisão' : step === 'send' ? 'Envio' : 'Resultado'}
                </button>
              ))}
            </div>

            <div className="disparazap-summary-grid" aria-label="Resumo da campanha">
              <div className="disparazap-summary-card is-destination">
                <span className="disparazap-summary-icon"><DisparazapIcon type="user" /></span>
                <div><span>Total importado</span><strong>{localBulkSummary.totalImported}</strong></div>
              </div>
              <div className="disparazap-summary-card is-language">
                <span className="disparazap-summary-icon"><DisparazapIcon type="verified" /></span>
                <div><span>Aptos</span><strong>{localBulkSummary.sendable}</strong></div>
              </div>
              <div className="disparazap-summary-card is-template">
                <span className="disparazap-summary-icon"><DisparazapIcon type="template" /></span>
                <div><span>Template</span><strong>{selectedTemplate?.name ?? '-'}</strong></div>
              </div>
              <div className="disparazap-summary-card is-params">
                <span className="disparazap-summary-icon"><DisparazapIcon type="sliders" /></span>
                <div><span>Status</span><strong>{bulkCampaign?.status ?? 'Rascunho'}</strong></div>
              </div>
            </div>

            <div className="disparazap-grid">
              <section className="disparazap-card disparazap-form">
                <div className="disparazap-card-header">
                  <span className="disparazap-card-icon">
                    <ModuleIcon type="message" />
                  </span>
                  <div>
                    <strong>Disparo em massa</strong>
                    <span>Importe, revise e inicie somente quando tudo estiver certo.</span>
                  </div>
                </div>

                {bulkStep === 'contacts' && (
                  <>
                    <label className="disparazap-field">
                      <span>Campanha</span>
                      <input value={bulkName} onChange={event => setBulkName(event.target.value)} placeholder="Nome da campanha" />
                    </label>

                    <div className="disparazap-model-row">
                      <button type="button" className="disparazap-file-button" onClick={() => { void handleDownloadContactModel() }}>
                        Baixar modelo Excel
                      </button>
                      <div>
                        <strong>Baixe o modelo, preencha Nome e Telefone e importe a planilha.</strong>
                        <span>Formatos aceitos: .xlsx, .xls e .csv</span>
                      </div>
                    </div>

                    {!bulkContactsValidated ? (
                      <label
                        className={`disparazap-upload-zone${bulkDragActive ? ' is-dragging' : ''}`}
                        onDragOver={event => {
                          event.preventDefault()
                          setBulkDragActive(true)
                        }}
                        onDragLeave={() => setBulkDragActive(false)}
                        onDrop={handleContactsDrop}
                      >
                        <span className="disparazap-upload-icon"><DisparazapIcon type="template" /></span>
                        <strong>{bulkValidatingContacts || bulkWorking ? 'Validando planilha...' : 'Arraste sua planilha aqui'}</strong>
                        <em>ou selecione um arquivo</em>
                        <small>.xlsx, .xls ou .csv</small>
                        <b>Selecionar planilha</b>
                        <input type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" onChange={handleSpreadsheetImport} />
                      </label>
                    ) : (
                      <div className="disparazap-import-result">
                        <div className="disparazap-import-file">
                          <div>
                            <span>Planilha importada</span>
                            <strong>{bulkContactsFileName || 'Contatos manuais'}</strong>
                          </div>
                          <button type="button" onClick={resetBulkDraftContacts}>Trocar planilha</button>
                        </div>

                        <div className="disparazap-contact-summary">
                          <div><strong>{localBulkSummary.totalImported}</strong><span>Total importado</span></div>
                          <div><strong>{localBulkSummary.sendable}</strong><span>Aptos</span></div>
                          <div><strong>{localBulkSummary.invalid}</strong><span>Inválidos</span></div>
                          <div><strong>{localBulkSummary.duplicates}</strong><span>Duplicados</span></div>
                          <div><strong>{localBulkSummary.optouts}</strong><span>Opt-out</span></div>
                        </div>

                        <div className="disparazap-contact-filters" aria-label="Filtrar contatos importados">
                          {[
                            ['all', 'Todos'],
                            ['ready', 'Aptos'],
                            ['invalid', 'Inválidos'],
                            ['duplicate', 'Duplicados'],
                            ['optout', 'Opt-out'],
                          ].map(([key, label]) => (
                            <button key={key} type="button" className={bulkContactFilter === key ? 'is-active' : ''} onClick={() => setBulkContactFilter(key as typeof bulkContactFilter)}>
                              {label}
                            </button>
                          ))}
                        </div>

                        <div className="disparazap-contact-table">
                          <div className="disparazap-contact-table-head">
                            <span>Nome</span>
                            <span>Telefone</span>
                            <span>Situação</span>
                          </div>
                          {filteredBulkContactRows.slice(0, 80).map((row, index) => (
                            <div className="disparazap-contact-row" key={`${row.name}-${row.phone}-${index}`}>
                              <strong>{row.name}</strong>
                              <span>{row.phone ?? 'Sem telefone'}</span>
                              <em className={`is-${row.situation}`}>{DISPARAZAP_CONTACT_STATUS_LABEL[row.situation]}</em>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="disparazap-format-help">
                      <strong>Exemplos válidos</strong>
                      <span>(21) 99999-9999</span>
                      <span>21999999999</span>
                      <span>+55 21 99999-9999</span>
                      <span>5521999999999</span>
                    </div>

                    <div className="disparazap-manual-block">
                      <button type="button" onClick={() => setBulkManualOpen(current => !current)}>
                        Inserir contatos manualmente
                      </button>
                      {bulkManualOpen && (
                        <label className="disparazap-field">
                          <span>Lista manual</span>
                          <textarea value={bulkContactsText} onChange={event => {
                            setBulkContactsText(event.target.value)
                            setBulkContactsFileName('')
                            setBulkContactsValidated(false)
                            setBulkContactRows([])
                            setBulkContactSummary(null)
                            setBulkSummary(null)
                            setBulkCampaign(null)
                            setBulkRecipients([])
                          }} placeholder={'nome,telefone\nJoão,21999999999\nMaria,+55 (21) 98888-8888'} />
                          <small>Use uma linha por contato no formato nome,telefone.</small>
                        </label>
                      )}
                    </div>

                    <div className="disparazap-import-row">
                      {bulkManualOpen && !bulkContactsValidated && (
                        <button type="button" className="disparazap-file-button" onClick={() => { void validateBulkContactsText(bulkContactsText) }} disabled={!bulkContactsText.trim() || bulkValidatingContacts}>
                          Validar contatos
                        </button>
                      )}
                      <button type="button" className="disparazap-submit" onClick={() => setBulkStep('template')} disabled={!bulkContactsValidated || localBulkSummary.sendable < 1}>
                        Avançar
                      </button>
                    </div>
                  </>
                )}

                {bulkStep === 'template' && (
                  <>
                    <label className="disparazap-field">
                      <span>Template</span>
                      {renderTemplateSelect()}
                    </label>
                    <div className="disparazap-template-list">
                      {templateOptions.map(({ key, template }) => (
                        <button key={key} type="button" className={key === selectedTemplateOption?.key ? 'is-active' : ''} disabled={template.status !== 'APPROVED'} onClick={() => updateTemplate(key)}>
                          <strong>{template.name}</strong>
                          <span>{template.category} · {template.language} · {template.status === 'APPROVED' ? 'Aprovado' : 'Em análise'}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" className="disparazap-submit" onClick={handleCreateCampaignReview} disabled={bulkWorking || !selectedTemplate || selectedTemplate.status !== 'APPROVED'}>
                      {bulkWorking ? 'Preparando...' : 'Preparar revisão'}
                    </button>
                  </>
                )}

                {bulkStep === 'review' && (
                  <>
                    <div className="disparazap-review-grid">
                      <div><span>Campanha</span><strong>{bulkCampaign?.name ?? bulkName}</strong></div>
                      <div><span>Template</span><strong>{bulkCampaign?.template_name ?? selectedTemplate?.name ?? '-'}</strong></div>
                      <div><span>Categoria</span><strong>{bulkCampaign?.template_category ?? selectedTemplate?.category ?? '-'}</strong></div>
                      <div><span>Idioma</span><strong>{bulkCampaign?.template_language ?? selectedTemplate?.language ?? '-'}</strong></div>
                      <div><span>Inválidos</span><strong>{localBulkSummary.invalid}</strong></div>
                      <div><span>Duplicados</span><strong>{localBulkSummary.duplicates}</strong></div>
                      <div><span>Opt-out</span><strong>{localBulkSummary.optouts}</strong></div>
                      <div><span>Receberão</span><strong>{localBulkSummary.sendable}</strong></div>
                    </div>
                    <button type="button" className="disparazap-submit" onClick={handleStartCampaign} disabled={bulkWorking || !bulkCampaign || bulkCampaign.status !== 'ready'}>
                      {bulkWorking ? 'Iniciando...' : 'Iniciar campanha'}
                    </button>
                  </>
                )}

                {(bulkStep === 'send' || bulkStep === 'result') && (
                  <>
                    <div className="disparazap-review-grid">
                      <div><span>Total</span><strong>{bulkCampaign?.total_contacts ?? 0}</strong></div>
                      <div><span>Na fila</span><strong>{bulkCampaign?.total_queued ?? 0}</strong></div>
                      <div><span>Enviadas</span><strong>{bulkCampaign?.total_sent ?? 0}</strong></div>
                      <div><span>Entregues</span><strong>{bulkCampaign?.total_delivered ?? 0}</strong></div>
                      <div><span>Lidas</span><strong>{bulkCampaign?.total_read ?? 0}</strong></div>
                      <div><span>Falharam</span><strong>{bulkCampaign?.total_failed ?? 0}</strong></div>
                      <div><span>Opt-out</span><strong>{bulkCampaign?.total_optout ?? 0}</strong></div>
                    </div>
                    <div className="disparazap-empty-params">
                      <DisparazapIcon type="info" />
                      <span>Acompanhe os status pelo webhook conforme a Meta retornar sent, delivered, read e failed.</span>
                    </div>
                  </>
                )}
              </section>

              <div className="disparazap-bulk-side">
                {renderPreview(selectedTemplate, selectedTemplate?.bodyVariableCount ? ['Nome do cliente'] : [], bulkRecipients[0]?.phone ?? 'Telefone mascarado')}
                <div className="disparazap-counters">
                  <span>Válidos <strong>{localBulkSummary.valid}</strong></span>
                  <span>Inválidos <strong>{localBulkSummary.invalid}</strong></span>
                  <span>Duplicados <strong>{localBulkSummary.duplicates}</strong></span>
                  <span>Opt-out <strong>{localBulkSummary.optouts}</strong></span>
                </div>
                {bulkRecipients.length > 0 && (
                  <div className="disparazap-recipient-list">
                    {bulkRecipients.slice(0, 8).map(recipient => (
                      <div key={recipient.id}>
                        <strong>{recipient.name}</strong>
                        <span>{recipient.phone ?? 'Telefone mascarado'} · {recipient.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="disparazap-inbox">
            <aside className="disparazap-card disparazap-inbox-list">
              <div className="disparazap-card-header">
                <span className="disparazap-card-icon is-whatsapp">
                  <ModuleIcon type="message" />
                </span>
                <div>
                  <strong>Caixa de entrada</strong>
                  <span>Respostas das campanhas e conversas abertas.</span>
                </div>
              </div>

              <label className="disparazap-field">
                <span>Buscar</span>
                <input value={inboxSearch} onChange={event => setInboxSearch(event.target.value)} placeholder="Nome ou telefone" />
              </label>

              <div className="disparazap-inbox-filters">
                {[
                  ['all', 'Todas'],
                  ['unread', 'Não lidas'],
                  ['interested', 'Interessados'],
                  ['optout', 'Opt-out'],
                ].map(([key, label]) => (
                  <button key={key} type="button" className={inboxFilter === key ? 'is-active' : ''} onClick={() => setInboxFilter(key as DisparazapInboxFilter)}>
                    {label}
                  </button>
                ))}
              </div>

              {inboxLoading ? (
                <div className="disparazap-inbox-empty">Carregando conversas...</div>
              ) : inboxConversations.length === 0 ? (
                <div className="disparazap-inbox-empty">
                  <strong>Nenhuma conversa ainda</strong>
                  <span>As respostas das suas campanhas aparecerão aqui automaticamente.</span>
                </div>
              ) : (
                <div className="disparazap-inbox-thread-list">
                  {inboxConversations.map(conversation => (
                    <button key={conversation.id} type="button" className={inboxSelectedId === conversation.id ? 'is-active' : ''} onClick={() => setInboxSelectedId(conversation.id)}>
                      <div>
                        <strong>{conversation.name || 'Contato sem nome'}</strong>
                        <span>{conversation.phone || 'Telefone mascarado'}</span>
                      </div>
                      <p>{conversation.last_message_text || 'Sem mensagem'}</p>
                      <footer>
                        {conversation.interested && <em className="is-interested">Interessado</em>}
                        {conversation.opted_out && <em className="is-optout">Opt-out</em>}
                        <small>{formatDisparazapRelativeTime(conversation.last_message_at)}</small>
                        {conversation.unread_count > 0 && <b>{conversation.unread_count}</b>}
                      </footer>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <section className="disparazap-card disparazap-inbox-chat">
              {inboxConversationLoading && !inboxSelected ? (
                <div className="disparazap-inbox-empty">Carregando conversa...</div>
              ) : !inboxSelected ? (
                <div className="disparazap-inbox-empty">
                  <strong>Nenhuma conversa selecionada</strong>
                  <span>Escolha uma conversa para ler e responder.</span>
                </div>
              ) : (
                <>
                  <div className="disparazap-inbox-chat-header">
                    <div>
                      <strong>{inboxSelected.name || 'Contato sem nome'}</strong>
                      <span>{inboxSelected.phone || 'Telefone mascarado'} · {formatDisparazapRelativeTime(inboxSelected.last_message_at)}</span>
                    </div>
                    <div className="disparazap-inbox-badges">
                      {inboxSelected.interested && <em className="is-interested">Interessado</em>}
                      {inboxSelected.opted_out && <em className="is-optout">Opt-out</em>}
                      <b className={selectedInboxWindow.active ? 'is-active' : 'is-closed'}>{selectedInboxWindow.label}</b>
                      <small>{selectedInboxWindow.detail}</small>
                    </div>
                  </div>

                  {inboxError && <span className="crm-global-error">{inboxError}</span>}

                  <div className="disparazap-inbox-messages">
                    {inboxMessages.length === 0 ? (
                      <div className="disparazap-inbox-empty">Nenhuma mensagem nesta conversa.</div>
                    ) : (
                      inboxMessages.map(message => (
                        <div key={message.id} className={`disparazap-inbox-message is-${message.direction}`}>
                          <div>
                            {message.type === 'template' && <span>Campanha</span>}
                            {message.type === 'button' && <span>Resposta rápida</span>}
                            <strong>{getDisparazapMessageText(message)}</strong>
                            <footer>
                              <small>{formatCrmDate(message.meta_timestamp || message.created_at)}</small>
                              {message.direction === 'outbound' && <em>{message.status || 'accepted'}</em>}
                            </footer>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form className="disparazap-inbox-reply" onSubmit={handleSendInboxReply}>
                    {!selectedInboxWindow.active || inboxSelected.opted_out ? (
                      <div className="disparazap-empty-params">
                        <DisparazapIcon type="info" />
                        <span>{inboxSelected.opted_out ? 'Este contato pediu opt-out. Não responda por texto livre.' : 'A janela de atendimento de 24 horas terminou. Use um template aprovado para iniciar uma nova conversa.'}</span>
                      </div>
                    ) : (
                      <>
                        <textarea value={inboxReply} onChange={event => setInboxReply(event.target.value)} placeholder="Digite sua resposta..." />
                        <button type="submit" className="disparazap-submit" disabled={inboxSending || !inboxReply.trim()}>
                          <DisparazapIcon type="send" />
                          {inboxSending ? 'Enviando...' : 'Enviar'}
                        </button>
                      </>
                    )}
                  </form>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

function OfflineBillingModule() {
  const [clients, setClients] = useState<OfflineBillingClient[]>([])
  const [slips, setSlips] = useState<OfflineBillingSlip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [activeArea, setActiveArea] = useState<'Clientes' | 'Competências'>('Competências')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<OfflineBillingClient | null>(null)
  const [editingSlip, setEditingSlip] = useState<OfflineBillingSlip | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [dueMonthInput, setDueMonthInput] = useState(getCurrentRoutineCompetenceMonth().slice(0, 7))

  const loadBillingData = async () => {
    setLoading(true)
    setError('')

    const [clientsResult, slipsResult] = await Promise.all([
      supabase
        .from('offline_billing_clients')
        .select('*')
        .order('client_name', { ascending: true }),
      supabase
        .from(OFFLINE_BILLING_TABLE)
        .select('*')
        .order('due_date', { ascending: true }),
    ])

    if (clientsResult.error || slipsResult.error) {
      setError('Não consegui carregar os boletos. Execute o SQL de criação do módulo Boletos.')
      setLoading(false)
      return
    }

    setClients(((clientsResult.data ?? []) as OfflineBillingClientRow[]).map(mapOfflineBillingClient))

    const mappedSlips = ((slipsResult.data ?? []) as OfflineBillingSlipRow[]).map(mapOfflineBillingSlip)
    const today = new Date().toISOString().slice(0, 10)
    const overdueIds = mappedSlips
      .filter(slip => slip.status === 'pendente' && slip.dueDate && slip.dueDate.slice(0, 10) < today)
      .map(slip => slip.id)

    if (overdueIds.length) {
      const { error: overdueError } = await supabase
        .from(OFFLINE_BILLING_TABLE)
        .update({ status: 'vencido', updated_at: new Date().toISOString() })
        .in('id', overdueIds)

      if (!overdueError) {
        setSlips(mappedSlips.map(slip => overdueIds.includes(slip.id) ? { ...slip, status: 'vencido' as const } : slip))
        setLoading(false)
        return
      }
    }

    setSlips(mappedSlips)
    setLoading(false)
  }

  useEffect(() => { void loadBillingData() }, [])

  const selectedDueMonth = normalizeRoutineCompetenceMonth(dueMonthInput)
  const selectedDueMonthKey = selectedDueMonth.slice(0, 7)
  const selectedReferenceMonth = getBillingReferenceFromDueMonth(selectedDueMonth)
  const competenceSlips = slips.filter(slip =>
    slip.dueDate.slice(0, 7) === selectedDueMonthKey || slip.referenceMonth === selectedReferenceMonth
  )
  const activeClients = clients.filter(client => client.active)

  const counts = useMemo(() => {
    return competenceSlips.reduce(
      (acc, slip) => {
        if (slip.status === 'pago') acc.paid += 1
        if (slip.status === 'pendente') acc.pending += 1
        if (slip.status === 'vencido') acc.overdue += 1
        if (slip.initialSentAt) acc.sent += 1
        return acc
      },
      { pending: 0, paid: 0, overdue: 0, sent: 0 }
    )
  }, [competenceSlips])

  const handleSaveClient = async (formData: OfflineBillingFormData, clientId?: string) => {
    const payload = {
      client_name: formData.clientName.trim(),
      email: formData.email.trim(),
      whatsapp: formData.whatsapp.trim(),
      due_day: Number(formData.dueDay),
      default_amount: parseOfflineBillingAmount(formData.amount),
      updated_at: new Date().toISOString(),
    }

    const query = clientId
      ? supabase.from('offline_billing_clients').update(payload).eq('id', clientId)
      : supabase.from('offline_billing_clients').insert(payload)

    const { data, error: saveError } = await query.select('*').single()

    if (saveError || !data) throw new Error('Não consegui salvar o cliente de boleto.')

    const savedClient = mapOfflineBillingClient(data as OfflineBillingClientRow)
    setClients(current => {
      const next = clientId
        ? current.map(client => client.id === clientId ? savedClient : client)
        : [...current, savedClient]
      return next.sort((a, b) => a.clientName.localeCompare(b.clientName))
    })
  }

  const updateClientStatus = async (client: OfflineBillingClient, active: boolean) => {
    const { data, error: updateError } = await supabase
      .from('offline_billing_clients')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', client.id)
      .select('*')
      .single()

    if (updateError || !data) {
      setError('Não consegui atualizar o cliente.')
      return
    }

    setClients(current => current.map(item => item.id === client.id ? mapOfflineBillingClient(data as OfflineBillingClientRow) : item))
  }

  const insertCompetenceSlips = async (clientsToGenerate: OfflineBillingClient[]) => {
    const payload = clientsToGenerate.map(client => ({
      client_id: client.id,
      client_name: client.clientName,
      email: client.email,
      whatsapp: client.whatsapp,
      due_date: getBillingDueDateFromDueMonth(selectedDueMonth, client.dueDay),
      reference_month: selectedReferenceMonth,
      amount: client.defaultAmount,
      file_name: '',
      file_path: null,
      file_size: 0,
    }))

    return supabase
      .from(OFFLINE_BILLING_TABLE)
      .insert(payload)
      .select('id')
  }

  const generateClientCompetence = async (client: OfflineBillingClient) => {
    setError('')
    setMessage('')
    setGenerating(true)

    try {
      if (!client.active) {
        setError('Ative o cliente antes de gerar um boleto para ele.')
        return
      }

      const { data: existingSlip, error: existingError } = await supabase
        .from(OFFLINE_BILLING_TABLE)
        .select('id')
        .eq('reference_month', selectedReferenceMonth)
        .eq('client_id', client.id)
        .maybeSingle()

      if (existingError) {
        setError('Não consegui verificar se esse cliente já tem boleto neste mês.')
        return
      }

      if (existingSlip) {
        await loadBillingData()
        setMessage(`${client.clientName} já tem boleto em ${formatBillingReference(selectedDueMonth)}.`)
        setActiveArea('Competências')
        return
      }

      const { data: insertedRows, error: insertError } = await insertCompetenceSlips([client])

      if (insertError || !insertedRows?.length) {
        const details = insertError ? [insertError.code, insertError.message, insertError.details].filter(Boolean).join(' · ') : ''
        setError(`Não consegui gerar o boleto deste cliente. ${details}`.trim())
        return
      }

      await loadBillingData()
      setMessage(`Boleto de ${formatBillingReference(selectedDueMonth)} gerado para ${client.clientName}.`)
      setActiveArea('Competências')
    } finally {
      setGenerating(false)
    }
  }

  const generateCompetence = async () => {
    setError('')
    setMessage('')
    setGenerating(true)

    try {
      if (!activeClients.length) {
        setError('Nenhum cliente ativo cadastrado. Cadastre ou ative um cliente antes de gerar boletos.')
        setActiveArea('Clientes')
        return
      }

      const { data: existingRows, error: existingError } = await supabase
        .from(OFFLINE_BILLING_TABLE)
        .select('client_id')
        .eq('reference_month', selectedReferenceMonth)
        .not('client_id', 'is', null)

      if (existingError) {
        setError('Não consegui verificar os boletos já gerados para este mês.')
        return
      }

      const existingClientIds = new Set(
        (((existingRows ?? []) as Array<{ client_id: string | null }>).map(row => row.client_id).filter(Boolean)) as string[]
      )
      const clientsToGenerate = activeClients.filter(client => !existingClientIds.has(client.id))

      if (!clientsToGenerate.length) {
        await loadBillingData()
        setMessage('Todos os clientes ativos já têm boleto para este mês. Atualizei a lista com os lançamentos encontrados.')
        setActiveArea('Competências')
        return
      }

      const { data: insertedRows, error: insertError } = await insertCompetenceSlips(clientsToGenerate)

      if (insertError) {
        await loadBillingData()
        if (insertError.code === '23505') {
          setMessage('Esse mês já tinha lançamentos. Atualizei a lista com o que estava no banco.')
        } else {
          const details = [insertError.code, insertError.message, insertError.details]
            .filter(Boolean)
            .join(' · ')
          setError(`Não consegui gerar os boletos deste mês. ${details}`)
        }
        return
      }

      await loadBillingData()
      const insertedCount = insertedRows?.length ?? 0
      if (insertedCount === 0) {
        setError('O Supabase aceitou a solicitação, mas não retornou lançamentos criados. Confira as políticas RLS da tabela offline_billing_slips.')
        return
      }

      setMessage(`Boletos de ${formatBillingReference(selectedDueMonth)} gerados para ${insertedCount} cliente${insertedCount === 1 ? '' : 's'}.`)
      setActiveArea('Competências')
    } finally {
      setGenerating(false)
    }
  }

  const sendBillingEmail = async (id: string, type: 'initial' | 'reminder_5d' | 'due_date' | 'recovery', testEmail = '') => {
    setSendingId(id)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/offline-boletos/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, testEmail: testEmail || undefined }),
      })
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Não consegui enviar o e-mail.')
      }

      setMessage(testEmail ? `E-mail teste enviado para ${testEmail}.` : 'E-mail enviado com sucesso.')
      if (!testEmail) await loadBillingData()
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Não consegui enviar o e-mail.')
    } finally {
      setSendingId(null)
    }
  }

  const sendBillingTestEmail = async (slip: OfflineBillingSlip) => {
    const email = window.prompt('Enviar teste para qual e-mail?')
    const trimmedEmail = email?.trim()

    if (!trimmedEmail) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Informe um e-mail de teste válido.')
      return
    }

    await sendBillingEmail(slip.id, 'initial', trimmedEmail)
  }

  const attachSlipFile = async (slip: OfflineBillingSlip, file: File) => {
    setError('')

    if (file.type !== 'application/pdf') {
      setError('Envie o boleto em PDF.')
      return
    }

    if (file.size > OFFLINE_BILLING_FILE_LIMIT_BYTES) {
      setError('O boleto deve ter até 10 MB.')
      return
    }

    setUploadingId(slip.id)
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const storagePath = `${slip.clientId || 'avulso'}/${slip.referenceMonth.slice(0, 7)}-${Date.now()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from(OFFLINE_BILLING_BUCKET)
      .upload(storagePath, file)

    if (uploadError) {
      setUploadingId(null)
      setError('Não consegui anexar o boleto. Confira se o bucket foi criado.')
      return
    }

    const { data, error: saveError } = await supabase
      .from(OFFLINE_BILLING_TABLE)
      .update({
        file_name: file.name,
        file_path: storagePath,
        file_size: file.size,
        updated_at: new Date().toISOString(),
      })
      .eq('id', slip.id)
      .select('*')
      .single()

    if (saveError || !data) {
      await supabase.storage.from(OFFLINE_BILLING_BUCKET).remove([storagePath])
      setUploadingId(null)
      setError('Não consegui salvar o arquivo do boleto.')
      return
    }

    setUploadingId(null)
    setSlips(current => current.map(item => item.id === slip.id ? mapOfflineBillingSlip(data as OfflineBillingSlipRow) : item))
    setMessage('Boleto anexado.')
  }

  const openSlipFile = async (slip: OfflineBillingSlip) => {
    if (!slip.filePath) {
      setError('Anexe o PDF antes de abrir.')
      return
    }

    setOpeningId(slip.id)
    setError('')

    const { data, error: signedError } = await supabase.storage
      .from(OFFLINE_BILLING_BUCKET)
      .createSignedUrl(slip.filePath, 60 * 10)

    setOpeningId(null)

    if (signedError || !data?.signedUrl) {
      setError('Não consegui abrir o boleto.')
      return
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  const updateSlipStatus = async (slip: OfflineBillingSlip, status: OfflineBillingStatus) => {
    setError('')
    const { data, error: updateError } = await supabase
      .from(OFFLINE_BILLING_TABLE)
      .update({
        status,
        paid_at: status === 'pago' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', slip.id)
      .select('*')
      .single()

    if (updateError || !data) {
      setError('Não consegui atualizar o status do boleto.')
      return
    }

    setSlips(current => current.map(item => item.id === slip.id ? mapOfflineBillingSlip(data as OfflineBillingSlipRow) : item))
  }

  const handleSaveSlip = async (slip: OfflineBillingSlip, formData: OfflineBillingSlipEditData) => {
    const { data, error: updateError } = await supabase
      .from(OFFLINE_BILLING_TABLE)
      .update({
        client_name: formData.clientName.trim(),
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        due_date: formData.dueDate,
        amount: parseOfflineBillingAmount(formData.amount),
        status: formData.status,
        paid_at: formData.status === 'pago' ? (slip.paidAt || new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', slip.id)
      .select('*')
      .single()

    if (updateError || !data) throw new Error('Não consegui salvar o lançamento.')

    setSlips(current => current.map(item => item.id === slip.id ? mapOfflineBillingSlip(data as OfflineBillingSlipRow) : item))
  }

  const deleteSlip = async (slip: OfflineBillingSlip) => {
    const confirmed = window.confirm(`Excluir o lançamento de ${slip.clientName}?`)
    if (!confirmed) return

    setError('')
    const { error: deleteError } = await supabase
      .from(OFFLINE_BILLING_TABLE)
      .delete()
      .eq('id', slip.id)

    if (deleteError) {
      setError('Não consegui excluir o lançamento.')
      return
    }

    if (slip.filePath) {
      await supabase.storage.from(OFFLINE_BILLING_BUCKET).remove([slip.filePath])
    }

    setSlips(current => current.filter(item => item.id !== slip.id))
    setMessage('Lançamento excluído.')
  }

  return (
    <div className="offline-billing-module crm-module">
      <div className="crm-module-inner offline-billing-inner">
        <div className="crm-module-header">
          <div>
            <p>Offline</p>
            <h2>Boletos</h2>
          </div>
          <div className="crm-header-right">
            {error && <span className="crm-global-error">{error}</span>}
            {message && <span className="offline-billing-message">{message}</span>}
            <button
              className="crm-add-btn crm-add-icon-btn"
              onClick={() => {
                setEditingClient(null)
                setIsModalOpen(true)
              }}
              type="button"
              aria-label="Adicionar cliente de boleto"
              title="Adicionar cliente de boleto"
            >
              <PfxPlusIcon />
            </button>
          </div>
        </div>

        <div className="routine-tabs offline-billing-tabs" aria-label="Áreas de Boletos">
          <button className={activeArea === 'Clientes' ? 'active' : ''} type="button" onClick={() => setActiveArea('Clientes')}>Clientes</button>
          <button className={activeArea === 'Competências' ? 'active' : ''} type="button" onClick={() => setActiveArea('Competências')}>Competências</button>
        </div>

        <div className="offline-billing-summary-grid" aria-label="Resumo dos boletos">
          <div className="pfx-summary-card">
            <span>Pendentes</span>
            <strong>{counts.pending}</strong>
          </div>
          <div className="pfx-summary-card">
            <span>Pagos</span>
            <strong>{counts.paid}</strong>
          </div>
          <div className="pfx-summary-card">
            <span>Vencidos</span>
            <strong>{counts.overdue}</strong>
          </div>
          <div className="pfx-summary-card">
            <span>E-mail inicial enviado</span>
            <strong>{counts.sent}</strong>
          </div>
        </div>

        {loading ? (
          <div className="crm-loading">Carregando boletos...</div>
        ) : activeArea === 'Clientes' ? (
          <div className="offline-billing-table-card">
            <table className="offline-billing-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Dia de vencimento</th>
                  <th>Valor padrão</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td>
                      <div className="offline-billing-client-cell">
                        <strong>{client.clientName}</strong>
                        <span>{client.email}</span>
                        {client.whatsapp ? <small>{client.whatsapp}</small> : null}
                      </div>
                    </td>
                    <td>Todo dia {client.dueDay}</td>
                    <td>{formatOfflineBillingAmount(client.defaultAmount)}</td>
                    <td>
                      <span className={`offline-billing-status ${client.active ? 'is-pago' : 'is-vencido'}`}>
                        {client.active ? 'ativo' : 'inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="offline-billing-actions">
                        <button type="button" onClick={() => void updateClientStatus(client, !client.active)}>
                          {client.active ? 'Inativar' : 'Ativar'}
                        </button>
                        <button type="button" onClick={() => {
                          setEditingClient(client)
                          setIsModalOpen(true)
                        }}>
                          Editar
                        </button>
                        <button type="button" onClick={() => void generateClientCompetence(client)} disabled={generating || !client.active}>
                          Gerar boleto
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {clients.length === 0 && (
              <div className="pfx-empty-state">
                <strong>Nenhum cliente de boleto cadastrado.</strong>
                <span>Cadastre o cliente uma vez e depois gere as competências mensais.</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="offline-billing-competence-bar">
              <label>
                Mês de vencimento
                <input type="month" value={dueMonthInput} onChange={event => setDueMonthInput(event.target.value)} />
              </label>
              <button className="crm-add-btn" type="button" onClick={() => void generateCompetence()} disabled={generating}>
                {generating ? 'Gerando...' : 'Gerar competência'}
              </button>
              <span>
                Vencimento em {formatBillingReference(selectedDueMonth)} gera boleto referente a {formatBillingReference(selectedReferenceMonth)}.
                {' '}Clientes ativos: {activeClients.length}. Lançamentos neste mês: {competenceSlips.length}.
              </span>
            </div>

          <div className="offline-billing-table-card">
            <table className="offline-billing-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Referência</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Envio</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {competenceSlips.map(slip => (
                  <tr key={slip.id}>
                    <td>
                      <div className="offline-billing-client-cell">
                        <strong>{slip.clientName}</strong>
                        <span>{slip.email}</span>
                        {slip.whatsapp ? <small>{slip.whatsapp}</small> : null}
                      </div>
                    </td>
                    <td>{formatBillingReference(slip.referenceMonth)}</td>
                    <td>{formatOfflineBillingDate(slip.dueDate)}</td>
                    <td>{formatOfflineBillingAmount(slip.amount)}</td>
                    <td>
                      <span className={`offline-billing-status is-${slip.status}`}>{slip.status}</span>
                    </td>
                    <td>
                      <div className="offline-billing-sent-cell">
                        <strong>{formatOfflineBillingSentAt(slip.initialSentAt)}</strong>
                        <small>5 dias: {formatOfflineBillingSentAt(slip.reminder5dSentAt)}</small>
                        <small>Vencimento: {formatOfflineBillingSentAt(slip.dueDateSentAt)}</small>
                        <small>Recuperação: {formatOfflineBillingSentAt(slip.recoverySentAt)}</small>
                      </div>
                    </td>
                    <td>
                      <div className="offline-billing-actions">
                        <label className="offline-billing-file-action">
                          {uploadingId === slip.id ? 'Anexando...' : slip.filePath ? 'Trocar PDF' : 'Anexar PDF'}
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={event => {
                              const file = event.target.files?.[0]
                              event.target.value = ''
                              if (file) void attachSlipFile(slip, file)
                            }}
                            hidden
                          />
                        </label>
                        <button type="button" onClick={() => void openSlipFile(slip)} disabled={openingId === slip.id || !slip.filePath}>
                          {openingId === slip.id ? 'Abrindo...' : 'Abrir'}
                        </button>
                        <button type="button" onClick={() => void sendBillingEmail(slip.id, 'initial')} disabled={sendingId === slip.id || !slip.filePath}>
                          {sendingId === slip.id ? 'Enviando...' : slip.initialSentAt ? 'Reenviar boleto' : 'Enviar boleto'}
                        </button>
                        <button type="button" onClick={() => void sendBillingEmail(slip.id, 'reminder_5d')} disabled={sendingId === slip.id || !slip.filePath}>
                          {slip.reminder5dSentAt ? 'Reenviar 5 dias' : 'Enviar 5 dias'}
                        </button>
                        <button type="button" onClick={() => void sendBillingEmail(slip.id, 'due_date')} disabled={sendingId === slip.id || !slip.filePath}>
                          {slip.dueDateSentAt ? 'Reenviar vencimento' : 'Enviar vencimento'}
                        </button>
                        <button type="button" onClick={() => void sendBillingTestEmail(slip)} disabled={sendingId === slip.id || !slip.filePath}>
                          Teste
                        </button>
                        <button type="button" onClick={() => setEditingSlip(slip)}>
                          Editar
                        </button>
                        {slip.status === 'pago' ? (
                          <button type="button" onClick={() => void updateSlipStatus(slip, 'pendente')}>Pendente</button>
                        ) : (
                          <button type="button" onClick={() => void updateSlipStatus(slip, 'pago')}>Pago</button>
                        )}
                        <button type="button" className="offline-billing-delete-action" onClick={() => void deleteSlip(slip)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {competenceSlips.length === 0 && (
              <div className="pfx-empty-state">
                <strong>Nenhum boleto nesta competência.</strong>
                <span>Gere a competência para os clientes ativos e depois anexe os PDFs.</span>
              </div>
            )}
          </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <OfflineBillingModal
          client={editingClient}
          onClose={() => {
            setEditingClient(null)
            setIsModalOpen(false)
          }}
          onSave={async formData => {
            await handleSaveClient(formData, editingClient?.id)
            setIsModalOpen(false)
            setEditingClient(null)
            setMessage(editingClient ? 'Cliente de boleto atualizado.' : 'Cliente de boleto cadastrado.')
          }}
        />
      )}

      {editingSlip && (
        <OfflineBillingSlipModal
          slip={editingSlip}
          onClose={() => setEditingSlip(null)}
          onSave={async formData => {
            await handleSaveSlip(editingSlip, formData)
            setEditingSlip(null)
            setMessage('Lançamento atualizado.')
          }}
        />
      )}
    </div>
  )
}

function OfflineBillingModal({
  client,
  onClose,
  onSave,
}: {
  client: OfflineBillingClient | null
  onClose: () => void
  onSave: (formData: OfflineBillingFormData) => Promise<void>
}) {
  const [clientName, setClientName] = useState(client?.clientName ?? '')
  const [email, setEmail] = useState(client?.email ?? '')
  const [whatsapp, setWhatsapp] = useState(client?.whatsapp ?? '')
  const [dueDay, setDueDay] = useState(client ? String(client.dueDay) : '15')
  const [amount, setAmount] = useState(client ? formatOfflineBillingAmount(client.defaultAmount) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!clientName.trim() || !email.trim() || !dueDay || !amount.trim()) {
      setError('Preencha cliente, e-mail, dia de vencimento e valor.')
      return
    }

    if (!isValidOfflineBillingEmailList(email)) {
      setError('Informe um ou mais e-mails válidos, separados por vírgula.')
      return
    }

    if (parseOfflineBillingAmount(amount) <= 0) {
      setError('Informe um valor maior que zero.')
      return
    }

    const dueDayNumber = Number(dueDay)
    if (!Number.isInteger(dueDayNumber) || dueDayNumber < 1 || dueDayNumber > 31) {
      setError('Informe um dia de vencimento entre 1 e 31.')
      return
    }

    setSaving(true)
    try {
      await onSave({ clientName, email, whatsapp, dueDay, amount })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não consegui salvar o boleto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal offline-billing-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>{client ? 'Editar cliente de boleto' : 'Novo cliente de boleto'}</h3>
          <button onClick={onClose} type="button" className="crm-modal-close">
            <CloseIcon />
          </button>
        </div>

        <form className="crm-modal-form offline-billing-form" onSubmit={handleSubmit}>
          <div className="offline-billing-form-grid">
            <label>
              Cliente
              <input value={clientName} onChange={event => setClientName(event.target.value)} placeholder="Nome do cliente" />
            </label>
            <label>
              E-mails
              <input value={email} onChange={event => setEmail(event.target.value)} placeholder="cliente@email.com, financeiro@email.com" />
            </label>
            <label>
              WhatsApp
              <input value={whatsapp} onChange={event => setWhatsapp(event.target.value)} placeholder="Opcional" />
            </label>
            <label>
              Dia de vencimento
              <input type="number" min={1} max={31} value={dueDay} onChange={event => setDueDay(event.target.value)} />
            </label>
            <label>
              Valor padrão
              <input value={amount} onChange={event => setAmount(event.target.value)} placeholder="R$ 0,00" />
            </label>
            <label>
              Geração mensal
              <input value={`Todo dia ${dueDay || '—'} do mês de vencimento escolhido`} readOnly />
            </label>
          </div>

          {error && <p className="crm-modal-error">{error}</p>}

          <div className="crm-modal-footer">
            <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
            <button type="submit" disabled={saving} className="crm-modal-submit">
              {saving ? 'Salvando...' : client ? 'Salvar alterações' : 'Salvar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OfflineBillingSlipModal({
  slip,
  onClose,
  onSave,
}: {
  slip: OfflineBillingSlip
  onClose: () => void
  onSave: (formData: OfflineBillingSlipEditData) => Promise<void>
}) {
  const [clientName, setClientName] = useState(slip.clientName)
  const [email, setEmail] = useState(slip.email)
  const [whatsapp, setWhatsapp] = useState(slip.whatsapp)
  const [dueDate, setDueDate] = useState(slip.dueDate)
  const [amount, setAmount] = useState(formatOfflineBillingAmount(slip.amount))
  const [status, setStatus] = useState<OfflineBillingStatus>(slip.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!clientName.trim() || !email.trim() || !dueDate || !amount.trim()) {
      setError('Preencha cliente, e-mails, vencimento e valor.')
      return
    }

    if (!isValidOfflineBillingEmailList(email)) {
      setError('Informe um ou mais e-mails válidos, separados por vírgula.')
      return
    }

    if (parseOfflineBillingAmount(amount) <= 0) {
      setError('Informe um valor maior que zero.')
      return
    }

    setSaving(true)
    try {
      await onSave({ clientName, email, whatsapp, dueDate, amount, status })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não consegui salvar o lançamento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal offline-billing-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>Editar lançamento</h3>
          <button onClick={onClose} type="button" className="crm-modal-close">
            <CloseIcon />
          </button>
        </div>

        <form className="crm-modal-form offline-billing-form" onSubmit={handleSubmit}>
          <div className="offline-billing-form-grid">
            <label>
              Cliente
              <input value={clientName} onChange={event => setClientName(event.target.value)} />
            </label>
            <label>
              E-mails
              <input value={email} onChange={event => setEmail(event.target.value)} />
            </label>
            <label>
              WhatsApp
              <input value={whatsapp} onChange={event => setWhatsapp(event.target.value)} placeholder="Opcional" />
            </label>
            <label>
              Vencimento
              <input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} />
            </label>
            <label>
              Valor
              <input value={amount} onChange={event => setAmount(event.target.value)} />
            </label>
            <label>
              Status
              <select value={status} onChange={event => setStatus(event.target.value as OfflineBillingStatus)}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="vencido">Vencido</option>
              </select>
            </label>
          </div>

          {error && <p className="crm-modal-error">{error}</p>}

          <div className="crm-modal-footer">
            <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
            <button type="submit" disabled={saving} className="crm-modal-submit">
              {saving ? 'Salvando...' : 'Salvar lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PfxModule() {
  const [clients, setClients] = useState<PfxClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [modalClient, setModalClient] = useState<PfxClient | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadClients = async () => {
    setLoading(true)
    setError('')

    const { data, error: loadError } = await supabase
      .from(PFX_CLIENTS_TABLE)
      .select('*')
      .order('validity_date', { ascending: true, nullsFirst: false })

    if (loadError) {
      setError('Não consegui carregar os clientes PFX. Execute o SQL de criação da tabela.')
      setLoading(false)
      return
    }

    const mappedClients = (data ?? []).map(row => mapPfxClient(row as PfxClientRow))
    setClients(mappedClients)
    setSelectedClientId(currentId => currentId && mappedClients.some(client => client.id === currentId) ? currentId : (mappedClients[0]?.id ?? null))
    setLoading(false)
  }

  useEffect(() => { void loadClients() }, [])

  const selectedClient = selectedClientId ? (clients.find(client => client.id === selectedClientId) ?? null) : null

  const handleSaveClient = async (formData: PfxClientFormData, clientId?: string) => {
    const payload = {
      client_name: formData.clientName,
      client_type: formData.clientType,
      bird_id_done: formData.birdIdDone,
      document: formData.document,
      pfx_file_name: formData.pfxFileName,
      pfx_file_url: formData.pfxFileUrl,
      pfx_file_size: formData.pfxFileSize,
      validity_date: formData.validityDate || null,
      whatsapp: formData.whatsapp,
      notes: formData.notes,
      updated_at: new Date().toISOString(),
    }

    if (clientId) {
      const { data, error: saveError } = await supabase
        .from(PFX_CLIENTS_TABLE)
        .update(payload)
        .eq('id', clientId)
        .select('*')
        .single()

      if (saveError || !data) throw new Error('Não consegui salvar as alterações.')
      const updatedClient = mapPfxClient(data as PfxClientRow)
      setClients(current => current.map(client => client.id === clientId ? updatedClient : client))
      setSelectedClientId(clientId)
      return
    }

    const { data, error: saveError } = await supabase
      .from(PFX_CLIENTS_TABLE)
      .insert(payload)
      .select('*')
      .single()

    if (saveError || !data) throw new Error('Não consegui adicionar o cliente PFX.')
    const createdClient = mapPfxClient(data as PfxClientRow)
    setClients(current => [createdClient, ...current])
    setSelectedClientId(createdClient.id)
  }

  const handleDeleteClient = async (clientId: string) => {
    await supabase.from(PFX_CLIENTS_TABLE).delete().eq('id', clientId)
    setClients(current => current.filter(client => client.id !== clientId))
    setSelectedClientId(currentId => currentId === clientId ? null : currentId)
  }

  const counts = useMemo(() => {
    return clients.reduce(
      (acc, client) => {
        const status = getPfxValidityStatus(client.validityDate)
        if (status === 'expired') acc.expired += 1
        if (status === 'soon') acc.soon += 1
        if (!client.birdIdDone) acc.pendingBird += 1
        if (!client.pfxFileName) acc.noFile += 1
        return acc
      },
      { expired: 0, soon: 0, pendingBird: 0, noFile: 0 }
    )
  }, [clients])

  return (
    <div className={`pfx-module crm-module${selectedClient ? ' pfx-module-panel-open' : ''}`}>
      <div className="crm-module-inner pfx-module-inner">
        <div className="crm-module-header">
          <div>
            <h2>PFX</h2>
          </div>
          <div className="crm-header-right">
            {error && <span className="crm-global-error">{error}</span>}
            <button
              className="crm-add-btn crm-add-icon-btn"
              onClick={() => { setModalClient(null); setIsModalOpen(true) }}
              type="button"
              aria-label="Adicionar cliente PFX"
              title="Adicionar cliente PFX"
            >
              <PfxPlusIcon />
            </button>
          </div>
        </div>

        <div className="pfx-summary-grid" aria-label="Resumo PFX">
          <div className="pfx-summary-card">
            <span>Vencidos</span>
            <strong>{counts.expired}</strong>
          </div>
          <div className="pfx-summary-card">
            <span>Próximos 30 dias</span>
            <strong>{counts.soon}</strong>
          </div>
          <div className="pfx-summary-card">
            <span>Bird-ID pendente</span>
            <strong>{counts.pendingBird}</strong>
          </div>
          <div className="pfx-summary-card">
            <span>Sem arquivo</span>
            <strong>{counts.noFile}</strong>
          </div>
        </div>

        {loading ? (
          <div className="crm-loading">Carregando clientes PFX...</div>
        ) : (
          <div className="pfx-table-card">
            <table className="pfx-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Documento</th>
                  <th>Bird-ID</th>
                  <th>PFX</th>
                  <th>Validade</th>
                  <th>WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <PfxClientRow
                    key={client.id}
                    client={client}
                    selected={selectedClientId === client.id}
                    onSelect={() => setSelectedClientId(currentId => currentId === client.id ? null : client.id)}
                  />
                ))}
              </tbody>
            </table>

            {clients.length === 0 && (
              <div className="pfx-empty-state">
                <strong>Nenhum cliente PFX ainda.</strong>
                <span>Use o botão no canto superior direito para cadastrar o primeiro certificado.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedClient && (
        <PfxClientPanel
          client={selectedClient}
          onClose={() => setSelectedClientId(null)}
          onEdit={() => { setModalClient(selectedClient); setIsModalOpen(true) }}
          onDelete={handleDeleteClient}
        />
      )}

      {isModalOpen && (
        <PfxClientModal
          client={modalClient}
          onClose={() => setIsModalOpen(false)}
          onSave={async data => {
            await handleSaveClient(data, modalClient?.id)
            setIsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function PfxClientRow({ client, selected, onSelect }: {
  client: PfxClient
  selected: boolean
  onSelect: () => void
}) {
  const status = getPfxValidityStatus(client.validityDate)
  const hasWhatsapp = normalizePfxWhatsapp(client.whatsapp) !== ''

  return (
    <tr className={selected ? 'selected' : ''} onClick={onSelect}>
      <td>
        <div className="pfx-client-cell">
          <strong>{client.clientName}</strong>
          {client.notes && <span>{client.notes}</span>}
        </div>
      </td>
      <td><span className="pfx-pill">{client.clientType}</span></td>
      <td>{client.document || 'Não informado'}</td>
      <td>
        <span className={`pfx-bird-badge${client.birdIdDone ? ' done' : ''}`}>
          {client.birdIdDone ? 'Feito' : 'Não feito'}
        </span>
      </td>
      <td>
        <span className={`pfx-file-badge${client.pfxFileName ? ' has-file' : ''}`}>
          {client.pfxFileName || 'Sem arquivo'}
        </span>
      </td>
      <td>
        <span className={`pfx-validity-badge status-${status}`}>
          {getPfxValidityLabel(client.validityDate)}
        </span>
      </td>
      <td>
        {hasWhatsapp ? (
          <a
            href={getPfxWhatsappUrl(client, 'Renovação')}
            target="_blank"
            rel="noopener noreferrer"
            className="pfx-row-whatsapp"
            onClick={event => event.stopPropagation()}
            title="Enviar WhatsApp"
          >
            <CrmWhatsappIcon />
          </a>
        ) : (
          <span className="pfx-muted">Sem número</span>
        )}
      </td>
    </tr>
  )
}

function PfxClientPanel({ client, onClose, onEdit, onDelete }: {
  client: PfxClient
  onClose: () => void
  onEdit: () => void
  onDelete: (clientId: string) => Promise<void>
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const status = getPfxValidityStatus(client.validityDate)
  const whatsappReady = normalizePfxWhatsapp(client.whatsapp) !== ''

  return (
    <aside className="pfx-panel crm-lead-panel">
      <div className="crm-panel-header">
        <div className="crm-panel-title">
          <span className={`pfx-panel-status-dot status-${status}`} />
          <div>
            <strong>{client.clientName}</strong>
            <span>{client.clientType} · {client.document || 'Sem documento'}</span>
          </div>
        </div>
        <button className="crm-panel-close" onClick={onClose} type="button" aria-label="Fechar">
          <CloseIcon />
        </button>
      </div>

      <div className="crm-panel-body">
        <div className="pfx-panel-hero">
          <span className={`pfx-validity-badge status-${status}`}>
            {getPfxValidityLabel(client.validityDate)}
          </span>
          <strong>{client.pfxFileName || 'Arquivo PFX não anexado'}</strong>
          {client.pfxFileName && <span>{formatPfxFileSize(client.pfxFileSize)}</span>}
          {client.pfxFileUrl && (
            <a href={client.pfxFileUrl} download={client.pfxFileName || 'certificado.pfx'} className="pfx-download-link">
              Baixar PFX
            </a>
          )}
        </div>

        <div className="crm-panel-section">
          <p className="crm-panel-label">WhatsApp</p>
          <div className="pfx-whatsapp-actions">
            {PFX_WHATSAPP_INTENTS.map(intent => (
              <a
                key={intent}
                href={whatsappReady ? getPfxWhatsappUrl(client, intent) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`crm-contact-btn crm-contact-whatsapp${!whatsappReady ? ' disabled' : ''}`}
                aria-disabled={!whatsappReady}
                onClick={event => { if (!whatsappReady) event.preventDefault() }}
              >
                <CrmWhatsappIcon /> {intent}
              </a>
            ))}
          </div>
          <div className="crm-contact-info">
            {client.whatsapp ? <span>{client.whatsapp}</span> : <span>Nenhum WhatsApp cadastrado</span>}
          </div>
        </div>

        <div className="crm-panel-section">
          <p className="crm-panel-label">Dados</p>
          <div className="pfx-detail-list">
            <div><span>Tipo</span><strong>{client.clientType}</strong></div>
            <div><span>Bird-ID</span><strong>{client.birdIdDone ? 'Feito' : 'Não feito'}</strong></div>
            <div><span>Documento</span><strong>{client.document || 'Não informado'}</strong></div>
            <div><span>Atualizado em</span><strong>{formatCrmDate(client.updatedAt)}</strong></div>
          </div>
        </div>

        {client.notes && (
          <div className="crm-panel-section">
            <p className="crm-panel-label">Observação</p>
            <p className="pfx-notes">{client.notes}</p>
          </div>
        )}

        <div className="crm-panel-section">
          <button type="button" className="pfx-edit-btn" onClick={onEdit}>
            <PencilIcon /> Editar cliente
          </button>
        </div>

        <div className="crm-panel-section crm-panel-danger-zone">
          {confirmDelete ? (
            <div className="crm-delete-confirm">
              <span>Excluir este cliente PFX?</span>
              <div className="crm-delete-confirm-actions">
                <button className="crm-delete-yes" onClick={() => void onDelete(client.id)} type="button">Sim, excluir</button>
                <button className="crm-delete-no" onClick={() => setConfirmDelete(false)} type="button">Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="crm-delete-btn" onClick={() => setConfirmDelete(true)} type="button">
              <TrashIcon /> Excluir cliente
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

function PfxClientModal({ client, onClose, onSave }: {
  client: PfxClient | null
  onClose: () => void
  onSave: (data: PfxClientFormData) => Promise<void>
}) {
  const [clientName, setClientName] = useState(client?.clientName ?? '')
  const [clientType, setClientType] = useState<PfxClientType>(client?.clientType ?? 'PJ')
  const [birdIdDone, setBirdIdDone] = useState(client?.birdIdDone ?? false)
  const [document, setDocument] = useState(client?.document ?? '')
  const [pfxFileName, setPfxFileName] = useState(client?.pfxFileName ?? '')
  const [pfxFileUrl, setPfxFileUrl] = useState(client?.pfxFileUrl ?? '')
  const [pfxFileSize, setPfxFileSize] = useState(client?.pfxFileSize ?? 0)
  const [validityDate, setValidityDate] = useState(client?.validityDate ?? '')
  const [whatsapp, setWhatsapp] = useState(client?.whatsapp ?? '')
  const [notes, setNotes] = useState(client?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleTypeChange = (nextType: PfxClientType) => {
    setClientType(nextType)
    setDocument(maskPfxDocument(document, nextType))
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')

    if (file.size > PFX_FILE_LIMIT_BYTES) {
      setError('O arquivo PFX pode ter no máximo 5MB.')
      event.target.value = ''
      return
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(new Error('Falha ao ler arquivo.'))
      reader.readAsDataURL(file)
    })

    setPfxFileName(file.name)
    setPfxFileUrl(dataUrl)
    setPfxFileSize(file.size)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const cleanName = clientName.trim()
    const cleanDocument = maskPfxDocument(document, clientType)
    const documentDigits = onlyDigits(cleanDocument)
    const expectedDocumentSize = clientType === 'PF' ? 11 : 14

    if (!cleanName) {
      setError('Informe o nome do cliente.')
      return
    }

    if (cleanDocument && documentDigits.length !== expectedDocumentSize) {
      setError(clientType === 'PF' ? 'Informe um CPF completo.' : 'Informe um CNPJ completo.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await onSave({
        clientName: cleanName,
        clientType,
        birdIdDone,
        document: cleanDocument,
        pfxFileName,
        pfxFileUrl,
        pfxFileSize,
        validityDate,
        whatsapp: maskPfxWhatsapp(whatsapp),
        notes: notes.trim(),
      })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não consegui salvar o cliente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal pfx-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>{client ? 'Editar cliente PFX' : 'Novo cliente PFX'}</h3>
          <button onClick={onClose} type="button" className="crm-modal-close"><CloseIcon /></button>
        </div>

        <form className="crm-modal-form" onSubmit={event => void handleSubmit(event)}>
          <label>Cliente *<input value={clientName} onChange={event => { setClientName(event.target.value); setError('') }} placeholder="Nome do cliente" autoFocus /></label>
          <div className="crm-modal-row">
            <label>
              Tipo
              <select value={clientType} onChange={event => handleTypeChange(event.target.value as PfxClientType)}>
                <option value="PJ">PJ</option>
                <option value="PF">PF</option>
              </select>
            </label>
            <label>
              Bird-ID
              <select value={birdIdDone ? 'Feito' : 'Não Feito'} onChange={event => setBirdIdDone(event.target.value === 'Feito')}>
                {PFX_BIRD_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
          <div className="crm-modal-row">
            <label>
              Documento
              <input
                value={document}
                onChange={event => setDocument(maskPfxDocument(event.target.value, clientType))}
                placeholder={clientType === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
            </label>
            <label>
              Validade
              <input type="date" value={validityDate} onChange={event => setValidityDate(event.target.value)} />
            </label>
          </div>
          <label>
            WhatsApp
            <input value={whatsapp} onChange={event => setWhatsapp(maskPfxWhatsapp(event.target.value))} placeholder="(00) 00000-0000" />
          </label>

          <div className="pfx-upload-field">
            <span className="crm-import-file-label">Arquivo PFX</span>
            <div className="crm-import-upload">
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                Escolher arquivo
              </button>
              <span>{pfxFileName ? `${pfxFileName}${formatPfxFileSize(pfxFileSize) ? ` · ${formatPfxFileSize(pfxFileSize)}` : ''}` : 'Nenhum arquivo escolhido'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pfx,.p12,application/x-pkcs12"
                onChange={event => void handleFileChange(event)}
              />
            </div>
          </div>

          <label>Observação<textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Detalhes internos..." /></label>
          {error && <p className="crm-modal-error">{error}</p>}

          <div className="crm-modal-footer">
            <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
            <button type="submit" disabled={saving} className="crm-modal-submit">{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}


function CrmWhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  )
}


function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  )
}


function UserPlusIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M2.5 21a5.5 5.5 0 0 1 11 0" />
      <path d="M17 10h4" />
      <path d="M19 8v4" />
    </svg>
  )
}


function DownloadTemplateIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 21h14" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  )
}


function PfxPlusIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <path d="M9 14h6" />
      <path d="M12 11v6" />
    </svg>
  )
}

function RoutineCalendarIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M4 10h16" />
      <path d="M9 15h6" />
      <path d="M12 12v6" />
    </svg>
  )
}

function RoutineBulkIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M4 10h16" />
      <path d="M8 15h8" />
      <path d="M8 18h5" />
      <path d="M17 15h4" />
      <path d="M19 13v4" />
    </svg>
  )
}

function RoutineBroadcastIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M4 12h3l9-5v10l-9-5H4Z" />
      <path d="M7 12v6a2 2 0 0 0 2 2h1" />
      <path d="M19 9a4 4 0 0 1 0 6" />
      <path d="M21 6a8 8 0 0 1 0 12" />
    </svg>
  )
}

function ModuleIcon({
  type,
}: {
  type: 'routines' | 'pfx' | 'clients' | 'billing' | 'message'
}) {
  if (type === 'routines') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="17" rx="2" />
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M4 9h16" />
        <path d="m8.5 14 2 2 5-5" />
      </svg>
    )
  }

  if (type === 'pfx') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    )
  }

  if (type === 'clients') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }

  if (type === 'billing') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 9h10" />
        <path d="M7 13h6" />
        <path d="M16 13h1" />
      </svg>
    )
  }

  if (type === 'message') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    )
  }

  return null
}

function DisparazapIcon({
  type,
}: {
  type: 'user' | 'template' | 'globe' | 'sliders' | 'phone' | 'info' | 'send' | 'verified' | 'checks'
}) {
  if (type === 'user') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    )
  }

  if (type === 'template') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    )
  }

  if (type === 'globe') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15 15 0 0 1 0 20" />
        <path d="M12 2a15 15 0 0 0 0 20" />
      </svg>
    )
  }

  if (type === 'sliders') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M4 7h8" />
        <path d="M16 7h4" />
        <circle cx="14" cy="7" r="2" />
        <path d="M4 17h4" />
        <path d="M12 17h8" />
        <circle cx="10" cy="17" r="2" />
      </svg>
    )
  }

  if (type === 'phone') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.61a2 2 0 0 1-.45 2.11L8 9.7a16 16 0 0 0 6.3 6.3l1.26-1.26a2 2 0 0 1 2.11-.45c.84.28 1.71.48 2.61.6A2 2 0 0 1 22 16.92Z" />
      </svg>
    )
  }

  if (type === 'info') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    )
  }

  if (type === 'send') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    )
  }

  if (type === 'verified') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="m9 12 2 2 4-5" />
        <path d="M12 2.8 14.1 5l3-.3.6 3 2.6 1.5-1.3 2.8 1.3 2.8-2.6 1.5-.6 3-3-.3-2.1 2.2L9.9 19l-3 .3-.6-3-2.6-1.5L5 12 3.7 9.2l2.6-1.5.6-3 3 .3Z" />
      </svg>
    )
  }

  if (type === 'checks') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="m3 12 4 4 8-8" />
        <path d="m13 12 3 3 5-6" />
      </svg>
    )
  }

  return null
}

// ── Solicitações de clientes ──────────────────────────────────────────
// Módulo adicionado sem tocar em nenhum dos módulos existentes acima.
// Lê e grava através de RPCs SECURITY DEFINER (admin_list_client_requests,
// admin_update_client_request) gated por is_admin() no banco — ver
// supabase/create-admin-client-requests-access.sql. A tabela client_requests
// e suas policies (usadas pelo hub do cliente) não são alteradas aqui.

type AdminClientRequest = {
  id: string
  user_id: string
  category: RequestCategory
  title: string
  description: string
  priority: RequestPriority
  status: RequestStatus
  attachment_path: string | null
  internal_note: string | null
  created_at: string
  updated_at: string
  client_name: string | null
  client_email: string | null
  client_company_name: string | null
}

const REQUEST_STATUS_OPTIONS = Object.keys(STATUS_LABELS) as RequestStatus[]

function ClientRequestsAdminModule() {
  const [requests, setRequests] = useState<AdminClientRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | RequestStatus>('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draftStatus, setDraftStatus] = useState<RequestStatus>('recebida')
  const [draftNote, setDraftNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)

  const loadRequests = async () => {
    setLoading(true)
    setError('')
    const { data, error: loadError } = await supabase.rpc('admin_list_client_requests')

    if (loadError) {
      setError('Não consegui carregar as solicitações. Execute o SQL de acesso administrativo.')
      setLoading(false)
      return
    }

    setRequests((data ?? []) as AdminClientRequest[])
    setLoading(false)
  }

  useEffect(() => { void loadRequests() }, [])

  const selected = selectedId ? (requests.find(request => request.id === selectedId) ?? null) : null

  useEffect(() => {
    if (!selected) return
    setDraftStatus(selected.status)
    setDraftNote(selected.internal_note ?? '')
    setSaveMessage('')
    setAttachmentUrl(null)
  }, [selected?.id])

  useEffect(() => {
    let active = true

    async function loadAttachmentUrl() {
      if (!selected?.attachment_path) return
      const { data } = await supabase.storage
        .from('client-request-attachments')
        .createSignedUrl(selected.attachment_path, 60 * 5)
      if (active && data?.signedUrl) setAttachmentUrl(data.signedUrl)
    }

    void loadAttachmentUrl()
    return () => { active = false }
  }, [selected?.attachment_path])

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase()

    return requests.filter(request => {
      if (statusFilter !== 'Todos' && request.status !== statusFilter) return false
      if (!term) return true

      return (
        request.title.toLowerCase().includes(term) ||
        (request.client_name ?? '').toLowerCase().includes(term) ||
        (request.client_email ?? '').toLowerCase().includes(term) ||
        (request.client_company_name ?? '').toLowerCase().includes(term)
      )
    })
  }, [requests, search, statusFilter])

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setSaveMessage('')

    const { error: saveError } = await supabase.rpc('admin_update_client_request', {
      p_request_id: selected.id,
      p_status: draftStatus,
      p_internal_note: draftNote,
    })

    setSaving(false)

    if (saveError) {
      setSaveMessage('Não consegui salvar as alterações.')
      return
    }

    const updatedAt = new Date().toISOString()
    setRequests(current =>
      current.map(request =>
        request.id === selected.id
          ? { ...request, status: draftStatus, internal_note: draftNote, updated_at: updatedAt }
          : request,
      ),
    )
    setSaveMessage('Alterações salvas.')
  }

  return (
    <div className={`crm-module${selected ? ' crm-module-panel-open' : ''}`}>
      <div className="crm-module-inner">
        <div className="crm-module-header">
          <div>
            <h2>Solicitações de clientes</h2>
          </div>
          <div className="crm-header-right">
            {error && <span className="crm-global-error">{error}</span>}
          </div>
        </div>

        <RoutineFilters>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar por cliente, e-mail, empresa ou título"
          />
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'Todos' | RequestStatus)}>
            <option value="Todos">Todos os status</option>
            {REQUEST_STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </RoutineFilters>

        {loading ? (
          <div className="crm-loading">Carregando solicitações...</div>
        ) : (
          <div className="pfx-table-card">
            <table className="pfx-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Enviada em</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => (
                  <tr
                    key={request.id}
                    className={selectedId === request.id ? 'selected' : ''}
                    onClick={() => setSelectedId(currentId => currentId === request.id ? null : request.id)}
                  >
                    <td>
                      <div className="pfx-client-cell">
                        <strong>{request.client_name || request.client_email || 'Cliente'}</strong>
                        {request.client_company_name && <span>{request.client_company_name}</span>}
                      </div>
                    </td>
                    <td>{request.title}</td>
                    <td>{CATEGORY_LABELS[request.category] ?? request.category}</td>
                    <td>{PRIORITY_LABELS[request.priority] ?? request.priority}</td>
                    <td>{STATUS_LABELS[request.status] ?? request.status}</td>
                    <td>{formatCrmDate(request.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRequests.length === 0 && (
              <div className="pfx-empty-state">
                <strong>Nenhuma solicitação encontrada.</strong>
                <span>Ajuste a busca ou o filtro de status.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <aside className="pfx-panel crm-lead-panel">
          <div className="crm-panel-header">
            <div className="crm-panel-title">
              <div>
                <strong>{selected.title}</strong>
                <span>{CATEGORY_LABELS[selected.category] ?? selected.category} · {formatCrmDate(selected.created_at)}</span>
              </div>
            </div>
            <button className="crm-panel-close" onClick={() => setSelectedId(null)} type="button" aria-label="Fechar">
              <CloseIcon />
            </button>
          </div>

          <div className="crm-panel-body">
            <div className="crm-panel-section">
              <p className="crm-panel-label">Cliente</p>
              <div className="pfx-detail-list">
                <div><span>Nome</span><strong>{selected.client_name || 'Não informado'}</strong></div>
                <div><span>E-mail</span><strong>{selected.client_email || 'Não informado'}</strong></div>
                <div><span>Empresa</span><strong>{selected.client_company_name || 'Não informado'}</strong></div>
              </div>
            </div>

            <div className="crm-panel-section">
              <p className="crm-panel-label">Descrição</p>
              <p className="pfx-notes">{selected.description || 'Sem descrição.'}</p>
            </div>

            {selected.attachment_path && (
              <div className="crm-panel-section">
                <p className="crm-panel-label">Anexo</p>
                {attachmentUrl ? (
                  <a href={attachmentUrl} target="_blank" rel="noreferrer" className="pfx-download-link">
                    Abrir anexo
                  </a>
                ) : (
                  <span>Carregando link do anexo...</span>
                )}
              </div>
            )}

            <div className="crm-panel-section">
              <p className="crm-panel-label">Alterar status</p>
              <div className="crm-modal-form">
                <select value={draftStatus} onChange={event => setDraftStatus(event.target.value as RequestStatus)}>
                  {REQUEST_STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="crm-panel-section">
              <p className="crm-panel-label">Observação interna (o cliente nunca vê isso)</p>
              <div className="crm-modal-form">
                <textarea
                  value={draftNote}
                  onChange={event => setDraftNote(event.target.value)}
                  placeholder="Anotações internas sobre esta solicitação"
                  rows={4}
                />
              </div>
            </div>

            {saveMessage && <p className="crm-panel-label">{saveMessage}</p>}

            <div className="crm-panel-section">
              <button type="button" className="pfx-edit-btn" onClick={() => void handleSave()} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

// ── Onboarding (Certificado Digital A1 / Abertura de Empresa) ─────────────
// Mesmo padrão do módulo de Solicitações acima: lê e grava via RPCs
// SECURITY DEFINER (admin_list_onboarding_intakes, admin_update_onboarding_intake)
// gated por is_admin() no banco — ver supabase/create-admin-onboarding-access.sql.
// A senha gov.br nunca vem na listagem; só é revelada sob demanda através da
// rota app/api/admin/onboarding/[id]/reveal-senha, que decifra fora do banco.

type AdminOnboardingIntake = {
  id: string
  user_id: string
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
  client_name: string | null
  client_email: string | null
  client_company_name: string | null
  purchased_products: string[]
}

const CERTIFICADO_STATUS_OPTIONS = Object.keys(CERTIFICADO_STATUS_LABELS) as CertificadoStatus[]
const ABERTURA_STATUS_OPTIONS = Object.keys(ABERTURA_STATUS_LABELS) as AberturaStatus[]
const MEI_STATUS_OPTIONS = Object.keys(MEI_STATUS_LABELS) as MeiStatus[]
const ALTERACAO_STATUS_OPTIONS = Object.keys(ALTERACAO_STATUS_LABELS) as AlteracaoStatus[]
const PRODUCT_LABELS: Record<string, string> = {
  certificado_pj_a1: 'Certificado Digital PJ A1',
  certificado_pf_a1: 'Certificado Digital PF A1',
  abertura_empresa: 'Abertura de empresa',
  alteracao_cnpj: 'Alteração contratual',
  serasa_pf: 'Consulta Serasa PF',
  serasa_pj: 'Consulta Serasa PJ',
  nota_fiscal_servico: 'Nota Fiscal de Serviço',
  nota_fiscal_produto: 'Nota Fiscal de Produto (DANFE)',
}

function OnboardingAdminModule() {
  const [intakes, setIntakes] = useState<AdminOnboardingIntake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draftCertificadoStatus, setDraftCertificadoStatus] = useState<CertificadoStatus>('nao_iniciado')
  const [draftAberturaStatus, setDraftAberturaStatus] = useState<AberturaStatus>('nao_iniciado')
  const [draftMeiStatus, setDraftMeiStatus] = useState<MeiStatus>('nao_iniciado')
  const [draftAlteracaoStatus, setDraftAlteracaoStatus] = useState<AlteracaoStatus>('nao_iniciado')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({})
  const [revealedSenha, setRevealedSenha] = useState<string | null>(null)
  const [revealError, setRevealError] = useState('')
  const [revealing, setRevealing] = useState(false)

  const loadIntakes = async () => {
    setLoading(true)
    setError('')
    const { data, error: loadError } = await supabase.rpc('admin_list_onboarding_intakes')

    if (loadError) {
      setError('Não consegui carregar o onboarding. Execute o SQL de acesso administrativo.')
      setLoading(false)
      return
    }

    setIntakes((data ?? []) as AdminOnboardingIntake[])
    setLoading(false)
  }

  useEffect(() => { void loadIntakes() }, [])

  const selected = selectedId ? (intakes.find(intake => intake.id === selectedId) ?? null) : null

  useEffect(() => {
    if (!selected) return
    setDraftCertificadoStatus(selected.certificado_status)
    setDraftAberturaStatus(selected.abertura_status)
    setDraftMeiStatus(selected.mei_status)
    setDraftAlteracaoStatus(selected.alteracao_status)
    setSaveMessage('')
    setDocumentUrls({})
    setRevealedSenha(null)
    setRevealError('')
  }, [selected?.id])

  useEffect(() => {
    let active = true

    async function loadDocumentUrls() {
      if (!selected) return

      const entries = await Promise.all(
        DOCUMENT_FIELDS.map(async doc => {
          const path = selected[doc.field]
          if (!path) return null
          const { data } = await supabase.storage.from(DOCUMENT_BUCKET).createSignedUrl(path, 60 * 5)
          return data?.signedUrl ? [doc.field, data.signedUrl] as const : null
        }),
      )

      if (!active) return
      const validEntries = entries.filter((entry): entry is readonly [DocumentField, string] => entry !== null)
      setDocumentUrls(Object.fromEntries(validEntries))
    }

    void loadDocumentUrls()
    return () => { active = false }
  }, [selected?.id])

  const filteredIntakes = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return intakes

    return intakes.filter(intake =>
      (intake.client_name ?? '').toLowerCase().includes(term) ||
      (intake.client_email ?? '').toLowerCase().includes(term) ||
      (intake.client_company_name ?? '').toLowerCase().includes(term) ||
      intake.cpf.toLowerCase().includes(term),
    )
  }, [intakes, search])

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setSaveMessage('')

    const { error: saveError } = await supabase.rpc('admin_update_onboarding_intake', {
      p_id: selected.id,
      p_certificado_status: draftCertificadoStatus,
      p_abertura_status: draftAberturaStatus,
      p_mei_status: draftMeiStatus,
      p_alteracao_status: draftAlteracaoStatus,
    })

    setSaving(false)

    if (saveError) {
      setSaveMessage('Não consegui salvar as alterações.')
      return
    }

    setIntakes(current =>
      current.map(intake =>
        intake.id === selected.id
          ? {
              ...intake,
              certificado_status: draftCertificadoStatus,
              abertura_status: draftAberturaStatus,
              mei_status: draftMeiStatus,
              alteracao_status: draftAlteracaoStatus,
            }
          : intake,
      ),
    )
    setSaveMessage('Alterações salvas.')
  }

  const handleRevealSenha = async () => {
    if (!selected) return
    setRevealing(true)
    setRevealError('')

    try {
      const response = await fetch(`/api/admin/onboarding/${selected.id}/reveal-senha`)
      const data = await response.json() as { senha?: string; error?: string }

      if (!response.ok || !data.senha) {
        setRevealError(data.error || 'Não consegui revelar a senha.')
        setRevealing(false)
        return
      }

      setRevealedSenha(data.senha)
      setRevealing(false)
    } catch {
      setRevealError('Não consegui revelar a senha.')
      setRevealing(false)
    }
  }

  return (
    <div className={`crm-module${selected ? ' crm-module-panel-open' : ''}`}>
      <div className="crm-module-inner">
        <div className="crm-module-header">
          <div>
            <h2>Onboarding (MEI / Certificado A1 / Abertura / Alteração)</h2>
          </div>
          <div className="crm-header-right">
            {error && <span className="crm-global-error">{error}</span>}
          </div>
        </div>

        <RoutineFilters>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar por cliente, e-mail, empresa ou CPF"
          />
        </RoutineFilters>

        {loading ? (
          <div className="crm-loading">Carregando onboarding...</div>
        ) : (
          <div className="pfx-table-card">
            <table className="pfx-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Produtos</th>
                  <th>MEI</th>
                  <th>Certificado</th>
                  <th>Abertura</th>
                  <th>Alteração</th>
                  <th>Enviada em</th>
                </tr>
              </thead>
              <tbody>
                {filteredIntakes.map(intake => (
                  <tr
                    key={intake.id}
                    className={selectedId === intake.id ? 'selected' : ''}
                    onClick={() => setSelectedId(currentId => currentId === intake.id ? null : intake.id)}
                  >
                    <td>
                      <div className="pfx-client-cell">
                        <strong>{intake.client_name || intake.client_email || 'Cliente'}</strong>
                        {intake.client_company_name && <span>{intake.client_company_name}</span>}
                      </div>
                    </td>
                    <td>{intake.purchased_products.map(product => PRODUCT_LABELS[product] ?? product).join(', ') || (intake.wants_abertura_mei ? 'MEI (grátis)' : '—')}</td>
                    <td>{intake.wants_abertura_mei ? MEI_STATUS_LABELS[intake.mei_status] : '—'}</td>
                    <td>{intake.wants_certificado ? CERTIFICADO_STATUS_LABELS[intake.certificado_status] : '—'}</td>
                    <td>{intake.wants_abertura_empresa ? ABERTURA_STATUS_LABELS[intake.abertura_status] : '—'}</td>
                    <td>{intake.wants_alteracao_cnpj ? ALTERACAO_STATUS_LABELS[intake.alteracao_status] : '—'}</td>
                    <td>{formatCrmDate(intake.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredIntakes.length === 0 && (
              <div className="pfx-empty-state">
                <strong>Nenhum onboarding encontrado.</strong>
                <span>Ajuste a busca.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <aside className="pfx-panel crm-lead-panel">
          <div className="crm-panel-header">
            <div className="crm-panel-title">
              <div>
                <strong>{selected.client_name || selected.client_email || 'Cliente'}</strong>
                <span>{selected.client_company_name || selected.client_email}</span>
              </div>
            </div>
            <button className="crm-panel-close" onClick={() => setSelectedId(null)} type="button" aria-label="Fechar">
              <CloseIcon />
            </button>
          </div>

          <div className="crm-panel-body">
            <div className="crm-panel-section">
              <p className="crm-panel-label">Cliente</p>
              <div className="pfx-detail-list">
                <div><span>Nome</span><strong>{selected.client_name || 'Não informado'}</strong></div>
                <div><span>E-mail</span><strong>{selected.client_email || 'Não informado'}</strong></div>
                <div><span>CPF</span><strong>{selected.cpf || 'Não informado'}</strong></div>
                <div><span>Produtos</span><strong>{selected.purchased_products.map(product => PRODUCT_LABELS[product] ?? product).join(', ') || 'Nenhum'}</strong></div>
              </div>
            </div>

            <div className="crm-panel-section">
              <p className="crm-panel-label">Senha gov.br</p>
              {revealedSenha ? (
                <p className="pfx-notes">{revealedSenha}</p>
              ) : (
                <button type="button" className="pfx-edit-btn" onClick={() => void handleRevealSenha()} disabled={revealing}>
                  {revealing ? 'Revelando...' : 'Revelar senha gov.br'}
                </button>
              )}
              {revealError && <p className="crm-global-error">{revealError}</p>}
            </div>

            {selected.wants_abertura_empresa && (
              <>
                <div className="crm-panel-section">
                  <p className="crm-panel-label">Segmento</p>
                  <p className="pfx-notes">{selected.segmento || 'Não informado'}</p>
                </div>

                <div className="crm-panel-section">
                  <p className="crm-panel-label">O que o cliente quer para o CNPJ</p>
                  <p className="pfx-notes">{selected.descricao_cnpj || 'Não informado'}</p>
                </div>

                <div className="crm-panel-section">
                  <p className="crm-panel-label">Razão social / sócios</p>
                  <div className="pfx-detail-list">
                    <div><span>Razão social</span><strong>{selected.razao_social || 'Não informado'}</strong></div>
                    <div><span>Nome fantasia</span><strong>{selected.tem_nome_fantasia ? (selected.nome_fantasia || 'Não informado') : 'Não vai usar'}</strong></div>
                    <div><span>Quantidade de sócios</span><strong>{selected.quantidade_socios ?? 'Não informado'}</strong></div>
                    <div><span>Estado civil</span><strong>{selected.estado_civil ? ESTADO_CIVIL_LABELS[selected.estado_civil] : 'Não informado'}</strong></div>
                    {selected.estado_civil === 'casado' && (
                      <div><span>Regime de bens</span><strong>{selected.regime_bens ? REGIME_BENS_LABELS[selected.regime_bens] : 'Não informado'}</strong></div>
                    )}
                  </div>
                </div>
              </>
            )}

            {selected.wants_alteracao_cnpj && (
              <>
                <div className="crm-panel-section">
                  <p className="crm-panel-label">CNPJ atual</p>
                  <p className="pfx-notes">{selected.cnpj_atual || 'Não informado'}</p>
                </div>

                <div className="crm-panel-section">
                  <p className="crm-panel-label">O que o cliente quer alterar</p>
                  <p className="pfx-notes">{selected.descricao_alteracao || 'Não informado'}</p>
                </div>
              </>
            )}

            {(selected.wants_abertura_mei || selected.wants_abertura_empresa || selected.wants_alteracao_cnpj) && (
              <div className="crm-panel-section">
                <p className="crm-panel-label">Documentos</p>
                <div className="pfx-detail-list">
                  {DOCUMENT_FIELDS.filter(doc => {
                    if (selected.wants_abertura_empresa) return true
                    if (selected.wants_abertura_mei) {
                      return doc.field === 'doc_identidade_path' || doc.field === 'doc_comprovante_residencia_path'
                    }
                    return doc.field === 'doc_identidade_path'
                  }).map(doc => {
                    const path = selected[doc.field]
                    const flagKey = doc.optionalFlag
                    const flagValue = flagKey ? selected[flagKey] : null

                    return (
                      <div key={doc.field}>
                        <span>{doc.label}</span>
                        {path && documentUrls[doc.field] ? (
                          <a href={documentUrls[doc.field]} target="_blank" rel="noreferrer" className="pfx-download-link">
                            Abrir documento
                          </a>
                        ) : path ? (
                          <strong>Carregando link...</strong>
                        ) : flagValue === false ? (
                          <strong>Cliente não possui</strong>
                        ) : (
                          <strong>Não enviado</strong>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {selected.wants_abertura_mei && (
              <div className="crm-panel-section">
                <p className="crm-panel-label">Status do MEI</p>
                <div className="crm-modal-form">
                  <select value={draftMeiStatus} onChange={event => setDraftMeiStatus(event.target.value as MeiStatus)}>
                    {MEI_STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{MEI_STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="crm-panel-section">
              <p className="crm-panel-label">Status do certificado</p>
              <div className="crm-modal-form">
                <select value={draftCertificadoStatus} onChange={event => setDraftCertificadoStatus(event.target.value as CertificadoStatus)}>
                  {CERTIFICADO_STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{CERTIFICADO_STATUS_LABELS[status]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="crm-panel-section">
              <p className="crm-panel-label">Status da abertura de empresa</p>
              <div className="crm-modal-form">
                <select value={draftAberturaStatus} onChange={event => setDraftAberturaStatus(event.target.value as AberturaStatus)}>
                  {ABERTURA_STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{ABERTURA_STATUS_LABELS[status]}</option>
                  ))}
                </select>
              </div>
            </div>

            {selected.wants_alteracao_cnpj && (
              <div className="crm-panel-section">
                <p className="crm-panel-label">Status da alteração</p>
                <div className="crm-modal-form">
                  <select value={draftAlteracaoStatus} onChange={event => setDraftAlteracaoStatus(event.target.value as AlteracaoStatus)}>
                    {ALTERACAO_STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{ALTERACAO_STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {saveMessage && <p className="crm-panel-label">{saveMessage}</p>}

            <div className="crm-panel-section">
              <button type="button" className="pfx-edit-btn" onClick={() => void handleSave()} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

// ── Leads de Lucro Presumido/Real (formulário público de /abrir-empresa/comecar) ──
// Sem processo automatizado: só lista quem pediu contato e deixa marcar o
// status manual (novo / em contato / concluído). Lê e grava via RPCs
// SECURITY DEFINER gated por is_admin() — ver supabase/create-abrir-cnpj-flow.sql.

type PresumidoRealStatus = 'novo' | 'em_contato' | 'concluido'

type PresumidoRealLead = {
  id: string
  name: string
  whatsapp: string
  email: string
  company_description: string
  status: PresumidoRealStatus
  created_at: string
}

const PRESUMIDO_REAL_STATUS_LABELS: Record<PresumidoRealStatus, string> = {
  novo: 'Novo',
  em_contato: 'Em contato',
  concluido: 'Concluído',
}

const PRESUMIDO_REAL_STATUS_OPTIONS = Object.keys(PRESUMIDO_REAL_STATUS_LABELS) as PresumidoRealStatus[]

function PresumidoRealLeadsModule() {
  const [leads, setLeads] = useState<PresumidoRealLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  const loadLeads = async () => {
    setLoading(true)
    setError('')
    const { data, error: loadError } = await supabase.rpc('admin_list_presumido_real_leads')

    if (loadError) {
      setError('Não consegui carregar os leads de Presumido/Real. Execute o SQL de acesso administrativo.')
      setLoading(false)
      return
    }

    setLeads((data ?? []) as PresumidoRealLead[])
    setLoading(false)
  }

  useEffect(() => { void loadLeads() }, [])

  const handleStatusChange = async (id: string, status: PresumidoRealStatus) => {
    setSavingId(id)
    const { error: saveError } = await supabase.rpc('admin_update_presumido_real_lead_status', { p_id: id, p_status: status })
    setSavingId(null)

    if (saveError) return

    setLeads(current => current.map(lead => (lead.id === id ? { ...lead, status } : lead)))
  }

  return (
    <div className="crm-module">
      <div className="crm-module-inner">
        <div className="crm-module-header">
          <div>
            <h2>Leads — Lucro Presumido ou Real</h2>
          </div>
          <div className="crm-header-right">
            {error && <span className="crm-global-error">{error}</span>}
          </div>
        </div>

        {loading ? (
          <div className="crm-loading">Carregando leads...</div>
        ) : (
          <div className="pfx-table-card">
            <table className="pfx-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>WhatsApp</th>
                  <th>E-mail</th>
                  <th>Empresa</th>
                  <th>Status</th>
                  <th>Enviado em</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td><strong>{lead.name}</strong></td>
                    <td>{lead.whatsapp}</td>
                    <td>{lead.email}</td>
                    <td>{lead.company_description || '—'}</td>
                    <td>
                      <select
                        value={lead.status}
                        disabled={savingId === lead.id}
                        onChange={event => void handleStatusChange(lead.id, event.target.value as PresumidoRealStatus)}
                      >
                        {PRESUMIDO_REAL_STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{PRESUMIDO_REAL_STATUS_LABELS[status]}</option>
                        ))}
                      </select>
                    </td>
                    <td>{formatCrmDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {leads.length === 0 && (
              <div className="pfx-empty-state">
                <strong>Nenhum lead de Presumido/Real ainda.</strong>
                <span>Aparecem aqui quando alguém preenche o formulário em /abrir-empresa/comecar.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
