"use client"

import { useEffect, useState } from "react"
import { CalendarDays, Check, CreditCard, FileText, RefreshCw, TrendingUp, X } from "lucide-react"
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
  const isFree = planSlug === "free"
  const paymentMethodLabel = hasStripeCustomer ? "Cartão ou método salvo no Stripe" : "Nenhum cartão cadastrado"

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
    <article className="client-hub-panel">
      <div className="client-hub-section-head client-subscription-head">
        <div>
          <h2>Faturamento</h2>
          <p>Plano, vencimento, cartão e ações de cobrança em um só lugar.</p>
        </div>
        <span className={isFree ? "client-subscription-status is-free" : "client-subscription-status"}>
          {subscriptionStatusLabel}
        </span>
      </div>

      <div className="client-subscription-hero">
        <div>
          <span>Plano atual</span>
          <strong>{planLabel}</strong>
          <p>
            {plan.priceLabel}
            {plan.period ? ` ${plan.period}` : ""}
          </p>
        </div>
        <div className="client-subscription-next">
          <CalendarDays size={20} strokeWidth={2.2} aria-hidden="true" />
          <span>Próxima cobrança</span>
          <strong>{nextBillingDateLabel ?? "Sem vencimento ativo"}</strong>
        </div>
      </div>

      <div className="client-subscription-grid">
        <section className="client-subscription-card">
          <CreditCard size={20} strokeWidth={2.2} aria-hidden="true" />
          <span>Forma de pagamento</span>
          <strong>{paymentMethodLabel}</strong>
          <p>{hasStripeCustomer ? "Atualize cartão, endereço de cobrança e recibos pelo portal seguro." : "Contrate um plano para cadastrar o pagamento."}</p>
        </section>

        <section className="client-subscription-card">
          <RefreshCw size={20} strokeWidth={2.2} aria-hidden="true" />
          <span>Data de vencimento</span>
          <strong>{nextBillingDateLabel ?? "A definir"}</strong>
          <p>A troca da data precisa ser solicitada para ajustarmos a cobrança com segurança.</p>
        </section>

        <section className="client-subscription-card">
          <FileText size={20} strokeWidth={2.2} aria-hidden="true" />
          <span>Recibos e notas</span>
          <strong>{hasStripeCustomer ? "Disponíveis no portal" : "Sem histórico ainda"}</strong>
          <p>Acesse faturas, recibos e dados de cobrança quando houver assinatura ativa.</p>
        </section>
      </div>

      <div className="client-subscription-bottom">
        <div className="client-subscription-benefits">
          <span>Incluído no seu plano</span>
          <ul>
            {plan.benefits.map((benefit) => (
              <li key={benefit}>
                <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="client-subscription-actions-panel">
          <span>Ações rápidas</span>
          <div className="client-subscription-actions">
            <button className="client-requests-new-button" type="button" onClick={() => setUpgradeOpen(true)}>
              <TrendingUp size={15} strokeWidth={2.4} aria-hidden="true" />
              Aumentar Plano
            </button>

            {hasStripeCustomer ? (
              <>
                <StripePortalButton>Atualizar cartão e faturas</StripePortalButton>
                <button className="client-requests-back-button" type="button" onClick={onRequestBillingDateChange}>
                  Pedir troca de vencimento
                </button>
              </>
            ) : (
              <>
                <a className="client-requests-back-button" href="/#planos">
                  Fale conosco
                </a>
                <button className="client-requests-back-button" type="button" onClick={onRequestBillingDateChange}>
                  Pedir ajuste de cobrança
                </button>
              </>
            )}
          </div>
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
