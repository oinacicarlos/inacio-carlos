"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calculator,
  CreditCard,
  Crown,
  FileSignature,
  FileStack,
  FolderOpen,
  HelpCircle,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquarePlus,
  ReceiptText,
  Sparkles,
  UploadCloud,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"
import PricingCalculatorClient from "@/app/ferramentas/calculadora-precificacao/calculadora-precificacao-client"
import ContractGeneratorClient from "@/app/ferramentas/gerador-contrato/gerador-contrato-client"
import HiringSimulatorClient from "@/app/ferramentas/simulador-contratacao/simulador-contratacao-client"
import TerminationSimulatorClient from "@/app/ferramentas/simulador-rescisao/simulador-rescisao-client"
import AccountPanel from "@/components/hub/account-panel"
import RequestsPanel from "@/components/hub/requests-panel"
import type { RequestIntent } from "@/components/hub/requests-panel"
import SubscriptionPanel from "@/components/hub/subscription-panel"
import { ServicesProductsSection, type ServiceProcess } from "@/components/hub/onboarding-panel"
import RoutinesPanel from "@/components/hub/routines-panel"
import type { RequestFlowAction } from "@/lib/client-requests/flow"
import type { PlanSlug } from "@/lib/plans"
import type { ToolUsageStatus } from "@/lib/tool-usage/status"
import { isToolSlug, type ToolSlug } from "@/lib/tool-usage/tools"
import { supabase } from "@/lib/supabaseClient"

type Section = "visao-geral" | "ferramentas" | "rotinas" | "solicitacoes" | "assinatura" | "conta"
type HubTool = ToolSlug | "nova-solicitacao"

const hubNavigation: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "visao-geral", label: "Visão geral", icon: Home },
  { id: "ferramentas", label: "Ferramentas", icon: Calculator },
  { id: "rotinas", label: "Rotinas", icon: FolderOpen },
  { id: "solicitacoes", label: "Solicitações", icon: HelpCircle },
  { id: "assinatura", label: "Faturamento", icon: CreditCard },
  { id: "conta", label: "Minha conta", icon: UserRound },
]

const hubTools: Array<{ title: string; description: string; icon: LucideIcon; slug: HubTool }> = [
  {
    title: "Gerador de Contratos",
    description: "Criar contratos rapidamente.",
    icon: FileSignature,
    slug: "gerador-contrato",
  },
  {
    title: "Simulador de Rescisão",
    description: "Estimar valores da rescisão.",
    icon: ReceiptText,
    slug: "simulador-rescisao",
  },
  {
    title: "Simulador de Contratação",
    description: "Calcular custo de contratação.",
    icon: Users,
    slug: "simulador-contratacao",
  },
  {
    title: "Calculadora de Precificação",
    description: "Sugerir preço de venda.",
    icon: Calculator,
    slug: "calculadora-precificacao",
  },
  {
    title: "Nova Solicitação",
    description: "Enviar pedido ou suporte.",
    icon: MessageSquarePlus,
    slug: "nova-solicitacao",
  },
]

type OverviewCardProps = {
  label: string
  value: string | number
  description: string
  action: string
  icon: LucideIcon
  onAction: () => void
}

type QuickShortcutProps = {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
}

function toolUsageCount(status: ToolUsageStatus | undefined) {
  if (!status || !status.limited) {
    return "∞"
  }

  const remaining = status.remaining ?? 0
  return String(Math.max(0, remaining))
}

const toolTitles: Record<ToolSlug, string> = {
  "gerador-contrato": "Gerador de Contratos",
  "simulador-rescisao": "Simulador de Rescisão",
  "simulador-contratacao": "Simulador de Contratação",
  "calculadora-precificacao": "Calculadora de Precificação",
}

function isToolBlocked(status: ToolUsageStatus | undefined) {
  return Boolean(status?.limited && (status.remaining ?? 0) <= 0)
}

function firstNameFrom(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "Cliente"
}

function sectionFromTab(tab: string | null): Section | null {
  if (tab === "processo") return "ferramentas"
  if (
    tab === "visao-geral" ||
    tab === "ferramentas" ||
    tab === "rotinas" ||
    tab === "solicitacoes" ||
    tab === "assinatura" ||
    tab === "conta"
  ) {
    return tab
  }
  return null
}

function toolFromParam(tool: string | null): ToolSlug | null {
  return isToolSlug(tool) ? tool : null
}

function serviceProcessFromParam(process: string | null): ServiceProcess | null {
  if (
    process === "abertura_mei" ||
    process === "abertura_empresa" ||
    process === "alteracao_cnpj" ||
    process === "certificado_digital"
  ) {
    return process
  }
  return null
}

function SectionHeader({ title, subtitle, id }: { title: string; subtitle: string; id?: string }) {
  return (
    <div className="client-hub-section-head">
      <h2 id={id}>{title}</h2>
      <p>{subtitle}</p>
    </div>
  )
}

function OverviewCard({ label, value, description, action, icon: Icon, onAction }: OverviewCardProps) {
  return (
    <article className="client-hub-overview-card">
      <div className="client-hub-overview-card-top">
        <span>{label}</span>
        <span className="client-hub-overview-icon" aria-hidden="true">
          <Icon size={22} strokeWidth={2.15} />
        </span>
      </div>
      <strong>{value}</strong>
      <p>{description}</p>
      <button type="button" onClick={onAction}>
        <span>{action}</span>
        <ArrowRight size={16} strokeWidth={2.35} aria-hidden="true" />
      </button>
    </article>
  )
}

function QuickShortcut({ title, description, icon: Icon, onClick }: QuickShortcutProps) {
  return (
    <button className="client-hub-shortcut-card" type="button" onClick={onClick}>
      <span className="client-hub-shortcut-icon" aria-hidden="true">
        <Icon size={23} strokeWidth={2.15} />
      </span>
      <span>{title}</span>
      <strong>{description}</strong>
      <span className="client-hub-shortcut-arrow" aria-hidden="true">
        <ArrowRight size={15} strokeWidth={2.45} />
      </span>
    </button>
  )
}

function HubEmbeddedTool({
  tool,
  status,
  onBack,
  onUpgrade,
}: {
  tool: ToolSlug
  status: ToolUsageStatus | undefined
  onBack: () => void
  onUpgrade: () => void
}) {
  const blocked = isToolBlocked(status)
  const trackUsage = !blocked

  function renderTool() {
    if (tool === "gerador-contrato") {
      return <ContractGeneratorClient embedded isAuthenticated trackUsage={trackUsage} />
    }

    if (tool === "simulador-rescisao") {
      return <TerminationSimulatorClient embedded isAuthenticated trackUsage={trackUsage} />
    }

    if (tool === "simulador-contratacao") {
      return <HiringSimulatorClient embedded isAuthenticated trackUsage={trackUsage} />
    }

    return <PricingCalculatorClient embedded isAuthenticated trackUsage={trackUsage} />
  }

  return (
    <div className="client-hub-embedded-tool">
      <div className="client-hub-tool-workspace-head">
        <button className="client-requests-back-button" type="button" onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" />
          Ferramentas
        </button>
        <div>
          <span>Ferramenta do hub</span>
          <h2>{toolTitles[tool]}</h2>
        </div>
        <span className="client-hub-tool-workspace-usage">
          {status?.limited ? `${toolUsageCount(status)} restantes` : "Ilimitado"}
        </span>
      </div>

      {blocked ? (
        <div className="client-hub-tool-limit-panel">
          <strong>Limite desta ferramenta atingido</strong>
          <p>Seu plano grátis libera 3 usos por mês em cada ferramenta. Para continuar usando sem limite, aumente seu plano.</p>
          <button className="client-requests-new-button" type="button" onClick={onUpgrade}>
            Aumentar Plano
          </button>
        </div>
      ) : (
        renderTool()
      )}
    </div>
  )
}

type HubContentProps = {
  clientName: string
  userEmail: string
  userPhone: string
  planLabel: string
  planSlug: PlanSlug
  subscriptionStatusLabel: string
  toolsUsedThisMonth: number
  isUsageLimited: boolean
  toolUsage: Record<ToolSlug, ToolUsageStatus> | null
  recentRequestsCount: number
  hasStripeCustomer: boolean
  canCreateRequests: boolean
  nextBillingDateLabel: string | null
}

export default function HubContent({
  clientName,
  userEmail,
  userPhone,
  planLabel,
  planSlug,
  subscriptionStatusLabel,
  toolsUsedThisMonth,
  isUsageLimited,
  toolUsage,
  recentRequestsCount,
  hasStripeCustomer,
  canCreateRequests,
  nextBillingDateLabel,
}: HubContentProps) {
  const [activeSection, setActiveSection] = useState<Section>("visao-geral")
  const [requestIntent, setRequestIntent] = useState<RequestIntent | null>(null)
  const [activeTool, setActiveTool] = useState<ToolSlug | null>(null)
  const [serviceProcess, setServiceProcess] = useState<ServiceProcess | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState({
    name: clientName,
    phone: userPhone,
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const firstName = firstNameFrom(profile.name)

  useEffect(() => {
    const tab = searchParams.get("tab")
    const section = sectionFromTab(tab)
    if (!section) return

    setActiveSection(section)

    if (section === "ferramentas") {
      setActiveTool(toolFromParam(searchParams.get("tool")))
      setServiceProcess(serviceProcessFromParam(searchParams.get("process")))
    } else {
      setActiveTool(null)
      setServiceProcess(null)
    }

    if (tab === "processo") {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", "ferramentas")
      router.replace(`/hub?${params.toString()}`, { scroll: false })
    }
  }, [router, searchParams])

  function openSection(section: Section) {
    if (section !== "solicitacoes") {
      setRequestIntent(null)
    }
    setActiveTool(null)
    setServiceProcess(null)
    setActiveSection(section)
    setSidebarOpen(false)
  }

  function openRequest(intent: RequestIntent | null = null) {
    setRequestIntent(intent)
    setActiveTool(null)
    setActiveSection("solicitacoes")
    setSidebarOpen(false)
  }

  function openTool(tool: ToolSlug) {
    setActiveTool(tool)
    setActiveSection("ferramentas")
    setSidebarOpen(false)
  }

  function handleRequestFlowAction(action: RequestFlowAction) {
    setRequestIntent(null)
    setSidebarOpen(false)

    if (action.actionType === "contact") {
      window.open(action.href, "_blank", "noopener,noreferrer")
      return
    }

    if (action.actionType === "route") {
      if (action.section === "ferramentas" && action.tool) {
        openTool(action.tool)
        return
      }

      openSection(action.section)
      return
    }

    setActiveTool(null)
    setActiveSection("ferramentas")
    setServiceProcess(action.actionType === "process" ? action.process : null)

    const params = new URLSearchParams()
    params.set("tab", "ferramentas")

    if (action.actionType === "process" && action.process === "abertura_mei") {
      params.set("start", "mei")
    }

    if (action.actionType === "product") {
      params.set("product", action.product)
    }

    if (action.actionType === "process") {
      params.set("process", action.process)
    }

    router.push(`/hub?${params.toString()}`, { scroll: false })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  return (
    <main className="client-hub-page">
      <div className="client-hub-mobile-bar">
        <a className="client-hub-logo" href="/" aria-label="Tropa">
          <span>Tropa</span>
        </a>
        <button
          className="client-hub-menu-toggle"
          type="button"
          aria-label={sidebarOpen ? "Fechar menu do hub" : "Abrir menu do hub"}
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen ? <X size={20} strokeWidth={2.2} aria-hidden="true" /> : <Menu size={20} strokeWidth={2.2} aria-hidden="true" />}
        </button>
      </div>

      {sidebarOpen && <button className="client-hub-sidebar-backdrop" type="button" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}

      <aside className={sidebarOpen ? "client-hub-sidebar is-open" : "client-hub-sidebar"} aria-label="Menu do hub do cliente">
        <a className="client-hub-logo" href="/" aria-label="Tropa">
          <span>Tropa</span>
        </a>

        <nav className="client-hub-nav" aria-label="Navegação do hub">
          {hubNavigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={activeSection === id ? "is-active" : ""}
              aria-current={activeSection === id ? "page" : undefined}
              onClick={() => openSection(id)}
            >
              <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="client-hub-signout" type="button" onClick={() => void handleSignOut()}>
          <LogOut size={18} strokeWidth={2.1} aria-hidden="true" />
          <span>Sair</span>
        </button>
      </aside>

      <section
        className={
          activeSection === "assinatura"
            ? "client-hub-main is-billing"
            : activeSection === "conta"
              ? "client-hub-main is-account"
              : "client-hub-main"
        }
        aria-labelledby="client-hub-title"
      >
        {activeSection === "visao-geral" && (
          <>
            <header className="client-hub-header">
              <div>
                <span>Visão Geral</span>
                <h1 id="client-hub-title">Olá, {firstName}.</h1>
                <p>Acompanhe suas ferramentas, solicitações e dados da assinatura em um só lugar.</p>
              </div>

              <div className="client-hub-account-pill">
                <Crown size={17} strokeWidth={2.1} aria-hidden="true" />
                <span>Plano {planLabel}</span>
              </div>
            </header>

            <section className="client-hub-overview" aria-label="Visão geral">
              <OverviewCard
                label="PLANO ATUAL"
                value={planLabel}
                description={subscriptionStatusLabel}
                action="Ver faturamento"
                icon={Crown}
                onAction={() => openSection("assinatura")}
              />
              <OverviewCard
                label="FERRAMENTAS UTILIZADAS NESTE MÊS"
                value={toolsUsedThisMonth}
                description={isUsageLimited ? "3 usos grátis por mês em cada ferramenta" : "Uso ilimitado em todas as ferramentas"}
                action="Abrir ferramentas"
                icon={BarChart3}
                onAction={() => openSection("ferramentas")}
              />
              <OverviewCard
                label="SOLICITAÇÕES RECENTES"
                value={recentRequestsCount}
                description={recentRequestsCount === 0 ? "Nenhuma solicitação enviada ainda." : "Acompanhe na aba Solicitações."}
                action="Nova solicitação"
                icon={MessageSquarePlus}
                onAction={() => openRequest(null)}
              />
            </section>

            <section className="client-hub-quick-zone" aria-label="Atalhos rápidos">
              <div className="client-hub-section-head">
                <div className="client-hub-section-title-row">
                  <span className="client-hub-section-icon" aria-hidden="true">
                    <Sparkles size={18} strokeWidth={2.2} />
                  </span>
                  <h2>Atalhos rápidos</h2>
                </div>
                <p>Ações que normalmente resolvem o próximo passo sem você procurar pelo menu.</p>
              </div>
              <div className="client-hub-shortcut-grid">
                <QuickShortcut
                  title="Usar ferramentas"
                  description="Contratos, rescisão, contratação e precificação."
                  icon={LayoutGrid}
                  onClick={() => openSection("ferramentas")}
                />
                <QuickShortcut
                  title="Começar processo"
                  description="MEI, certificado, abertura ou alteração de CNPJ."
                  icon={FileStack}
                  onClick={() => openSection("ferramentas")}
                />
                <QuickShortcut
                  title="Enviar documento"
                  description="Abra uma solicitação com anexo para a equipe."
                  icon={UploadCloud}
                  onClick={() => openRequest("document_upload")}
                />
                <QuickShortcut
                  title="Completar perfil"
                  description="Nome, WhatsApp, e-mail e senha."
                  icon={UserRound}
                  onClick={() => openSection("conta")}
                />
              </div>
            </section>
          </>
        )}

        {activeSection === "ferramentas" && (
          <section className="client-hub-section" aria-labelledby="client-hub-tools-title">
            {activeTool ? (
              <HubEmbeddedTool
                tool={activeTool}
                status={toolUsage?.[activeTool]}
                onBack={() => setActiveTool(null)}
                onUpgrade={() => openSection("assinatura")}
              />
            ) : (
              <>
                <SectionHeader
                  id="client-hub-tools-title"
                  title="Ferramentas"
                  subtitle="Atalhos para resolver tarefas comuns sem sair do hub."
                />

                <div className="client-hub-tool-grid">
                  {hubTools.map(({ title, description, icon: Icon, slug }) => (
                    slug === "nova-solicitacao" ? (
                      <button
                        className="client-hub-tool-card"
                        type="button"
                        key={title}
                        onClick={() => openRequest(null)}
                      >
                        <div className="client-hub-tool-card-top">
                          <span className="client-hub-tool-icon" aria-hidden="true">
                            <Icon size={24} strokeWidth={2.1} />
                          </span>
                        </div>
                        <strong>{title}</strong>
                        <p>{description}</p>
                      </button>
                    ) : (
                      <button className="client-hub-tool-card" type="button" onClick={() => openTool(slug)} key={title}>
                        <div className="client-hub-tool-card-top">
                          <span className="client-hub-tool-icon" aria-hidden="true">
                            <Icon size={24} strokeWidth={2.1} />
                          </span>
                          {slug ? <span className="client-hub-tool-usage">{toolUsageCount(toolUsage?.[slug])}</span> : null}
                        </div>
                        <strong>{title}</strong>
                        <p>{description}</p>
                      </button>
                    )
                  ))}
                </div>

                <div className="client-hub-section-divider" />

                <SectionHeader
                  title="Produtos e serviços avulsos"
                  subtitle="Serviços e produtos que podem ser contratados separadamente."
                />

                <ServicesProductsSection initialProcess={serviceProcess} />
              </>
            )}
          </section>
        )}

        {activeSection === "rotinas" && <RoutinesPanel />}

        {activeSection === "solicitacoes" && (
          <RequestsPanel
            initialIntent={requestIntent}
            canCreateRequests={canCreateRequests}
            onUpgrade={() => openSection("assinatura")}
            onFlowAction={handleRequestFlowAction}
          />
        )}

        {activeSection === "assinatura" && (
          <SubscriptionPanel
            planSlug={planSlug}
            planLabel={planLabel}
            subscriptionStatusLabel={subscriptionStatusLabel}
            hasStripeCustomer={hasStripeCustomer}
            nextBillingDateLabel={nextBillingDateLabel}
            onRequestBillingDateChange={() => openRequest("billing_due_date")}
          />
        )}

        {activeSection === "conta" && (
          <AccountPanel
            clientName={profile.name}
            userEmail={userEmail}
            userPhone={profile.phone}
            onProfileUpdated={(updatedProfile) =>
              setProfile((currentProfile) => ({
                ...currentProfile,
                name: updatedProfile.name,
                phone: updatedProfile.phone,
              }))
            }
          />
        )}
      </section>
    </main>
  )
}
