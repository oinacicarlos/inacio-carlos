import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import AdminOnlineRequestActions from '@/components/admin-online-request-actions'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  Gauge,
  Inbox,
  Mail,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  WalletCards,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS, type RequestCategory, type RequestPriority, type RequestStatus } from '@/lib/client-requests/constants'
import { isPlanSlug, PLAN_DETAILS, type PlanSlug } from '@/lib/plans'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceRoleSupabaseClient } from '@/lib/supabase/service-role'
import type { ToolSlug } from '@/lib/tool-usage/tools'

type AdminOnlineModule = 'clientes' | 'solicitacoes' | 'processos' | 'compras' | 'ferramentas' | 'assinaturas'

type AdminOnlineClientsProps = {
  activeModule?: string
}

type ClientHubProfileRow = {
  id: string
  name: string
  phone: string
  document: string
  company_name: string
  current_plan: string
  subscription_status: string
  stripe_customer_id: string | null
  current_period_end?: string | null
  created_at: string
  updated_at: string
}

type ClientRequestRow = {
  id: string
  user_id: string
  category: RequestCategory
  title: string
  description: string
  priority: RequestPriority
  status: RequestStatus
  attachment_path: string | null
  internal_note?: string | null
  created_at: string
  updated_at: string
}

type ProductPurchaseRow = {
  user_id: string
  product: string
  amount_total: number | null
  stripe_checkout_session_id: string | null
  created_at: string
}

type OnboardingRow = {
  id: string
  user_id: string
  wants_certificado: boolean | null
  wants_abertura_empresa: boolean | null
  wants_abertura_mei?: boolean | null
  wants_alteracao_cnpj?: boolean | null
  certificado_status: string | null
  abertura_status: string | null
  mei_status?: string | null
  alteracao_status?: string | null
  updated_at: string
  created_at: string
}

type ToolUsageRow = {
  user_id: string
  tool: ToolSlug | string
  used_at: string
}

type AdminOnlineNavItem = {
  module: AdminOnlineModule
  label: string
  icon: LucideIcon
}

const ADMIN_ONLINE_MODULES = new Set<AdminOnlineModule>([
  'clientes',
  'solicitacoes',
  'processos',
  'compras',
  'ferramentas',
  'assinaturas',
])

const ADMIN_ONLINE_NAV: AdminOnlineNavItem[] = [
  { module: 'clientes', label: 'Clientes', icon: UserRound },
  { module: 'solicitacoes', label: 'Solicitações', icon: Inbox },
  { module: 'processos', label: 'Processos', icon: ClipboardList },
  { module: 'compras', label: 'Compras avulsas', icon: ShoppingBag },
  { module: 'ferramentas', label: 'Ferramentas', icon: Wrench },
  { module: 'assinaturas', label: 'Assinaturas', icon: WalletCards },
]

const MODULE_COPY: Record<AdminOnlineModule, { eyebrow: string; title: string; description: string }> = {
  clientes: {
    eyebrow: 'Online',
    title: 'Clientes do Hub',
    description: 'Visão dos clientes que já acessam o novo sistema da Tropa.',
  },
  solicitacoes: {
    eyebrow: 'Fila SaaS',
    title: 'Solicitações',
    description: 'Pedidos enviados pelo Hub, compras que viraram demanda e documentos recebidos.',
  },
  processos: {
    eyebrow: 'Operação',
    title: 'Processos e onboarding',
    description: 'MEI, certificado digital, abertura de empresa e alteração contratual.',
  },
  compras: {
    eyebrow: 'Receita avulsa',
    title: 'Compras avulsas',
    description: 'Produtos contratados separadamente e sua ligação com solicitações ou processos.',
  },
  ferramentas: {
    eyebrow: 'Uso do Hub',
    title: 'Ferramentas',
    description: 'Acompanhamento mensal das ferramentas usadas pelos clientes online.',
  },
  assinaturas: {
    eyebrow: 'Planos',
    title: 'Assinaturas',
    description: 'Planos, status, vencimentos e vínculos com Stripe.',
  },
}

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  free: 'Sem assinatura',
  active: 'Ativa',
  trialing: 'Em teste',
  past_due: 'Pagamento pendente',
  canceled: 'Cancelada',
  inactive: 'Inativa',
}

const PRODUCT_LABELS: Record<string, string> = {
  certificado_pj_a1: 'Certificado Digital PJ A1',
  certificado_pf_a1: 'Certificado Digital PF A1',
  abertura_empresa: 'Abertura de empresa',
  alteracao_cnpj: 'Alteração contratual',
  serasa_pf: 'Consulta Serasa PF',
  serasa_pj: 'Consulta Serasa PJ',
  nota_fiscal_servico: 'Nota Fiscal de Serviço',
  nota_fiscal_produto: 'Nota Fiscal de Produto',
}

const TOOL_LABELS: Record<string, string> = {
  'gerador-contrato': 'Gerador de Contratos',
  'simulador-rescisao': 'Simulador de Rescisão',
  'simulador-contratacao': 'Simulador de Contratação',
  'calculadora-precificacao': 'Calculadora de Precificação',
}

const OPEN_REQUEST_STATUSES = new Set<RequestStatus>(['recebida', 'em_analise', 'aguardando_cliente', 'em_andamento'])
const PENDING_PROCESS_STATUSES = new Set(['triagem_enviada', 'aguardando_agendamento', 'em_atendimento', 'senha_recebida', 'em_analise', 'protocolado_junta', 'protocolado'])

function resolveAdminOnlineModule(value: string | undefined): AdminOnlineModule {
  return value && ADMIN_ONLINE_MODULES.has(value as AdminOnlineModule) ? value as AdminOnlineModule : 'clientes'
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrencyFromCents(value: number | null | undefined) {
  if (typeof value !== 'number') return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100)
}

function getPlanLabel(plan: string) {
  return isPlanSlug(plan) ? PLAN_DETAILS[plan].label : plan || '—'
}

function getPlanOrder(plan: string) {
  const order: Record<PlanSlug, number> = {
    free: 0,
    bronze: 1,
    prata: 2,
    ouro: 3,
    diamante: 4,
  }

  return isPlanSlug(plan) ? order[plan] : -1
}

function compactList(items: string[], empty = 'Sem registros') {
  if (!items.length) return empty
  if (items.length <= 2) return items.join(', ')
  return `${items.slice(0, 2).join(', ')} +${items.length - 2}`
}

function monthReference() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function clientLabel(profile: ClientHubProfileRow | undefined, email: string | undefined) {
  return profile?.name || profile?.company_name || email || 'Cliente sem nome'
}

function processLabels(onboarding: OnboardingRow | undefined) {
  if (!onboarding) return []

  return [
    onboarding.wants_abertura_mei ? 'MEI' : null,
    onboarding.wants_certificado ? 'Certificado' : null,
    onboarding.wants_abertura_empresa ? 'Abertura' : null,
    onboarding.wants_alteracao_cnpj ? 'Alteração' : null,
  ].filter(Boolean) as string[]
}

function activeProcessStatuses(onboarding: OnboardingRow) {
  return [
    onboarding.wants_abertura_mei ? onboarding.mei_status : null,
    onboarding.wants_certificado ? onboarding.certificado_status : null,
    onboarding.wants_abertura_empresa ? onboarding.abertura_status : null,
    onboarding.wants_alteracao_cnpj ? onboarding.alteracao_status : null,
  ].filter(Boolean) as string[]
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={status === 'active' || status === 'concluida' || status === 'concluido' || status === 'pago' ? 'admin-online-status is-active' : 'admin-online-status'}>
      <ShieldCheck size={13} strokeWidth={2.1} aria-hidden="true" />
      {SUBSCRIPTION_STATUS_LABELS[status] ?? STATUS_LABELS[status as RequestStatus] ?? status.replaceAll('_', ' ')}
    </span>
  )
}

function EmptyState({ children }: { children: string }) {
  return <p className="admin-online-empty">{children}</p>
}

export default async function AdminOnlineClients({ activeModule: rawActiveModule }: AdminOnlineClientsProps = {}) {
  const activeModule = resolveAdminOnlineModule(rawActiveModule)
  const copy = MODULE_COPY[activeModule]
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: isAdmin } = await supabase.rpc('is_admin')

  if (isAdmin !== true) {
    redirect('/hub')
  }

  let profiles: ClientHubProfileRow[] = []
  let requests: ClientRequestRow[] = []
  let purchases: ProductPurchaseRow[] = []
  let onboardings: OnboardingRow[] = []
  let toolUsage: ToolUsageRow[] = []
  let emailByUserId = new Map<string, string>()
  let loadError = ''

  try {
    const serviceClient = createServiceRoleSupabaseClient()
    const [profilesResult, requestsResult, purchasesResult, onboardingResult, toolUsageResult, usersResult] = await Promise.all([
      serviceClient
        .from('client_hub_profiles')
        .select('id, name, phone, document, company_name, current_plan, subscription_status, stripe_customer_id, current_period_end, created_at, updated_at')
        .order('updated_at', { ascending: false }),
      serviceClient
        .from('client_requests')
        .select('id, user_id, category, title, description, priority, status, attachment_path, created_at, updated_at')
        .order('created_at', { ascending: false }),
      serviceClient
        .from('product_purchases')
        .select('user_id, product, amount_total, stripe_checkout_session_id, created_at')
        .order('created_at', { ascending: false }),
      serviceClient
        .from('onboarding_intakes')
        .select('id, user_id, wants_certificado, wants_abertura_empresa, wants_abertura_mei, wants_alteracao_cnpj, certificado_status, abertura_status, mei_status, alteracao_status, created_at, updated_at')
        .order('updated_at', { ascending: false }),
      serviceClient.from('tool_usage').select('user_id, tool, used_at').eq('reference_month', monthReference()),
      serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ])

    if (profilesResult.error) {
      loadError = 'Não foi possível carregar os clientes online.'
    }

    profiles = (profilesResult.data as ClientHubProfileRow[] | null) ?? []
    requests = (requestsResult.data as ClientRequestRow[] | null) ?? []
    purchases = (purchasesResult.data as ProductPurchaseRow[] | null) ?? []
    onboardings = (onboardingResult.data as OnboardingRow[] | null) ?? []
    toolUsage = (toolUsageResult.data as ToolUsageRow[] | null) ?? []

    if (requests.length > 0) {
      const { data: notesData } = await serviceClient
        .from('client_requests')
        .select('id, internal_note')
        .in('id', requests.map((requestRow) => requestRow.id))

      const notesByRequest = new Map((notesData as { id: string; internal_note: string | null }[] | null ?? []).map((requestRow) => [requestRow.id, requestRow.internal_note]))
      requests = requests.map((requestRow) => ({
        ...requestRow,
        internal_note: notesByRequest.get(requestRow.id) ?? null,
      }))
    }

    if (!usersResult.error) {
      emailByUserId = new Map(usersResult.data.users.map((onlineUser) => [onlineUser.id, onlineUser.email ?? '']))
    }
  } catch {
    loadError = 'Configuração administrativa do Supabase indisponível para ler os clientes online.'
  }

  const profilesByUser = new Map(profiles.map((profile) => [profile.id, profile]))
  const requestsByUser = new Map<string, ClientRequestRow[]>()
  const purchasesByUser = new Map<string, ProductPurchaseRow[]>()
  const onboardingByUser = new Map<string, OnboardingRow>()
  const toolUsageByUser = new Map<string, number>()
  const toolUsageByTool = new Map<string, number>()

  requests.forEach((request) => {
    requestsByUser.set(request.user_id, [...(requestsByUser.get(request.user_id) ?? []), request])
  })

  purchases.forEach((purchase) => {
    purchasesByUser.set(purchase.user_id, [...(purchasesByUser.get(purchase.user_id) ?? []), purchase])
  })

  onboardings.forEach((onboarding) => {
    onboardingByUser.set(onboarding.user_id, onboarding)
  })

  toolUsage.forEach((usage) => {
    toolUsageByUser.set(usage.user_id, (toolUsageByUser.get(usage.user_id) ?? 0) + 1)
    toolUsageByTool.set(usage.tool, (toolUsageByTool.get(usage.tool) ?? 0) + 1)
  })

  const paidClients = profiles.filter((profile) => profile.current_plan !== 'free').length
  const activeSubscriptions = profiles.filter((profile) => profile.subscription_status === 'active').length
  const openRequests = requests.filter((request) => OPEN_REQUEST_STATUSES.has(request.status)).length
  const onboardingPending = onboardings.filter((onboarding) => activeProcessStatuses(onboarding).some((status) => PENDING_PROCESS_STATUSES.has(status))).length
  const recentPurchases = purchases.filter((purchase) => {
    const createdAt = new Date(purchase.created_at).getTime()
    return Number.isFinite(createdAt) && Date.now() - createdAt <= 30 * 24 * 60 * 60 * 1000
  }).length

  const orderedProfiles = [...profiles].sort((left, right) => {
    const planDiff = getPlanOrder(right.current_plan) - getPlanOrder(left.current_plan)
    if (planDiff !== 0) return planDiff
    return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
  })

  const orderedRequests = [...requests].sort((left, right) => {
    const leftOpen = OPEN_REQUEST_STATUSES.has(left.status) ? 1 : 0
    const rightOpen = OPEN_REQUEST_STATUSES.has(right.status) ? 1 : 0
    if (rightOpen !== leftOpen) return rightOpen - leftOpen
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })

  const orderedOnboardings = [...onboardings].sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
  const orderedSubscriptions = [...profiles].sort((left, right) => {
    if (left.subscription_status === 'past_due' && right.subscription_status !== 'past_due') return -1
    if (right.subscription_status === 'past_due' && left.subscription_status !== 'past_due') return 1
    return getPlanOrder(right.current_plan) - getPlanOrder(left.current_plan)
  })
  const toolRows = Array.from(toolUsageByTool.entries()).sort((left, right) => right[1] - left[1])

  return (
    <main className="admin-online-page">
      <aside className="admin-online-sidebar" aria-label="Módulo online">
        <Link className="admin-online-back" href="/admin">
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
          Módulos
        </Link>
        <div className="admin-online-logo">
          <BrandLogo variant="black" />
        </div>
        <nav className="admin-online-nav" aria-label="Navegação do Online">
          {ADMIN_ONLINE_NAV.map((item) => {
            const Icon = item.icon
            const href = item.module === 'clientes' ? '/clientes/online' : `/clientes/online?modulo=${item.module}`

            return (
              <Link className={activeModule === item.module ? 'admin-online-nav-item is-active' : 'admin-online-nav-item'} href={href} key={item.module}>
                <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <section className="admin-online-main" aria-labelledby="admin-online-title">
        <header className="admin-online-header">
          <div>
            <span>{copy.eyebrow}</span>
            <h1 id="admin-online-title">{copy.title}</h1>
            <p>{copy.description}</p>
          </div>
          <Link className="admin-online-secondary-link" href="/clientes">
            Abrir Offline
          </Link>
        </header>

        {loadError ? <p className="admin-online-alert">{loadError}</p> : null}

        <div className="admin-online-metrics" aria-label="Resumo online">
          <article>
            <UserRound size={18} strokeWidth={2.2} aria-hidden="true" />
            <span>Clientes no Hub</span>
            <strong>{profiles.length}</strong>
          </article>
          <article>
            <CreditCard size={18} strokeWidth={2.2} aria-hidden="true" />
            <span>Planos pagos</span>
            <strong>{paidClients}</strong>
          </article>
          <article>
            <CheckCircle2 size={18} strokeWidth={2.2} aria-hidden="true" />
            <span>Assinaturas ativas</span>
            <strong>{activeSubscriptions}</strong>
          </article>
          <article>
            <Clock3 size={18} strokeWidth={2.2} aria-hidden="true" />
            <span>Solicitações abertas</span>
            <strong>{openRequests}</strong>
          </article>
          <article>
            <FileText size={18} strokeWidth={2.2} aria-hidden="true" />
            <span>Processos em triagem</span>
            <strong>{onboardingPending}</strong>
          </article>
          <article>
            <PackageCheck size={18} strokeWidth={2.2} aria-hidden="true" />
            <span>Compras 30 dias</span>
            <strong>{recentPurchases}</strong>
          </article>
        </div>

        {activeModule === 'clientes' && (
          <div className="admin-online-table-card">
            <div className="admin-online-table-head">
              <div>
                <h2>Base online</h2>
                <p>Clientes ordenados por plano e atualização mais recente.</p>
              </div>
              <span>{orderedProfiles.length} registro{orderedProfiles.length === 1 ? '' : 's'}</span>
            </div>

            {orderedProfiles.length === 0 ? (
              <EmptyState>Nenhum cliente online encontrado.</EmptyState>
            ) : (
              <div className="admin-online-table-wrap">
                <table className="admin-online-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Plano</th>
                      <th>Status</th>
                      <th>Solicitações</th>
                      <th>Produtos/processos</th>
                      <th>Ferramentas</th>
                      <th>Atualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedProfiles.map((profile) => {
                      const userRequests = requestsByUser.get(profile.id) ?? []
                      const userPurchases = purchasesByUser.get(profile.id) ?? []
                      const userOnboarding = onboardingByUser.get(profile.id)
                      const userOpenRequests = userRequests.filter((request) => OPEN_REQUEST_STATUSES.has(request.status)).length
                      const processes = processLabels(userOnboarding)

                      return (
                        <tr key={profile.id}>
                          <td>
                            <ClientCell profile={profile} email={emailByUserId.get(profile.id)} />
                          </td>
                          <td>
                            <span className="admin-online-plan-pill">{getPlanLabel(profile.current_plan)}</span>
                          </td>
                          <td>
                            <StatusPill status={profile.subscription_status} />
                            <small>{profile.current_period_end ? `Renova em ${formatDate(profile.current_period_end)}` : 'Sem vencimento ativo'}</small>
                          </td>
                          <td>
                            <strong>{userRequests.length}</strong>
                            <small>{userOpenRequests} aberta{userOpenRequests === 1 ? '' : 's'}</small>
                          </td>
                          <td>
                            <strong>{compactList(processes, 'Sem processo')}</strong>
                            <small>{compactList(userPurchases.map((purchase) => PRODUCT_LABELS[purchase.product] ?? purchase.product), 'Sem compra avulsa')}</small>
                          </td>
                          <td>
                            <span className="admin-online-tool-count">
                              <Gauge size={14} strokeWidth={2.1} aria-hidden="true" />
                              {toolUsageByUser.get(profile.id) ?? 0} uso{(toolUsageByUser.get(profile.id) ?? 0) === 1 ? '' : 's'} no mês
                            </span>
                          </td>
                          <td>{formatDate(profile.updated_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeModule === 'solicitacoes' && (
          <div className="admin-online-table-card">
            <div className="admin-online-table-head">
              <div>
                <h2>Fila de solicitações</h2>
                <p>Base operacional do que o cliente pediu pelo Hub.</p>
              </div>
              <span>{openRequests} aberta{openRequests === 1 ? '' : 's'}</span>
            </div>
            {orderedRequests.length === 0 ? (
              <EmptyState>Nenhuma solicitação online encontrada.</EmptyState>
            ) : (
              <div className="admin-online-table-wrap">
                <table className="admin-online-table admin-online-table-compact">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Solicitação</th>
                      <th>Status</th>
                      <th>Gestão</th>
                      <th>Atualização</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedRequests.map((request) => {
                      const profile = profilesByUser.get(request.user_id)

                      return (
                        <tr key={request.id}>
                          <td>{clientLabel(profile, emailByUserId.get(request.user_id))}</td>
                          <td>
                            <strong>{request.title}</strong>
                            <small>{CATEGORY_LABELS[request.category] ?? request.category}</small>
                            {request.description ? <small>{request.description}</small> : null}
                          </td>
                          <td><StatusPill status={request.status} /></td>
                          <td>
                            <AdminOnlineRequestActions
                              requestId={request.id}
                              initialStatus={request.status}
                              initialPriority={request.priority}
                              initialInternalNote={request.internal_note}
                              hasAttachment={Boolean(request.attachment_path)}
                            />
                          </td>
                          <td>
                            {formatDate(request.updated_at)}
                            <small>Enviada em {formatDate(request.created_at)}</small>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeModule === 'processos' && (
          <div className="admin-online-table-card">
            <div className="admin-online-table-head">
              <div>
                <h2>Processos e onboarding</h2>
                <p>Fila inicial para processos gerados por compra ou pelo MEI gratuito.</p>
              </div>
              <span>{onboardingPending} em andamento</span>
            </div>
            {orderedOnboardings.length === 0 ? (
              <EmptyState>Nenhum processo de onboarding encontrado.</EmptyState>
            ) : (
              <div className="admin-online-table-wrap">
                <table className="admin-online-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Processos</th>
                      <th>MEI</th>
                      <th>Certificado</th>
                      <th>Abertura</th>
                      <th>Alteração</th>
                      <th>Atualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedOnboardings.map((onboarding) => {
                      const profile = profilesByUser.get(onboarding.user_id)

                      return (
                        <tr key={onboarding.id}>
                          <td>{clientLabel(profile, emailByUserId.get(onboarding.user_id))}</td>
                          <td>{compactList(processLabels(onboarding), 'Sem processo')}</td>
                          <td>{onboarding.wants_abertura_mei ? (onboarding.mei_status ?? 'nao_iniciado').replaceAll('_', ' ') : '—'}</td>
                          <td>{onboarding.wants_certificado ? (onboarding.certificado_status ?? 'nao_iniciado').replaceAll('_', ' ') : '—'}</td>
                          <td>{onboarding.wants_abertura_empresa ? (onboarding.abertura_status ?? 'nao_iniciado').replaceAll('_', ' ') : '—'}</td>
                          <td>{onboarding.wants_alteracao_cnpj ? (onboarding.alteracao_status ?? 'nao_iniciado').replaceAll('_', ' ') : '—'}</td>
                          <td>{formatDate(onboarding.updated_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeModule === 'compras' && (
          <div className="admin-online-table-card">
            <div className="admin-online-table-head">
              <div>
                <h2>Compras avulsas</h2>
                <p>Contratações fora do plano mensal, vindas do checkout de produto.</p>
              </div>
              <span>{purchases.length} compra{purchases.length === 1 ? '' : 's'}</span>
            </div>
            {purchases.length === 0 ? (
              <EmptyState>Nenhuma compra avulsa registrada.</EmptyState>
            ) : (
              <div className="admin-online-table-wrap">
                <table className="admin-online-table admin-online-table-compact">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Produto</th>
                      <th>Valor</th>
                      <th>Destino operacional</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase, index) => {
                      const product = PRODUCT_LABELS[purchase.product] ?? purchase.product
                      const isRequestProduct = purchase.product.startsWith('serasa') || purchase.product.startsWith('nota_fiscal')

                      return (
                        <tr key={`${purchase.user_id}-${purchase.product}-${purchase.created_at}-${index}`}>
                          <td>{clientLabel(profilesByUser.get(purchase.user_id), emailByUserId.get(purchase.user_id))}</td>
                          <td><strong>{product}</strong></td>
                          <td>{formatCurrencyFromCents(purchase.amount_total)}</td>
                          <td>{isRequestProduct ? 'Solicitação automática' : 'Onboarding / processo'}</td>
                          <td>{formatDate(purchase.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeModule === 'ferramentas' && (
          <div className="admin-online-table-card">
            <div className="admin-online-table-head">
              <div>
                <h2>Uso de ferramentas</h2>
                <p>Resumo do mês atual por ferramenta e clientes com maior uso.</p>
              </div>
              <span>{toolUsage.length} uso{toolUsage.length === 1 ? '' : 's'} no mês</span>
            </div>
            {toolUsage.length === 0 ? (
              <EmptyState>Nenhum uso de ferramenta registrado neste mês.</EmptyState>
            ) : (
              <div className="admin-online-split-grid">
                <div className="admin-online-mini-card">
                  <h3>Por ferramenta</h3>
                  {toolRows.map(([tool, count]) => (
                    <div className="admin-online-list-row" key={tool}>
                      <span>{TOOL_LABELS[tool] ?? tool}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
                <div className="admin-online-mini-card">
                  <h3>Clientes com uso no mês</h3>
                  {Array.from(toolUsageByUser.entries())
                    .sort((left, right) => right[1] - left[1])
                    .slice(0, 12)
                    .map(([userId, count]) => (
                      <div className="admin-online-list-row" key={userId}>
                        <span>{clientLabel(profilesByUser.get(userId), emailByUserId.get(userId))}</span>
                        <strong>{count}</strong>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeModule === 'assinaturas' && (
          <div className="admin-online-table-card">
            <div className="admin-online-table-head">
              <div>
                <h2>Assinaturas</h2>
                <p>Leitura operacional dos planos e status gravados pelo Stripe.</p>
              </div>
              <span>{activeSubscriptions} ativa{activeSubscriptions === 1 ? '' : 's'}</span>
            </div>
            {orderedSubscriptions.length === 0 ? (
              <EmptyState>Nenhuma assinatura encontrada.</EmptyState>
            ) : (
              <div className="admin-online-table-wrap">
                <table className="admin-online-table admin-online-table-compact">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Plano</th>
                      <th>Status</th>
                      <th>Vencimento</th>
                      <th>Stripe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedSubscriptions.map((profile) => (
                      <tr key={profile.id}>
                        <td>{clientLabel(profile, emailByUserId.get(profile.id))}</td>
                        <td><span className="admin-online-plan-pill">{getPlanLabel(profile.current_plan)}</span></td>
                        <td><StatusPill status={profile.subscription_status} /></td>
                        <td>{profile.current_period_end ? formatDate(profile.current_period_end) : 'Sem vencimento ativo'}</td>
                        <td>
                          <strong>{profile.stripe_customer_id ? 'Cliente vinculado' : 'Sem customer'}</strong>
                          <small>{profile.stripe_customer_id ?? '—'}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

function ClientCell({ profile, email }: { profile: ClientHubProfileRow; email: string | undefined }) {
  return (
    <div className="admin-online-client-cell">
      <span className="admin-online-client-avatar">{(profile.name || profile.company_name || 'C').slice(0, 1).toUpperCase()}</span>
      <div>
        <strong>{profile.name || profile.company_name || 'Cliente sem nome'}</strong>
        <span>
          <Mail size={13} strokeWidth={2.1} aria-hidden="true" />
          {email || 'E-mail não disponível'}
        </span>
        {profile.phone ? (
          <span>
            <Phone size={13} strokeWidth={2.1} aria-hidden="true" />
            {profile.phone}
          </span>
        ) : null}
        {profile.company_name ? (
          <span>
            <Building2 size={13} strokeWidth={2.1} aria-hidden="true" />
            {profile.company_name}
          </span>
        ) : null}
      </div>
    </div>
  )
}
