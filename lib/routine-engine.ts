export type RoutineRegime = 'MEI' | 'Simples Nacional'
export type RoutineClientStatus = 'Ativo' | 'Inativo'
export type RoutineItemStatus = 'Pendente' | 'Não precisa' | 'Anexado' | 'Enviado'
export type RoutineDepartment =
  | 'Obrigatoriedade'
  | 'Fiscal'
  | 'Atualização Cadastral'
  | 'Departamento Pessoal'
  | 'Obrigações específicas'
export type RoutineDepartmentStatus = 'Enviado' | 'Anexado' | 'Inacabado' | 'Não se aplica'
export type RoutineDepartmentFilter = 'Todos' | 'Feito' | 'Pendente' | 'Não se aplica'
export type RoutineCompetenceStatus = 'Enviado' | 'Inacabado'
export type RoutineEmailScope = RoutineDepartment | 'Geral'
export type RoutineBroadcastAudience = 'Folha' | 'Geral'

export const ROUTINE_CLIENTS_TABLE = 'routine_clients'
export const ROUTINE_COMPETENCES_TABLE = 'routine_competences'
export const ROUTINE_ITEMS_TABLE = 'routine_items'
export const ROUTINE_CLIENT_CUSTOM_OBLIGATIONS_TABLE = 'routine_client_custom_obligations'
export const ROUTINE_EMAIL_DRAFTS_TABLE = 'routine_email_drafts'
export const ROUTINE_CLIENT_ATTACHMENTS_BUCKET = 'routine-client-attachments'
export const ROUTINE_ATTACHMENT_LIMIT_BYTES = 10 * 1024 * 1024
export const ROUTINE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const ROUTINE_REGIMES: RoutineRegime[] = ['MEI', 'Simples Nacional']
export const ROUTINE_ITEM_STATUSES: RoutineItemStatus[] = ['Pendente', 'Não precisa', 'Anexado', 'Enviado']
export const ROUTINE_DEPARTMENTS: RoutineDepartment[] = [
  'Obrigatoriedade',
  'Fiscal',
  'Atualização Cadastral',
  'Departamento Pessoal',
  'Obrigações específicas',
]

export type RoutineClient = {
  id: string
  name: string
  cnpj: string
  regime: RoutineRegime
  hasPayroll: boolean
  hasEmployees: boolean
  hasProLabore: boolean
  issuesInvoices: boolean
  needsFiscalTracking: boolean
  whatsapp: string
  email: string
  status: RoutineClientStatus
}

export type RoutineCompetence = {
  id: string
  clientId: string
  competenceMonth: string
  createdAt: string
  updatedAt: string
}

export type RoutineItem = {
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

export type RoutineClientCustomObligation = {
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

export type RoutineDefinition = {
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

export type RoutineItemInsertPayload = {
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

export const ROUTINE_DEFINITIONS: RoutineDefinition[] = [
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

export function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function sanitizeAttachmentFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]+/g, '-')
}

export function mapRoutineClient(row: Record<string, unknown>): RoutineClient {
  const hasEmployees = row.has_employees === true
  const hasProLabore = row.has_pro_labore === true
  const hasPayroll = row.has_payroll === true || hasEmployees || hasProLabore

  return {
    id: String(row.id),
    name: (row.name as string) ?? '',
    cnpj: (row.cnpj as string) ?? '',
    regime: row.regime === 'Simples Nacional' ? 'Simples Nacional' : 'MEI',
    hasPayroll,
    hasEmployees,
    hasProLabore,
    issuesInvoices: row.issues_invoices !== false,
    needsFiscalTracking: row.needs_fiscal_tracking !== false,
    whatsapp: (row.whatsapp as string) ?? '',
    email: (row.email as string) ?? '',
    status: row.status === 'Inativo' ? 'Inativo' : 'Ativo',
  }
}

export function mapRoutineCompetence(row: Record<string, unknown>): RoutineCompetence {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    competenceMonth: (row.competence_month as string) ?? '',
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  }
}

export function mapRoutineItem(row: Record<string, unknown>): RoutineItem {
  return {
    id: String(row.id),
    competenceId: String(row.competence_id),
    routineName: (row.routine_name as string) ?? '',
    department: (row.department as RoutineDepartment) ?? 'Obrigações específicas',
    category: (row.category as string) ?? '',
    status: (row.status as RoutineItemStatus) ?? 'Pendente',
    fileName: (row.file_name as string) ?? '',
    fileUrl: (row.file_url as string) ?? '',
    fileStoragePath: (row.file_storage_path as string) ?? '',
    notes: (row.notes as string) ?? '',
    requiresFile: row.requires_file !== false,
    isCustom: row.is_custom === true,
    customObligationId: (row.custom_obligation_id as string) ?? '',
    sortOrder: Number(row.sort_order ?? 500),
    sentAt: (row.sent_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  }
}

export function mapRoutineCustomObligation(row: Record<string, unknown>): RoutineClientCustomObligation {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    name: (row.name as string) ?? '',
    department: (row.department as RoutineDepartment) ?? 'Obrigações específicas',
    category: (row.category as string) ?? 'Personalizada',
    requiresFile: row.requires_file !== false,
    active: row.active !== false,
    notes: (row.notes as string) ?? '',
    sortOrder: Number(row.sort_order ?? 900),
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  }
}

export function isRoutineDefinitionApplicableToClient(client: RoutineClient, definition: RoutineDefinition) {
  if (!client) return false
  if (!definition.regimes.includes(client.regime)) return false
  if (definition.requiresPayroll && !(client.hasPayroll || client.hasEmployees || client.hasProLabore)) return false
  if (definition.requiresInvoices && !client.issuesInvoices) return false
  if (definition.requiresFiscalTracking && !client.needsFiscalTracking) return false
  return true
}

export function getApplicableRoutineDefinitions(client: RoutineClient) {
  return ROUTINE_DEFINITIONS.filter(definition => isRoutineDefinitionApplicableToClient(client, definition))
}

export function buildRoutineItemsPayload(
  client: RoutineClient,
  competenceId: string,
  customObligations: RoutineClientCustomObligation[],
): RoutineItemInsertPayload[] {
  const standardPayload: RoutineItemInsertPayload[] = getApplicableRoutineDefinitions(client).map(definition => ({
    competence_id: competenceId,
    routine_name: definition.name,
    department: definition.department,
    category: definition.category,
    requires_file: definition.requiresFile,
    is_custom: false,
    custom_obligation_id: null,
    sort_order: definition.sortOrder,
    status: 'Pendente',
  }))

  const customPayload: RoutineItemInsertPayload[] = customObligations
    .filter(obligation => obligation.active && obligation.clientId === client.id)
    .map((obligation, index) => ({
      competence_id: competenceId,
      routine_name: obligation.name,
      department: obligation.department,
      category: obligation.category || 'Personalizada',
      requires_file: obligation.requiresFile,
      is_custom: true,
      custom_obligation_id: obligation.id,
      sort_order: obligation.sortOrder || 900 + index,
      status: 'Pendente',
    }))

  return [...standardPayload, ...customPayload]
}

export function isRoutineItemApplicableToClient(client: RoutineClient, item: RoutineItem) {
  if (item.isCustom) return true
  const definition = ROUTINE_DEFINITIONS.find(
    def => def.name === item.routineName && def.department === item.department && def.regimes.includes(client.regime),
  )
  if (!definition) return true
  return isRoutineDefinitionApplicableToClient(client, definition)
}

export function isRoutineItemReady(item: RoutineItem) {
  return (
    item.status === 'Anexado' ||
    item.status === 'Enviado' ||
    item.status === 'Não precisa' ||
    Boolean(item.fileName || item.fileStoragePath)
  )
}

export function getRoutineCompetenceStatus(client: RoutineClient, items: RoutineItem[]): RoutineCompetenceStatus {
  const applicableItems = items.filter(item => isRoutineItemApplicableToClient(client, item))
  if (!applicableItems.length) return 'Inacabado'
  return applicableItems.every(item => item.status === 'Enviado' || item.status === 'Não precisa') ? 'Enviado' : 'Inacabado'
}

export function getRoutineDepartmentStatus(
  client: RoutineClient,
  items: RoutineItem[],
  department: RoutineDepartment,
): RoutineDepartmentStatus {
  const departmentItems = items.filter(item => item.department === department && isRoutineItemApplicableToClient(client, item))
  if (!departmentItems.length) return 'Não se aplica'
  if (departmentItems.every(item => item.status === 'Enviado' || item.status === 'Não precisa')) return 'Enviado'
  if (departmentItems.every(item => isRoutineItemReady(item))) return 'Anexado'
  return 'Inacabado'
}

export function matchesRoutineDepartmentFilter(status: RoutineDepartmentStatus, filter: RoutineDepartmentFilter) {
  if (filter === 'Todos') return true
  if (filter === 'Feito') return status === 'Enviado' || status === 'Anexado'
  if (filter === 'Pendente') return status === 'Inacabado'
  return status === 'Não se aplica'
}

export function normalizeRoutineCompetenceMonth(value: string) {
  if (!value) {
    const now = new Date()
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().slice(0, 10)
  }
  const [year, month] = value.split('-')
  return `${year}-${month.padStart(2, '0')}-01`
}

export function formatRoutineCompetence(monthValue: string) {
  if (!monthValue) return ''
  const date = new Date(`${monthValue}T00:00:00`)
  const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function shiftRoutineCompetenceMonth(monthValue: string, direction: 1 | -1) {
  const date = new Date(`${monthValue}T00:00:00`)
  date.setMonth(date.getMonth() + direction)
  return date.toISOString().slice(0, 10)
}

export function hasValidRoutineEmail(email: string) {
  return ROUTINE_EMAIL_PATTERN.test(email.trim())
}

export function buildRoutineEmailSubject(scope: RoutineEmailScope, monthLabel: string) {
  if (scope === 'Fiscal') return `Documentos Fiscais — ${monthLabel}`
  if (scope === 'Departamento Pessoal') return `Documentos do Departamento Pessoal — ${monthLabel}`
  if (scope === 'Geral') return `Rotina de ${monthLabel}`
  return `${scope} — ${monthLabel}`
}

export function buildRoutineMessage(
  scope: RoutineEmailScope,
  client: RoutineClient,
  items: RoutineItem[],
  monthLabel: string,
) {
  const scoped = scope === 'Geral' ? items : items.filter(item => item.department === scope)
  const applicable = scoped.filter(item => isRoutineItemApplicableToClient(client, item))
  const attached = applicable.filter(item => item.status === 'Anexado' || item.status === 'Enviado').map(item => item.routineName)
  const pending = applicable.filter(item => item.status === 'Pendente').map(item => item.routineName)
  const skipped = applicable.filter(item => item.status === 'Não precisa').map(item => item.routineName)

  const lines = [`Olá, ${client.name}! Segue a atualização da rotina de ${monthLabel}.`, '']

  if (attached.length > 0) {
    lines.push('Documentos enviados/anexados:')
    attached.forEach(name => lines.push(`- ${name}`))
    lines.push('')
  }

  if (pending.length > 0) {
    lines.push('Ainda pendente:')
    pending.forEach(name => lines.push(`- ${name}`))
    lines.push('')
  }

  if (skipped.length > 0) {
    lines.push('Rotinas que não se aplicam a esse período:')
    skipped.forEach(name => lines.push(`- ${name}`))
    lines.push('')
  }

  lines.push('Qualquer dúvida, é só responder este e-mail.')
  return lines.join('\n')
}

export function getRoutineBroadcastDefaults(audience: RoutineBroadcastAudience, monthLabel: string) {
  if (audience === 'Folha') {
    return {
      subject: `LANÇAMENTO FOLHA - ${monthLabel.toUpperCase()}`,
      body: `Olá! Passando para avisar que a folha de pagamento de ${monthLabel} já está disponível. Qualquer dúvida, estamos à disposição.`,
    }
  }
  return {
    subject: `COMUNICADO TROPA - ${monthLabel.toUpperCase()}`,
    body: `Olá! Este é um comunicado geral da Tropa Contabilidade referente a ${monthLabel}. Qualquer dúvida, estamos à disposição.`,
  }
}
