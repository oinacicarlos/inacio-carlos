"use client"

import { useEffect, useState } from "react"
import {
  ArrowRight,
  CalendarDays,
  Check,
  CreditCard,
  FileText,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react"
import PlanCalculator from "@/components/plan-calculator"
import { StripePortalButton } from "@/components/stripe-portal-button"
import { PLAN_DETAILS, type PlanSlug } from "@/lib/plans"

type SubscriptionPanelProps = {
  planSlug: PlanSlug
  planLabel: string
  subscriptionStatusLabel: string
  hasStripeCustomer: boolean
  nextBillingDateLabel: string | null
  onRequestBillingDateChange: () => void
}

function formattedStatusLabel(label: string) {
  const normalized = label.trim().toLowerCase()

  if (normalized === "ativa") return "Assinatura ativa"
  if (normalized === "cancelada") return "Assinatura cancelada"
  if (normalized === "inativa") return "Assinatura inativa"
  if (normalized === "em teste") return "Assinatura em teste"

  return label
}

function statusTone(label: string) {
  const normalized = label.trim().toLowerCase()

  if (normalized.includes("sem assinatura")) return "is-free"
  if (normalized.includes("pendente")) return "is-pending"
  if (normalized.includes("cancelada") || normalized.includes("inativa")) return "is-canceled"
  if (normalized.includes("ativa") || normalized.includes("teste")) return "is-active"

  return "is-free"
}

function BillingStatusCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <section className="client-billing-status-card">
      <span className="client-billing-icon" aria-hidden="true">
        <Icon size={23} strokeWidth={2.2} />
      </span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </section>
  )
}

function BillingManagementContent({
  icon: Icon,
  label,
  value,
  description,
  showArrow = false,
}: {
  icon: LucideIcon
  label: string
  value: string
  description: string
  showArrow?: boolean
}) {
  return (
    <>
      <span className="client-billing-icon" aria-hidden="true">
        <Icon size={22} strokeWidth={2.2} />
      </span>
      <span className="client-billing-management-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </span>
      {showArrow ? (
        <span className="client-billing-management-arrow" aria-hidden="true">
          <ArrowRight size={18} strokeWidth={2.2} />
        </span>
      ) : null}
    </>
  )
}

export default function SubscriptionPanel({
  planSlug,
  planLabel,
  subscriptionStatusLabel,
  hasStripeCustomer,
  nextBillingDateLabel,
  onRequestBillingDateChange,
}: SubscriptionPanelProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const plan = PLAN_DETAILS[planSlug]
  const statusLabel = formattedStatusLabel(subscriptionStatusLabel)
  const statusClassName = `client-billing-status-badge ${statusTone(statusLabel)}`
  const paymentMethodLabel = hasStripeCustomer ? "Cartão ou método salvo no Stripe" : "Nenhum cartão cadastrado"
  const paymentDescription = hasStripeCustomer
    ? "Atualize cartão, endereço de cobrança e recibos pelo portal seguro."
    : "Contrate um plano para cadastrar o pagamento."
  const receiptsLabel = hasStripeCustomer ? "Disponíveis no portal" : "Sem histórico ainda"

  useEffect(() => {
    if (!upgradeOpen) return

    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setUpgradeOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [upgradeOpen])

  return (
    <article className="client-billing-panel">
      <header className="client-billing-header">
        <div>
          <h2>Faturamento</h2>
          <p>PLANO, VENCIMENTO, CARTÃO E AÇÕES DE COBRANÇA EM UM SÓ LUGAR.</p>
        </div>
        <span className={statusClassName}>
          <span aria-hidden="true" />
          {statusLabel}
        </span>
      </header>

      <div className="client-billing-summary-grid">
        <section className="client-billing-plan-card">
          <div>
            <span>PLANO ATUAL</span>
            <strong>{planLabel}</strong>
            <p>
              {plan.priceLabel}
              {plan.period ? ` ${plan.period}` : ""}
            </p>
          </div>
          <ShieldCheck size={154} strokeWidth={1.5} aria-hidden="true" />
        </section>

        <div className="client-billing-status-stack">
          <BillingStatusCard icon={CalendarDays} label="PRÓXIMA COBRANÇA" value={nextBillingDateLabel ?? "Sem vencimento ativo"} />
          <BillingStatusCard icon={ShieldCheck} label="STATUS DA ASSINATURA" value={statusLabel} />
        </div>
      </div>

      <div className="client-billing-detail-grid">
        <section className="client-billing-card client-billing-management-card">
          <span className="client-billing-card-title">GERENCIAMENTO DE COBRANÇA</span>
          <div className="client-billing-management-list">
            {hasStripeCustomer ? (
              <StripePortalButton className="client-billing-management-action" wrapperClassName="client-billing-management-portal">
                <BillingManagementContent
                  icon={CreditCard}
                  label="FORMA DE PAGAMENTO"
                  value={paymentMethodLabel}
                  description={paymentDescription}
                  showArrow
                />
              </StripePortalButton>
            ) : (
              <div className="client-billing-management-item">
                <BillingManagementContent icon={CreditCard} label="FORMA DE PAGAMENTO" value={paymentMethodLabel} description={paymentDescription} />
              </div>
            )}

            <button className="client-billing-management-action" type="button" onClick={onRequestBillingDateChange}>
              <BillingManagementContent
                icon={RefreshCw}
                label="DATA DE VENCIMENTO"
                value={nextBillingDateLabel ?? "A definir"}
                description="A troca da data precisa ser solicitada para ajustarmos a cobrança com segurança."
                showArrow
              />
            </button>

            {hasStripeCustomer ? (
              <StripePortalButton className="client-billing-management-action" wrapperClassName="client-billing-management-portal">
                <BillingManagementContent
                  icon={FileText}
                  label="RECIBOS E NOTAS"
                  value={receiptsLabel}
                  description="Acesse faturas, recibos e dados de cobrança quando houver assinatura ativa."
                  showArrow
                />
              </StripePortalButton>
            ) : (
              <div className="client-billing-management-item">
                <BillingManagementContent
                  icon={FileText}
                  label="RECIBOS E NOTAS"
                  value={receiptsLabel}
                  description="Acesse faturas, recibos e dados de cobrança quando houver assinatura ativa."
                />
              </div>
            )}
          </div>
        </section>

        <div className="client-billing-side-stack">
          <section className="client-billing-card client-billing-benefits">
            <span className="client-billing-card-title">INCLUÍDO NO SEU PLANO</span>
            <ul>
              {plan.benefits.map((benefit) => (
                <li key={benefit}>
                  <span aria-hidden="true">
                    <Check size={15} strokeWidth={2.4} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <section className="client-billing-card client-billing-quick-actions">
            <span className="client-billing-card-title">AÇÕES RÁPIDAS</span>
            <button className="client-billing-action is-primary" type="button" onClick={() => setUpgradeOpen(true)}>
              <TrendingUp size={17} strokeWidth={2.4} aria-hidden="true" />
              Aumentar Plano
            </button>
            <a className="client-billing-action" href="/#planos">
              <MessageCircle size={17} strokeWidth={2.2} aria-hidden="true" />
              Fale conosco
            </a>
            <button className="client-billing-action" type="button" onClick={onRequestBillingDateChange}>
              <Sparkles size={17} strokeWidth={2.2} aria-hidden="true" />
              Pedir ajuste de cobrança
            </button>
          </section>
        </div>
      </div>

      {upgradeOpen && (
        <div className="client-upgrade-modal-overlay" onClick={() => setUpgradeOpen(false)}>
          <div className="client-upgrade-modal" onClick={(event) => event.stopPropagation()}>
            <div className="client-upgrade-modal-head">
              <div>
                <h3>Simular troca de plano</h3>
                <p>Responda a calculadora para ver qual plano faz sentido para seu momento.</p>
              </div>
              <button type="button" onClick={() => setUpgradeOpen(false)} aria-label="Fechar">
                <X size={18} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
            <PlanCalculator />
          </div>
        </div>
      )}
    </article>
  )
}
