"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calculator,
  CreditCard,
  FileSignature,
  FileStack,
  HelpCircle,
  Home,
  LogOut,
  MessageSquarePlus,
  ReceiptText,
  Settings,
  Sparkles,
  UserRound,
  Users,
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
import OnboardingPanel from "@/components/hub/onboarding-panel"
import type { PlanSlug } from "@/lib/plans"
import type { ToolUsageStatus } from "@/lib/tool-usage/status"
import type { ToolSlug } from "@/lib/tool-usage/tools"
import { supabase } from "@/lib/supabaseClient"

type Section = "visao-geral" | "ferramentas" | "processo" | "solicitacoes" | "assinatura" | "conta"
type HubTool = ToolSlug | "nova-solicitacao"

const hubNavigation: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "visao-geral", label: "Visão geral", icon: Home },
  { id: "ferramentas", label: "Ferramentas", icon: Calculator },
  { id: "processo", label: "Meu processo", icon: FileStack },
  { id: "solicitacoes", label: "Solicitações", icon: HelpCircle },
  { id: "assinatura", label: "Minha assinatura", icon: CreditCard },
  { id: "conta", label: "Minha conta", icon: UserRound },
]

const hubTools: Array<{ title: string; description: string; icon: LucideIcon; slug: HubTool }> = [
  {
    title: "Gerador de Contratos",
    description: "Monte um documento simples para revisar, imprimir ou baixar.",
    icon: FileSignature,
    slug: "gerador-contrato",
  },
  {
    title: "Simulador de Rescisão",
    description: "Estime valores principais de uma rescisão trabalhista.",
    icon: ReceiptText,
    slug: "simulador-rescisao",
  },
  {
    title: "Simulador de Contratação",
    description: "Veja uma estimativa do custo mensal de contratar uma pessoa.",
    icon: Users,
    slug: "simulador-contratacao",
  },
  {
    title: "Calculadora de Precificação",
    description: "Descubra um valor sugerido para cobrar por produtos ou serviços.",
    icon: Calculator,
    slug: "calculadora-precificacao",
  },
  {
    title: "Nova Solicitação",
    description: "Envie uma dúvida, pedido de suporte ou solicitação contábil.",
    icon: MessageSquarePlus,
    slug: "nova-solicitacao",
  },
]

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
  companyName: string | null
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
  nextBillingDateLabel: string | null
}

export default function HubContent({
  clientName,
  companyName,
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
  nextBillingDateLabel,
}: HubContentProps) {
  const [activeSection, setActiveSection] = useState<Section>("visao-geral")
  const [requestIntent, setRequestIntent] = useState<RequestIntent | null>(null)
  const [activeTool, setActiveTool] = useState<ToolSlug | null>(null)
  const [profile, setProfile] = useState({
    name: clientName,
    companyName,
    phone: userPhone,
  })
  const router = useRouter()

  function openSection(section: Section) {
    if (section !== "solicitacoes") {
      setRequestIntent(null)
    }
    if (section !== "ferramentas") {
      setActiveTool(null)
    }
    setActiveSection(section)
  }

  function openRequest(intent: RequestIntent | null = null) {
    setRequestIntent(intent)
    setActiveTool(null)
    setActiveSection("solicitacoes")
  }

  function openTool(tool: ToolSlug) {
    setActiveTool(tool)
    setActiveSection("ferramentas")
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  return (
    <main className="client-hub-page">
      <aside className="client-hub-sidebar" aria-label="Menu do hub do cliente">
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

      <section className="client-hub-main" aria-labelledby="client-hub-title">
        {activeSection === "visao-geral" && (
          <>
            <header className="client-hub-header">
              <div>
                <span>Hub do cliente</span>
                <h1 id="client-hub-title">Olá, {profile.name}. Tudo certo por aqui.</h1>
                <p>Acompanhe suas ferramentas, solicitações e dados da assinatura em um só lugar.</p>
              </div>

              <div className="client-hub-account-pill">
                <Settings size={17} strokeWidth={2.1} aria-hidden="true" />
                <span>Plano {planLabel}</span>
              </div>
            </header>

            <section className="client-hub-overview" aria-label="Visão geral">
              <article>
                <span>Plano atual</span>
                <strong>{planLabel}</strong>
                <p>{subscriptionStatusLabel}</p>
                <button type="button" onClick={() => openSection("assinatura")}>
                  Ver faturamento
                </button>
              </article>
              <article>
                <span>Ferramentas utilizadas neste mês</span>
                <strong>{toolsUsedThisMonth}</strong>
                <p>{isUsageLimited ? "3 usos grátis por mês em cada ferramenta" : "Uso ilimitado em todas as ferramentas"}</p>
                <button type="button" onClick={() => openSection("ferramentas")}>
                  Abrir ferramentas
                </button>
              </article>
              <article>
                <span>Solicitações recentes</span>
                <strong>{recentRequestsCount}</strong>
                <p>{recentRequestsCount === 0 ? "Nenhuma solicitação enviada ainda." : "Acompanhe na aba Solicitações."}</p>
                <button type="button" onClick={() => openRequest(null)}>
                  Nova solicitação
                </button>
              </article>
            </section>

            <section className="client-hub-quick-zone" aria-label="Atalhos rápidos">
              <div className="client-hub-section-head">
                <h2>Atalhos rápidos</h2>
                <p>Ações que normalmente resolvem o próximo passo sem você procurar pelo menu.</p>
              </div>
              <div className="client-hub-shortcut-grid">
                <button type="button" onClick={() => openSection("ferramentas")}>
                  <Calculator size={19} strokeWidth={2.2} aria-hidden="true" />
                  <span>Usar ferramentas</span>
                  <strong>Contratos, rescisão, contratação e precificação.</strong>
                </button>
                <button type="button" onClick={() => openSection("processo")}>
                  <FileStack size={19} strokeWidth={2.2} aria-hidden="true" />
                  <span>Começar processo</span>
                  <strong>MEI, certificado, abertura ou alteração de CNPJ.</strong>
                </button>
                <button type="button" onClick={() => openRequest("document_upload")}>
                  <MessageSquarePlus size={19} strokeWidth={2.2} aria-hidden="true" />
                  <span>Enviar documento</span>
                  <strong>Abra uma solicitação com anexo para a equipe.</strong>
                </button>
                <button type="button" onClick={() => openSection("conta")}>
                  <Sparkles size={19} strokeWidth={2.2} aria-hidden="true" />
                  <span>Completar perfil</span>
                  <strong>Nome, WhatsApp, empresa, e-mail e senha.</strong>
                </button>
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
                <div className="client-hub-section-head">
                  <h2 id="client-hub-tools-title">Ferramentas</h2>
                  <p>Atalhos para resolver tarefas comuns sem sair do hub.</p>
                </div>

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
              </>
            )}
          </section>
        )}

        {activeSection === "processo" && <OnboardingPanel />}

        {activeSection === "solicitacoes" && <RequestsPanel initialIntent={requestIntent} />}

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
            companyName={profile.companyName}
            userEmail={userEmail}
            userPhone={profile.phone}
            onProfileUpdated={setProfile}
          />
        )}
      </section>
    </main>
  )
}
