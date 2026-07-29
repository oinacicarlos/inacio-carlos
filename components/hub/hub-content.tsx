"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
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
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"
import RequestsPanel from "@/components/hub/requests-panel"
import SubscriptionPanel from "@/components/hub/subscription-panel"
import OnboardingPanel from "@/components/hub/onboarding-panel"
import type { PlanSlug } from "@/lib/plans"
import type { ToolUsageStatus } from "@/lib/tool-usage/status"
import type { ToolSlug } from "@/lib/tool-usage/tools"
import { supabase } from "@/lib/supabaseClient"

type Section = "visao-geral" | "ferramentas" | "processo" | "solicitacoes" | "assinatura" | "conta"

const hubNavigation: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "visao-geral", label: "Visão geral", icon: Home },
  { id: "ferramentas", label: "Ferramentas", icon: Calculator },
  { id: "processo", label: "Meu processo", icon: FileStack },
  { id: "solicitacoes", label: "Solicitações", icon: HelpCircle },
  { id: "assinatura", label: "Minha assinatura", icon: CreditCard },
  { id: "conta", label: "Minha conta", icon: UserRound },
]

const hubTools: Array<{ title: string; description: string; icon: LucideIcon; href: string; slug: ToolSlug | null }> = [
  {
    title: "Gerador de Contratos",
    description: "Monte um documento simples para revisar, imprimir ou baixar.",
    icon: FileSignature,
    href: "/ferramentas/gerador-contrato?origem=hub",
    slug: "gerador-contrato",
  },
  {
    title: "Simulador de Rescisão",
    description: "Estime valores principais de uma rescisão trabalhista.",
    icon: ReceiptText,
    href: "/ferramentas/simulador-rescisao?origem=hub",
    slug: "simulador-rescisao",
  },
  {
    title: "Simulador de Contratação",
    description: "Veja uma estimativa do custo mensal de contratar uma pessoa.",
    icon: Users,
    href: "/ferramentas/simulador-contratacao?origem=hub",
    slug: "simulador-contratacao",
  },
  {
    title: "Calculadora de Precificação",
    description: "Descubra um valor sugerido para cobrar por produtos ou serviços.",
    icon: Calculator,
    href: "/ferramentas/calculadora-precificacao?origem=hub",
    slug: "calculadora-precificacao",
  },
  {
    title: "Nova Solicitação",
    description: "Envie uma dúvida, pedido de suporte ou solicitação contábil.",
    icon: MessageSquarePlus,
    href: "#",
    slug: null,
  },
]

function toolUsageLabel(status: ToolUsageStatus | undefined) {
  if (!status || !status.limited) {
    return "Uso ilimitado"
  }

  const remaining = status.remaining ?? 0
  return remaining > 0 ? `${remaining} de ${status.limit} usos restantes este mês` : "Limite deste mês atingido"
}

type HubContentProps = {
  clientName: string
  companyName: string | null
  userEmail: string
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
  const router = useRouter()

  useEffect(() => {
    // Suporte a /hub?tab=processo, usado no redirect pós-checkout e no
    // redirect de cadastro/login pra quem clicou em comprar um produto
    // avulso ainda deslogado. window.location em vez de useSearchParams
    // pra não exigir um Suspense boundary nesse componente aninhado.
    const tab = new URLSearchParams(window.location.search).get("tab")
    if (tab === "processo") setActiveSection("processo")
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  return (
    <main className="client-hub-page">
      <aside className="client-hub-sidebar" aria-label="Menu do hub do cliente">
        <a className="client-hub-logo" href="/" aria-label="ContaFacil">
          <span>Conta</span>Facil
        </a>

        <nav className="client-hub-nav" aria-label="Navegação do hub">
          {hubNavigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={activeSection === id ? "is-active" : ""}
              aria-current={activeSection === id ? "page" : undefined}
              onClick={() => setActiveSection(id)}
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
                <h1 id="client-hub-title">Olá, {clientName}. Tudo certo por aqui.</h1>
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
              </article>
              <article>
                <span>Ferramentas utilizadas neste mês</span>
                <strong>{toolsUsedThisMonth}</strong>
                <p>{isUsageLimited ? "3 usos grátis por mês em cada ferramenta" : "Uso ilimitado em todas as ferramentas"}</p>
              </article>
              <article>
                <span>Solicitações recentes</span>
                <strong>{recentRequestsCount}</strong>
                <p>{recentRequestsCount === 0 ? "Nenhuma solicitação enviada ainda." : "Acompanhe na aba Solicitações."}</p>
              </article>
            </section>
          </>
        )}

        {activeSection === "ferramentas" && (
          <section className="client-hub-section" aria-labelledby="client-hub-tools-title">
            <div className="client-hub-section-head">
              <h2 id="client-hub-tools-title">Ferramentas</h2>
              <p>Atalhos para resolver tarefas comuns sem sair do hub.</p>
            </div>

            <div className="client-hub-tool-grid">
              {hubTools.map(({ title, description, icon: Icon, href, slug }) => (
                href === "#" ? (
                  <button
                    className="client-hub-tool-card"
                    type="button"
                    key={title}
                    onClick={() => setActiveSection("solicitacoes")}
                  >
                    <span className="client-hub-tool-icon" aria-hidden="true">
                      <Icon size={24} strokeWidth={2.1} />
                    </span>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </button>
                ) : (
                  <a className="client-hub-tool-card" href={href} key={title}>
                    <span className="client-hub-tool-icon" aria-hidden="true">
                      <Icon size={24} strokeWidth={2.1} />
                    </span>
                    <strong>{title}</strong>
                    <p>{description}</p>
                    {slug ? <span className="client-hub-tool-usage">{toolUsageLabel(toolUsage?.[slug])}</span> : null}
                  </a>
                )
              ))}
            </div>
          </section>
        )}

        {activeSection === "processo" && <OnboardingPanel />}

        {activeSection === "solicitacoes" && <RequestsPanel />}

        {activeSection === "assinatura" && (
          <SubscriptionPanel
            planSlug={planSlug}
            planLabel={planLabel}
            subscriptionStatusLabel={subscriptionStatusLabel}
            hasStripeCustomer={hasStripeCustomer}
            nextBillingDateLabel={nextBillingDateLabel}
          />
        )}

        {activeSection === "conta" && (
          <article className="client-hub-panel">
            <div className="client-hub-section-head">
              <h2>Minha conta</h2>
              <p>Informações da sua conta.</p>
            </div>
            <dl className="client-hub-account-list">
              <div>
                <dt>Nome</dt>
                <dd>{clientName}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{userEmail}</dd>
              </div>
              {companyName && (
                <div>
                  <dt>Empresa</dt>
                  <dd>{companyName}</dd>
                </div>
              )}
            </dl>
          </article>
        )}
      </section>
    </main>
  )
}
