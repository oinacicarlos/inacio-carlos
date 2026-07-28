"use client"

import { Check } from "lucide-react"
import { StripePlanButton } from "@/components/stripe-plan-button"
import { StripePortalButton } from "@/components/stripe-portal-button"
import { PLAN_DETAILS, type PlanSlug } from "@/lib/plans"

type SubscriptionPanelProps = {
  planSlug: PlanSlug
  planLabel: string
  subscriptionStatusLabel: string
  hasStripeCustomer: boolean
  nextBillingDateLabel: string | null
}

export default function SubscriptionPanel({
  planSlug,
  planLabel,
  subscriptionStatusLabel,
  hasStripeCustomer,
  nextBillingDateLabel,
}: SubscriptionPanelProps) {
  const plan = PLAN_DETAILS[planSlug]
  const isFree = planSlug === "free"

  return (
    <article className="client-hub-panel">
      <div className="client-hub-section-head">
        <h2>Minha assinatura</h2>
        <p>Resumo da sua assinatura atual.</p>
      </div>

      <div className="client-subscription-fields">
        <div>
          <span>Plano atual</span>
          <strong>{planLabel}</strong>
        </div>
        <div>
          <span>Valor</span>
          <strong>
            {plan.priceLabel}
            {plan.period ? ` ${plan.period}` : ""}
          </strong>
        </div>
        <div>
          <span>Situação</span>
          <strong>{subscriptionStatusLabel}</strong>
        </div>
        <div>
          <span>Próxima cobrança</span>
          <strong>{nextBillingDateLabel ?? "—"}</strong>
        </div>
      </div>

      <div className="client-subscription-benefits">
        <span>Benefícios</span>
        <ul>
          {plan.benefits.map((benefit) => (
            <li key={benefit}>
              <Check size={14} strokeWidth={2.4} aria-hidden="true" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <div className="client-subscription-actions">
        {isFree ? (
          <>
            <StripePlanButton plan="bronze">Contratar Bronze</StripePlanButton>
            <StripePlanButton featured plan="prata">
              Contratar Prata
            </StripePlanButton>
            <a className="client-requests-back-button" href="/diagnostico">
              Falar sobre o plano Ouro
            </a>
          </>
        ) : hasStripeCustomer ? (
          <StripePortalButton>Gerenciar assinatura</StripePortalButton>
        ) : (
          <a className="client-requests-back-button" href="/diagnostico">
            Fale conosco
          </a>
        )}
      </div>
    </article>
  )
}
