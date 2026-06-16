'use client'

import { type ChangeEvent, type FormEvent, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Node, Edge } from '@xyflow/react'
import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  Handle,
  MarkerType,
  NodeResizer,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  reconnectEdge,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type NodeProps,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import { supabase } from '@/lib/supabaseClient'

type AdminModule =
  | 'Disparos'
  | 'CRM'
  | 'Financeiro'
  | 'Links'
  | 'Quadros'

type AdminDashboardClientProps = {
  initialModule?: AdminModule
}

type TrackedLinkSource = {
  source: string
  clicks: number
}

type TrackedLink = {
  id: string
  title: string
  slug: string
  destinationUrl: string
  createdAt: string
  sources: TrackedLinkSource[]
}

type TrackedLinkRow = {
  id: string
  title: string
  slug: string
  destination_url: string
  created_at: string
}

type TrackedClickRow = {
  link_id: string
  source: string | null
}

type FinanceTab = 'Visão geral' | 'Entradas' | 'Saídas' | 'Relatórios'
type FinanceKind = 'entrada' | 'saida'
type FinanceStatus = 'Pendente' | 'Parcial' | 'Pago' | 'Cancelado'
type FinanceRecordType = 'Fixa' | 'Variável' | 'Rendimento' | 'Dívida'

type FinanceRecord = {
  id: string
  kind: FinanceKind
  name: string
  category: string
  account: string
  value: number
  date: string
  status: FinanceStatus
  type: FinanceRecordType
  note?: string
}

type FinanceRecordRow = {
  id: string
  kind: string
  name: string
  category: string
  account: string
  value: number | string
  record_date: string
  status: string
  type: string
  note: string | null
}

type BoardType = 'Funil de vendas' | 'Fluxo de processo' | 'Quadro'

type BoardNodeKind =
  // Tráfego (fontes circulares)
  | 'Meta' | 'Google' | 'TikTok' | 'Instagram' | 'LinkedIn' | 'YouTube' | 'Orgânico'
  | 'Lista' | 'Afiliado' | 'Indicação'
  // Checkout (plataformas)
  | 'Monnetize' | 'Ticto' | 'Kirvano' | 'Hotmart' | 'Kiwify' | 'Hubla'
  // Dados — campos de coleta
  | 'Nome' | 'Email' | 'Telefone' | 'CPF' | 'Endereço' | 'Nascimento' | 'Empresa' | 'Sexo'
  // Funil — páginas
  | 'Opt-in' | 'Página' | 'VSL' | 'Survey' | 'Webinar' | 'Pop-up'
  | 'Checkout' | 'Order Bump' | 'Upsell' | 'Downsell' | 'Confirmação' | 'Obrigado'
  // Comunicação
  | 'E-mail' | 'SMS' | 'WhatsApp' | 'Grupo'
  // Vendas
  | 'Reunião' | 'Ligação' | 'Anúncio' | 'Venda'
  // Controle de fluxo
  | 'Início' | 'Final'
  // Fluxo
  | 'Etapa' | 'Decisão' | 'Aprovação' | 'Aguardar'
  // Ação
  | 'Formulário' | 'Documento' | 'Integração' | 'Notificação'
  // Anotação
  | 'Anotação'
  // Personalizado (logo via URL)
  | 'Custom'

const SOURCE_KINDS = new Set<BoardNodeKind>([
  'Meta', 'Google', 'TikTok', 'Instagram', 'LinkedIn', 'YouTube', 'Orgânico',
  'Lista', 'Afiliado', 'Indicação',
  'Monnetize', 'Ticto', 'Kirvano', 'Hotmart', 'Kiwify', 'Hubla',
  'Nome', 'Email', 'Telefone', 'CPF', 'Endereço', 'Nascimento', 'Empresa', 'Sexo',
  'Custom',
])

// Nodes rendered as browser-window cards
const PAGE_KINDS = new Set<BoardNodeKind>([
  'Opt-in', 'Página', 'VSL', 'Survey', 'Webinar', 'Pop-up',
  'Checkout', 'Order Bump', 'Upsell', 'Downsell', 'Confirmação', 'Obrigado',
  'Formulário', 'Documento',
])

function nodeTypeForKind(kind: BoardNodeKind): string {
  if (kind === 'Anotação') return 'noteNode'
  if (SOURCE_KINDS.has(kind)) return 'sourceNode'
  return 'circleNode'
}

// Nodes that show metric as descriptive body text (not as a pill badge)
const CONTENT_KINDS = new Set<BoardNodeKind>([
  'Formulário', 'Opt-in', 'Survey', 'Etapa', 'Reunião', 'Ligação',
  'WhatsApp', 'E-mail', 'Documento', 'Anotação', 'Webinar', 'VSL',
  'Checkout', 'Venda', 'Order Bump', 'Upsell', 'Downsell',
])

type BoardNodeData = {
  label: string
  kind: BoardNodeKind
  metric?: string
  logoUrl?: string  // só usado quando kind === 'Custom'
  note?: string
  groupId?: string
}

type Board = {
  id: string
  name: string
  type: BoardType
  updatedAt: string
  nodes: Node<BoardNodeData>[]
  edges: Edge[]
}

type BoardRow = {
  id: string
  name: string
  type: string
  nodes: Node<BoardNodeData>[]
  edges: Edge[]
  updated_at: string
}

// ─── CRM ────────────────────────────────────────────────────────────────────
type CrmStage = 'Novos' | 'Qualificando' | 'Reunião' | 'Fechado' | 'Recusado'

type CrmLead = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  source: string
  stage: CrmStage
  // Tentativas
  attempt1: boolean
  attempt2: boolean
  attempt3: boolean
  // Qualificação
  hasTeam: boolean | null
  aboveSimples: boolean | null
  adsBudget: boolean | null
  qualifiedFlag: boolean
  // Etapas
  meetingDone: boolean
  proposalDone: boolean
  contractDone: boolean
  isClosed: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

type CrmActivityKind = 'call' | 'whatsapp' | 'email' | 'note'

type CrmActivity = {
  id: string
  leadId: string
  type: CrmActivityKind
  content: string
  createdAt: string
}

type CrmLeadRow = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  source: string
  stage: string
  attempt1: boolean
  attempt2: boolean
  attempt3: boolean
  has_team: boolean | null
  above_simples: boolean | null
  ads_budget: boolean | null
  qualified_flag: boolean
  meeting_done: boolean
  proposal_done: boolean
  contract_done: boolean
  is_closed: boolean
  notes: string
  created_at: string
  updated_at: string
}

type CrmLeadImportInsert = {
  name: string
  company: string
  email: string
  phone: string
  source: string
  stage: CrmStage
  attempt1: boolean
  attempt2: boolean
  attempt3: boolean
  has_team: boolean | null
  above_simples: boolean | null
  ads_budget: boolean | null
  qualified_flag: boolean
  meeting_done: boolean
  proposal_done: boolean
  contract_done: boolean
  is_closed: boolean
  notes: string
}

type CrmActivityRow = {
  id: string
  lead_id: string
  type: string
  content: string
  created_at: string
}

type DispatchChannel = 'WhatsApp' | 'E-mail'
type DispatchStatus = 'Rascunho' | 'Enviando' | 'Enviado' | 'Erro'
type DispatchStageFilter = 'Todos' | CrmStage
type DispatchAttemptFilter = 'Todos' | 'Sem tentativa' | '1 tentativa' | '2 tentativas' | '3 tentativas'
type DispatchQualificationFilter = 'Todos' | 'Qualificados' | 'Nao qualificados'

type DispatchRecipientLog = {
  email: string
  nome: string
  empresa: string
  status: 'sent' | 'failed'
  error?: string
  sentAt?: string
}

type ConfirmDialogVariant = 'primary' | 'danger' | 'info'

type ConfirmDialogState = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string | null  // null = hide cancel (alert mode)
  variant?: ConfirmDialogVariant
  onConfirm?: () => void
}

type DispatchCampaign = {
  id: string
  name: string
  channel: DispatchChannel
  stageFilter: DispatchStageFilter
  attemptFilter: DispatchAttemptFilter
  qualificationFilter: DispatchQualificationFilter
  subject: string
  message: string
  recipientCount: number
  validRecipientCount: number
  status: DispatchStatus
  sentCount?: number
  failedCount?: number
  recipientsLog?: DispatchRecipientLog[]
  extraEmails?: string[]
  excludedEmails?: string[]
  createdAt: string
}

const CRM_STAGES: CrmStage[] = ['Novos', 'Qualificando', 'Reunião', 'Fechado', 'Recusado']

type CrmColumn = 'Novos' | 'Qualificando' | 'Reunião' | 'Resolução'
const CRM_COLUMNS: CrmColumn[] = ['Novos', 'Qualificando', 'Reunião', 'Resolução']

const CRM_STAGE_COLORS: Record<CrmStage, string> = {
  'Novos':       '#6b7280',
  'Qualificando':'#3b82f6',
  'Reunião':     '#8b5cf6',
  'Fechado':     '#10b981',
  'Recusado':    '#ef4444',
}

const CRM_COLUMN_COLORS: Record<CrmColumn, string> = {
  'Novos':       '#6b7280',
  'Qualificando':'#3b82f6',
  'Reunião':     '#8b5cf6',
  'Resolução':   '#f59e0b',
}

function getColumnLeads(col: CrmColumn, leads: CrmLead[]): CrmLead[] {
  if (col === 'Resolução') return leads.filter(l => l.stage === 'Fechado' || l.stage === 'Recusado')
  return leads.filter(l => l.stage === col)
}

const CRM_ACTIVITY_LABELS: Record<CrmActivityKind, string> = {
  call:     'Ligação',
  whatsapp: 'WhatsApp',
  email:    'E-mail',
  note:     'Nota',
}

// Checklist de 8 etapas na ordem do pipeline
const CRM_CHECKLIST: Array<{ key: keyof CrmLead; label: string }> = [
  { key: 'attempt1',     label: '1ª Tentativa de contato' },
  { key: 'attempt2',     label: '2ª Tentativa de contato' },
  { key: 'attempt3',     label: '3ª Tentativa de contato' },
  { key: 'qualifiedFlag',label: 'Qualificado' },
  { key: 'meetingDone',  label: 'Reunião agendada' },
  { key: 'proposalDone', label: 'Proposta apresentada' },
  { key: 'contractDone', label: 'Contrato enviado' },
  { key: 'isClosed',     label: 'Fechado' },
]

const CRM_LEADS_TABLE     = 'crm_leads'
const CRM_ACTIVITIES_TABLE = 'crm_activities'

type CrmLeadImportColumn = 'name' | 'company' | 'email' | 'phone' | 'source' | 'stage'

const CRM_IMPORT_COLUMNS: Array<{ key: CrmLeadImportColumn; label: string; aliases: string[] }> = [
  { key: 'name',    label: 'Nome *',              aliases: ['name', 'nome', 'nome *'] },
  { key: 'company', label: 'Empresa',             aliases: ['company', 'empresa'] },
  { key: 'email',   label: 'E-mail',              aliases: ['email', 'e-mail'] },
  { key: 'phone',   label: 'WhatsApp / Telefone', aliases: ['phone', 'telefone', 'whatsapp', 'whatsapp / telefone', 'whatsapp/telefone'] },
  { key: 'source',  label: 'Fonte',               aliases: ['source', 'fonte', 'origem'] },
  { key: 'stage',   label: 'Estágio',             aliases: ['stage', 'estagio', 'estágio'] },
]

const CRM_IMPORT_SAMPLE: Record<CrmLeadImportColumn, string> = {
  name: 'João Silva',
  company: 'Silva & Associados',
  email: 'joao@empresa.com',
  phone: '(11) 99999-0000',
  source: 'LinkedIn',
  stage: 'Novos',
}

function mapCrmLead(row: CrmLeadRow): CrmLead {
  return {
    id: row.id, name: row.name, company: row.company,
    email: row.email, phone: row.phone, source: row.source,
    stage: row.stage as CrmStage,
    attempt1: row.attempt1, attempt2: row.attempt2, attempt3: row.attempt3,
    hasTeam: row.has_team, aboveSimples: row.above_simples, adsBudget: row.ads_budget,
    qualifiedFlag: row.qualified_flag,
    meetingDone: row.meeting_done, proposalDone: row.proposal_done,
    contractDone: row.contract_done, isClosed: row.is_closed,
    notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

function mapCrmActivity(row: CrmActivityRow): CrmActivity {
  return { id: row.id, leadId: row.lead_id, type: row.type as CrmActivityKind, content: row.content, createdAt: row.created_at }
}

function formatCrmDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function daysAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoje'
  if (days === 1) return '1 dia'
  return `${days} dias`
}

function normalizeImportCell(value: unknown) {
  return value === null || value === undefined ? '' : String(value).trim()
}

function normalizeImportHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function getImportField(rawRow: Record<string, unknown>, key: CrmLeadImportColumn) {
  const field = CRM_IMPORT_COLUMNS.find(column => column.key === key)

  if (!field) return ''

  const normalizedEntries = Object.entries(rawRow).map(([header, value]) => ({
    header: normalizeImportHeader(header),
    value,
  }))

  const match = normalizedEntries.find(entry =>
    field.aliases.some(alias => normalizeImportHeader(alias) === entry.header)
  )

  return normalizeImportCell(match?.value)
}

function parseImportStage(value: unknown) {
  const stage = normalizeImportCell(value)
  const normalizedStage = normalizeImportHeader(stage)
  const matchedStage = CRM_STAGES.find(candidate => normalizeImportHeader(candidate) === normalizedStage)
  return matchedStage ?? 'Novos'
}

function buildCrmImportRows(rawRows: Record<string, unknown>[]) {
  const warnings: string[] = []
  const skipped: number[] = []
  const rows: CrmLeadImportInsert[] = []

  rawRows.forEach((rawRow, index) => {
    const rowNumber = index + 2
    const name = getImportField(rawRow, 'name')

    if (!name) {
      skipped.push(rowNumber)
      return
    }

    const stageValue = getImportField(rawRow, 'stage')
    const stage = parseImportStage(stageValue)

    if (stageValue && normalizeImportHeader(stage) !== normalizeImportHeader(stageValue)) {
      warnings.push(`Linha ${rowNumber}: estágio inválido. Usei "Novos".`)
    }

    rows.push({
      name,
      company: getImportField(rawRow, 'company'),
      email: getImportField(rawRow, 'email'),
      phone: getImportField(rawRow, 'phone'),
      source: getImportField(rawRow, 'source'),
      stage,
      attempt1: false,
      attempt2: false,
      attempt3: false,
      has_team: null,
      above_simples: null,
      ads_budget: null,
      qualified_flag: false,
      meeting_done: false,
      proposal_done: false,
      contract_done: false,
      is_closed: false,
      notes: '',
    })
  })

  if (skipped.length) {
    warnings.push(`${skipped.length} linha(s) ignorada(s) por não terem name preenchido.`)
  }

  return { rows, warnings }
}

// Retorna o status visual do lead baseado nas qualificações e tentativas
type CrmLeadStatus = 'normal' | 'qualified' | 'disqualified' | 'maxAttempts'
function getCrmLeadStatus(lead: CrmLead): CrmLeadStatus {
  if (lead.hasTeam === false || lead.aboveSimples === false || lead.adsBudget === false) return 'disqualified'
  if (lead.hasTeam === true && lead.aboveSimples === true && lead.adsBudget === true) return 'qualified'
  if (lead.attempt3) return 'maxAttempts'
  return 'normal'
}

function getCrmLeadProgress(lead: CrmLead): number {
  const keys: Array<keyof CrmLead> = ['attempt1','attempt2','attempt3','qualifiedFlag','meetingDone','proposalDone','contractDone','isClosed']
  return keys.filter(k => lead[k] === true).length
}

function getCrmActivityIcon(type: CrmActivityKind) {
  if (type === 'call')     return <CrmCallIcon />
  if (type === 'whatsapp') return <CrmWhatsappIcon />
  if (type === 'email')    return <CrmEmailIcon />
  return <CrmNoteIcon />
}

// Próxima tentativa disponível (1, 2, 3 ou null se todas já usadas)
function getNextAttempt(lead: CrmLead): 1 | 2 | 3 | null {
  if (!lead.attempt1) return 1
  if (!lead.attempt2) return 2
  if (!lead.attempt3) return 3
  return null
}

const MODULES: Array<{
  name: AdminModule
  icon: 'dispatches' | 'crm' | 'finance' | 'links' | 'boards'
}> = [
  { name: 'Disparos', icon: 'dispatches' },
  { name: 'CRM', icon: 'crm' },
  { name: 'Links', icon: 'links' },
  { name: 'Quadros', icon: 'boards' },
  { name: 'Financeiro', icon: 'finance' },
]

const MODULE_ROUTES: Partial<Record<AdminModule, string>> = {
  Disparos: '/disparos',
  Financeiro: '/financeiro',
  Links: '/links',
  Quadros: '/quadros',
}

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

const LINKS_TABLE_NAME = 'tracked_links'
const LINK_CLICKS_TABLE_NAME = 'tracked_link_clicks'
const FINANCE_RECORDS_TABLE = 'finance_records'
const BOARD_NODE_TYPES = {
  boardNode: BoardCircleNode,
  sourceNode: BoardSourceNode,
  circleNode: BoardCircleNode,
  noteNode: BoardNoteNode,
}

const BOARD_NOTE_DEFAULT_SIZE = {
  width: 220,
  height: 150,
}

const BOARD_DEFAULT_EDGE_OPTIONS = {
  animated: true,
  type: 'straight',
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: '#ffffff', strokeWidth: 2 },
}

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

export default function DashboardPage({ initialModule = 'CRM' }: AdminDashboardClientProps) {
  const router = useRouter()
  const [checkingSession, setCheckingSession] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
  // Lazy initial state: lê do localStorage durante o primeiro render
  // (síncrono, sem flash, sem race condition).
  // Como o componente está em dynamic({ ssr: false }), window sempre existe.
  const [themePreview, setThemePreview] = useState<'Escuro' | 'Branco'>(() => {
    try {
      const saved = window.localStorage.getItem('hubTheme')
      if (saved === 'Branco' || saved === 'Escuro') return saved
    } catch {
      // localStorage indisponível (modo privado, etc.)
    }
    return 'Escuro'
  })

  // Persiste mudança de tema
  useEffect(() => {
    try {
      window.localStorage.setItem('hubTheme', themePreview)
    } catch {
      // ignora se não puder escrever
    }
  }, [themePreview])
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

  const themeAttr = themePreview === 'Branco' ? 'light' : 'dark'

  if (checkingSession) {
    return <main className="admin-dashboard-page" data-theme={themeAttr} />
  }

  return (
    <main className={sidebarOpen ? 'admin-dashboard-page' : 'admin-dashboard-page collapsed'} data-theme={themeAttr}>
      <aside className="admin-sidebar" aria-label="Módulos administrativos">
        <div className="admin-sidebar-top">
          <button
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            type="button"
            aria-label={sidebarOpen ? 'Fechar barra lateral' : 'Abrir barra lateral'}
            title={sidebarOpen ? 'Fechar barra lateral' : 'Abrir barra lateral'}
          >
            <SidebarIcon />
          </button>
        </div>

        <nav className="admin-module-nav" aria-label="Navegação dos módulos">
          {MODULES.map(module => (
            <button
              className={activeModule === module.name ? 'admin-module-button active' : 'admin-module-button'}
              key={module.name}
              onClick={() => {
                const moduleRoute = MODULE_ROUTES[module.name]
                setActiveModule(module.name)

                if (moduleRoute) {
                  router.push(moduleRoute)
                }
              }}
              type="button"
              title={module.name}
            >
              <span className="module-icon-wrap">
                <ModuleIcon type={module.icon} />
              </span>
              {sidebarOpen && <span>{module.name}</span>}
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
            {sidebarOpen && (
              <div className="admin-sidebar-user-info">
                <span className="admin-sidebar-user-name">{profileName}</span>
                <span className="admin-sidebar-user-role">Admin</span>
              </div>
            )}
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
              <button
                type="button"
                role="menuitem"
                onClick={() => setThemePreview(themePreview === 'Escuro' ? 'Branco' : 'Escuro')}
              >
                <span className="admin-profile-menu-icon" aria-hidden="true">
                  {themePreview === 'Escuro' ? (
                    // Lua (clique muda para Escuro)
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                    </svg>
                  ) : (
                    // Sol (clique muda para Branco)
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                    </svg>
                  )}
                </span>
                {themePreview}
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
        className={activeModule === 'Disparos' || activeModule === 'CRM' || activeModule === 'Financeiro' || activeModule === 'Links' || activeModule === 'Quadros' ? 'admin-module-stage forms-module-stage' : 'admin-module-stage'}
        aria-labelledby="active-module-title"
      >
        {activeModule === 'Disparos' ? (
          <DispatchesModule />
        ) : activeModule === 'Financeiro' ? (
          <FinanceiroModule />
        ) : activeModule === 'Links' ? (
          <LinksModule />
        ) : activeModule === 'CRM' ? (
          <CrmModule />
        ) : activeModule === 'Quadros' ? (
          <BoardsModule />
        ) : (
          <div className="admin-module-empty">
            <h2 id="active-module-title">{activeModule}</h2>
          </div>
        )}
      </section>
    </main>
  )
}


// ─── CRM Icons ───────────────────────────────────────────────────────────────
function CrmCallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.59 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
function CrmWhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
function CrmEmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}
function CrmNoteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

// ─── CRM Module ───────────────────────────────────────────────────────────────
function CrmModule() {
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [activities, setActivities] = useState<CrmActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(''  )
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null)
  const [resolutionModal, setResolutionModal] = useState<{ leadId: string } | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError('')
    const [leadsRes, activitiesRes] = await Promise.all([
      supabase.from(CRM_LEADS_TABLE).select('*').order('updated_at', { ascending: false }),
      supabase.from(CRM_ACTIVITIES_TABLE).select('*').order('created_at', { ascending: false }),
    ])
    if (leadsRes.error) {
      setError('Não consegui carregar os leads do Supabase. Execute o SQL de criação das tabelas.')
      setLoading(false)
      return
    }
    setLeads((leadsRes.data ?? []).map(r => mapCrmLead(r as CrmLeadRow)))
    setActivities((activitiesRes.data ?? []).map(r => mapCrmActivity(r as CrmActivityRow)))
    setLoading(false)
  }

  useEffect(() => { void loadData() }, [])

  const selectedLead = selectedLeadId ? (leads.find(l => l.id === selectedLeadId) ?? null) : null
  const selectedActivities = selectedLeadId
    ? activities.filter(a => a.leadId === selectedLeadId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : []

  // ── Handlers ──────────────────────────────────────────
  const handleDrop = async (leadId: string, targetColumn: CrmColumn) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return
    if (targetColumn === 'Resolução') {
      const alreadyResolved = lead.stage === 'Fechado' || lead.stage === 'Recusado'
      if (alreadyResolved) return
      setResolutionModal({ leadId })
      return
    }
    const targetStage = targetColumn as CrmStage
    if (lead.stage === targetStage) return
    setLeads(cur => cur.map(l => l.id === leadId ? { ...l, stage: targetStage } : l))
    await supabase.from(CRM_LEADS_TABLE).update({ stage: targetStage, updated_at: new Date().toISOString() }).eq('id', leadId)
  }

  const handleResolutionChoice = async (choice: 'Fechado' | 'Recusado') => {
    if (!resolutionModal) return
    const { leadId } = resolutionModal
    setResolutionModal(null)
    setLeads(cur => cur.map(l => l.id === leadId ? { ...l, stage: choice } : l))
    await supabase.from(CRM_LEADS_TABLE).update({ stage: choice, updated_at: new Date().toISOString() }).eq('id', leadId)
  }

  const handleLeadUpdate = async (leadId: string, updates: Partial<CrmLead>) => {
    const dbMap: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.stage           !== undefined) dbMap.stage            = updates.stage
    if (updates.attempt1        !== undefined) dbMap.attempt1         = updates.attempt1
    if (updates.attempt2        !== undefined) dbMap.attempt2         = updates.attempt2
    if (updates.attempt3        !== undefined) dbMap.attempt3         = updates.attempt3
    if (updates.hasTeam         !== undefined) dbMap.has_team         = updates.hasTeam
    if (updates.aboveSimples    !== undefined) dbMap.above_simples    = updates.aboveSimples
    if (updates.adsBudget       !== undefined) dbMap.ads_budget       = updates.adsBudget
    if (updates.qualifiedFlag   !== undefined) dbMap.qualified_flag   = updates.qualifiedFlag
    if (updates.meetingDone     !== undefined) dbMap.meeting_done     = updates.meetingDone
    if (updates.proposalDone    !== undefined) dbMap.proposal_done    = updates.proposalDone
    if (updates.contractDone    !== undefined) dbMap.contract_done    = updates.contractDone
    if (updates.isClosed        !== undefined) dbMap.is_closed        = updates.isClosed
    if (updates.notes           !== undefined) dbMap.notes            = updates.notes
    await supabase.from(CRM_LEADS_TABLE).update(dbMap).eq('id', leadId)
    setLeads(cur => cur.map(l => l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
  }

  const handleActivityAdd = async (leadId: string, type: CrmActivityKind, content: string) => {
    const { data: row } = await supabase
      .from(CRM_ACTIVITIES_TABLE).insert({ lead_id: leadId, type, content }).select('*').single()
    if (row) setActivities(cur => [mapCrmActivity(row as CrmActivityRow), ...cur])
    await supabase.from(CRM_LEADS_TABLE).update({ updated_at: new Date().toISOString() }).eq('id', leadId)
    setLeads(cur => cur.map(l => l.id === leadId ? { ...l, updatedAt: new Date().toISOString() } : l))
  }

  const handleLeadDelete = async (leadId: string) => {
    await supabase.from(CRM_LEADS_TABLE).delete().eq('id', leadId)
    setLeads(cur => cur.filter(l => l.id !== leadId))
    setActivities(cur => cur.filter(a => a.leadId !== leadId))
    setSelectedLeadId(null)
  }

  const handleAddLead = async (data: { name: string; company: string; email: string; phone: string; source: string; stage: CrmStage }) => {
    const { data: row, error: e } = await supabase.from(CRM_LEADS_TABLE).insert(data).select('*').single()
    if (e || !row) { setError('Não consegui adicionar o lead.'); return }
    setLeads(cur => [mapCrmLead(row as CrmLeadRow), ...cur])
    setIsAddModalOpen(false)
  }

  const handleImportLeads = async (rows: CrmLeadImportInsert[]) => {
    const { data, error: importError } = await supabase
      .from(CRM_LEADS_TABLE)
      .insert(rows)
      .select('*')

    if (importError) {
      throw new Error('Não consegui importar os leads no Supabase.')
    }

    const importedLeads = (data ?? []).map(row => mapCrmLead(row as CrmLeadRow))
    setLeads(currentLeads => [...importedLeads, ...currentLeads])
    return importedLeads.length
  }

  return (
    <div className={`crm-module${selectedLead ? ' crm-module-panel-open' : ''}`}>
      <div className="crm-module-inner">
        <div className="crm-module-header">
          <div>
            <h2>CRM</h2>
          </div>
          <div className="crm-header-right">
            {error && <span className="crm-global-error">{error}</span>}
            <button
              className="crm-add-btn crm-add-icon-btn"
              onClick={() => setIsImportModalOpen(true)}
              type="button"
              aria-label="Importar leads por Excel"
              title="Importar leads por Excel"
            >
              <ImportLeadsIcon />
            </button>
            <button
              className="crm-add-btn crm-add-icon-btn"
              onClick={() => setIsAddModalOpen(true)}
              type="button"
              aria-label="Adicionar lead"
              title="Adicionar lead"
            >
              <UserPlusIcon />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="crm-loading">Carregando leads...</div>
        ) : (
          <div className="crm-kanban">
            {CRM_COLUMNS.map(col => (
              <CrmStageColumn
                key={col}
                column={col}
                leads={getColumnLeads(col, leads)}
                draggingLeadId={draggingLeadId}
                selectedLeadId={selectedLeadId}
                onLeadClick={id => setSelectedLeadId(prev => prev === id ? null : id)}
                onDragStart={setDraggingLeadId}
                onDragEnd={() => setDraggingLeadId(null)}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>

      {selectedLead && (
        <CrmLeadPanel
          lead={selectedLead}
          activities={selectedActivities}
          onClose={() => setSelectedLeadId(null)}
          onLeadUpdate={handleLeadUpdate}
          onLeadDelete={handleLeadDelete}
          onActivityAdd={handleActivityAdd}
        />
      )}

      {isAddModalOpen && (
        <CrmAddLeadModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddLead} />
      )}

      {isImportModalOpen && (
        <CrmImportLeadsModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportLeads}
        />
      )}

      {resolutionModal && (
        <CrmResolutionModal
          onClose={() => setResolutionModal(null)}
          onChoice={handleResolutionChoice}
        />
      )}
    </div>
  )
}

// ─── CRM Stage Column ─────────────────────────────────────────────────────────
function CrmStageColumn({
  column, leads, draggingLeadId, selectedLeadId, onLeadClick, onDragStart, onDragEnd, onDrop,
}: {
  column: CrmColumn; leads: CrmLead[]; draggingLeadId: string | null; selectedLeadId: string | null
  onLeadClick: (id: string) => void; onDragStart: (id: string) => void
  onDragEnd: () => void; onDrop: (leadId: string, column: CrmColumn) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const isResolution = column === 'Resolução'
  return (
    <div
      className={`crm-column${isDragOver ? ' drag-over' : ''}${isResolution ? ' crm-column-resolution' : ''}`}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => { e.preventDefault(); setIsDragOver(false); if (draggingLeadId) onDrop(draggingLeadId, column) }}
    >
      <div className="crm-column-header">
        <div className="crm-column-title">
          <span className="crm-column-dot" style={{ background: CRM_COLUMN_COLORS[column] }} />
          <strong>{column}</strong>
        </div>
        <span className="crm-column-count">{leads.length}</span>
      </div>
      <div className="crm-column-body">
        {leads.map(lead => (
          <CrmLeadCard
            key={lead.id}
            lead={lead}
            isSelected={selectedLeadId === lead.id}
            showResolutionBadge={isResolution}
            onClick={() => onLeadClick(lead.id)}
            onDragStart={() => onDragStart(lead.id)}
            onDragEnd={onDragEnd}
          />
        ))}
        {leads.length === 0 && <div className="crm-column-empty">Nenhum lead</div>}
      </div>
    </div>
  )
}

// ─── CRM Lead Card ────────────────────────────────────────────────────────────
function CrmLeadCard({ lead, isSelected, showResolutionBadge, onClick, onDragStart, onDragEnd }: {
  lead: CrmLead; isSelected: boolean; showResolutionBadge?: boolean
  onClick: () => void; onDragStart: () => void; onDragEnd: () => void
}) {
  const status   = getCrmLeadStatus(lead)
  const progress = getCrmLeadProgress(lead)
  const attempts = [lead.attempt1, lead.attempt2, lead.attempt3]
  const qualif   = [lead.hasTeam, lead.aboveSimples, lead.adsBudget]

  return (
    <div
      className={`crm-lead-card crm-status-${status}${isSelected ? ' selected' : ''}`}
      draggable
      onDragStart={e => { e.dataTransfer.setData('leadId', lead.id); onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
    >
      {/* Resolution badge */}
      {showResolutionBadge && (
        <span className={`crm-resolution-badge${lead.stage === 'Fechado' ? ' badge-fechado' : ' badge-recusado'}`}>
          {lead.stage}
        </span>
      )}

      {/* Company + Name */}
      {lead.company && <div className="crm-card-company">{lead.company}</div>}
      <div className="crm-card-name">{lead.name}</div>

      {/* Indicators row */}
      <div className="crm-card-indicators">
        {/* Attempt dots */}
        <div className="crm-dots" title="Tentativas de contato">
          {attempts.map((done, i) => (
            <span key={i} className={`crm-dot${done ? ' done' : ''}`} />
          ))}
        </div>

        {/* Qualification dots */}
        <div className="crm-dots" title="Qualificação">
          {qualif.map((val, i) => (
            <span
              key={i}
              className={`crm-dot qualif${val === true ? ' yes' : val === false ? ' no' : ''}`}
            />
          ))}
        </div>

        {/* Meeting badge */}
        {lead.meetingDone && <span className="crm-card-meeting-badge">📅</span>}

        {/* Max attempts warning */}
        {status === 'maxAttempts' && <span className="crm-card-alert" title="3 tentativas sem resposta">!</span>}
      </div>

      {/* Progress bar */}
      <div className="crm-card-progress">
        <div className="crm-card-progress-bar" style={{ width: `${(progress / 8) * 100}%` }} />
      </div>

      {/* Footer */}
      <div className="crm-card-footer">
        <span className="crm-card-age">{daysAgo(lead.updatedAt)}</span>
        <div className="crm-card-actions">
          {lead.phone && (
            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="crm-card-action" title="WhatsApp" onClick={e => e.stopPropagation()}>
              <CrmWhatsappIcon />
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="crm-card-action" title="E-mail" onClick={e => e.stopPropagation()}>
              <CrmEmailIcon />
            </a>
          )}
          {lead.phone && (
            <a href={`tel:${lead.phone.replace(/\D/g, '')}`} className="crm-card-action" title="Ligar" onClick={e => e.stopPropagation()}>
              <CrmCallIcon />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CRM Lead Panel ───────────────────────────────────────────────────────────
function CrmLeadPanel({ lead, activities, onClose, onLeadUpdate, onLeadDelete, onActivityAdd }: {
  lead: CrmLead; activities: CrmActivity[]
  onClose: () => void
  onLeadUpdate: (id: string, updates: Partial<CrmLead>) => void
  onLeadDelete: (id: string) => void
  onActivityAdd: (leadId: string, type: CrmActivityKind, content: string) => void
}) {
  const [notes, setNotes] = useState(lead.notes)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setNotes(lead.notes) }, [lead.id, lead.notes])

  const update = (updates: Partial<CrmLead>) => onLeadUpdate(lead.id, updates)

  const handleNotesChange = (val: string) => {
    setNotes(val)
    if (notesTimer.current) clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(async () => {
      setSavingNotes(true)
      await update({ notes: val })
      setSavingNotes(false)
    }, 800)
  }

  // Log contact attempt: auto-increments attempt1 → 2 → 3
  const handleContact = async (type: CrmActivityKind, label: string) => {
    const next = getNextAttempt(lead)
    const attemptUpdate: Partial<CrmLead> = {}
    if (next === 1) attemptUpdate.attempt1 = true
    else if (next === 2) attemptUpdate.attempt2 = true
    else if (next === 3) attemptUpdate.attempt3 = true
    if (Object.keys(attemptUpdate).length) await update(attemptUpdate)
    const attemptLabel = next ? ` (${next}ª tentativa)` : ''
    await onActivityAdd(lead.id, type, `${label} realizado${attemptLabel}`)
  }

  // Update qualification answer + auto-set qualifiedFlag
  const handleQualif = async (field: 'hasTeam' | 'aboveSimples' | 'adsBudget', val: boolean | null) => {
    const updated = { ...lead, [field]: val }
    const updates: Partial<CrmLead> = { [field]: val }
    // Recalculate qualifiedFlag
    if (updated.hasTeam === true && updated.aboveSimples === true && updated.adsBudget === true) {
      updates.qualifiedFlag = true
    } else {
      updates.qualifiedFlag = false
    }
    await update(updates)
  }

  // Toggle checklist item
  const handleChecklist = async (key: keyof CrmLead) => {
    await update({ [key]: !lead[key] } as Partial<CrmLead>)
  }

  const status = getCrmLeadStatus(lead)
  const nextAttempt = getNextAttempt(lead)
  const progress = getCrmLeadProgress(lead)

  const qualifQuestions: Array<{ field: 'hasTeam' | 'aboveSimples' | 'adsBudget'; label: string }> = [
    { field: 'hasTeam',      label: 'Tem vendedores ou atendentes?' },
    { field: 'aboveSimples', label: 'Empresa acima do Simples Nacional?' },
    { field: 'adsBudget',    label: 'Budget > R$1.000 em tráfego pago?' },
  ]

  return (
    <aside className="crm-lead-panel">
      {/* Header */}
      <div className="crm-panel-header">
        <div className="crm-panel-title">
          <span className="crm-panel-stage-dot" style={{ background: CRM_STAGE_COLORS[lead.stage] }} />
          <div>
            <strong>{lead.name}</strong>
            {lead.company && <span>{lead.company}</span>}
          </div>
        </div>
        <button className="crm-panel-close" onClick={onClose} type="button" aria-label="Fechar">
          <CloseIcon />
        </button>
      </div>

      <div className="crm-panel-body">

        {/* Progress bar */}
        <div className="crm-panel-progress-wrap">
          <div className="crm-panel-progress-bar" style={{ width: `${(progress / 8) * 100}%` }} />
          <span className="crm-panel-progress-label">{progress}/8 etapas</span>
        </div>

        {/* Status banner */}
        {status === 'qualified' && (
          <div className="crm-panel-banner crm-banner-qualified">✓ Lead qualificado — agende a reunião!</div>
        )}
        {status === 'disqualified' && (
          <div className="crm-panel-banner crm-banner-disqualified">✗ Lead desqualificado</div>
        )}
        {status === 'maxAttempts' && (
          <div className="crm-panel-banner crm-banner-maxattempts">3 tentativas sem resposta — desistir?</div>
        )}

        {/* Contact section */}
        <div className="crm-panel-section">
          <p className="crm-panel-label">
            Registrar contato
            {nextAttempt && <span className="crm-panel-label-sub"> · {nextAttempt}ª tentativa</span>}
            {!nextAttempt && <span className="crm-panel-label-sub"> · todas tentativas usadas</span>}
          </p>
          <div className="crm-contact-btns">
            {lead.phone && (
              <button
                className="crm-contact-btn crm-contact-call"
                type="button"
                onClick={() => void handleContact('call', 'Ligação')}
              >
                <CrmCallIcon /> Ligar
              </button>
            )}
            {lead.phone && (
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="crm-contact-btn crm-contact-whatsapp"
                onClick={() => void handleContact('whatsapp', 'Mensagem')}
              >
                <CrmWhatsappIcon /> WhatsApp
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="crm-contact-btn crm-contact-email"
                onClick={() => void handleContact('email', 'E-mail')}
              >
                <CrmEmailIcon /> E-mail
              </a>
            )}
          </div>
          {/* Contact info */}
          <div className="crm-contact-info">
            {lead.phone && <span>{lead.phone}</span>}
            {lead.email && <span>{lead.email}</span>}
            {lead.source && <span>Fonte: {lead.source}</span>}
          </div>
        </div>

        {/* Qualification */}
        <div className="crm-panel-section">
          <p className="crm-panel-label">Qualificação</p>
          <div className="crm-qualif-list">
            {qualifQuestions.map(({ field, label }) => {
              const val = lead[field] as boolean | null
              return (
                <div key={field} className="crm-qualif-row">
                  <span className="crm-qualif-label">{label}</span>
                  <div className="crm-qualif-toggle">
                    <button
                      type="button"
                      className={`crm-qualif-btn${val === true ? ' active-yes' : ''}`}
                      onClick={() => void handleQualif(field, val === true ? null : true)}
                    >Sim</button>
                    <button
                      type="button"
                      className={`crm-qualif-btn${val === false ? ' active-no' : ''}`}
                      onClick={() => void handleQualif(field, val === false ? null : false)}
                    >Não</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Checklist */}
        <div className="crm-panel-section">
          <p className="crm-panel-label">Checklist de etapas</p>
          <div className="crm-checklist">
            {CRM_CHECKLIST.map(({ key, label }) => {
              const done = lead[key] === true
              return (
                <button
                  key={key}
                  type="button"
                  className={`crm-checklist-item${done ? ' done' : ''}`}
                  onClick={() => void handleChecklist(key)}
                >
                  <span className="crm-check-box">{done ? '✓' : ''}</span>
                  <span className="crm-check-label">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Stage selector */}
        <div className="crm-panel-section">
          <p className="crm-panel-label">Estágio</p>
          <div className="crm-stage-select-wrap">
            <span className="crm-stage-select-dot" style={{ background: CRM_STAGE_COLORS[lead.stage] }} />
            <select
              className="crm-stage-select"
              value={lead.stage}
              onChange={e => void update({ stage: e.target.value as CrmStage })}
            >
              {CRM_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="crm-panel-section">
          <p className="crm-panel-label">
            Notas{savingNotes && <span className="crm-saving-indicator"> · salvando...</span>}
          </p>
          <textarea
            className="crm-notes-input"
            value={notes}
            onChange={e => handleNotesChange(e.target.value)}
            placeholder="Anotações sobre o lead..."
            rows={3}
          />
        </div>

        {/* Activity log */}
        <div className="crm-panel-section">
          <p className="crm-panel-label">Histórico ({activities.length})</p>
          {activities.length === 0 ? (
            <p className="crm-activity-empty">Nenhuma atividade ainda.</p>
          ) : (
            <div className="crm-activity-list">
              {activities.map(act => (
                <div key={act.id} className="crm-activity-item">
                  <div className={`crm-activity-icon crm-act-${act.type}`}>{getCrmActivityIcon(act.type)}</div>
                  <div className="crm-activity-body">
                    <span className="crm-activity-kind">{CRM_ACTIVITY_LABELS[act.type as CrmActivityKind]}</span>
                    <span className="crm-activity-text">{act.content}</span>
                    <span className="crm-activity-date">{formatCrmDate(act.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        <div className="crm-panel-section crm-panel-danger-zone">
          {confirmDelete ? (
            <div className="crm-delete-confirm">
              <span>Excluir este lead permanentemente?</span>
              <div className="crm-delete-confirm-actions">
                <button className="crm-delete-yes" onClick={() => void onLeadDelete(lead.id)} type="button">Sim, excluir</button>
                <button className="crm-delete-no" onClick={() => setConfirmDelete(false)} type="button">Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="crm-delete-btn" onClick={() => setConfirmDelete(true)} type="button">
              <TrashIcon /> Excluir lead
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

// ─── CRM Resolution Modal ─────────────────────────────────────────────────────
function CrmResolutionModal({ onClose, onChoice }: {
  onClose: () => void
  onChoice: (choice: 'Fechado' | 'Recusado') => void
}) {
  return (
    <div className="crm-modal-overlay" onClick={onClose}>
      <div className="crm-resolution-modal" onClick={e => e.stopPropagation()}>
        <p className="crm-resolution-title">Qual foi o resultado?</p>
        <div className="crm-resolution-btns">
          <button className="crm-resolution-btn btn-fechado" onClick={() => onChoice('Fechado')} type="button">
            ✓ Fechado
          </button>
          <button className="crm-resolution-btn btn-recusado" onClick={() => onChoice('Recusado')} type="button">
            ✕ Recusado
          </button>
        </div>
        <button className="crm-resolution-cancel" onClick={onClose} type="button">Cancelar</button>
      </div>
    </div>
  )
}

// ─── CRM Add Lead Modal ───────────────────────────────────────────────────────
function CrmAddLeadModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (data: { name: string; company: string; email: string; phone: string; source: string; stage: CrmStage }) => void
}) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState('')
  const [stage, setStage] = useState<CrmStage>('Novos')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) { setError('Informe o nome do lead.'); return }
    setSaving(true)
    await onAdd({ name: cleanName, company: company.trim(), email: email.trim(), phone: phone.trim(), source: source.trim(), stage })
    setSaving(false)
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal" onClick={e => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>Novo lead</h3>
          <button onClick={onClose} type="button" className="crm-modal-close"><CloseIcon /></button>
        </div>
        <form className="crm-modal-form" onSubmit={e => void handleSubmit(e)}>
          <label>Nome *<input value={name} onChange={e => { setName(e.target.value); setError('') }} placeholder="João Silva" autoFocus /></label>
          <label>Empresa<input value={company} onChange={e => setCompany(e.target.value)} placeholder="Silva & Associados" /></label>
          <div className="crm-modal-row">
            <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@empresa.com" /></label>
            <label>WhatsApp / Telefone<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-0000" /></label>
          </div>
          <div className="crm-modal-row">
            <label>Fonte<input value={source} onChange={e => setSource(e.target.value)} placeholder="LinkedIn, indicação..." /></label>
            <label>Estágio<select value={stage} onChange={e => setStage(e.target.value as CrmStage)}>{CRM_STAGES.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
          </div>
          {error && <p className="crm-modal-error">{error}</p>}
          <div className="crm-modal-footer">
            <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
            <button type="submit" disabled={saving} className="crm-modal-submit">{saving ? 'Salvando...' : 'Adicionar lead'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CrmImportLeadsModal({ onClose, onImport }: {
  onClose: () => void
  onImport: (rows: CrmLeadImportInsert[]) => Promise<number>
}) {
  const [fileName, setFileName] = useState('')
  const [preparedRows, setPreparedRows] = useState<CrmLeadImportInsert[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx')
    const header = CRM_IMPORT_COLUMNS.map(column => column.label)
    const sampleRow = CRM_IMPORT_COLUMNS.map(column => CRM_IMPORT_SAMPLE[column.key] ?? '')
    const worksheet = XLSX.utils.aoa_to_sheet([header, sampleRow])

    worksheet['!cols'] = header.map(column => ({ wch: Math.max(16, column.length + 4) }))

    const guideRows = [
      ['Campo', 'Obrigatório', 'Como preencher'],
      ['Nome *', 'Sim', 'Mesmo campo Nome do cadastro manual. Linhas sem nome são ignoradas.'],
      ['Empresa', 'Não', 'Mesmo campo Empresa do cadastro manual.'],
      ['E-mail', 'Não', 'Mesmo campo E-mail do cadastro manual.'],
      ['WhatsApp / Telefone', 'Não', 'Mesmo campo WhatsApp / Telefone do cadastro manual.'],
      ['Fonte', 'Não', 'Mesmo campo Fonte do cadastro manual: LinkedIn, indicação etc.'],
      ['Estágio', 'Não', `Use: ${CRM_STAGES.join(', ')}. Se ficar vazio, entra como Novos.`],
    ]
    const guideWorksheet = XLSX.utils.aoa_to_sheet(guideRows)
    guideWorksheet['!cols'] = [{ wch: 34 }, { wch: 14 }, { wch: 72 }]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads')
    XLSX.utils.book_append_sheet(workbook, guideWorksheet, 'Como preencher')
    XLSX.writeFile(workbook, 'modelo-importacao-crm.xlsx')
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setPreparedRows([])
    setWarnings([])
    setError('')
    setSuccess('')

    try {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : null

      if (!worksheet) {
        setError('Não consegui encontrar uma aba válida nessa planilha.')
        return
      }

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' })

      if (!rawRows.length) {
        setError('A planilha não tem leads para importar.')
        return
      }

      const hasNameColumn = rawRows.some(row => getImportField(row, 'name') !== '')

      if (!hasNameColumn) {
        setError('A planilha precisa ter a coluna "Nome *" preenchida. Baixe o modelo para seguir os campos corretos.')
        return
      }

      const result = buildCrmImportRows(rawRows)

      if (!result.rows.length) {
        setError('Nenhum lead válido encontrado. Preencha a coluna "name".')
        setWarnings(result.warnings)
        return
      }

      setPreparedRows(result.rows)
      setWarnings(result.warnings)
    } catch {
      setError('Não consegui ler esse arquivo. Use o modelo .xlsx do CRM.')
    }
  }

  const handleImport = async () => {
    if (!preparedRows.length) {
      setError('Escolha uma planilha válida antes de importar.')
      return
    }

    setImporting(true)
    setError('')
    setSuccess('')

    try {
      const count = await onImport(preparedRows)
      setPreparedRows([])
      setFileName('')
      setSuccess(`${count} lead(s) importado(s) para o CRM.`)
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Não consegui importar os leads.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal crm-import-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>Importar leads</h3>
          <button onClick={onClose} type="button" className="crm-modal-close"><CloseIcon /></button>
        </div>

        <div className="crm-modal-form crm-import-form">
          <div className="crm-import-template">
            <div>
              <strong>Modelo da planilha</strong>
              <span>Baixe o arquivo e mantenha os nomes das colunas para bater com a base do CRM.</span>
            </div>
            <button type="button" onClick={() => void handleDownloadTemplate()}>
              <DownloadTemplateIcon /> Baixar modelo
            </button>
          </div>

          <div className="crm-import-file">
            <span className="crm-import-file-label">Planilha Excel</span>
            <div className="crm-import-upload">
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                Escolher arquivo
              </button>
              <span>{fileName || 'Nenhum arquivo escolhido'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={event => void handleFileChange(event)}
              />
            </div>
          </div>

          {fileName && (
            <div className="crm-import-summary">
              <span>Arquivo</span>
              <strong>{fileName}</strong>
              <p>{preparedRows.length} lead(s) pronto(s) para importar.</p>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="crm-import-warnings">
              {warnings.slice(0, 4).map(warning => <span key={warning}>{warning}</span>)}
              {warnings.length > 4 && <span>+ {warnings.length - 4} aviso(s)</span>}
            </div>
          )}

          {error && <p className="crm-modal-error">{error}</p>}
          {success && <p className="admin-profile-message">{success}</p>}
        </div>

        <div className="crm-modal-footer">
          <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
          <button type="button" disabled={importing || preparedRows.length === 0} onClick={() => void handleImport()} className="crm-modal-submit">
            {importing ? 'Importando...' : 'Importar leads'}
          </button>
        </div>
      </div>
    </div>
  )
}

function getDispatchAttemptCount(lead: CrmLead) {
  return [lead.attempt1, lead.attempt2, lead.attempt3].filter(Boolean).length
}

function isValidDispatchEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function isValidDispatchPhone(phone: string) {
  return phone.replace(/\D/g, '').length >= 10
}

function getDispatchAudience(
  leads: CrmLead[],
  stageFilter: DispatchStageFilter,
  attemptFilter: DispatchAttemptFilter,
  qualificationFilter: DispatchQualificationFilter
) {
  return leads.filter(lead => {
    if (stageFilter !== 'Todos' && lead.stage !== stageFilter) return false

    const attempts = getDispatchAttemptCount(lead)
    if (attemptFilter === 'Sem tentativa' && attempts !== 0) return false
    if (attemptFilter === '1 tentativa' && attempts !== 1) return false
    if (attemptFilter === '2 tentativas' && attempts !== 2) return false
    if (attemptFilter === '3 tentativas' && attempts !== 3) return false

    const leadStatus = getCrmLeadStatus(lead)
    if (qualificationFilter === 'Qualificados' && leadStatus !== 'qualified') return false
    if (qualificationFilter === 'Nao qualificados' && leadStatus !== 'disqualified') return false

    return true
  })
}

function getDispatchValidRecipients(leads: CrmLead[], channel: DispatchChannel) {
  return leads.filter(lead => channel === 'E-mail'
    ? isValidDispatchEmail(lead.email)
    : isValidDispatchPhone(lead.phone)
  )
}

function getDispatchAudienceLabel(campaign: DispatchCampaign) {
  const parts = [
    campaign.stageFilter === 'Todos' ? 'Todos os estágios' : campaign.stageFilter,
    campaign.attemptFilter === 'Todos' ? '' : campaign.attemptFilter,
    campaign.qualificationFilter === 'Todos' ? '' : campaign.qualificationFilter,
  ].filter(Boolean)

  return parts.join(' · ')
}

const DISPATCHES_TABLE = 'dispatches'

type DispatchRow = {
  id: string
  name: string
  channel: string
  subject: string
  message: string
  stage_filter: string
  attempt_filter: string
  qualification_filter: string
  status: string
  sent_count: number
  failed_count: number
  recipients_log?: DispatchRecipientLog[] | null
  extra_emails?: string[] | null
  excluded_emails?: string[] | null
  created_at: string
}

function mapDispatchRow(row: DispatchRow): DispatchCampaign {
  return {
    id: row.id,
    name: row.name,
    channel: row.channel as DispatchChannel,
    subject: row.subject,
    message: row.message,
    stageFilter: row.stage_filter as DispatchStageFilter,
    attemptFilter: row.attempt_filter as DispatchAttemptFilter,
    qualificationFilter: row.qualification_filter as DispatchQualificationFilter,
    status: row.status as DispatchStatus,
    sentCount: row.sent_count,
    failedCount: row.failed_count,
    recipientsLog: Array.isArray(row.recipients_log) ? row.recipients_log : undefined,
    extraEmails: Array.isArray(row.extra_emails) ? row.extra_emails : undefined,
    excludedEmails: Array.isArray(row.excluded_emails) ? row.excluded_emails : undefined,
    recipientCount: 0,
    validRecipientCount: 0,
    createdAt: row.created_at,
  }
}

function DispatchesModule() {
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [campaigns, setCampaigns] = useState<DispatchCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ campaign: DispatchCampaign; x: number; y: number } | null>(null)
  const [detailCampaign, setDetailCampaign] = useState<DispatchCampaign | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<DispatchCampaign | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)
  const ctxMenuRef = useRef<HTMLDivElement | null>(null)

  // Fecha o menu de contexto ao clicar fora ou pressionar Esc
  useEffect(() => {
    if (!contextMenu) return
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as globalThis.Node | null
      if (target && ctxMenuRef.current && !ctxMenuRef.current.contains(target)) {
        setContextMenu(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [contextMenu])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')

      const [leadsResult, campaignsResult] = await Promise.all([
        supabase.from(CRM_LEADS_TABLE).select('*').order('updated_at', { ascending: false }),
        supabase.from(DISPATCHES_TABLE).select('*').order('created_at', { ascending: false }),
      ])

      if (leadsResult.error) {
        setError('Não consegui carregar os leads do CRM.')
        setLoading(false)
        return
      }

      setLeads((leadsResult.data ?? []).map(row => mapCrmLead(row as CrmLeadRow)))
      setCampaigns((campaignsResult.data ?? []).map(row => mapDispatchRow(row as DispatchRow)))
      setLoading(false)
    }

    void loadData()
  }, [])

  const handleCreateCampaign = async (campaign: DispatchCampaign) => {
    const { data, error: insertError } = await supabase
      .from(DISPATCHES_TABLE)
      .insert({
        name: campaign.name,
        channel: campaign.channel,
        subject: campaign.subject,
        message: campaign.message,
        stage_filter: campaign.stageFilter,
        attempt_filter: campaign.attemptFilter,
        qualification_filter: campaign.qualificationFilter,
        status: campaign.status,
        sent_count: 0,
        failed_count: 0,
      })
      .select()
      .single()

    if (insertError || !data) {
      setCampaigns(currentCampaigns => [campaign, ...currentCampaigns])
    } else {
      setCampaigns(currentCampaigns => [mapDispatchRow(data as DispatchRow), ...currentCampaigns])
    }
    setIsCreateModalOpen(false)
  }

  const updateCampaignInDb = async (
    id: string,
    fields: Partial<{
      status: string
      sent_count: number
      failed_count: number
      name: string
      channel: string
      subject: string
      message: string
      stage_filter: string
      attempt_filter: string
      qualification_filter: string
      recipients_log: DispatchRecipientLog[]
      extra_emails: string[]
      excluded_emails: string[]
    }>,
  ) => {
    await supabase.from(DISPATCHES_TABLE).update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id)
  }

  const handleSendCampaign = async (campaign: DispatchCampaign) => {
    if (campaign.channel !== 'E-mail') {
      setConfirmDialog({
        title: 'Canal indisponível',
        message: 'Envio via WhatsApp ainda não está disponível. Em breve.',
        confirmLabel: 'Entendi',
        cancelLabel: null,
        variant: 'info',
      })
      return
    }

    // Monta lista de destinatários válidos com base nos filtros da campanha
    const audience = getDispatchAudience(leads, campaign.stageFilter, campaign.attemptFilter, campaign.qualificationFilter)
    const validLeadsFromFilter = getDispatchValidRecipients(audience, campaign.channel)

    // Remove leads cujo email está na lista de excluídos
    const excludedSet = new Set((campaign.excludedEmails ?? []).map(e => e.toLowerCase()))
    const filteredLeads = validLeadsFromFilter.filter(lead => !excludedSet.has(lead.email.toLowerCase()))

    // Monta destinatários finais: leads do filtro + emails extras manuais
    const filterRecipients = filteredLeads.map(lead => ({
      email: lead.email,
      nome: lead.name,
      empresa: lead.company,
    }))

    // Evita duplicar email extra que já está em algum lead
    const filterEmailSet = new Set(filterRecipients.map(r => r.email.toLowerCase()))
    const extraRecipients = (campaign.extraEmails ?? [])
      .filter(email => email && !filterEmailSet.has(email.toLowerCase()))
      .map(email => ({ email, nome: '', empresa: '' }))

    const validLeads = [...filterRecipients, ...extraRecipients]

    if (validLeads.length === 0) {
      setConfirmDialog({
        title: 'Sem destinatários',
        message: 'Nenhum destinatário válido encontrado com os filtros atuais.',
        confirmLabel: 'OK',
        cancelLabel: null,
        variant: 'info',
      })
      return
    }

    // Marca como "Enviando"
    setCampaigns(prev => prev.map(c =>
      c.id === campaign.id ? { ...c, status: 'Enviando' } : c
    ))
    void updateCampaignInDb(campaign.id, { status: 'Enviando' })

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: campaign.channel,
          subject: campaign.subject,
          message: campaign.message,
          recipients: validLeads,
        }),
      })

      const result = await res.json() as {
        sent?: number
        failed?: number
        results?: DispatchRecipientLog[]
        error?: string
      }

      if (!res.ok || result.error) {
        const fallbackLog: DispatchRecipientLog[] = validLeads.map(r => ({
          email: r.email,
          nome: r.nome,
          empresa: r.empresa,
          status: 'failed',
          error: result.error ?? 'Falha desconhecida',
        }))
        setCampaigns(prev => prev.map(c =>
          c.id === campaign.id
            ? { ...c, status: 'Erro', sentCount: 0, failedCount: validLeads.length, recipientsLog: fallbackLog }
            : c
        ))
        void updateCampaignInDb(campaign.id, {
          status: 'Erro',
          sent_count: 0,
          failed_count: validLeads.length,
          recipients_log: fallbackLog,
        })
        return
      }

      const log = result.results ?? []
      const finalStatus: DispatchStatus = (result.failed ?? 0) > 0 && (result.sent ?? 0) === 0 ? 'Erro' : 'Enviado'
      setCampaigns(prev => prev.map(c =>
        c.id === campaign.id
          ? { ...c, status: finalStatus, sentCount: result.sent ?? 0, failedCount: result.failed ?? 0, recipientsLog: log }
          : c
      ))
      void updateCampaignInDb(campaign.id, {
        status: finalStatus,
        sent_count: result.sent ?? 0,
        failed_count: result.failed ?? 0,
        recipients_log: log,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro de rede'
      const fallbackLog: DispatchRecipientLog[] = validLeads.map(r => ({
        email: r.email,
        nome: r.nome,
        empresa: r.empresa,
        status: 'failed',
        error: errorMsg,
      }))
      setCampaigns(prev => prev.map(c =>
        c.id === campaign.id ? { ...c, status: 'Erro', sentCount: 0, failedCount: validLeads.length, recipientsLog: fallbackLog } : c
      ))
      void updateCampaignInDb(campaign.id, {
        status: 'Erro',
        sent_count: 0,
        failed_count: validLeads.length,
        recipients_log: fallbackLog,
      })
    }
  }

  const handleDeleteCampaign = (campaign: DispatchCampaign) => {
    setConfirmDialog({
      title: 'Excluir campanha',
      message: `Excluir "${campaign.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        await supabase.from(DISPATCHES_TABLE).delete().eq('id', campaign.id)
        setCampaigns(prev => prev.filter(c => c.id !== campaign.id))
        setDetailCampaign(cur => (cur && cur.id === campaign.id ? null : cur))
      },
    })
  }

  const handleRenameCampaign = async (campaign: DispatchCampaign) => {
    const next = window.prompt('Novo nome da campanha:', campaign.name)
    if (!next) return
    const trimmed = next.trim()
    if (!trimmed || trimmed === campaign.name) return
    await updateCampaignInDb(campaign.id, { name: trimmed })
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, name: trimmed } : c))
  }

  const handleDuplicateCampaign = async (campaign: DispatchCampaign) => {
    const { data, error: insertError } = await supabase
      .from(DISPATCHES_TABLE)
      .insert({
        name: `${campaign.name} (cópia)`,
        channel: campaign.channel,
        subject: campaign.subject,
        message: campaign.message,
        stage_filter: campaign.stageFilter,
        attempt_filter: campaign.attemptFilter,
        qualification_filter: campaign.qualificationFilter,
        status: 'Rascunho',
        sent_count: 0,
        failed_count: 0,
      })
      .select()
      .single()
    if (insertError || !data) return
    setCampaigns(prev => [mapDispatchRow(data as DispatchRow), ...prev])
  }

  const handleResendCampaign = (campaign: DispatchCampaign) => {
    setConfirmDialog({
      title: 'Reenviar campanha',
      message: `Reenviar "${campaign.name}" para os destinatários atuais? O log do envio anterior será sobrescrito.`,
      confirmLabel: 'Reenviar',
      cancelLabel: 'Cancelar',
      variant: 'primary',
      onConfirm: () => {
        void handleSendCampaign(campaign)
      },
    })
  }

  const handleUpdateCampaign = async (updated: DispatchCampaign) => {
    await updateCampaignInDb(updated.id, {
      name: updated.name,
      channel: updated.channel,
      subject: updated.subject,
      message: updated.message,
      stage_filter: updated.stageFilter,
      attempt_filter: updated.attemptFilter,
      qualification_filter: updated.qualificationFilter,
      extra_emails: updated.extraEmails ?? [],
      excluded_emails: updated.excludedEmails ?? [],
    })
    setCampaigns(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))
    setEditingCampaign(null)
    // Se o detail modal estava aberto na mesma campanha, atualiza ele também
    setDetailCampaign(cur => (cur && cur.id === updated.id ? { ...cur, ...updated } : cur))
  }

  return (
    <div className="forms-module dispatches-module">
      <header className="forms-module-header">
        <div>
          <h2 id="active-module-title">Disparos</h2>
        </div>
        <div className="links-header-actions">
          <button
            className="crm-add-btn crm-add-icon-btn"
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
            aria-label="Criar disparo"
            title="Criar disparo"
          >
            <DispatchPlusIcon />
          </button>
        </div>
      </header>

      <section className="dispatches-sheet" aria-label="Campanhas de disparo">
        <div className="dispatches-sheet-header">
          <span>Campanha</span>
          <span>Canal</span>
          <span>Público</span>
          <span>Status</span>
          <span>Destinatários</span>
          <span>Criado em</span>
          <span></span>
        </div>

        {loading ? (
          <div className="links-sheet-empty">Carregando leads do CRM...</div>
        ) : error ? (
          <div className="links-sheet-empty">{error}</div>
        ) : campaigns.length > 0 ? (
          <div className="links-sheet-body">
            {campaigns.map(campaign => (
              <div
                className="dispatches-sheet-row"
                key={campaign.id}
                onClick={(event) => {
                  // ignora cliques dentro da coluna de ação (botão Enviar/Reenviar)
                  const target = event.target as globalThis.Element | null
                  if (target && target.closest('.dispatches-sheet-action')) return
                  setDetailCampaign(campaign)
                }}
                onContextMenu={(event) => {
                  event.preventDefault()
                  const menuWidth = 200
                  const menuHeight = 200
                  const x = Math.min(event.clientX, window.innerWidth - menuWidth - 8)
                  const y = Math.min(event.clientY, window.innerHeight - menuHeight - 8)
                  setContextMenu({ campaign, x, y })
                }}
              >
                <strong>{campaign.name}</strong>
                <span>{campaign.channel}</span>
                <span>{getDispatchAudienceLabel(campaign)}</span>
                <span className={`dispatch-status dispatch-status--${campaign.status.toLowerCase().replace('ã', 'a').replace('í', 'i')}`}>
                  {campaign.status}
                </span>
                <span>
                  {campaign.status === 'Enviado'
                    ? `${campaign.sentCount ?? campaign.validRecipientCount} enviados${(campaign.failedCount ?? 0) > 0 ? ` · ${campaign.failedCount} falhas` : ''}`
                    : `${campaign.validRecipientCount}/${campaign.recipientCount}`
                  }
                </span>
                <span>{new Date(campaign.createdAt).toLocaleDateString('pt-BR')}</span>
                <span className="dispatches-sheet-action">
                  {campaign.status === 'Rascunho' && (
                    <button
                      type="button"
                      className="dispatch-send-btn"
                      onClick={() => handleSendCampaign(campaign)}
                      title="Enviar campanha"
                    >
                      Enviar
                    </button>
                  )}
                  {campaign.status === 'Enviando' && (
                    <span className="dispatch-sending-indicator">Enviando…</span>
                  )}
                  {campaign.status === 'Erro' && (
                    <button
                      type="button"
                      className="dispatch-send-btn dispatch-send-btn--retry"
                      onClick={() => handleSendCampaign({ ...campaign, status: 'Rascunho' })}
                      title="Tentar novamente"
                    >
                      Tentar novamente
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="links-sheet-empty">Nenhum disparo criado ainda.</div>
        )}
      </section>

      {isCreateModalOpen && (
        <DispatchCreateModal
          leads={leads}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCampaign}
        />
      )}

      {contextMenu && (
        <div
          ref={ctxMenuRef}
          className="board-card-ctx-menu dispatch-ctx-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 200,
          }}
        >
          <button
            type="button"
            disabled={contextMenu.campaign.status === 'Enviando'}
            onClick={() => {
              const c = contextMenu.campaign
              setContextMenu(null)
              handleResendCampaign(c)
            }}
          >
            Reenviar
          </button>
          <button
            type="button"
            onClick={() => {
              const c = contextMenu.campaign
              setContextMenu(null)
              setEditingCampaign(c)
            }}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => {
              const c = contextMenu.campaign
              setContextMenu(null)
              void handleDuplicateCampaign(c)
            }}
          >
            Duplicar
          </button>
          <button
            type="button"
            className="board-card-ctx-delete"
            onClick={() => {
              const c = contextMenu.campaign
              setContextMenu(null)
              void handleDeleteCampaign(c)
            }}
          >
            Excluir
          </button>
        </div>
      )}

      {detailCampaign && (
        <DispatchDetailModal
          campaign={detailCampaign}
          leads={leads}
          onClose={() => setDetailCampaign(null)}
          onResend={(c) => {
            setDetailCampaign(null)
            handleResendCampaign(c)
          }}
          onEdit={(c) => {
            setEditingCampaign(c)
          }}
          onDuplicate={async (c) => {
            await handleDuplicateCampaign(c)
            setDetailCampaign(null)
          }}
          onDelete={(c) => {
            handleDeleteCampaign(c)
          }}
        />
      )}

      {editingCampaign && (
        <DispatchEditModal
          campaign={editingCampaign}
          leads={leads}
          onClose={() => setEditingCampaign(null)}
          onSave={handleUpdateCampaign}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          {...confirmDialog}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}

function DispatchDetailModal({
  campaign,
  leads,
  onClose,
  onResend,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  campaign: DispatchCampaign
  leads: CrmLead[]
  onClose: () => void
  onResend: (campaign: DispatchCampaign) => void
  onEdit: (campaign: DispatchCampaign) => void
  onDuplicate: (campaign: DispatchCampaign) => void | Promise<void>
  onDelete: (campaign: DispatchCampaign) => void | Promise<void>
}) {
  const audience = getDispatchAudience(
    leads,
    campaign.stageFilter,
    campaign.attemptFilter,
    campaign.qualificationFilter,
  )
  const validNow = getDispatchValidRecipients(audience, campaign.channel)
  const log = campaign.recipientsLog ?? []
  const sentInLog = log.filter(r => r.status === 'sent').length
  const failedInLog = log.filter(r => r.status === 'failed').length
  const hasLog = log.length > 0

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal dispatches-modal dispatch-detail-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header dispatch-detail-header">
          <h3>{campaign.name}</h3>
          <div className="dispatch-detail-actions">
            <button
              type="button"
              className="dispatch-action-btn"
              disabled={campaign.status === 'Enviando'}
              onClick={() => onResend(campaign)}
              title="Reenviar"
              aria-label="Reenviar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
            <button
              type="button"
              className="dispatch-action-btn"
              onClick={() => onEdit(campaign)}
              title="Editar"
              aria-label="Editar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
            <button
              type="button"
              className="dispatch-action-btn"
              onClick={() => void onDuplicate(campaign)}
              title="Duplicar"
              aria-label="Duplicar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button
              type="button"
              className="dispatch-action-btn dispatch-action-btn--danger"
              onClick={() => void onDelete(campaign)}
              title="Excluir"
              aria-label="Excluir"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
            <span className="dispatch-detail-divider" aria-hidden="true" />
            <button onClick={onClose} type="button" className="crm-modal-close" aria-label="Fechar">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="dispatch-detail-body">
          <div className="dispatch-detail-meta">
            <div className="dispatch-detail-meta-item">
              <span>Canal</span>
              <strong>{campaign.channel}</strong>
            </div>
            <div className="dispatch-detail-meta-item">
              <span>Status</span>
              <strong>{campaign.status}</strong>
            </div>
            <div className="dispatch-detail-meta-item">
              <span>Público</span>
              <strong>{getDispatchAudienceLabel(campaign)}</strong>
            </div>
            <div className="dispatch-detail-meta-item">
              <span>Criado em</span>
              <strong>{new Date(campaign.createdAt).toLocaleString('pt-BR')}</strong>
            </div>
          </div>

          {campaign.subject && (
            <div className="dispatch-detail-section">
              <span className="dispatch-detail-label">Assunto</span>
              <p className="dispatch-detail-subject">{campaign.subject}</p>
            </div>
          )}

          <div className="dispatch-detail-section">
            <span className="dispatch-detail-label">Mensagem</span>
            <pre className="dispatch-detail-message">{campaign.message}</pre>
          </div>

          <div className="dispatch-detail-stats">
            <div className="dispatch-stat">
              <strong>{hasLog ? sentInLog : (campaign.sentCount ?? 0)}</strong>
              <span>enviados</span>
            </div>
            <div className="dispatch-stat dispatch-stat--failed">
              <strong>{hasLog ? failedInLog : (campaign.failedCount ?? 0)}</strong>
              <span>falhas</span>
            </div>
            <div className="dispatch-stat">
              <strong>{validNow.length}</strong>
              <span>elegíveis agora</span>
            </div>
          </div>

          {hasLog ? (
            <div className="dispatch-detail-section">
              <span className="dispatch-detail-label">
                Destinatários do último envio ({log.length})
              </span>
              <div className="dispatch-recipients-list">
                {log.map((r, i) => (
                  <div key={`${r.email}-${i}`} className={`dispatch-recipient dispatch-recipient--${r.status}`}>
                    <div className="dispatch-recipient-info">
                      <strong>{r.nome || r.email}</strong>
                      <span className="dispatch-recipient-meta">
                        {r.empresa && <>{r.empresa} · </>}
                        {r.email}
                      </span>
                      {r.status === 'failed' && r.error && (
                        <span className="dispatch-recipient-error">{r.error}</span>
                      )}
                    </div>
                    <span className={`dispatch-recipient-badge dispatch-recipient-badge--${r.status}`}>
                      {r.status === 'sent' ? 'Enviado' : 'Falha'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="dispatch-detail-section">
              <span className="dispatch-detail-label">
                Vai enviar para ({validNow.length})
              </span>
              {validNow.length > 0 ? (
                <div className="dispatch-recipients-list">
                  {validNow.map(lead => (
                    <div key={lead.id} className="dispatch-recipient">
                      <div className="dispatch-recipient-info">
                        <strong>{lead.name}</strong>
                        <span className="dispatch-recipient-meta">
                          {lead.company && <>{lead.company} · </>}
                          {campaign.channel === 'E-mail' ? lead.email : lead.phone}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="dispatch-recipients-empty">
                  Nenhum lead elegível com os filtros atuais.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DispatchEditModal({
  campaign,
  leads,
  onClose,
  onSave,
}: {
  campaign: DispatchCampaign
  leads: CrmLead[]
  onClose: () => void
  onSave: (campaign: DispatchCampaign) => Promise<void>
}) {
  const [name, setName] = useState(campaign.name)
  const [channel, setChannel] = useState<DispatchChannel>(campaign.channel)
  const [stageFilter, setStageFilter] = useState<DispatchStageFilter>(campaign.stageFilter)
  const [attemptFilter, setAttemptFilter] = useState<DispatchAttemptFilter>(campaign.attemptFilter)
  const [qualificationFilter, setQualificationFilter] = useState<DispatchQualificationFilter>(campaign.qualificationFilter)
  const [subject, setSubject] = useState(campaign.subject)
  const [message, setMessage] = useState(campaign.message)
  const [extraEmails, setExtraEmails] = useState<string[]>(campaign.extraEmails ?? [])
  const [excludedEmails, setExcludedEmails] = useState<string[]>(campaign.excludedEmails ?? [])
  const [extraInput, setExtraInput] = useState('')
  const [error, setError] = useState('')

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Audiência atualizada conforme filtros mudam
  const audience = getDispatchAudience(leads, stageFilter, attemptFilter, qualificationFilter)
  const validInAudience = getDispatchValidRecipients(audience, channel)

  const excludedSet = new Set(excludedEmails.map(e => e.toLowerCase()))
  const activeFromFilter = validInAudience.filter(l => !excludedSet.has(l.email.toLowerCase()))
  const excludedFromFilter = validInAudience.filter(l => excludedSet.has(l.email.toLowerCase()))
  const totalFinal = activeFromFilter.length + extraEmails.length

  const addExtra = () => {
    const e = extraInput.trim().toLowerCase()
    if (!e) return
    if (!isValidEmail(e)) {
      setError('E-mail inválido.')
      return
    }
    if (extraEmails.some(x => x.toLowerCase() === e)) {
      setError('E-mail já adicionado.')
      return
    }
    setExtraEmails(prev => [...prev, e])
    setExtraInput('')
    setError('')
  }

  const removeExtra = (email: string) => {
    setExtraEmails(prev => prev.filter(e => e.toLowerCase() !== email.toLowerCase()))
  }

  const excludeLead = (email: string) => {
    setExcludedEmails(prev => [...prev, email])
  }

  const restoreLead = (email: string) => {
    setExcludedEmails(prev => prev.filter(e => e.toLowerCase() !== email.toLowerCase()))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanName = name.trim()
    const cleanSubject = subject.trim()
    const cleanMessage = message.trim()

    if (!cleanName) {
      setError('Informe o nome da campanha.')
      return
    }
    if (channel === 'E-mail' && !cleanSubject) {
      setError('Informe o assunto do e-mail.')
      return
    }
    if (!cleanMessage) {
      setError('Escreva a mensagem do disparo.')
      return
    }

    void onSave({
      ...campaign,
      name: cleanName,
      channel,
      stageFilter,
      attemptFilter,
      qualificationFilter,
      subject: cleanSubject,
      message: cleanMessage,
      extraEmails,
      excludedEmails,
    })
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal dispatches-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>Editar campanha</h3>
          <button onClick={onClose} type="button" className="crm-modal-close" aria-label="Fechar">
            <CloseIcon />
          </button>
        </div>

        <form className="crm-modal-form dispatches-modal-form" onSubmit={handleSubmit}>
          <section className="dispatches-modal-section">
            <span>Canal</span>
            <div className="dispatch-channel-options">
              {(['WhatsApp', 'E-mail'] as DispatchChannel[]).map(option => (
                <button
                  key={option}
                  type="button"
                  className={channel === option ? 'active' : ''}
                  onClick={() => {
                    setChannel(option)
                    setError('')
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className="dispatches-modal-section">
            <span>Público do CRM</span>
            <label>
              Nome da campanha
              <input value={name} onChange={event => setName(event.target.value)} placeholder="Prospecção - Leads novos" />
            </label>
            <div className="crm-modal-row">
              <label>
                Estágio
                <select value={stageFilter} onChange={event => setStageFilter(event.target.value as DispatchStageFilter)}>
                  <option value="Todos">Todos</option>
                  {CRM_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                </select>
              </label>
              <label>
                Tentativas
                <select value={attemptFilter} onChange={event => setAttemptFilter(event.target.value as DispatchAttemptFilter)}>
                  <option value="Todos">Todos</option>
                  <option value="Sem tentativa">Sem tentativa</option>
                  <option value="1 tentativa">1 tentativa</option>
                  <option value="2 tentativas">2 tentativas</option>
                  <option value="3 tentativas">3 tentativas</option>
                </select>
              </label>
            </div>
            <label>
              Qualificação
              <select value={qualificationFilter} onChange={event => setQualificationFilter(event.target.value as DispatchQualificationFilter)}>
                <option value="Todos">Todos</option>
                <option value="Qualificados">Qualificados</option>
                <option value="Nao qualificados">Não qualificados</option>
              </select>
            </label>
          </section>

          <section className="dispatches-modal-section">
            <span>Mensagem</span>
            {channel === 'E-mail' && (
              <label>
                Assunto
                <input value={subject} onChange={event => setSubject(event.target.value)} placeholder="Próximo passo para a {empresa}" />
              </label>
            )}
            <label>
              Mensagem
              <textarea
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder={channel === 'E-mail' ? 'Olá {nome}, tudo bem?' : 'Oi {nome}, tudo bem?'}
                rows={5}
              />
            </label>
            <p className="dispatches-modal-hint">Variáveis disponíveis: {'{nome}'} e {'{empresa}'}</p>
          </section>

          {channel === 'E-mail' && (
            <section className="dispatches-modal-section">
              <span>Destinatários ({totalFinal})</span>

              {/* Adicionar extra */}
              <div className="dispatch-extras-add">
                <input
                  type="email"
                  value={extraInput}
                  onChange={event => {
                    setExtraInput(event.target.value)
                    if (error) setError('')
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addExtra()
                    }
                  }}
                  placeholder="adicionar@email.com"
                />
                <button type="button" onClick={addExtra}>+ Adicionar</button>
              </div>

              {extraEmails.length > 0 && (
                <div className="dispatch-recipients-block">
                  <span className="dispatch-recipients-block-label">Extras ({extraEmails.length})</span>
                  <div className="dispatch-recipients-mini-list">
                    {extraEmails.map(email => (
                      <div key={email} className="dispatch-recipient-chip">
                        <span>{email}</span>
                        <button
                          type="button"
                          aria-label={`Remover ${email}`}
                          onClick={() => removeExtra(email)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="dispatch-recipients-block">
                <span className="dispatch-recipients-block-label">
                  Da audiência ({activeFromFilter.length} ativos · {excludedFromFilter.length} excluídos)
                </span>
                {validInAudience.length === 0 ? (
                  <p className="dispatch-recipients-empty">
                    Nenhum lead elegível com os filtros atuais.
                  </p>
                ) : (
                  <div className="dispatch-recipients-mini-list">
                    {validInAudience.map(lead => {
                      const isExcluded = excludedSet.has(lead.email.toLowerCase())
                      return (
                        <div
                          key={lead.id}
                          className={`dispatch-recipient-chip${isExcluded ? ' dispatch-recipient-chip--excluded' : ''}`}
                        >
                          <span>
                            <strong>{lead.name}</strong>
                            {lead.company && <> · {lead.company}</>}
                            {' · '}
                            {lead.email}
                          </span>
                          {isExcluded ? (
                            <button
                              type="button"
                              className="dispatch-recipient-chip-restore"
                              onClick={() => restoreLead(lead.email)}
                            >
                              Restaurar
                            </button>
                          ) : (
                            <button
                              type="button"
                              aria-label={`Excluir ${lead.email}`}
                              onClick={() => excludeLead(lead.email)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="dispatches-review">
            <div>
              <span>Filtro</span>
              <strong>{activeFromFilter.length}</strong>
            </div>
            <div>
              <span>Extras</span>
              <strong>{extraEmails.length}</strong>
            </div>
            <div>
              <span>Excluídos</span>
              <strong>{excludedFromFilter.length}</strong>
            </div>
            <div>
              <span>Total final</span>
              <strong>{totalFinal}</strong>
            </div>
          </section>

          {error && <p className="crm-modal-error">{error}</p>}

          <div className="crm-modal-footer">
            <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
            <button type="submit" className="crm-modal-submit">Salvar alterações</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  onConfirm,
  onClose,
}: ConfirmDialogState & { onClose: () => void }) {
  // Esc fecha; Enter confirma
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onConfirm?.()
        onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, onConfirm])

  const showCancel = cancelLabel !== null

  return (
    <div className="crm-modal-backdrop confirm-dialog-backdrop" onClick={onClose}>
      <div
        className={`confirm-dialog confirm-dialog--${variant}`}
        role="alertdialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={event => event.stopPropagation()}
      >
        <div className="confirm-dialog-icon" aria-hidden="true">
          {variant === 'danger' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : variant === 'info' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
        </div>

        <h3 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h3>
        <p id="confirm-dialog-message" className="confirm-dialog-message">{message}</p>

        <div className="confirm-dialog-footer">
          {showCancel && (
            <button
              type="button"
              className="confirm-dialog-cancel"
              onClick={onClose}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`confirm-dialog-confirm confirm-dialog-confirm--${variant}`}
            autoFocus
            onClick={() => {
              onConfirm?.()
              onClose()
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function DispatchCreateModal({
  leads,
  onClose,
  onCreate,
}: {
  leads: CrmLead[]
  onClose: () => void
  onCreate: (campaign: DispatchCampaign) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<DispatchChannel>('WhatsApp')
  const [stageFilter, setStageFilter] = useState<DispatchStageFilter>('Todos')
  const [attemptFilter, setAttemptFilter] = useState<DispatchAttemptFilter>('Todos')
  const [qualificationFilter, setQualificationFilter] = useState<DispatchQualificationFilter>('Todos')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const audience = getDispatchAudience(leads, stageFilter, attemptFilter, qualificationFilter)
  const validRecipients = getDispatchValidRecipients(audience, channel)
  const invalidRecipients = audience.length - validRecipients.length

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanName = name.trim()
    const cleanSubject = subject.trim()
    const cleanMessage = message.trim()

    if (!cleanName) {
      setError('Informe o nome da campanha.')
      return
    }

    if (channel === 'E-mail' && !cleanSubject) {
      setError('Informe o assunto do e-mail.')
      return
    }

    if (!cleanMessage) {
      setError('Escreva a mensagem do disparo.')
      return
    }

    if (validRecipients.length === 0) {
      setError(channel === 'E-mail'
        ? 'Nenhum lead desse filtro tem e-mail válido.'
        : 'Nenhum lead desse filtro tem WhatsApp válido.'
      )
      return
    }

    onCreate({
      id: genId(),
      name: cleanName,
      channel,
      stageFilter,
      attemptFilter,
      qualificationFilter,
      subject: cleanSubject,
      message: cleanMessage,
      recipientCount: audience.length,
      validRecipientCount: validRecipients.length,
      status: 'Rascunho',
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal dispatches-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>Novo disparo</h3>
          <button onClick={onClose} type="button" className="crm-modal-close">
            <CloseIcon />
          </button>
        </div>

        <form className="crm-modal-form dispatches-modal-form" onSubmit={handleSubmit}>
          <section className="dispatches-modal-section">
            <span>Canal</span>
            <div className="dispatch-channel-options">
              {(['WhatsApp', 'E-mail'] as DispatchChannel[]).map(option => (
                <button
                  key={option}
                  type="button"
                  className={channel === option ? 'active' : ''}
                  onClick={() => {
                    setChannel(option)
                    setError('')
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className="dispatches-modal-section">
            <span>Público do CRM</span>
            <label>
              Nome da campanha
              <input value={name} onChange={event => setName(event.target.value)} placeholder="Prospecção - Leads novos" />
            </label>
            <div className="crm-modal-row">
              <label>
                Estágio
                <select value={stageFilter} onChange={event => setStageFilter(event.target.value as DispatchStageFilter)}>
                  <option value="Todos">Todos</option>
                  {CRM_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                </select>
              </label>
              <label>
                Tentativas
                <select value={attemptFilter} onChange={event => setAttemptFilter(event.target.value as DispatchAttemptFilter)}>
                  <option value="Todos">Todos</option>
                  <option value="Sem tentativa">Sem tentativa</option>
                  <option value="1 tentativa">1 tentativa</option>
                  <option value="2 tentativas">2 tentativas</option>
                  <option value="3 tentativas">3 tentativas</option>
                </select>
              </label>
            </div>
            <label>
              Qualificação
              <select value={qualificationFilter} onChange={event => setQualificationFilter(event.target.value as DispatchQualificationFilter)}>
                <option value="Todos">Todos</option>
                <option value="Qualificados">Qualificados</option>
                <option value="Nao qualificados">Não qualificados</option>
              </select>
            </label>
          </section>

          <section className="dispatches-modal-section">
            <span>Mensagem</span>
            {channel === 'E-mail' && (
              <label>
                Assunto
                <input value={subject} onChange={event => setSubject(event.target.value)} placeholder="Próximo passo para a {empresa}" />
              </label>
            )}
            <label>
              Mensagem
              <textarea
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder={channel === 'E-mail' ? 'Olá {nome}, tudo bem?' : 'Oi {nome}, tudo bem?'}
                rows={5}
              />
            </label>
            <p className="dispatches-modal-hint">Variáveis disponíveis: {'{nome}'} e {'{empresa}'}</p>
          </section>

          <section className="dispatches-review">
            <div>
              <span>Base</span>
              <strong>{audience.length}</strong>
            </div>
            <div>
              <span>Válidos</span>
              <strong>{validRecipients.length}</strong>
            </div>
            <div>
              <span>Sem contato</span>
              <strong>{invalidRecipients}</strong>
            </div>
            <div>
              <span>Canal</span>
              <strong>{channel}</strong>
            </div>
          </section>

          {error && <p className="crm-modal-error">{error}</p>}

          <div className="crm-modal-footer">
            <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
            <button type="submit" className="crm-modal-submit">Salvar rascunho</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const FINANCE_TABS: FinanceTab[] = ['Visão geral', 'Entradas', 'Saídas', 'Relatórios']
const FINANCE_STATUSES: FinanceStatus[] = ['Pendente', 'Parcial', 'Pago', 'Cancelado']
const FINANCE_TYPES: FinanceRecordType[] = ['Fixa', 'Variável', 'Rendimento', 'Dívida']

function formatFinanceCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatFinanceDate(value: string) {
  if (!value) return '-'
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}/${month}/${year}` : value
}

function getFinanceStatusTone(status: FinanceStatus) {
  if (status === 'Pago') return 'paid'
  if (status === 'Parcial') return 'partial'
  if (status === 'Cancelado') return 'cancelled'
  return 'pending'
}

function mapFinanceRecord(row: FinanceRecordRow): FinanceRecord {
  const kind = row.kind === 'saida' ? 'saida' : 'entrada'
  const status = FINANCE_STATUSES.includes(row.status as FinanceStatus) ? row.status as FinanceStatus : 'Pendente'
  const type = FINANCE_TYPES.includes(row.type as FinanceRecordType) ? row.type as FinanceRecordType : 'Fixa'

  return {
    id: row.id,
    kind,
    name: row.name ?? '',
    category: row.category ?? '',
    account: row.account ?? 'Principal',
    value: Number(row.value ?? 0),
    date: row.record_date ?? '',
    status,
    type,
    note: row.note ?? '',
  }
}

function FinanceiroModule() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('Visão geral')
  const [records, setRecords] = useState<FinanceRecord[]>([])
  const [createKind, setCreateKind] = useState<FinanceKind | null>(null)
  const [loading, setLoading] = useState(true)
  const [financeError, setFinanceError] = useState('')

  const loadFinanceRecords = async () => {
    setLoading(true)
    setFinanceError('')

    const { data, error } = await supabase
      .from(FINANCE_RECORDS_TABLE)
      .select('id, kind, name, category, account, value, record_date, status, type, note')
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      setRecords([])
      setFinanceError('Não consegui carregar o financeiro. Execute o SQL de criação da tabela.')
      setLoading(false)
      return
    }

    setRecords((data ?? []).map(row => mapFinanceRecord(row as FinanceRecordRow)))
    setLoading(false)
  }

  useEffect(() => { void loadFinanceRecords() }, [])

  const entries = records.filter(record => record.kind === 'entrada')
  const expenses = records.filter(record => record.kind === 'saida')
  const totalEntries = entries.filter(record => record.status !== 'Cancelado').reduce((sum, record) => sum + record.value, 0)
  const totalExpenses = expenses.filter(record => record.status !== 'Cancelado').reduce((sum, record) => sum + record.value, 0)
  const pendingEntries = entries.filter(record => record.status === 'Pendente' || record.status === 'Parcial').reduce((sum, record) => sum + record.value, 0)
  const pendingExpenses = expenses.filter(record => record.status === 'Pendente' || record.status === 'Parcial').reduce((sum, record) => sum + record.value, 0)
  const balance = totalEntries - totalExpenses
  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date))
  const nextEntries = sortedRecords.filter(record => record.kind === 'entrada' && record.status !== 'Pago' && record.status !== 'Cancelado').slice(0, 4)
  const nextExpenses = sortedRecords.filter(record => record.kind === 'saida' && record.status !== 'Pago' && record.status !== 'Cancelado').slice(0, 4)

  const handleCreateRecord = async (record: Omit<FinanceRecord, 'id'>) => {
    setFinanceError('')

    const { data, error } = await supabase
      .from(FINANCE_RECORDS_TABLE)
      .insert({
        kind: record.kind,
        name: record.name,
        category: record.category,
        account: record.account,
        value: record.value,
        record_date: record.date,
        status: record.status,
        type: record.type,
        note: record.note ?? '',
      })
      .select('id, kind, name, category, account, value, record_date, status, type, note')
      .single()

    if (error || !data) {
      setFinanceError('Não consegui salvar esse lançamento no Supabase.')
      throw new Error('Não consegui salvar esse lançamento no Supabase.')
    }

    setRecords(current => [mapFinanceRecord(data as FinanceRecordRow), ...current])
    setCreateKind(null)
  }

  const handleStatusChange = async (recordId: string, status: FinanceStatus) => {
    const previousRecords = records
    setRecords(current => current.map(record => record.id === recordId ? { ...record, status } : record))

    const { error } = await supabase
      .from(FINANCE_RECORDS_TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', recordId)

    if (error) {
      setRecords(previousRecords)
      setFinanceError('Não consegui atualizar o status no Supabase.')
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    const previousRecords = records
    setRecords(current => current.filter(record => record.id !== recordId))

    const { error } = await supabase
      .from(FINANCE_RECORDS_TABLE)
      .delete()
      .eq('id', recordId)

    if (error) {
      setRecords(previousRecords)
      setFinanceError('Não consegui excluir esse lançamento no Supabase.')
    }
  }

  return (
    <div className="finance-module">
      <header className="finance-module-header">
        <div>
          <h2 id="active-module-title">Financeiro</h2>
        </div>
        <div className="finance-header-actions">
          {financeError && <span className="crm-global-error">{financeError}</span>}
          <button
            className="crm-add-btn crm-add-icon-btn"
            onClick={() => setCreateKind(activeTab === 'Saídas' ? 'saida' : 'entrada')}
            type="button"
            aria-label={activeTab === 'Saídas' ? 'Nova saída' : 'Nova entrada'}
            title={activeTab === 'Saídas' ? 'Nova saída' : 'Nova entrada'}
          >
            <FinancePlusIcon />
          </button>
        </div>
      </header>

      <nav className="finance-tabs" aria-label="Navegação do financeiro">
        {FINANCE_TABS.map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'finance-tab active' : 'finance-tab'}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="crm-loading">Carregando financeiro...</div>
      ) : activeTab === 'Visão geral' ? (
        <div className="finance-overview">
          <section className="finance-summary-grid">
            <FinanceSummaryCard label="Entradas" value={formatFinanceCurrency(totalEntries)} helper={`${formatFinanceCurrency(pendingEntries)} a receber`} />
            <FinanceSummaryCard label="Saídas" value={formatFinanceCurrency(totalExpenses)} helper={`${formatFinanceCurrency(pendingExpenses)} a pagar`} />
            <FinanceSummaryCard label="Balanço" value={formatFinanceCurrency(balance)} helper="Resultado previsto do período" tone={balance >= 0 ? 'positive' : 'negative'} />
          </section>

          <section className="finance-daily-grid">
            <FinanceMiniList title="Próximas entradas" items={nextEntries} empty="Nenhuma entrada pendente." />
            <FinanceMiniList title="Próximas saídas" items={nextExpenses} empty="Nenhuma saída pendente." />
          </section>
        </div>
      ) : activeTab === 'Entradas' ? (
        <FinanceRecordsTable kind="entrada" records={entries} onCreate={() => setCreateKind('entrada')} onDelete={handleDeleteRecord} onStatusChange={handleStatusChange} />
      ) : activeTab === 'Saídas' ? (
        <FinanceRecordsTable kind="saida" records={expenses} onCreate={() => setCreateKind('saida')} onDelete={handleDeleteRecord} onStatusChange={handleStatusChange} />
      ) : (
        <FinanceReports records={records} />
      )}

      {createKind && (
        <FinanceCreateModal kind={createKind} onClose={() => setCreateKind(null)} onCreate={handleCreateRecord} />
      )}
    </div>
  )
}

function FinanceSummaryCard({ label, value, helper, tone = 'neutral' }: { label: string; value: string; helper: string; tone?: 'neutral' | 'positive' | 'negative' }) {
  return (
    <article className={`finance-summary-card finance-summary-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  )
}

function FinanceMiniList({ title, items, empty }: { title: string; items: FinanceRecord[]; empty: string }) {
  return (
    <article className="finance-list-card">
      <header>
        <h3>{title}</h3>
      </header>
      {items.length > 0 ? (
        <div className="finance-mini-list">
          {items.map(item => (
            <div className="finance-mini-row" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.category} · {formatFinanceDate(item.date)}</span>
              </div>
              <b>{formatFinanceCurrency(item.value)}</b>
            </div>
          ))}
        </div>
      ) : (
        <p className="finance-empty-text">{empty}</p>
      )}
    </article>
  )
}

function FinanceRecordsTable({
  kind,
  records,
  onCreate,
  onDelete,
  onStatusChange,
}: {
  kind: FinanceKind
  records: FinanceRecord[]
  onCreate: () => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: FinanceStatus) => void
}) {
  return (
    <section className="finance-sheet" aria-label={kind === 'entrada' ? 'Entradas' : 'Saídas'}>
      <div className="finance-sheet-top">
        <h3>{kind === 'entrada' ? 'Entradas' : 'Saídas'}</h3>
        <button className="crm-add-btn crm-add-icon-btn" onClick={onCreate} type="button" aria-label={kind === 'entrada' ? 'Nova entrada' : 'Nova saída'} title={kind === 'entrada' ? 'Nova entrada' : 'Nova saída'}>
          <FinancePlusIcon />
        </button>
      </div>

      <div className="finance-sheet-header">
        <span>Nome</span>
        <span>Data</span>
        <span>Categoria</span>
        <span>Valor</span>
        <span>Status</span>
        <span />
      </div>

      {records.length > 0 ? (
        <div className="finance-sheet-body">
          {records.map(record => (
            <div className="finance-sheet-row" key={record.id}>
              <strong>{record.name}</strong>
              <span>{formatFinanceDate(record.date)}</span>
              <span>{record.category}</span>
              <span>{formatFinanceCurrency(record.value)}</span>
              <select
                className={`finance-status-select finance-status-select--${getFinanceStatusTone(record.status)}`}
                value={record.status}
                onChange={event => onStatusChange(record.id, event.target.value as FinanceStatus)}
                aria-label={`Status de ${record.name}`}
              >
                <option value="Pendente">Pendente</option>
                <option value="Parcial">Parcial</option>
                <option value="Pago">Pago</option>
                <option value="Cancelado">Cancelado</option>
              </select>
              <div className="finance-row-actions">
                <button onClick={() => onDelete(record.id)} type="button" aria-label={`Excluir ${record.name}`} title="Excluir">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="finance-sheet-empty">Nenhum lançamento criado ainda.</div>
      )}
    </section>
  )
}

function FinanceReports({ records }: { records: FinanceRecord[] }) {
  const totalEntries = records.filter(record => record.kind === 'entrada' && record.status !== 'Cancelado').reduce((sum, record) => sum + record.value, 0)
  const totalExpenses = records.filter(record => record.kind === 'saida' && record.status !== 'Cancelado').reduce((sum, record) => sum + record.value, 0)
  const balance = totalEntries - totalExpenses
  const totalPending = records.filter(record => record.status === 'Pendente' || record.status === 'Parcial').reduce((sum, record) => sum + record.value, 0)
  const categoryKeys = Array.from(new Set(records.map(record => `${record.kind}:${record.category}`)))

  return (
    <div className="finance-reports">
      <section className="finance-summary-grid">
        <FinanceSummaryCard label="Entradas" value={formatFinanceCurrency(totalEntries)} helper="Total consolidado" />
        <FinanceSummaryCard label="Saídas" value={formatFinanceCurrency(totalExpenses)} helper="Total consolidado" />
        <FinanceSummaryCard label="Saldo" value={formatFinanceCurrency(balance)} helper={`${formatFinanceCurrency(totalPending)} pendente`} tone={balance >= 0 ? 'positive' : 'negative'} />
      </section>

      <section className="finance-sheet">
        <div className="finance-sheet-top">
          <h3>Resumo por categoria</h3>
        </div>
        <div className="finance-sheet-header finance-sheet-header--report">
          <span>Categoria</span>
          <span>Tipo</span>
          <span>Total</span>
        </div>
        <div className="finance-sheet-body">
          {categoryKeys.map(key => {
            const [kind, category] = key.split(':') as [FinanceKind, string]
            const total = records
              .filter(record => record.kind === kind && record.category === category && record.status !== 'Cancelado')
              .reduce((sum, record) => sum + record.value, 0)

            return (
              <div className="finance-sheet-row finance-sheet-row--report" key={key}>
                <strong>{category}</strong>
                <span>{kind === 'entrada' ? 'Entrada' : 'Saída'}</span>
                <span>{formatFinanceCurrency(total)}</span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function FinanceCreateModal({
  kind,
  onClose,
  onCreate,
}: {
  kind: FinanceKind
  onClose: () => void
  onCreate: (record: Omit<FinanceRecord, 'id'>) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [account, setAccount] = useState('Principal')
  const [value, setValue] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<FinanceStatus>('Pendente')
  const [type, setType] = useState<FinanceRecordType>(kind === 'entrada' ? 'Fixa' : 'Variável')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedValue = Number(value)

    if (!name.trim() || !category.trim() || !date || !Number.isFinite(parsedValue) || parsedValue <= 0) {
      setError('Preencha nome, categoria, data e valor para salvar.')
      return
    }

    setSaving(true)
    try {
      await onCreate({
        kind,
        name: name.trim(),
        category: category.trim(),
        account: account.trim() || 'Principal',
        value: parsedValue,
        date,
        status,
        type,
        note: note.trim(),
      })
    } catch {
      setError('Não consegui salvar esse lançamento agora.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal finance-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>{kind === 'entrada' ? 'Nova entrada' : 'Nova saída'}</h3>
          <button onClick={onClose} type="button" className="crm-modal-close">
            <CloseIcon />
          </button>
        </div>

        <form className="crm-modal-form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input value={name} onChange={event => setName(event.target.value)} placeholder={kind === 'entrada' ? 'Mensalidade cliente' : 'Ferramenta ou despesa'} autoFocus />
          </label>

          <div className="crm-modal-row">
            <label>
              Categoria
              <input value={category} onChange={event => setCategory(event.target.value)} placeholder={kind === 'entrada' ? 'Contrato' : 'Software'} />
            </label>
            <label>
              Conta
              <input value={account} onChange={event => setAccount(event.target.value)} placeholder="Principal" />
            </label>
          </div>

          <div className="crm-modal-row">
            <label>
              Valor
              <input type="number" min="0" step="0.01" value={value} onChange={event => setValue(event.target.value)} placeholder="0,00" />
            </label>
            <label>
              Data
              <input type="date" value={date} onChange={event => setDate(event.target.value)} />
            </label>
          </div>

          <div className="crm-modal-row">
            <label>
              Tipo
              <select value={type} onChange={event => setType(event.target.value as FinanceRecordType)}>
                {kind === 'entrada' ? (
                  <>
                    <option value="Fixa">Fixa</option>
                    <option value="Variável">Variável</option>
                    <option value="Rendimento">Rendimento</option>
                  </>
                ) : (
                  <>
                    <option value="Fixa">Fixa</option>
                    <option value="Variável">Variável</option>
                    <option value="Dívida">Dívida</option>
                  </>
                )}
              </select>
            </label>
            <label>
              Status
              <select value={status} onChange={event => setStatus(event.target.value as FinanceStatus)}>
                <option value="Pendente">Pendente</option>
                <option value="Parcial">Parcial</option>
                <option value="Pago">Pago</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </label>
          </div>

          <label>
            Observação
            <textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Detalhes internos..." rows={3} />
          </label>

          {error && <p className="crm-modal-error">{error}</p>}

          <div className="crm-modal-footer">
            <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
            <button type="submit" disabled={saving} className="crm-modal-submit">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LinksModule() {
  const [links, setLinks] = useState<TrackedLink[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [error, setError] = useState('')
  const [linksError, setLinksError] = useState('')
  const [linksLoading, setLinksLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [copiedLinkId, setCopiedLinkId] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const loadTrackedLinks = async () => {
    setLinksLoading(true)
    setLinksError('')

    const { data: linkRows, error: linkError } = await supabase
      .from('tracked_links')
      .select('id, title, slug, destination_url, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (linkError) {
      setLinks([])
      setLinksError('Não consegui carregar os links do Supabase.')
      setLinksLoading(false)
      return
    }

    const rows = (linkRows ?? []) as TrackedLinkRow[]
    const linkIds = rows.map(link => link.id)
    let clickRows: TrackedClickRow[] = []

    if (linkIds.length > 0) {
      const { data: clicks, error: clicksError } = await supabase
        .from('tracked_link_clicks')
        .select('link_id, source')
        .in('link_id', linkIds)

      if (clicksError) {
        setLinksError('Links carregados, mas não consegui buscar os cliques.')
      } else {
        clickRows = (clicks ?? []) as TrackedClickRow[]
      }
    }

    setLinks(mapTrackedLinks(rows, clickRows))
    setLinksLoading(false)
  }

  useEffect(() => {
    void loadTrackedLinks()
  }, [])

  const handleCreateLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLinksError('')

    const cleanTitle = title.trim()
    const cleanDestination = normalizeDestinationUrl(destinationUrl)
    const cleanSlug = slugify(slug || cleanTitle)

    if (!cleanTitle || !cleanDestination || !cleanSlug) {
      setError('Preencha nome, destino e slug para criar o link.')
      return
    }

    if (links.some(link => link.slug === cleanSlug)) {
      setError('Esse slug já existe. Use outro nome para o link.')
      return
    }

    setActionLoading(true)
    const { data: createdLink, error: insertError } = await supabase
      .from('tracked_links')
      .insert({
        title: cleanTitle,
        slug: cleanSlug,
        destination_url: cleanDestination,
      })
      .select('id, title, slug, destination_url, created_at')
      .single()
    setActionLoading(false)

    if (insertError) {
      setError(insertError.code === '23505' ? 'Esse slug já existe. Use outro nome para o link.' : 'Não consegui salvar o link no Supabase.')
      return
    }

    setLinks(currentLinks => [
      mapTrackedLink(createdLink as TrackedLinkRow, []),
      ...currentLinks,
    ])
    setTitle('')
    setSlug('')
    setDestinationUrl('')
    setIsCreateModalOpen(false)
  }

  const handleCopyLink = async (link: TrackedLink) => {
    const trackedHref = getTrackedLinkHref(link)

    try {
      await navigator.clipboard.writeText(trackedHref)
      setCopiedLinkId(link.id)
      window.setTimeout(() => setCopiedLinkId(''), 1400)
    } catch {
      setCopiedLinkId('')
    }
  }

  const handleDeleteLink = async (link: TrackedLink) => {
    setLinksError('')
    setActionLoading(true)
    const { error: deleteError } = await supabase
      .from('tracked_links')
      .update({ is_active: false })
      .eq('id', link.id)
    setActionLoading(false)

    if (deleteError) {
      setLinksError('Não consegui excluir esse link no Supabase.')
      return
    }

    setLinks(currentLinks => currentLinks.filter(currentLink => currentLink.id !== link.id))
  }

  return (
    <div className="forms-module links-module">
      <header className="forms-module-header">
        <div>
          <h2 id="active-module-title">Links</h2>
        </div>
        <div className="links-header-actions">
          <button
            className="crm-add-btn crm-add-icon-btn"
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
            aria-label="Criar link"
            title="Criar link"
          >
            <LinkPlusIcon />
          </button>
        </div>
      </header>

      <div className="links-workspace">
        <section className="links-sheet" aria-label="Links rastreados">
          <div className="links-sheet-header">
            <span>Nome</span>
            <span>Link rastreado</span>
            <span>Destino</span>
            <span>Cliques</span>
            <span>Origem</span>
            <span />
          </div>

          {linksLoading ? (
            <div className="links-sheet-empty">
              Carregando links...
            </div>
          ) : linksError ? (
            <div className="links-sheet-empty">
              {linksError}
            </div>
          ) : links.length > 0 ? (
            <div className="links-sheet-body">
              {links.map(link => (
                <div className="links-sheet-row" key={link.id}>
                  <strong>{link.title}</strong>
                  <a href={getTrackedLinkPath(link)} target="_blank" rel="noopener noreferrer">
                    {getTrackedLinkHref(link)}
                  </a>
                  <span>{link.destinationUrl}</span>
                  <span>{getTrackedLinkClicks(link)}</span>
                  <span>{getTrackedLinkTopSource(link)}</span>
                  <div className="tracked-link-actions">
                    <button onClick={() => handleCopyLink(link)} type="button" aria-label={`Copiar ${link.title}`} title="Copiar link">
                      {copiedLinkId === link.id ? <CheckIcon /> : <CopyIcon />}
                    </button>
                    <a href={getTrackedLinkPath(link)} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${link.title}`} title="Abrir link">
                      <ExternalLinkIcon />
                    </a>
                    <button disabled={actionLoading} onClick={() => handleDeleteLink(link)} type="button" aria-label={`Excluir ${link.title}`} title="Excluir link">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="links-sheet-empty">
              Nenhum link criado ainda.
            </div>
          )}
        </section>
      </div>

      {isCreateModalOpen && (
        <div className="crm-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="crm-modal" onClick={event => event.stopPropagation()}>
            <div className="crm-modal-header">
              <h3>Novo rastreador</h3>
              <button onClick={() => setIsCreateModalOpen(false)} type="button" className="crm-modal-close">
                <CloseIcon />
              </button>
            </div>

            <form className="crm-modal-form" onSubmit={handleCreateLink}>
              <label>
                Nome
                <input
                  value={title}
                  onChange={event => {
                    setTitle(event.target.value)
                    if (!slug) setError('')
                  }}
                  placeholder="Instagram Bio"
                  autoFocus
                />
              </label>

              <label>
                Link final
                <input
                  value={destinationUrl}
                  onChange={event => {
                    setDestinationUrl(event.target.value)
                    if (error) setError('')
                  }}
                  placeholder="https://instagram.com/inaciocarlos"
                />
              </label>

              <label>
                Slug
                <input
                  value={slug}
                  onChange={event => {
                    setSlug(event.target.value)
                    if (error) setError('')
                  }}
                  placeholder={slugify(title) || 'instagram-bio'}
                />
              </label>

              {error && <p className="crm-modal-error">{error}</p>}

              <div className="crm-modal-footer">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="crm-modal-cancel">
                  Cancelar
                </button>
                <button disabled={actionLoading} type="submit" className="crm-modal-submit">
                  {actionLoading ? 'Salvando...' : 'Criar link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function BoardsModule() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [moduleError, setModuleError] = useState('')
  const [selectedBoardId, setSelectedBoardId] = useState('')
  const [boardName, setBoardName] = useState('')
  const [boardType] = useState<BoardType>('Quadro')
  const [creating, setCreating] = useState(false)
  const [nameError, setNameError] = useState('')
  const [renamingBoardId, setRenamingBoardId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState('')
  const renameCancelledRef = useRef(false)
  const [boardCardMenu, setBoardCardMenu] = useState<{ board: Board; x: number; y: number } | null>(null)

  const loadBoards = async () => {
    setLoading(true)
    setModuleError('')

    const { data, error } = await supabase
      .from('boards')
      .select('id, name, type, nodes, edges, updated_at')
      .order('updated_at', { ascending: false })

    if (error) {
      setModuleError('Não consegui carregar os quadros do Supabase.')
      setLoading(false)
      return
    }

    setBoards((data ?? []).map(row => mapBoardRow(row as BoardRow)))
    setLoading(false)
  }

  useEffect(() => {
    void loadBoards()
  }, [])

  const selectedBoard = boards.find(board => board.id === selectedBoardId) ?? null

  const handleCreateBoard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanName = boardName.trim()
    if (!cleanName) {
      setNameError('Informe um nome para o quadro.')
      return
    }

    setCreating(true)
    setNameError('')

    const { data, error } = await supabase
      .from('boards')
      .insert({ name: cleanName, type: boardType, nodes: [], edges: [] })
      .select('id, name, type, nodes, edges, updated_at')
      .single()

    setCreating(false)

    if (error || !data) {
      setModuleError('Não consegui criar o quadro.')
      return
    }

    const newBoard = mapBoardRow(data as BoardRow)
    setBoards(current => [newBoard, ...current])
    setBoardName('')
    setIsCreateModalOpen(false)
    setSelectedBoardId(newBoard.id)
  }

  const handleBoardSave = (board: Board) => {
    setBoards(current => current.map(b => b.id === board.id ? board : b))
  }

  const handleBoardDelete = async (boardId: string) => {
    const { error } = await supabase.from('boards').delete().eq('id', boardId)
    if (error) {
      setModuleError('Não consegui excluir o quadro. Tente novamente.')
      throw error
    }
    setBoards(current => current.filter(b => b.id !== boardId))
    setSelectedBoardId('')
  }

  const handleRenameStart = (board: Board) => {
    renameCancelledRef.current = false
    setRenamingBoardId(board.id)
    setRenameValue(board.name)
  }

  const handleRenameSubmit = async (event: FormEvent, boardId: string) => {
    event.preventDefault()

    if (renameCancelledRef.current) {
      renameCancelledRef.current = false
      return
    }

    const cleanName = renameValue.trim()
    const current = boards.find(b => b.id === boardId)

    if (!cleanName || cleanName === current?.name) {
      setRenamingBoardId(null)
      return
    }

    const { error } = await supabase.from('boards').update({ name: cleanName }).eq('id', boardId)

    if (error) {
      setModuleError('Não consegui renomear o quadro. Tente novamente.')
      setRenamingBoardId(null)
      return
    }

    setBoards(prev => prev.map(b => b.id === boardId ? { ...b, name: cleanName } : b))
    setRenamingBoardId(null)
  }

  const handleDuplicateBoard = async (board: Board) => {
    setDuplicatingId(board.id)

    const { data, error } = await supabase
      .from('boards')
      .insert({
        name: `${board.name} (cópia)`,
        type: board.type,
        nodes: board.nodes,
        edges: board.edges,
      })
      .select('id, name, type, nodes, edges, updated_at')
      .single()

    setDuplicatingId('')

    if (error || !data) {
      setModuleError('Não consegui duplicar o quadro. Tente novamente.')
      return
    }

    setBoards(prev => [mapBoardRow(data as BoardRow), ...prev])
  }

  const handleEditorRename = async (name: string) => {
    const cleanName = name.trim()
    if (!cleanName || !selectedBoardId) return
    const { error } = await supabase.from('boards').update({ name: cleanName }).eq('id', selectedBoardId)
    if (!error) setBoards(prev => prev.map(b => b.id === selectedBoardId ? { ...b, name: cleanName } : b))
  }

  if (selectedBoard) {
    return (
      <BoardEditor
        board={selectedBoard}
        onBack={() => setSelectedBoardId('')}
        onDelete={() => handleBoardDelete(selectedBoard.id)}
        onRename={handleEditorRename}
        onSave={handleBoardSave}
      />
    )
  }

  return (
    <div className="forms-module boards-module">
      <header className="forms-module-header">
        <div>
          <h2 id="active-module-title">Quadros</h2>
        </div>
        <button
          className="crm-add-btn crm-add-icon-btn"
          onClick={() => setIsCreateModalOpen(true)}
          type="button"
          aria-label="Criar quadro"
          title="Criar quadro"
        >
          <BoardPlusIcon />
        </button>
      </header>

      {moduleError && <p className="links-form-error">{moduleError}</p>}

      <div className="boards-workspace">
        <section className="boards-library" aria-label="Quadros criados">
          {loading ? (
            <p className="boards-empty-state">Carregando quadros...</p>
          ) : boards.length === 0 ? (
            <p className="boards-empty-state">Nenhum quadro criado ainda.</p>
          ) : boards.map(board => (
            <article
              className="board-card"
              key={board.id}
              onClick={() => { if (renamingBoardId !== board.id) setSelectedBoardId(board.id) }}
              onContextMenu={event => {
                event.preventDefault()
                setBoardCardMenu({ board, x: event.clientX, y: event.clientY })
              }}
            >
              <div className="board-card-preview">
                {board.nodes.slice(0, 8).map(node => (
                  <div
                    className="board-card-preview-node"
                    data-kind={node.data.kind}
                    key={node.id}
                    style={{
                      left: `${Math.max(4, Math.min(74, node.position.x / 8))}%`,
                      top: `${Math.max(8, Math.min(74, node.position.y / 5))}%`,
                    }}
                  >
                    {node.data.label}
                  </div>
                ))}
              </div>
              <div className="board-card-info">
                <span>{board.type}</span>
                {renamingBoardId === board.id ? (
                  <form onSubmit={event => handleRenameSubmit(event, board.id)}>
                    <input
                      className="board-card-rename-input"
                      value={renameValue}
                      onChange={event => setRenameValue(event.target.value)}
                      onBlur={event => void handleRenameSubmit(event as unknown as FormEvent, board.id)}
                      onKeyDown={event => {
                        if (event.key === 'Escape') {
                          renameCancelledRef.current = true
                          setRenamingBoardId(null)
                        }
                      }}
                      autoFocus
                    />
                  </form>
                ) : (
                  <h3>{board.name}</h3>
                )}
                <p>{board.nodes.length} blocos · {board.edges.length} conexões · {board.updatedAt}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Context menu para cards de quadro */}
        {boardCardMenu && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 999 }}
              onClick={() => setBoardCardMenu(null)}
              onContextMenu={event => { event.preventDefault(); setBoardCardMenu(null) }}
            />
            <div
              className="board-card-ctx-menu"
              style={{ position: 'fixed', left: boardCardMenu.x, top: boardCardMenu.y, zIndex: 1000 }}
              onClick={event => event.stopPropagation()}
            >
              <button type="button" onClick={() => { setSelectedBoardId(boardCardMenu.board.id); setBoardCardMenu(null) }}>
                Abrir
              </button>
              <button type="button" onClick={() => { handleRenameStart(boardCardMenu.board); setBoardCardMenu(null) }}>
                Renomear
              </button>
              <button
                type="button"
                disabled={duplicatingId === boardCardMenu.board.id}
                onClick={() => { void handleDuplicateBoard(boardCardMenu.board); setBoardCardMenu(null) }}
              >
                {duplicatingId === boardCardMenu.board.id ? 'Duplicando...' : 'Duplicar'}
              </button>
              <button
                type="button"
                className="board-card-ctx-delete"
                onClick={() => {
                  if (window.confirm(`Excluir "${boardCardMenu.board.name}"?`)) {
                    void handleBoardDelete(boardCardMenu.board.id)
                  }
                  setBoardCardMenu(null)
                }}
              >
                Excluir
              </button>
            </div>
          </>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="crm-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="crm-modal" onClick={event => event.stopPropagation()}>
            <div className="crm-modal-header">
              <h3>Novo quadro</h3>
              <button onClick={() => setIsCreateModalOpen(false)} type="button" className="crm-modal-close">
                <CloseIcon />
              </button>
            </div>
            <form className="crm-modal-form" onSubmit={handleCreateBoard}>
              <label>
                Nome
                <input
                  value={boardName}
                  onChange={event => {
                    setBoardName(event.target.value)
                    if (nameError) setNameError('')
                  }}
                  placeholder="Funil principal"
                  autoFocus
                />
              </label>
              {nameError && <p className="crm-modal-error">{nameError}</p>}
              <div className="crm-modal-footer">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="crm-modal-cancel">
                  Cancelar
                </button>
                <button disabled={creating} type="submit" className="crm-modal-submit">
                  {creating ? 'Criando...' : 'Criar quadro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

type ContextMenuState = { screenX: number; screenY: number; flowX: number; flowY: number }

function CanvasWithContextMenu({
  board,
  contextMenu,
  edges,
  nodes,
  selectedEdge,
  selectedNode,
  onAddNode,
  onConnect,
  onReconnect,
  onContextMenuClose,
  onContextMenuOpen,
  onEdgeDelete,
  onEdgeDoubleClick,
  onEdgeUpdate,
  onEdgesChange,
  onNodeClick,
  onNodeDelete,
  onNodeDragStop,
  onNodeDuplicate,
  onNodeUpdate,
  onAlignNodes,
  onGroupNodes,
  onUngroupNodes,
  onNodesChange,
  onNodesDelete,
  onPaneClick,
  onSelectedEdgeClose,
  onSelectedNodeClose,
}: {
  board: Board
  contextMenu: ContextMenuState | null
  edges: Edge[]
  nodes: Node<BoardNodeData>[]
  selectedEdge: Edge | null
  selectedNode: Node<BoardNodeData> | null
  onAddNode: (kind: BoardNodeKind, position: { x: number; y: number }, logoUrl?: string) => void
  onConnect: (connection: Connection) => void
  onReconnect: (oldEdge: Edge, newConnection: Connection) => void
  onContextMenuClose: () => void
  onContextMenuOpen: (menu: ContextMenuState) => void
  onEdgeDelete: (id: string) => void
  onEdgeDoubleClick: (event: React.MouseEvent, edge: Edge) => void
  onEdgeUpdate: (edge: Edge) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onNodeClick: (event: React.MouseEvent, node: Node<BoardNodeData>) => void
  onNodeDelete: (id: string) => void
  onNodeDragStop: (event: React.MouseEvent, node: Node<BoardNodeData>) => void
  onNodeDuplicate: (id: string) => void
  onNodeUpdate: (node: Node<BoardNodeData>) => void
  onAlignNodes: (updates: { id: string; position: { x: number; y: number } }[]) => void
  onGroupNodes: (ids: string[]) => void
  onUngroupNodes: (ids: string[]) => void
  onNodesChange: (changes: NodeChange<Node<BoardNodeData>>[]) => void
  onNodesDelete: (deleted: Node<BoardNodeData>[]) => void
  onPaneClick: () => void
  onSelectedEdgeClose: () => void
  onSelectedNodeClose: () => void
}) {
  const { screenToFlowPosition } = useReactFlow()
  const [tool, setTool] = useState<'select' | 'hand'>('select')
  const reactFlowNodeTypes = useMemo(() => BOARD_NODE_TYPES, [])
  const reactFlowDefaultEdgeOptions = useMemo(() => BOARD_DEFAULT_EDGE_OPTIONS, [])

  /* ⌘ (Mac) → toggle entre select e hand */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' && !e.repeat) {
        setTool(t => t === 'select' ? 'hand' : 'select')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown) }
  }, [])

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    const flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    onContextMenuOpen({ screenX: event.clientX, screenY: event.clientY, flowX: flowPos.x, flowY: flowPos.y })
  }

  const [pendingCustom, setPendingCustom] = useState<{ x: number; y: number } | null>(null)

  const handleMenuSelect = (kind: BoardNodeKind) => {
    if (!contextMenu) return
    const isSource = SOURCE_KINDS.has(kind)
    const offset = isSource ? 30 : 28
    const pos = { x: contextMenu.flowX - offset, y: contextMenu.flowY - offset }

    if (kind === 'Custom') {
      // Intercepta: abre modal de URL antes de criar o node
      setPendingCustom(pos)
      onContextMenuClose()
      return
    }

    onAddNode(kind, pos)
    onContextMenuClose()
  }

  const handleCustomConfirm = (logoUrl: string) => {
    if (!pendingCustom) return
    onAddNode('Custom', pendingCustom, logoUrl)
    setPendingCustom(null)
  }

  // ── Alignment helpers ───────────────────────────────────
  // Alinhamento usa como referência o CENTRO VISUAL do ícone (parte de 60x60
  // no topo do nó, sempre centralizada horizontalmente no bbox). Isso evita
  // que rótulos/observações de comprimentos diferentes desalinhem visualmente.
  const ICON_SIZE = 60
  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes])

  const iconAnchor = (n: Node<BoardNodeData>) => {
    const bboxW = n.measured?.width ?? n.width ?? ICON_SIZE
    // Centro horizontal do ícone = centro horizontal do bbox (ícone é centralizado)
    const cx = n.position.x + bboxW / 2
    // Centro vertical do ícone = topo do bbox + metade do ícone (ícone fica no topo)
    const cy = n.position.y + ICON_SIZE / 2
    return { id: n.id, x: n.position.x, y: n.position.y, bboxW, cx, cy }
  }

  // Dado um novo centro de ícone, recalcula a position (canto superior esquerdo do bbox)
  const posFromAnchor = (a: { bboxW: number; x: number; y: number }, newCx?: number, newCy?: number) => ({
    x: newCx !== undefined ? newCx - a.bboxW / 2 : a.x,
    y: newCy !== undefined ? newCy - ICON_SIZE / 2 : a.y,
  })
  void posFromAnchor // mantido caso de uso futuro

  const clusterCount = useMemo(() => {
    const keys = new Set<string>()
    selectedNodes.forEach(n => keys.add(n.data.groupId ?? `__solo_${n.id}`))
    return keys.size
  }, [selectedNodes])

  const applyAlign = (kind: 'left' | 'centerH' | 'right' | 'top' | 'centerV' | 'bottom' | 'distH' | 'distV') => {
    if (selectedNodes.length < 2) return

    // Agrupa nós selecionados em clusters: nós com mesmo groupId formam 1 cluster;
    // nós sem groupId ficam cada um em seu próprio cluster. Alinhamento opera sobre clusters.
    const clusterMap = new Map<string, Node<BoardNodeData>[]>()
    selectedNodes.forEach(n => {
      const key = n.data.groupId ?? `__solo_${n.id}`
      const arr = clusterMap.get(key) ?? []
      arr.push(n)
      clusterMap.set(key, arr)
    })

    // Computa caixa-âncora de cada cluster (envolve os ícones de todos os membros)
    type Cluster = {
      key: string
      members: Node<BoardNodeData>[]
      left: number; right: number; top: number; bottom: number
      cx: number; cy: number
    }
    const clusters: Cluster[] = Array.from(clusterMap.entries()).map(([key, members]) => {
      const anchors = members.map(iconAnchor)
      const left = Math.min(...anchors.map(a => a.cx - ICON_SIZE / 2))
      const right = Math.max(...anchors.map(a => a.cx + ICON_SIZE / 2))
      const top = Math.min(...anchors.map(a => a.cy - ICON_SIZE / 2))
      const bottom = Math.max(...anchors.map(a => a.cy + ICON_SIZE / 2))
      return {
        key, members,
        left, right, top, bottom,
        cx: (left + right) / 2,
        cy: (top + bottom) / 2,
      }
    })

    if (clusters.length < 2) return
    if ((kind === 'distH' || kind === 'distV') && clusters.length < 3) return

    // Para cada cluster, calcula (deltaX, deltaY) e aplica a todos os membros mantendo o offset relativo
    const applyClusterDelta = (results: { c: Cluster; dx: number; dy: number }[]) => {
      const updates: { id: string; position: { x: number; y: number } }[] = []
      results.forEach(({ c, dx, dy }) => {
        c.members.forEach(m => {
          updates.push({ id: m.id, position: { x: m.position.x + dx, y: m.position.y + dy } })
        })
      })
      onAlignNodes(updates)
    }

    if (kind === 'left') {
      const target = Math.min(...clusters.map(c => c.left))
      applyClusterDelta(clusters.map(c => ({ c, dx: target - c.left, dy: 0 })))
    } else if (kind === 'right') {
      const target = Math.max(...clusters.map(c => c.right))
      applyClusterDelta(clusters.map(c => ({ c, dx: target - c.right, dy: 0 })))
    } else if (kind === 'centerH') {
      const avgCx = clusters.reduce((s, c) => s + c.cx, 0) / clusters.length
      applyClusterDelta(clusters.map(c => ({ c, dx: avgCx - c.cx, dy: 0 })))
    } else if (kind === 'top') {
      const target = Math.min(...clusters.map(c => c.top))
      applyClusterDelta(clusters.map(c => ({ c, dx: 0, dy: target - c.top })))
    } else if (kind === 'bottom') {
      const target = Math.max(...clusters.map(c => c.bottom))
      applyClusterDelta(clusters.map(c => ({ c, dx: 0, dy: target - c.bottom })))
    } else if (kind === 'centerV') {
      const avgCy = clusters.reduce((s, c) => s + c.cy, 0) / clusters.length
      applyClusterDelta(clusters.map(c => ({ c, dx: 0, dy: avgCy - c.cy })))
    } else if (kind === 'distH') {
      const sorted = [...clusters].sort((a, b) => a.cx - b.cx)
      const first = sorted[0], last = sorted[sorted.length - 1]
      const step = (last.cx - first.cx) / (sorted.length - 1)
      applyClusterDelta(sorted.map((c, idx) => ({ c, dx: (first.cx + step * idx) - c.cx, dy: 0 })))
    } else if (kind === 'distV') {
      const sorted = [...clusters].sort((a, b) => a.cy - b.cy)
      const first = sorted[0], last = sorted[sorted.length - 1]
      const step = (last.cy - first.cy) / (sorted.length - 1)
      applyClusterDelta(sorted.map((c, idx) => ({ c, dx: 0, dy: (first.cy + step * idx) - c.cy })))
    }
  }

  return (
    <div className="board-canvas-shell" data-tool={tool} onContextMenu={handleContextMenu}>
      <ReactFlow
        colorMode="dark"
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={reactFlowDefaultEdgeOptions}
        deleteKeyCode={['Delete', 'Backspace']}
        snapToGrid
        snapGrid={[20, 20]}
        edges={edges}
        fitView
        nodeTypes={reactFlowNodeTypes}
        nodes={nodes}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onEdgesChange={onEdgesChange}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onPaneClick={() => { onPaneClick(); onContextMenuClose() }}
        selectionOnDrag={tool === 'select'}
        panOnDrag={tool === 'hand' ? true : [1, 2]}
      >
        <Background variant={BackgroundVariant.Dots} color="rgba(245,245,247,.12)" gap={22} size={1.5} />
        <Controls showInteractive={false} />
        <Panel position="top-left">
          <div className="board-tool-bar">
            <button
              className={`board-tool-btn${tool === 'select' ? ' active' : ''}`}
              onClick={() => setTool('select')}
              title="Selecionar (⌘)"
              type="button"
            >
              <SelectToolIcon />
            </button>
            <button
              className={`board-tool-btn${tool === 'hand' ? ' active' : ''}`}
              onClick={() => setTool('hand')}
              title="Mover (⌘)"
              type="button"
            >
              <HandToolIcon />
            </button>
          </div>
        </Panel>
        {selectedNodes.length >= 2 && (
          <Panel position="top-center">
            <div className="board-align-bar" role="toolbar" aria-label="Alinhamento">
              <span className="board-align-count">{selectedNodes.length} selecionados</span>
              <div className="board-align-group">
                <button type="button" className="board-align-btn" title="Alinhar à esquerda" onClick={() => applyAlign('left')}><AlignLeftIcon /></button>
                <button type="button" className="board-align-btn" title="Centralizar horizontal" onClick={() => applyAlign('centerH')}><AlignCenterHIcon /></button>
                <button type="button" className="board-align-btn" title="Alinhar à direita" onClick={() => applyAlign('right')}><AlignRightIcon /></button>
              </div>
              <div className="board-align-group">
                <button type="button" className="board-align-btn" title="Alinhar ao topo" onClick={() => applyAlign('top')}><AlignTopIcon /></button>
                <button type="button" className="board-align-btn" title="Centralizar vertical" onClick={() => applyAlign('centerV')}><AlignCenterVIcon /></button>
                <button type="button" className="board-align-btn" title="Alinhar abaixo" onClick={() => applyAlign('bottom')}><AlignBottomIcon /></button>
              </div>
              <div className="board-align-group">
                <button type="button" className="board-align-btn" title="Distribuir horizontal (3+)" onClick={() => applyAlign('distH')} disabled={clusterCount < 3}><DistributeHIcon /></button>
                <button type="button" className="board-align-btn" title="Distribuir vertical (3+)" onClick={() => applyAlign('distV')} disabled={clusterCount < 3}><DistributeVIcon /></button>
              </div>
              <div className="board-align-group">
                <button type="button" className="board-align-btn" title="Agrupar" onClick={() => onGroupNodes(selectedNodes.map(n => n.id))}><GroupIcon /></button>
                <button type="button" className="board-align-btn" title="Desagrupar" onClick={() => onUngroupNodes(selectedNodes.map(n => n.id))} disabled={!selectedNodes.some(n => n.data.groupId)}><UngroupIcon /></button>
              </div>
            </div>
          </Panel>
        )}
        {selectedNode && (
          <Panel position="top-right">
            <NodeEditPanel
              boardType={board.type}
              node={selectedNode}
              onClose={onSelectedNodeClose}
              onDelete={() => onNodeDelete(selectedNode.id)}
              onDuplicate={() => onNodeDuplicate(selectedNode.id)}
              onUpdate={onNodeUpdate}
            />
          </Panel>
        )}
        {!selectedNode && selectedEdge && (
          <Panel position="top-right">
            <EdgeEditPanel
              edge={selectedEdge}
              onClose={onSelectedEdgeClose}
              onDelete={() => onEdgeDelete(selectedEdge.id)}
              onUpdate={onEdgeUpdate}
            />
          </Panel>
        )}
      </ReactFlow>
      {contextMenu && (
        <BoardContextMenu
          boardType={board.type}
          x={contextMenu.screenX}
          y={contextMenu.screenY}
          onClose={onContextMenuClose}
          onSelect={handleMenuSelect}
        />
      )}
      {pendingCustom && (
        <BoardCustomLogoModal
          onClose={() => setPendingCustom(null)}
          onConfirm={handleCustomConfirm}
        />
      )}
    </div>
  )
}

function BoardCustomLogoModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: (url: string) => void
}) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [previewError, setPreviewError] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const isValidUrl = (s: string) => {
    try {
      const u = new URL(s)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch { return false }
  }

  const handleSubmit = () => {
    const trimmed = url.trim()
    if (!trimmed) { setError('Cole o link da imagem.'); return }
    if (!isValidUrl(trimmed)) { setError('URL inválida (precisa começar com https://).'); return }
    onConfirm(trimmed)
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div
        className="crm-modal board-custom-logo-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="custom-logo-title"
      >
        <div className="crm-modal-header">
          <h3 id="custom-logo-title">Logo personalizado</h3>
          <button onClick={onClose} type="button" className="crm-modal-close" aria-label="Fechar">
            <CloseIcon />
          </button>
        </div>

        <div className="board-custom-logo-body">
          <div className="extras-field">
            <label>URL da imagem</label>
            <input
              autoFocus
              type="url"
              placeholder="https://exemplo.com/logo.png"
              value={url}
              onChange={e => { setUrl(e.target.value); setError(''); setPreviewError(false) }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>

          {url && isValidUrl(url) && !previewError && (
            <div className="board-custom-logo-preview">
              <span className="board-custom-logo-preview-label">Prévia</span>
              <div className="board-custom-logo-preview-circle">
                <img
                  src={url}
                  alt=""
                  onError={() => setPreviewError(true)}
                />
              </div>
            </div>
          )}

          {previewError && (
            <p className="board-custom-logo-error">
              Não consegui carregar a imagem desse link. Verifique se a URL é direta pra uma imagem (.png, .jpg, .svg) e se o site permite hot-linking.
            </p>
          )}

          {error && <p className="board-custom-logo-error">{error}</p>}

          <p className="board-custom-logo-hint">
            Cole a URL direta de uma imagem. Funciona melhor com PNG/SVG transparentes em quadrado.
          </p>
        </div>

        <div className="crm-modal-footer">
          <button type="button" onClick={onClose} className="crm-modal-cancel">Cancelar</button>
          <button type="button" onClick={handleSubmit} className="crm-modal-submit" disabled={!url.trim() || previewError}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

function BoardContextMenu({
  boardType,
  x,
  y,
  onClose,
  onSelect,
}: {
  boardType: BoardType
  x: number
  y: number
  onClose: () => void
  onSelect: (kind: BoardNodeKind) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [openIndex, setOpenIndex] = useState(0)
  const categories = getBoardContextCategories(boardType)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as globalThis.Node)) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [onClose])

  const menuWidth = 216
  const menuMaxHeight = 460
  const shell = typeof document !== 'undefined' ? document.querySelector('.board-canvas-shell') : null
  const rect = shell?.getBoundingClientRect()
  const left = rect ? Math.min(x - rect.left, rect.width - menuWidth - 8) : x
  const top = rect ? Math.min(y - rect.top, rect.height - menuMaxHeight - 8) : y

  return (
    <div
      ref={ref}
      className="board-context-menu"
      style={{ left, top }}
      onContextMenu={e => e.preventDefault()}
    >
      {categories.map((cat, i) => {
        const isOpen = openIndex === i
        const sourceKinds = cat.kinds.filter(k => SOURCE_KINDS.has(k))
        const regularKinds = cat.kinds.filter(k => !SOURCE_KINDS.has(k))
        return (
          <div key={cat.label} className="board-ctx-category">
            <button
              className={`board-ctx-category-header${isOpen ? ' open' : ''}`}
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
            >
              <span>{cat.label}</span>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            {isOpen && (
              <div className="board-ctx-category-body">
                {sourceKinds.length > 0 && (
                  <div className="board-context-menu-sources">
                    {sourceKinds.map(kind => (
                      <button key={kind} className="board-context-source-btn" data-kind={kind} type="button" title={kind} onClick={() => onSelect(kind)}>
                        <BoardSourceIcon kind={kind} compact />
                        <span>{kind}</span>
                      </button>
                    ))}
                  </div>
                )}
                {regularKinds.map(kind => (
                  <button key={kind} className="board-context-item" type="button" onClick={() => onSelect(kind)}>
                    <BoardNodeIcon kind={kind} />
                    <span>{kind}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function BoardEditor({
  board,
  onBack,
  onDelete,
  onRename,
  onSave,
}: {
  board: Board
  onBack: () => void
  onDelete: () => Promise<void>
  onRename: (name: string) => Promise<void>
  onSave: (board: Board) => void
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(board.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(board.edges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingBack, setConfirmingBack] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [renamingHeader, setRenamingHeader] = useState(false)
  const [headerRenameValue, setHeaderRenameValue] = useState('')
  const [contextMenu, setContextMenu] = useState<{ screenX: number; screenY: number; flowX: number; flowY: number } | null>(null)
  const headerRenameCancelledRef = useRef(false)
  const historyRef = useRef<Array<{ nodes: Node<BoardNodeData>[]; edges: Edge[] }>>([])
  const historyIndexRef = useRef(0)
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false })
  const syncHistoryState = () => {
    setHistoryState({
      canUndo: historyIndexRef.current > 0,
      canRedo: historyIndexRef.current < historyRef.current.length - 1,
    })
  }
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  const selectedNodeIdRef = useRef(selectedNodeId)
  nodesRef.current = nodes
  edgesRef.current = edges
  selectedNodeIdRef.current = selectedNodeId

  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null
  const selectedEdge = edges.find(e => e.id === selectedEdgeId) ?? null

  useEffect(() => {
    const normalizedNodes = normalizeBoardNodes(board.nodes)
    setNodes(normalizedNodes)
    setEdges(board.edges)
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
    setIsDirty(false)
    historyRef.current = [{ nodes: normalizedNodes, edges: board.edges }]
    historyIndexRef.current = 0
    syncHistoryState()
  }, [board.id, setEdges, setNodes])

  const HISTORY_LIMIT = 21 // até 10 desfazer + estado atual + 10 refazer (pré-push)
  const pushHistory = (newNodes: Node<BoardNodeData>[], newEdges: Edge[]) => {
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push({ nodes: newNodes, edges: newEdges })
    while (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift()
    historyIndexRef.current = historyRef.current.length - 1
    syncHistoryState()
  }

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current -= 1
    const snap = historyRef.current[historyIndexRef.current]
    setNodes(snap.nodes)
    setEdges(snap.edges)
    setIsDirty(historyIndexRef.current > 0)
    syncHistoryState()
  }

  const handleRedo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current += 1
    const snap = historyRef.current[historyIndexRef.current]
    setNodes(snap.nodes)
    setEdges(snap.edges)
    setIsDirty(true)
    syncHistoryState()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      const tag = (event.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        handleUndo()
      } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
        event.preventDefault()
        handleRedo()
      } else if (event.key === 'd') {
        event.preventDefault()
        const id = selectedNodeIdRef.current
        if (!id) return
        const original = nodesRef.current.find(n => n.id === id)
        if (!original) return
        const copy: Node<BoardNodeData> = {
          ...original,
          id: createLocalBoardId(),
          selected: false,
          position: { x: original.position.x + 40, y: original.position.y + 40 },
        }
        const newNodes = [...nodesRef.current, copy]
        setNodes(newNodes)
        setSelectedNodeId(copy.id)
        pushHistory(newNodes, edgesRef.current)
        setIsDirty(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setEdges, setNodes])

  const handleNodesChange = (changes: NodeChange<Node<BoardNodeData>>[]) => {
    onNodesChange(changes)
    if (changes.some(c => c.type === 'dimensions')) {
      setIsDirty(true)
    }
    const removes = changes.filter(c => c.type === 'remove') as Array<{ type: 'remove'; id: string }>
    if (removes.length > 0) {
      const removedIds = new Set(removes.map(c => c.id))
      const newNodes = nodes.filter(n => !removedIds.has(n.id))
      const newEdges = edges.filter(e => !removedIds.has(e.source) && !removedIds.has(e.target))
      pushHistory(newNodes, newEdges)
      setIsDirty(true)
    }
  }

  const handleEdgesChange = (changes: EdgeChange[]) => {
    onEdgesChange(changes)
    const removes = changes.filter(c => c.type === 'remove') as Array<{ type: 'remove'; id: string }>
    if (removes.length > 0) {
      const removedIds = new Set(removes.map(c => c.id))
      const newEdges = edges.filter(e => !removedIds.has(e.id))
      pushHistory(nodes, newEdges)
      setIsDirty(true)
    }
  }

  const handleConnect = (connection: Connection) => {
    const newEdges = addEdge(
      { ...connection, animated: true, type: 'straight', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#ffffff', strokeWidth: 2 } },
      edges,
    )
    setEdges(newEdges)
    pushHistory(nodes, newEdges)
    setIsDirty(true)
  }

  const handleReconnect = (oldEdge: Edge, newConnection: Connection) => {
    setEdges(eds => reconnectEdge(oldEdge, newConnection, eds))
    setIsDirty(true)
  }

  const handleAutoLayout = () => {
    const NODE_W = 195
    const NODE_H = 90
    const H_GAP = 100
    const V_GAP = 50

    const outEdges = new Map<string, string[]>()
    const inDegree = new Map<string, number>()
    nodes.forEach(n => { outEdges.set(n.id, []); inDegree.set(n.id, 0) })
    edges.forEach(e => {
      outEdges.get(e.source)?.push(e.target)
      inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
    })

    const levels = new Map<string, number>()
    const queue: string[] = nodes.filter(n => (inDegree.get(n.id) ?? 0) === 0).map(n => n.id)
    queue.forEach(id => levels.set(id, 0))
    let qi = 0
    while (qi < queue.length) {
      const id = queue[qi++]
      const level = levels.get(id) ?? 0
      for (const next of outEdges.get(id) ?? []) {
        const nl = level + 1
        if (!levels.has(next) || levels.get(next)! < nl) { levels.set(next, nl); queue.push(next) }
      }
    }
    nodes.forEach(n => { if (!levels.has(n.id)) levels.set(n.id, 0) })

    const byLevel = new Map<number, string[]>()
    nodes.forEach(n => {
      const l = levels.get(n.id) ?? 0
      if (!byLevel.has(l)) byLevel.set(l, [])
      byLevel.get(l)!.push(n.id)
    })

    const posMap = new Map<string, { x: number; y: number }>()
    byLevel.forEach((ids, level) => {
      const totalH = ids.length * (NODE_H + V_GAP) - V_GAP
      ids.forEach((id, i) => {
        posMap.set(id, { x: level * (NODE_W + H_GAP), y: i * (NODE_H + V_GAP) - totalH / 2 })
      })
    })

    const newNodes = nodes.map(n => ({ ...n, position: posMap.get(n.id) ?? n.position }))
    setNodes(newNodes)
    pushHistory(newNodes, edges)
    setIsDirty(true)
  }

  const handleAddNode = (kind: BoardNodeKind, position?: { x: number; y: number }, logoUrl?: string) => {
    const totalNodes = nodes.length + 1
    const isCustom = kind === 'Custom'
    const newNode: Node<BoardNodeData> = {
      id: createLocalBoardId(),
      type: nodeTypeForKind(kind),
      position: position ?? {
        x: 120 + (totalNodes % 4) * 180,
        y: 120 + Math.floor(totalNodes / 4) * 130,
      },
      data: {
        label: isCustom ? 'Logo' : kind,
        kind,
        ...(logoUrl ? { logoUrl } : {}),
      },
      ...(kind === 'Anotação' ? { style: { ...BOARD_NOTE_DEFAULT_SIZE } } : {}),
    }
    const newNodes = [...nodes, newNode]
    setNodes(newNodes)
    pushHistory(newNodes, edges)
    setIsDirty(true)
  }

  const handleSave = async (): Promise<boolean> => {
    setSaving(true)
    setSaveError('')

    const { error } = await supabase
      .from('boards')
      .update({ nodes, edges, updated_at: new Date().toISOString() })
      .eq('id', board.id)

    setSaving(false)

    if (error) {
      setSaveError('Não consegui salvar. Tente novamente.')
      return false
    }

    setIsDirty(false)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
    onSave({
      ...board,
      nodes,
      edges,
      updatedAt: new Intl.DateTimeFormat('pt-BR').format(new Date()),
    })
    return true
  }

  const handleBack = () => {
    if (isDirty) {
      setConfirmingBack(true)
    } else {
      onBack()
    }
  }

  const handleSaveAndBack = async () => {
    const saved = await handleSave()
    if (saved) onBack()
  }

  const handleDuplicateNode = (nodeId: string) => {
    const original = nodes.find(n => n.id === nodeId)
    if (!original) return
    const copy: Node<BoardNodeData> = {
      ...original,
      id: createLocalBoardId(),
      selected: false,
      position: { x: original.position.x + 40, y: original.position.y + 40 },
    }
    const newNodes = [...nodes, copy]
    setNodes(newNodes)
    setSelectedNodeId(copy.id)
    pushHistory(newNodes, edges)
    setIsDirty(true)
  }

  const handleNodeUpdate = (updatedNode: Node<BoardNodeData>) => {
    const normalizedNode = normalizeBoardNode(updatedNode)
    const newNodes = nodes.map(n => n.id === updatedNode.id ? normalizedNode : n)
    setNodes(newNodes)
    pushHistory(newNodes, edges)
    setIsDirty(true)
  }

  const handleAlignNodes = (updates: { id: string; position: { x: number; y: number } }[]) => {
    if (!updates.length) return
    const map = new Map(updates.map(u => [u.id, u.position]))
    const newNodes = nodes.map(n => map.has(n.id) ? { ...n, position: map.get(n.id)! } : n)
    setNodes(newNodes)
    pushHistory(newNodes, edges)
    setIsDirty(true)
  }

  const handleGroupNodes = (ids: string[]) => {
    if (ids.length < 2) return
    const idSet = new Set(ids)
    // Se algum nó selecionado já tem groupId, reaproveita; senão cria novo
    const existing = nodes.find(n => idSet.has(n.id) && n.data.groupId)?.data.groupId
    const groupId = existing ?? genId()
    const newNodes = nodes.map(n =>
      idSet.has(n.id) ? { ...n, data: { ...n.data, groupId } } : n
    )
    setNodes(newNodes)
    pushHistory(newNodes, edges)
    setIsDirty(true)
  }

  const handleUngroupNodes = (ids: string[]) => {
    if (!ids.length) return
    const idSet = new Set(ids)
    // Desagrupa todos os nós que compartilham qualquer groupId presente na seleção
    const groupIds = new Set(
      nodes.filter(n => idSet.has(n.id) && n.data.groupId).map(n => n.data.groupId!)
    )
    if (!groupIds.size) return
    const newNodes = nodes.map(n => {
      if (n.data.groupId && groupIds.has(n.data.groupId)) {
        const { groupId: _gid, ...rest } = n.data
        return { ...n, data: rest }
      }
      return n
    })
    setNodes(newNodes)
    pushHistory(newNodes, edges)
    setIsDirty(true)
  }

  const handleNodeDelete = (nodeId: string) => {
    const newNodes = nodes.filter(n => n.id !== nodeId)
    const newEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    setNodes(newNodes)
    setEdges(newEdges)
    setSelectedNodeId(null)
    pushHistory(newNodes, newEdges)
    setIsDirty(true)
  }

  const handleNodeDragStop = (_: React.MouseEvent, draggedNode: Node<BoardNodeData>) => {
    const THRESHOLD = 8
    const NODE_W = 155
    let { x, y } = draggedNode.position
    for (const other of nodesRef.current) {
      if (other.id === draggedNode.id) continue
      const ox = other.position.x
      const oy = other.position.y
      // X alignment: left-left, right-right, left-right, right-left
      if      (Math.abs(x - ox) < THRESHOLD)                           x = ox
      else if (Math.abs((x + NODE_W) - (ox + NODE_W)) < THRESHOLD)    x = ox
      else if (Math.abs(x - (ox + NODE_W)) < THRESHOLD)               x = ox + NODE_W
      else if (Math.abs((x + NODE_W) - ox) < THRESHOLD)               x = ox - NODE_W
      // Y alignment: top-top
      if      (Math.abs(y - oy) < THRESHOLD)                           y = oy
    }
    const finalNodes = nodesRef.current.map(n =>
      n.id === draggedNode.id ? { ...n, position: { x, y } } : n
    )
    const prev = historyRef.current[historyIndexRef.current]
    const prevPos = prev?.nodes.find(n => n.id === draggedNode.id)?.position
    if (!prevPos || prevPos.x !== x || prevPos.y !== y) {
      setNodes(finalNodes)
      pushHistory(finalNodes, edgesRef.current)
      setIsDirty(true)
    }
  }

  const handleEdgeUpdate = (updatedEdge: Edge) => {
    const newEdges = edges.map(e => e.id === updatedEdge.id ? updatedEdge : e)
    setEdges(newEdges)
    setSelectedEdgeId(null)
    pushHistory(nodes, newEdges)
    setIsDirty(true)
  }

  const handleEdgeDelete = (edgeId: string) => {
    const newEdges = edges.filter(e => e.id !== edgeId)
    setEdges(newEdges)
    setSelectedEdgeId(null)
    pushHistory(nodes, newEdges)
    setIsDirty(true)
  }

  const handleConfirmedDelete = async () => {
    setDeleteError('')
    try {
      await onDelete()
    } catch {
      setDeleteError('Não consegui excluir. Tente novamente.')
      setConfirmingDelete(false)
    }
  }

  return (
    <div className="board-editor">
      <header className="board-editor-header">
        <div>
          <p>{board.type}</p>
          {renamingHeader ? (
            <form onSubmit={async event => {
              event.preventDefault()
              setRenamingHeader(false)
              await onRename(headerRenameValue)
            }}>
              <input
                autoFocus
                className="board-header-rename-input"
                value={headerRenameValue}
                onChange={event => setHeaderRenameValue(event.target.value)}
                onBlur={async () => {
                  if (headerRenameCancelledRef.current) { headerRenameCancelledRef.current = false; return }
                  setRenamingHeader(false)
                  await onRename(headerRenameValue)
                }}
                onKeyDown={event => {
                  if (event.key === 'Escape') {
                    headerRenameCancelledRef.current = true
                    setRenamingHeader(false)
                  }
                }}
              />
            </form>
          ) : (
            <h2
              id="active-module-title"
              className="board-header-name"
              onClick={() => { setHeaderRenameValue(board.name); setRenamingHeader(true) }}
              title="Clique para renomear"
            >
              {board.name}
            </h2>
          )}
        </div>
        <div>
          {(saveError || deleteError) && (
            <span className="board-save-error">{saveError || deleteError}</span>
          )}
          {savedFlash && (
            <span className="board-saved-flash">● salvo</span>
          )}
          {isDirty && !saving && !savedFlash && (
            <span className="board-dirty-badge">● não salvo</span>
          )}
          {confirmingBack ? (
            <>
              <span className="board-delete-warning">Sair sem salvar?</span>
              <button onClick={() => setConfirmingBack(false)} type="button">Cancelar</button>
              <button onClick={onBack} type="button">Descartar</button>
              <button className="board-node-panel-save board-save-and-back" disabled={saving} onClick={handleSaveAndBack} type="button">
                {saving ? '...' : 'Salvar e sair'}
              </button>
            </>
          ) : confirmingDelete ? (
            <>
              <span className="board-delete-warning">Excluir?</span>
              <button onClick={() => setConfirmingDelete(false)} type="button">Cancelar</button>
              <button className="board-delete-confirm" onClick={handleConfirmedDelete} type="button">
                Confirmar
              </button>
            </>
          ) : (
            <>
              <button className="board-hdr-btn" disabled={!historyState.canUndo || saving} onClick={handleUndo} type="button" title="Desfazer (⌘Z)">
                <UndoIcon />
              </button>
              <button className="board-hdr-btn" disabled={!historyState.canRedo || saving} onClick={handleRedo} type="button" title="Refazer (⌘⇧Z)">
                <RedoIcon />
              </button>
              <span className="board-hdr-sep" aria-hidden />
              <button className="board-hdr-btn" disabled={saving} onClick={handleBack} type="button" title="Voltar">
                <ArrowLeftIcon />
              </button>
              <button className="board-hdr-btn board-hdr-save" disabled={saving} onClick={handleSave} type="button" title={saving ? 'Salvando...' : 'Salvar'}>
                <SaveIcon />
              </button>
              <button className="board-hdr-btn board-hdr-delete" onClick={() => setConfirmingDelete(true)} type="button" title="Excluir quadro">
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      </header>

      <ReactFlowProvider>
        <CanvasWithContextMenu
          board={board}
          contextMenu={contextMenu}
          edges={edges}
          nodes={nodes}
          selectedEdge={selectedEdge}
          selectedNode={selectedNode}
          onAddNode={handleAddNode}
          onConnect={handleConnect}
          onReconnect={handleReconnect}
          onContextMenuClose={() => setContextMenu(null)}
          onContextMenuOpen={setContextMenu}
          onEdgeDelete={handleEdgeDelete}
          onEdgeDoubleClick={(_, edge) => { setSelectedEdgeId(edge.id); setSelectedNodeId(null) }}
          onEdgeUpdate={handleEdgeUpdate}
          onEdgesChange={handleEdgesChange}
          onNodeClick={(event, node) => {
            setSelectedNodeId(node.id)
            setSelectedEdgeId(null)
            const groupId = node.data.groupId
            if (groupId && !(event.shiftKey || event.metaKey || event.ctrlKey)) {
              // Expande seleção para todos os membros do grupo
              setNodes(curr => curr.map(n => ({ ...n, selected: n.data.groupId === groupId })))
            }
          }}
          onNodeDelete={handleNodeDelete}
          onNodeDragStop={handleNodeDragStop}
          onNodeDuplicate={handleDuplicateNode}
          onNodeUpdate={handleNodeUpdate}
          onAlignNodes={handleAlignNodes}
          onGroupNodes={handleGroupNodes}
          onUngroupNodes={handleUngroupNodes}
          onNodesChange={handleNodesChange}
          onNodesDelete={deleted => { if (selectedNodeId && deleted.some(n => n.id === selectedNodeId)) setSelectedNodeId(null) }}
          onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null) }}
          onSelectedEdgeClose={() => setSelectedEdgeId(null)}
          onSelectedNodeClose={() => setSelectedNodeId(null)}
        />
      </ReactFlowProvider>
    </div>
  )
}

function NodeEditPanel({
  node,
  boardType,
  onUpdate,
  onDelete,
  onDuplicate,
  onClose,
}: {
  node: Node<BoardNodeData>
  boardType: BoardType
  onUpdate: (node: Node<BoardNodeData>) => void
  onDelete: () => void
  onDuplicate: () => void
  onClose: () => void
}) {
  const [label, setLabel] = useState(String(node.data.label))
  const [metric, setMetric] = useState(node.data.metric ?? '')
  const [kind, setKind] = useState<BoardNodeKind>(node.data.kind)
  const [logoUrl, setLogoUrl] = useState(node.data.logoUrl ?? '')
  const [logoError, setLogoError] = useState<string | null>(null)
  const [note, setNote] = useState(node.data.note ?? '')

  useEffect(() => {
    setLabel(String(node.data.label))
    setMetric(node.data.metric ?? '')
    setKind(node.data.kind)
    setLogoUrl(node.data.logoUrl ?? '')
    setLogoError(null)
    setNote(node.data.note ?? '')
  }, [node.id])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmedUrl = logoUrl.trim()
    const trimmedNote = note.trim()
    onUpdate({
      ...node,
      data: {
        label: label.trim() || (kind === 'Custom' ? 'Logo' : kind),
        kind,
        metric: metric.trim() || undefined,
        ...(trimmedUrl ? { logoUrl: trimmedUrl } : {}),
        ...(trimmedNote ? { note: trimmedNote } : {}),
      },
    })
  }

  const isSource = SOURCE_KINDS.has(kind)

  return (
    <div className="board-node-panel">
      <div className="board-node-panel-header">
        <span>{isSource ? 'Fonte de tráfego' : 'Editar bloco'}</span>
        <button onClick={onClose} type="button" aria-label="Fechar painel">
          <CloseIcon />
        </button>
      </div>

      {isSource && (
        <div className="board-node-panel-source-preview" data-kind={kind}>
          <BoardSourceIcon kind={kind} logoUrl={kind === 'Custom' ? (logoError ? undefined : logoUrl.trim() || undefined) : node.data.logoUrl} />
          <span>{kind === 'Custom' ? 'Logo personalizada' : kind}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {kind === 'Custom' && (
          <label className="board-node-panel-field">
            URL do logo
            <input
              type="url"
              value={logoUrl}
              onChange={event => { setLogoUrl(event.target.value); setLogoError(null) }}
              placeholder="https://exemplo.com/logo.png"
            />
            {logoError && <span style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{logoError}</span>}
            {logoUrl.trim() && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl.trim()}
                alt=""
                style={{ display: 'none' }}
                onError={() => setLogoError('Não foi possível carregar a imagem desta URL.')}
                onLoad={() => setLogoError(null)}
              />
            )}
          </label>
        )}

        <label className="board-node-panel-field">
          Nome
          <input
            value={label}
            onChange={event => setLabel(event.target.value)}
            placeholder={kind}
          />
        </label>

        {!isSource && (
          <label className="board-node-panel-field">
            Tipo
            <select value={kind} onChange={event => setKind(event.target.value as BoardNodeKind)}>
              {getBoardToolbarItems(boardType).filter(k => !SOURCE_KINDS.has(k)).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </label>
        )}

        {!isSource && CONTENT_KINDS.has(kind) && (
          <label className="board-node-panel-field">
            {kind === 'Anotação' ? 'Conteúdo' : 'O que coleta / entrega'}
            <textarea
              rows={3}
              value={metric}
              onChange={event => setMetric(event.target.value)}
              placeholder={
                kind === 'Formulário' ? 'ex: Nome, e-mail, telefone, empresa...'
                : kind === 'Opt-in' ? 'ex: Nome e e-mail em troca do lead magnet'
                : kind === 'Reunião' ? 'ex: Qualificação, apresentação da proposta...'
                : kind === 'Etapa' ? 'ex: O que acontece nessa etapa...'
                : 'Descreva o que é coletado ou entregue aqui...'
              }
              style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '12px' }}
            />
          </label>
        )}

        {!isSource && !CONTENT_KINDS.has(kind) && (
          <label className="board-node-panel-field">
            Métrica
            <input
              value={metric}
              onChange={event => setMetric(event.target.value)}
              placeholder="ex: 12% conversão"
            />
          </label>
        )}

        <label className="board-node-panel-field">
          Observação
          <input
            value={note}
            onChange={event => setNote(event.target.value)}
            placeholder="ex: domínio, mensal, R$ 49..."
            maxLength={40}
          />
        </label>

        <div className="board-node-panel-actions">
          <button className="board-node-panel-save" type="submit">Aplicar</button>
          <button className="board-node-panel-duplicate" onClick={onDuplicate} type="button" aria-label="Duplicar bloco">
            <CopyIcon />
          </button>
          <button className="board-node-panel-delete" onClick={onDelete} type="button" aria-label="Excluir bloco">
            <TrashIcon />
          </button>
        </div>
      </form>
    </div>
  )
}

type EdgeCondition = 'Sim' | 'Não' | 'Sempre' | 'custom' | ''

function deriveCondition(edge: Edge): EdgeCondition {
  const label = String(edge.label ?? '')
  if (label === 'Sim') return 'Sim'
  if (label === 'Não') return 'Não'
  if (label === 'Sempre') return 'Sempre'
  if (label) return 'custom'
  return ''
}

function buildEdgeWithCondition(base: Edge, condition: EdgeCondition, customLabel: string, edgeType: string, color: string): Edge {
  const reset = { labelStyle: undefined, labelBgStyle: undefined, labelBgBorderRadius: undefined, labelBgPadding: undefined }
  const typed = (result: Edge) => ({ ...result, type: edgeType })
  const s = { ...base.style, stroke: color, strokeWidth: 2 }

  if (condition === 'Sim') {
    return typed({
      ...base, label: 'Sim', style: s,
      labelStyle: { fontSize: 10, fontWeight: 650, fill: '#166534' },
      labelBgStyle: { fill: '#dcfce7', stroke: 'rgba(34,197,94,0.3)', strokeWidth: 1 },
      labelBgBorderRadius: 4,
      labelBgPadding: [4, 7] as [number, number],
    })
  }
  if (condition === 'Não') {
    return typed({
      ...base, label: 'Não', style: s,
      labelStyle: { fontSize: 10, fontWeight: 650, fill: '#991b1b' },
      labelBgStyle: { fill: '#fee2e2', stroke: 'rgba(239,68,68,0.3)', strokeWidth: 1 },
      labelBgBorderRadius: 4,
      labelBgPadding: [4, 7] as [number, number],
    })
  }
  if (condition === 'Sempre') {
    return typed({ ...base, ...reset, label: undefined, style: s })
  }
  if (condition === 'custom') {
    const clean = customLabel.trim()
    return typed({
      ...base, label: clean || undefined, style: s,
      ...(clean
        ? {
            labelStyle: { fontSize: 10, fontWeight: 650, fill: '#060606' },
            labelBgStyle: { fill: '#ffffff', stroke: 'rgba(6,6,6,0.14)', strokeWidth: 1 },
            labelBgBorderRadius: 4,
            labelBgPadding: [4, 7] as [number, number],
          }
        : reset),
    })
  }
  return typed({ ...base, ...reset, label: undefined, style: s })
}

const EDGE_PRESET_COLORS = ['#6366f1','#22c55e','#ef4444','#f59e0b','#ec4899','#0ea5e9','#ffffff','#a3a3a3']

function EdgeEditPanel({
  edge,
  onUpdate,
  onDelete,
  onClose,
}: {
  edge: Edge
  onUpdate: (edge: Edge) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [condition, setCondition] = useState<EdgeCondition>(() => deriveCondition(edge))
  const [customLabel, setCustomLabel] = useState(() => condition === 'custom' ? String(edge.label ?? '') : '')
  const [edgeType, setEdgeType] = useState(edge.type ?? 'smoothstep')
  const [color, setColor] = useState<string>(() => (edge.style?.stroke as string | undefined) ?? '#ffffff')

  useEffect(() => {
    const c = deriveCondition(edge)
    setCondition(c)
    setCustomLabel(c === 'custom' ? String(edge.label ?? '') : '')
    setEdgeType(edge.type ?? 'smoothstep')
    setColor((edge.style?.stroke as string | undefined) ?? '#ffffff')
  }, [edge.id])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onUpdate(buildEdgeWithCondition(edge, condition, customLabel, edgeType, color))
  }

  return (
    <div className="board-node-panel">
      <div className="board-node-panel-header">
        <span>Editar conexão</span>
        <button onClick={onClose} type="button" aria-label="Fechar painel">
          <CloseIcon />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="board-node-panel-field">
          Condição
          <select value={condition} onChange={event => setCondition(event.target.value as EdgeCondition)}>
            <option value="">Sem rótulo</option>
            <option value="Sim">✓ Sim</option>
            <option value="Não">✗ Não</option>
            <option value="Sempre">→ Sempre</option>
            <option value="custom">Personalizado...</option>
          </select>
        </label>

        {condition === 'custom' && (
          <label className="board-node-panel-field">
            Texto
            <input
              autoFocus
              value={customLabel}
              onChange={event => setCustomLabel(event.target.value)}
              placeholder="ex: Aprovado, Talvez..."
            />
          </label>
        )}

        <label className="board-node-panel-field">
          Linha
          <select value={edgeType} onChange={event => setEdgeType(event.target.value)}>
            <option value="straight">Reta</option>
            <option value="default">Curva</option>
            <option value="smoothstep">Cotovelo</option>
          </select>
        </label>

        <div className="board-node-panel-field">
          <span>Cor</span>
          <div className="edge-color-row">
            {EDGE_PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`edge-color-swatch${color === c ? ' active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={c}
              />
            ))}
            <input
              type="color"
              className="edge-color-custom"
              value={color}
              onChange={e => setColor(e.target.value)}
              title="Cor personalizada"
            />
          </div>
        </div>

        <div className="board-node-panel-actions">
          <button className="board-node-panel-save" type="submit">Aplicar</button>
          <button className="board-node-panel-delete" onClick={onDelete} type="button" aria-label="Remover conexão">
            <TrashIcon />
          </button>
        </div>
      </form>
    </div>
  )
}

function mapTrackedLinks(linkRows: TrackedLinkRow[], clickRows: TrackedClickRow[]) {
  return linkRows.map(linkRow => {
    const clickSources = clickRows
      .filter(click => click.link_id === linkRow.id)
      .reduce<Record<string, number>>((sources, click) => {
        const source = click.source || 'Direto'
        sources[source] = (sources[source] ?? 0) + 1

        return sources
      }, {})

    return mapTrackedLink(
      linkRow,
      Object.entries(clickSources).map(([source, clicks]) => ({ source, clicks })),
    )
  })
}

function mapTrackedLink(linkRow: TrackedLinkRow, sources: TrackedLinkSource[]) {
  return {
    id: linkRow.id,
    title: linkRow.title,
    slug: linkRow.slug,
    destinationUrl: linkRow.destination_url,
    createdAt: formatTrackedLinkDate(linkRow.created_at),
    sources,
  }
}

function formatTrackedLinkDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

function getTrackedLinkPath(link: TrackedLink) {
  return `/l/${link.slug}`
}

function getTrackedLinkHref(link: TrackedLink) {
  const trackedLinkPath = getTrackedLinkPath(link)

  if (typeof window === 'undefined') {
    return trackedLinkPath
  }

  return `${window.location.origin}${trackedLinkPath}`
}

function getTrackedLinkClicks(link: TrackedLink) {
  return link.sources.reduce((total, source) => total + source.clicks, 0)
}

function getTrackedLinkTopSource(link: TrackedLink) {
  return [...link.sources].sort((firstSource, secondSource) => secondSource.clicks - firstSource.clicks)[0]?.source ?? 'Sem dados'
}

function normalizeDestinationUrl(value: string) {
  const cleanValue = value.trim()

  if (!cleanValue) return ''
  if (/^https?:\/\//i.test(cleanValue)) return cleanValue

  return `https://${cleanValue}`
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function createBoardTemplate(id: string, name: string, type: BoardType): Board {
  const isFunnel = type === 'Funil de vendas'

  return {
    id,
    name,
    type,
    updatedAt: new Intl.DateTimeFormat('pt-BR').format(new Date()),
    nodes: isFunnel
      ? [
          createBoardNode('node-sales-page', 'Página de vendas', 'Página', 80, 120, 'Entrada'),
          createBoardNode('node-order-page', 'Checkout', 'Checkout', 290, 120, 'Pedido'),
          createBoardNode('node-upsell', 'Upsell', 'Upsell', 500, 120, 'Oferta'),
          createBoardNode('node-downsell', 'Downsell', 'Downsell', 500, 300, 'Alternativa'),
          createBoardNode('node-confirmation', 'Confirmação', 'Confirmação', 710, 120, 'Final'),
          createBoardNode('node-email', 'Boas-vindas', 'E-mail', 710, 300, 'Sequência'),
        ]
      : [
          createBoardNode('node-start', 'Entrada', 'Etapa', 90, 170),
          createBoardNode('node-analysis', 'Análise', 'Documento', 300, 170),
          createBoardNode('node-decision', 'Decisão', 'Decisão', 510, 170),
          createBoardNode('node-execution', 'Execução', 'Etapa', 720, 90),
          createBoardNode('node-review', 'Revisão', 'Etapa', 720, 250),
          createBoardNode('node-end', 'Finalizado', 'Final', 930, 170),
        ],
    edges: isFunnel
      ? [
          createBoardEdge('edge-1', 'node-sales-page', 'node-order-page'),
          createBoardEdge('edge-2', 'node-order-page', 'node-upsell'),
          createBoardEdge('edge-3', 'node-upsell', 'node-confirmation'),
          createBoardEdge('edge-4', 'node-upsell', 'node-downsell'),
          createBoardEdge('edge-5', 'node-downsell', 'node-confirmation'),
          createBoardEdge('edge-6', 'node-confirmation', 'node-email', 'smoothstep'),
        ]
      : [
          createBoardEdge('edge-1', 'node-start', 'node-analysis'),
          createBoardEdge('edge-2', 'node-analysis', 'node-decision'),
          createBoardEdge('edge-3', 'node-decision', 'node-execution'),
          createBoardEdge('edge-4', 'node-decision', 'node-review'),
          createBoardEdge('edge-5', 'node-execution', 'node-end'),
          createBoardEdge('edge-6', 'node-review', 'node-end'),
        ],
  }
}

function createBoardNode(
  id: string,
  label: string,
  kind: BoardNodeKind,
  x: number,
  y: number,
  metric?: string,
): Node<BoardNodeData> {
  return {
    id,
    type: nodeTypeForKind(kind),
    position: {
      x,
      y,
    },
    ...(kind === 'Anotação' ? { style: { ...BOARD_NOTE_DEFAULT_SIZE } } : {}),
    data: {
      label,
      kind,
      metric,
    },
  }
}

function normalizeBoardNode(node: Node<BoardNodeData>): Node<BoardNodeData> {
  const type = nodeTypeForKind(node.data.kind)

  if (node.data.kind !== 'Anotação') {
    return { ...node, type }
  }

  const width = typeof node.width === 'number' ? node.width : node.style?.width ?? BOARD_NOTE_DEFAULT_SIZE.width
  const height = typeof node.height === 'number' ? node.height : node.style?.height ?? BOARD_NOTE_DEFAULT_SIZE.height

  return {
    ...node,
    type,
    style: {
      ...node.style,
      width,
      height,
    },
  }
}

function normalizeBoardNodes(nodes: Node<BoardNodeData>[] = []): Node<BoardNodeData>[] {
  return nodes.map(normalizeBoardNode)
}

function createBoardEdge(id: string, source: string, target: string, type = 'default'): Edge {
  return {
    id,
    source,
    target,
    type,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#ffffff', strokeWidth: 2 },
  }
}

type ContextCategory = { label: string; kinds: BoardNodeKind[] }

const BOARD_CATEGORIES: ContextCategory[] = [
  { label: 'Tráfego', kinds: ['Meta', 'Google', 'TikTok', 'Instagram', 'LinkedIn', 'YouTube', 'Orgânico', 'Lista', 'Afiliado', 'Indicação'] },
  { label: 'Checkout', kinds: ['Monnetize', 'Ticto', 'Kirvano', 'Hotmart', 'Kiwify', 'Hubla'] },
  { label: 'Dados', kinds: ['Nome', 'Email', 'Telefone', 'CPF', 'Endereço', 'Nascimento', 'Empresa', 'Sexo'] },
  { label: 'Funil', kinds: ['Opt-in', 'Página', 'VSL', 'Survey', 'Webinar', 'Pop-up', 'Checkout', 'Order Bump', 'Upsell', 'Downsell', 'Confirmação', 'Obrigado'] },
  { label: 'Comunicação', kinds: ['E-mail', 'SMS', 'WhatsApp', 'Grupo'] },
  { label: 'Vendas', kinds: ['Reunião', 'Ligação', 'Anúncio', 'Venda'] },
  { label: 'Fluxo', kinds: ['Início', 'Etapa', 'Decisão', 'Aprovação', 'Aguardar', 'Final'] },
  { label: 'Ação', kinds: ['Formulário', 'Documento', 'Integração', 'Notificação'] },
  { label: 'Outros', kinds: ['Anotação', 'Custom'] },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getBoardContextCategories(_type: BoardType): ContextCategory[] {
  return BOARD_CATEGORIES
}

function getBoardToolbarItems(_type: BoardType): BoardNodeKind[] {
  return BOARD_CATEGORIES.flatMap(c => c.kinds)
}

function mapBoardRow(row: BoardRow): Board {
  return {
    id: row.id,
    name: row.name,
    type: row.type as BoardType,
    nodes: normalizeBoardNodes(row.nodes ?? []),
    edges: row.edges ?? [],
    updatedAt: new Intl.DateTimeFormat('pt-BR').format(new Date(row.updated_at)),
  }
}

function createLocalBoardId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `board-${crypto.randomUUID()}`
  }

  return `board-${Date.now()}`
}

function BoardCircleNode({ data, selected }: NodeProps<Node<BoardNodeData>>) {
  return (
    <div className={selected ? 'board-circle-node selected' : 'board-circle-node'} data-kind={data.kind}>
      <div className="board-circle-node-icon">
        <Handle className="board-node-handle" id="top" position={Position.Top} type="source" />
        <Handle className="board-node-handle" id="left" position={Position.Left} type="source" />
        <Handle className="board-node-handle" id="right" position={Position.Right} type="source" />
        <Handle className="board-node-handle" id="bottom" position={Position.Bottom} type="source" />
        <BoardNodeIcon kind={data.kind} />
      </div>
      <span className="board-circle-node-label">{data.label}</span>
      {data.metric && <span className="board-circle-node-metric">{data.metric}</span>}
      {data.note && <span className="board-node-note">{data.note}</span>}
    </div>
  )
}

function BoardNoteNode({ data, selected }: NodeProps<Node<BoardNodeData>>) {
  return (
    <div className={selected ? 'board-note-node selected' : 'board-note-node'}>
      <NodeResizer
        isVisible={selected}
        minWidth={180}
        minHeight={110}
        color="#facc15"
        handleClassName="board-note-resize-handle"
        lineClassName="board-note-resize-line"
      />
      <Handle className="board-node-handle" id="top" position={Position.Top} type="source" />
      <Handle className="board-node-handle" id="left" position={Position.Left} type="source" />
      <div className="board-note-node-inner">
        <p className="board-note-title">{data.label}</p>
        {data.metric && <p className="board-note-body">{data.metric}</p>}
      </div>
      <Handle className="board-node-handle" id="right" position={Position.Right} type="source" />
      <Handle className="board-node-handle" id="bottom" position={Position.Bottom} type="source" />
    </div>
  )
}

function BoardSourceNode({ data, selected }: NodeProps<Node<BoardNodeData>>) {
  return (
    <div
      className={selected ? 'board-source-node selected' : 'board-source-node'}
      data-kind={data.kind}
    >
      <div className="board-source-node-icon">
        <Handle className="board-node-handle" id="top" position={Position.Top} type="source" />
        <Handle className="board-node-handle" id="left" position={Position.Left} type="source" />
        <Handle className="board-node-handle" id="right" position={Position.Right} type="source" />
        <Handle className="board-node-handle" id="bottom" position={Position.Bottom} type="source" />
        <BoardSourceIcon kind={data.kind} logoUrl={data.logoUrl} />
      </div>
      <span className="board-source-node-label">{data.label}</span>
      {data.note && <span className="board-node-note">{data.note}</span>}
    </div>
  )
}

function BoardSourceIcon({ kind, compact = false, logoUrl }: { kind: BoardNodeKind, compact?: boolean, logoUrl?: string }) {
  // Custom: renderiza imagem da URL ou placeholder
  if (kind === 'Custom') {
    const size = compact
      ? { width: 30, height: 30 }
      : { width: 42, height: 42 }
    if (logoUrl) {
      return (
        <div className="board-custom-logo-wrap" style={{ ...size, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="Logo" />
        </div>
      )
    }
    return (
      <div className="board-custom-logo-placeholder" style={{ ...size, flexShrink: 0 }} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    )
  }

  if (kind === 'Meta') {
    if (compact) return (
      <div style={{ width: 36, height: 22, flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/meta.png" alt="Meta" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>
    )
    return (
      <div style={{ width: 46, height: 28, flexShrink: 0, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/meta.png" alt="Meta" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>
    )
  }

  if (kind === 'Google') {
    if (compact) return (
      <svg viewBox="0 0 48 48" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
    )
    return (
      <div style={{ width: 36, height: 36, flexShrink: 0, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/google.png" alt="Google" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>
    )
  }

  if (kind === 'TikTok') {
    return (
      <svg viewBox="0 0 884.95 1000" aria-hidden>
        <path fill="#FF004F" d="M655.853,360.979c64.565,46.13,143.67,73.274,229.097,73.274V269.94c-16.168,0.007-32.294-1.68-48.111-5.033v129.339c-85.422,0-164.513-27.144-229.098-73.274v335.311c0,167.738-136.048,303.711-303.864,303.711c-62.614,0-120.814-18.923-169.163-51.368c55.18,56.39,132.13,91.374,217.262,91.374c167.828,0,303.883-135.969,303.883-303.718V360.979H655.853z M715.204,195.209c-32.997-36.029-54.659-82.595-59.351-134.076V40H610.26C621.735,105.428,660.879,161.327,715.204,195.209L715.204,195.209z M240.855,779.91c-18.434-24.158-28.398-53.716-28.353-84.104c0-76.72,62.23-138.92,139.002-138.92c14.306-0.012,28.528,2.187,42.165,6.508V395.41c-15.935-2.183-32.015-3.108-48.095-2.768v130.751c-13.644-4.324-27.871-6.519-42.183-6.511c-76.773,0-138.998,62.201-138.998,138.929C164.396,710.06,195.5,757.031,240.855,779.91z" />
        <path fill="#ffffff" d="M607.741,320.973c64.585,46.13,143.676,73.274,229.098,73.274V264.908c-47.682-10.147-89.895-35.056-121.635-69.699C660.879,161.327,621.735,105.427,610.26,40H490.5v656.278c-0.271,76.509-62.394,138.455-139.001,138.455c-45.145,0-85.251-21.505-110.649-54.822c-45.358-22.879-76.46-69.851-76.46-124.102c0-76.725,62.224-138.926,138.997-138.926c14.708,0,28.885,2.291,42.183,6.508V392.642c-164.868,3.404-297.463,138.046-297.463,303.64c0,82.66,33.021,157.598,86.607,212.349C183.062,941.078,241.262,960,303.876,960c167.816,0,303.864-135.979,303.864-303.711V320.973L607.741,320.973z" />
        <path fill="#00F2EA" d="M836.838,264.908v-34.974c-43,0.065-85.151-11.97-121.635-34.73C747.498,230.542,790.021,254.911,836.838,264.908z M610.26,40c-1.096-6.252-1.938-12.546-2.52-18.867V0H442.384v656.283c-0.265,76.5-62.384,138.448-138.998,138.448c-22.496,0-43.728-5.334-62.537-14.821c25.398,33.317,65.504,54.822,110.649,54.822c76.602,0,138.731-61.946,139.001-138.455V40H610.26z M345.575,392.643V355.41c-13.817-1.889-27.747-2.833-41.692-2.826C136.047,352.583,0,488.56,0,656.283C0,761.44,53.469,854.111,134.72,908.626c-53.587-54.748-86.607-129.687-86.607-212.349C48.113,530.691,180.702,396.047,345.575,392.643z" />
      </svg>
    )
  }

  if (kind === 'Instagram') {
    /* Compact (painel): símbolo outline sem fundo */
    if (compact) return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <defs>
          <linearGradient id="ig-s" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="35%" stopColor="#e1306c" />
            <stop offset="100%" stopColor="#833ab4" />
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="22" height="22" rx="6" fill="none" stroke="url(#ig-s)" strokeWidth="2.4" />
        <circle cx="16" cy="16" r="5" fill="none" stroke="url(#ig-s)" strokeWidth="2.4" />
        <circle cx="23" cy="9" r="1.8" fill="#e1306c" />
      </svg>
    )
    /* Full (node / painel lateral): imagem oficial */
    return (
      <div style={{ width: 38, height: 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/instagram.svg" alt="Instagram" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }

  if (kind === 'LinkedIn') {
    /* Compact (painel): símbolo "in" sem fundo */
    if (compact) return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <circle cx="9" cy="8.5" r="2.5" fill="#0A66C2" />
        <rect x="6.8" y="13" width="4.5" height="12" rx="0.5" fill="#0A66C2" />
        <path fill="#0A66C2" d="M14.5 25 V13 H19 V15 C19.8 13.7 21.4 13 23.2 13 C26.5 13 28.5 15.2 28.5 19 V25 H24 V19.5 C24 17.8 23.3 16.8 21.9 16.8 C20.4 16.8 19.5 17.9 19.5 19.8 V25 Z" />
      </svg>
    )
    /* Full: imagem oficial */
    return (
      <div style={{ width: 38, height: 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/linkedin.png" alt="LinkedIn" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }

  if (kind === 'YouTube') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <path fill="#FF0000" d="M29.3 9.3A3.6 3.6 0 0 0 26.7 6.6C24.5 6 16 6 16 6s-8.5 0-10.7.6A3.6 3.6 0 0 0 2.7 9.3C2 11.5 2 16 2 16s0 4.5.7 6.7a3.6 3.6 0 0 0 2.6 2.6C7.5 26 16 26 16 26s8.5 0 10.7-.7a3.6 3.6 0 0 0 2.6-2.6C30 20.5 30 16 30 16s0-4.5-.7-6.7z" />
        <path fill="#fff" d="M13 20.5v-9L21 16z" />
      </svg>
    )
  }

  if (kind === 'Lista') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <path stroke="#818cf8" strokeWidth="2.4" fill="none" strokeLinecap="round" d="M6 10h20M6 16h20M6 22h13" />
        <circle cx="25" cy="23" r="5.5" fill="#6366f1" />
        <path stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" d="M22.5 23l2 2 3.5-3.5" />
      </svg>
    )
  }

  if (kind === 'Afiliado') {
    /* chain-link = affiliate connection */
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <path fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round"
          d="M13.5 18.5l-2 2a4.24 4.24 0 0 1-6-6l4-4a4.24 4.24 0 0 1 5.66 0" />
        <path fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round"
          d="M18.5 13.5l2-2a4.24 4.24 0 0 1 6 6l-4 4a4.24 4.24 0 0 1-5.66 0" />
        <line x1="14" y1="18" x2="18" y2="14" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'Indicação') {
    /* two-people referral icon */
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <circle cx="11" cy="9" r="4" fill="none" stroke="#10b981" strokeWidth="2" />
        <path fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"
          d="M3 26c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        <circle cx="23" cy="10" r="3" fill="none" stroke="#10b981" strokeWidth="2" />
        <path fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"
          d="M20 21c.9-.6 2-1 3-1 3.3 0 6 2.7 6 6" />
      </svg>
    )
  }

  if (kind === 'Monnetize') {
    return (
      <div style={{ width: compact ? 28 : 38, height: compact ? 28 : 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/Monnetize.png" alt="Monnetize" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }

  if (kind === 'Ticto') {
    return (
      <div style={{ width: compact ? 28 : 38, height: compact ? 28 : 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/ticto.png" alt="Ticto" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }

  if (kind === 'Kirvano') {
    return (
      <div style={{ width: compact ? 28 : 38, height: compact ? 28 : 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/kirvano.png" alt="Kirvano" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }

  if (kind === 'Hotmart') {
    return (
      <div style={{ width: compact ? 28 : 38, height: compact ? 28 : 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/hotmart.png" alt="Hotmart" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }

  if (kind === 'Kiwify') {
    return (
      <div style={{ width: compact ? 28 : 38, height: compact ? 28 : 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/kiwify.jpg" alt="Kiwify" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }

  if (kind === 'Hubla') {
    return (
      <div style={{ width: compact ? 28 : 38, height: compact ? 28 : 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/hubla.png" alt="Hubla" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }

  /* ── Campos de coleta de dados ─────────────────────────── */
  if (kind === 'Nome') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <circle cx="16" cy="11" r="5" fill="none" stroke="#22d3ee" strokeWidth="2.2" />
        <path fill="none" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round"
          d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" />
      </svg>
    )
  }

  if (kind === 'Email') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <rect x="3" y="8" width="26" height="18" rx="3" fill="none" stroke="#818cf8" strokeWidth="2.2" />
        <path fill="none" stroke="#818cf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          d="M3 11l13 9 13-9" />
      </svg>
    )
  }

  if (kind === 'Telefone') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <path fill="none" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          d="M10 4h4l2 5-3 1.5a13.5 13.5 0 0 0 8.5 8.5L23 16l5 2v4c0 1.5-1.5 2.5-3 2C12 22 8 12 8 8c-.5-1.5.5-4 2-4z" />
      </svg>
    )
  }

  if (kind === 'CPF') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <rect x="3" y="7" width="26" height="18" rx="3" fill="none" stroke="#fb923c" strokeWidth="2.2" />
        <circle cx="11" cy="14" r="3" fill="none" stroke="#fb923c" strokeWidth="1.8" />
        <path stroke="#fb923c" strokeWidth="1.8" fill="none" strokeLinecap="round"
          d="M17 12h7M17 16h5M8 20h16" />
      </svg>
    )
  }

  if (kind === 'Endereço') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <path fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          d="M16 3C11 3 7 7.5 7 13c0 7 9 16 9 16s9-9 9-16c0-5.5-4-10-9-10z" />
        <circle cx="16" cy="13" r="3" fill="none" stroke="#f87171" strokeWidth="2" />
      </svg>
    )
  }

  if (kind === 'Nascimento') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <rect x="3" y="9" width="26" height="20" rx="3" fill="none" stroke="#e879f9" strokeWidth="2.2" />
        <path stroke="#e879f9" strokeWidth="2.2" fill="none" strokeLinecap="round"
          d="M10 9V6M22 9V6M3 15h26" />
        <text x="16" y="25" textAnchor="middle" fill="#e879f9" fontSize="8" fontWeight="700"
          fontFamily="Arial, sans-serif">DATA</text>
      </svg>
    )
  }

  if (kind === 'Empresa') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        <rect x="5" y="10" width="22" height="18" rx="2" fill="none" stroke="#a78bfa" strokeWidth="2.2" />
        <path fill="none" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round"
          d="M11 10V7a5 5 0 0 1 10 0v3" />
        <path stroke="#a78bfa" strokeWidth="1.8" fill="none" strokeLinecap="round"
          d="M10 18h4M10 22h8M18 18h4" />
      </svg>
    )
  }

  if (kind === 'Sexo') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden>
        {/* símbolo feminino */}
        <circle cx="11" cy="12" r="5.5" fill="none" stroke="#f472b6" strokeWidth="2.2" />
        <path stroke="#f472b6" strokeWidth="2.2" fill="none" strokeLinecap="round"
          d="M11 17.5V26M8 23h6" />
        {/* símbolo masculino */}
        <circle cx="21" cy="15" r="4.5" fill="none" stroke="#60a5fa" strokeWidth="2.2" />
        <path stroke="#60a5fa" strokeWidth="2.2" fill="none" strokeLinecap="round"
          d="M24.2 11.8L28 8M25 8h3v3" />
      </svg>
    )
  }

  /* Orgânico — 3 folhas centralizadas */
  return (
    <svg viewBox="0 0 32 32" aria-hidden>
      {/* folha central (topo) */}
      <path fill="#22c55e" d="M16 19 C15 15 13 9 15 5 C16 3 18 3 19 6 C20 10 18 15 16 19 Z" />
      {/* folha direita */}
      <path fill="#16a34a" d="M16 22 C19 19 24 18 27 14 C28 11 26 8 23 10 C20 12 17 17 16 22 Z" />
      {/* folha esquerda */}
      <path fill="#4ade80" d="M16 22 C13 19 8 18 5 14 C4 11 6 8 9 10 C12 12 15 17 16 22 Z" />
      {/* caule */}
      <path stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round" d="M16 22 L16 29" />
    </svg>
  )
}

function BoardCanvasNode({ data, selected }: NodeProps<Node<BoardNodeData>>) {
  if (data.kind === 'Anotação') {
    return (
      <div className={selected ? 'board-note-node selected' : 'board-note-node'}>
        <Handle className="board-node-handle" id="top" position={Position.Top} type="source" />
        <Handle className="board-node-handle" id="left" position={Position.Left} type="source" />
        <div className="board-note-node-inner">
          <p className="board-note-title">{data.label}</p>
          {data.metric && <p className="board-note-body">{data.metric}</p>}
        </div>
        <Handle className="board-node-handle" id="right" position={Position.Right} type="source" />
        <Handle className="board-node-handle" id="bottom" position={Position.Bottom} type="source" />
      </div>
    )
  }

  return (
    <div
      className={selected ? 'board-flow-node selected' : 'board-flow-node'}
      data-kind={data.kind}
    >
      <Handle className="board-node-handle" id="top" position={Position.Top} type="source" />
      <Handle className="board-node-handle" id="left" position={Position.Left} type="source" />
      <div className="board-flow-node-inner">
        <div className="board-flow-window">
          <span />
          <span />
          <span />
        </div>
        <div className="board-flow-node-body">
          <BoardNodeIcon kind={data.kind} />
          <strong>{data.label}</strong>
          {data.metric && CONTENT_KINDS.has(data.kind)
            ? <p className="board-flow-node-desc">{data.metric}</p>
            : data.metric
              ? <span>{data.metric}</span>
              : null
          }
        </div>
      </div>
      <Handle className="board-node-handle" id="right" position={Position.Right} type="source" />
      <Handle className="board-node-handle" id="bottom" position={Position.Bottom} type="source" />
    </div>
  )
}

function BoardNodeIcon({ kind }: { kind: BoardNodeKind }) {
  if (kind === 'E-mail') return <EmailActionIcon />
  if (kind === 'WhatsApp') return <WhatsAppIcon />

  if (kind === 'Decisão') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="m12 3 9 9-9 9-9-9 9-9Z" />
      </svg>
    )
  }

  if (kind === 'Venda' || kind === 'Checkout' || kind === 'Order Bump') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M6 6h15l-2 8H8L6 6Z" />
        <path d="M6 6 5 3H2" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
    )
  }

  if (kind === 'Anúncio') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M4 14h4l10-6v12L8 14" />
        <path d="M8 14v5" />
      </svg>
    )
  }

  if (kind === 'Opt-in') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </svg>
    )
  }

  if (kind === 'SMS') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  }

  if (kind === 'Obrigado' || kind === 'Confirmação') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  }

  if (kind === 'Início') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="m10 8 6 4-6 4V8Z" />
      </svg>
    )
  }

  if (kind === 'Final') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9h6v6H9z" />
      </svg>
    )
  }

  if (kind === 'Aprovação') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
    )
  }

  if (kind === 'Aguardar') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    )
  }

  if (kind === 'Notificação') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    )
  }

  if (kind === 'Reunião') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    )
  }

  if (kind === 'Webinar') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="m10 8 5 3-5 3V8Z" />
      </svg>
    )
  }

  if (kind === 'VSL') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <circle cx="12" cy="12" r="4" />
        <path d="m10.5 10.5 4 3-4 3v-6Z" />
      </svg>
    )
  }

  if (kind === 'Survey') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h4" />
        <circle cx="6" cy="7" r="1" />
        <circle cx="6" cy="11" r="1" />
        <circle cx="6" cy="15" r="1" />
      </svg>
    )
  }

  if (kind === 'Pop-up') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" opacity=".4" />
        <rect x="5" y="7" width="14" height="10" rx="2" />
        <path d="M16 7V5M5 12h14" />
      </svg>
    )
  }

  if (kind === 'Ligação') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9Z" />
      </svg>
    )
  }

  if (kind === 'Grupo') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="3" />
        <circle cx="16" cy="7" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6" />
        <path d="M9 20v-1" />
        <path d="M15 20v-1" />
      </svg>
    )
  }

  if (kind === 'Formulário') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h6" />
        <path d="M17 14v4M15 16h4" />
      </svg>
    )
  }

  if (kind === 'Integração') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    )
  }

  if (kind === 'Anotação') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    )
  }

  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M7 9h10" />
      <path d="M7 13h6" />
    </svg>
  )
}


function SidebarIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M9 5v14" />
    </svg>
  )
}

function EmailActionIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
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

function WhatsAppIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M5.5 18.5 4 22l3.7-1.2A9 9 0 1 0 3 12a8.8 8.8 0 0 0 2.5 6.5Z" />
      <path d="M9.2 8.8c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.3 0 .5-.1.6l-.4.5c-.1.2-.2.3 0 .6.5 1 1.4 1.8 2.4 2.3.3.2.5.1.6-.1l.6-.7c.2-.2.4-.2.7-.1l1.5.7c.3.1.4.3.4.5 0 .6-.4 1.4-.9 1.6-.6.3-2.5.5-5-1.4-2.1-1.6-3.3-3.8-3.4-4.7-.1-.5.4-1.1.7-1.3Z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
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

function ArrowLeftIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

function LayoutIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  )
}

function SelectToolIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path fill="currentColor" d="M4 3l16 9.5-8.5 1.5L8 22z" />
    </svg>
  )
}

function HandToolIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V8a2 2 0 0 0-4 0v3M14 8V6a2 2 0 0 0-4 0v2M10 7a2 2 0 0 0-4 0v5l-1.5-1.5A1.5 1.5 0 0 0 2.5 12c0 .4.16.78.44 1.06L7 17.5A7 7 0 0 0 14 20h1a5 5 0 0 0 5-5v-4a2 2 0 0 0-4 0" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
    </svg>
  )
}
function RedoIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H9a5 5 0 0 0 0 10h4" />
    </svg>
  )
}

function AlignLeftIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <line x1="3" y1="3" x2="3" y2="21" />
      <rect x="5" y="6" width="12" height="4" rx="1" />
      <rect x="5" y="14" width="8" height="4" rx="1" />
    </svg>
  )
}
function AlignCenterHIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <line x1="12" y1="3" x2="12" y2="21" />
      <rect x="5" y="6" width="14" height="4" rx="1" />
      <rect x="8" y="14" width="8" height="4" rx="1" />
    </svg>
  )
}
function AlignRightIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <line x1="21" y1="3" x2="21" y2="21" />
      <rect x="7" y="6" width="12" height="4" rx="1" />
      <rect x="11" y="14" width="8" height="4" rx="1" />
    </svg>
  )
}
function AlignTopIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <line x1="3" y1="3" x2="21" y2="3" />
      <rect x="6" y="5" width="4" height="12" rx="1" />
      <rect x="14" y="5" width="4" height="8" rx="1" />
    </svg>
  )
}
function AlignCenterVIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="8" width="4" height="8" rx="1" />
    </svg>
  )
}
function AlignBottomIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <line x1="3" y1="21" x2="21" y2="21" />
      <rect x="6" y="7" width="4" height="12" rx="1" />
      <rect x="14" y="11" width="4" height="8" rx="1" />
    </svg>
  )
}
function DistributeHIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <line x1="3" y1="4" x2="3" y2="20" />
      <line x1="21" y1="4" x2="21" y2="20" />
      <rect x="10" y="8" width="4" height="8" rx="1" />
    </svg>
  )
}
function GroupIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 2" />
      <rect x="6.5" y="6.5" width="5" height="5" rx="1" fill="currentColor" stroke="none" />
      <rect x="12.5" y="12.5" width="5" height="5" rx="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
function UngroupIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="9" height="9" rx="1.5" strokeDasharray="3 2" />
      <rect x="12" y="12" width="9" height="9" rx="1.5" strokeDasharray="3 2" />
      <rect x="5.5" y="5.5" width="4" height="4" rx="1" fill="currentColor" stroke="none" />
      <rect x="14.5" y="14.5" width="4" height="4" rx="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function DistributeVIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <line x1="4" y1="3" x2="20" y2="3" />
      <line x1="4" y1="21" x2="20" y2="21" />
      <rect x="8" y="10" width="8" height="4" rx="1" />
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

function ImportLeadsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M4 4h10l6 6v10H4z" />
      <path d="M14 4v6h6" />
      <path d="M12 18v-7" />
      <path d="m9 14 3-3 3 3" />
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

function LinkPlusIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.9 5.03" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07l1.22-1.22" />
      <path d="M18 17h4" />
      <path d="M20 15v4" />
    </svg>
  )
}

function DispatchPlusIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
      <path d="M16 18h4" />
      <path d="M18 16v4" />
    </svg>
  )
}

function BoardPlusIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M15 4v16" />
      <path d="M17 10h4" />
      <path d="M19 8v4" />
    </svg>
  )
}

function FinancePlusIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M4 19V5" />
      <path d="M4 19h17" />
      <path d="M8 16v-5" />
      <path d="M13 16V8" />
      <path d="M18 16v-3" />
      <path d="M17 5h4" />
      <path d="M19 3v4" />
    </svg>
  )
}

function ModuleIcon({
  type,
}: {
  type: 'dispatches' | 'crm' | 'finance' | 'links' | 'boards' | 'clients'
}) {
  if (type === 'dispatches') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    )
  }

  if (type === 'crm') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M2.5 21a5.5 5.5 0 0 1 11 0" />
        <path d="M17 10h4" />
        <path d="M19 8v4" />
        <path d="M16 17h5" />
      </svg>
    )
  }

  if (type === 'finance') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="M8 16v-5" />
        <path d="M13 16V8" />
        <path d="M18 16v-3" />
      </svg>
    )
  }

  if (type === 'links') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.9 5.03" />
        <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07l1.22-1.22" />
      </svg>
    )
  }

  if (type === 'boards') {
    return (
      <svg aria-hidden viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
        <path d="M15 4v16" />
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

  return null
}
