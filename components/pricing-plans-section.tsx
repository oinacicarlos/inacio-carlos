"use client"

import { useId, useState } from "react"
import { Check, ChevronDown, Medal } from "lucide-react"
import { PlanWhatsAppButton } from "@/components/plan-whatsapp-button"

export type PricingPlanTier = "bronze" | "prata" | "ouro"

export type PricingPlanItem = {
  tier: PricingPlanTier
  name: string
  description: string
  featured: boolean
  features: string[]
  href: string
}

const INITIAL_VISIBLE_FEATURES = 6

type PricingPlansSectionProps = {
  plans: PricingPlanItem[]
}

export function PricingPlansSection({ plans }: PricingPlansSectionProps) {
  return (
    <div className="plans-grid" id="simulador-planos">
      {plans.map((plan) => (
        <PlanCard key={plan.tier} plan={plan} />
      ))}
    </div>
  )
}

function PlanCard({ plan }: { plan: PricingPlanItem }) {
  const { tier, name, description, featured, features, href } = plan
  const generatedId = useId()
  const panelId = `plan-benefits-${generatedId.replace(/:/g, "")}`
  const [expanded, setExpanded] = useState(false)

  const visibleFeatures = features.slice(0, INITIAL_VISIBLE_FEATURES)
  const hiddenFeatures = features.slice(INITIAL_VISIBLE_FEATURES)
  const hasHiddenFeatures = hiddenFeatures.length > 0

  return (
    <article className={`plans-card${featured ? " is-featured" : ""}`}>
      {featured && <span className="plans-featured-badge">Mais escolhido</span>}

      <div className={`plans-icon plans-icon--${tier}`} aria-hidden="true">
        <Medal size={24} strokeWidth={2} />
      </div>

      <h3 className="plans-name">{name}</h3>
      <p className="plans-description">{description}</p>

      <span className="plans-divider" aria-hidden="true" />

      <div className="plans-benefits-block">
        <ul className="plans-features">
          {visibleFeatures.map((feature) => (
            <li key={feature}>
              <span className="plans-feature-check" aria-hidden="true">
                <Check size={11} strokeWidth={3} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {hasHiddenFeatures && (
          <>
            <div id={panelId} className={`plans-features-panel${expanded ? " is-open" : ""}`} aria-hidden={!expanded}>
              <ul className="plans-features plans-features--extra">
                {hiddenFeatures.map((feature) => (
                  <li key={feature}>
                    <span className="plans-feature-check" aria-hidden="true">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className="plans-expand-toggle"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? "Ocultar benefícios" : "Ver todos os benefícios"}
              <ChevronDown size={16} strokeWidth={2.2} className="plans-expand-icon" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <PlanWhatsAppButton className={`plans-cta${featured ? " is-primary" : ""}`} href={href}>
        Saber Mais
      </PlanWhatsAppButton>
    </article>
  )
}
