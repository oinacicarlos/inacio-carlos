import { Lock } from "lucide-react"
import { ToolShell, paywallHeaderActions } from "@/components/tool-shell"
import { StripePlanButton } from "@/components/stripe-plan-button"

export default function ToolUsagePaywall({ toolTitle }: { toolTitle: string }) {
  return (
    <ToolShell mainClassName="tool-usage-paywall-page" headerActions={paywallHeaderActions}>
      <section className="tool-usage-paywall-section" aria-labelledby="tool-usage-paywall-title">
        <div className="tool-usage-paywall-card">
          <span className="tool-usage-paywall-tag">
            <Lock size={15} strokeWidth={2.2} aria-hidden="true" />
            Limite do plano grátis
          </span>
          <h1 id="tool-usage-paywall-title">Você já usou as 3 utilizações gratuitas deste mês nesta ferramenta</h1>
          <p>
            O plano grátis inclui 3 utilizações mensais em cada ferramenta — e você já usou as 3 de {toolTitle} neste
            mês. Assine um plano pago para continuar usando sem limite em todas as ferramentas.
          </p>

          <div className="tool-usage-paywall-plans">
            <div className="tool-usage-paywall-plan">
              <strong>Bronze</strong>
              <span>R$ 162,10/mês</span>
              <StripePlanButton plan="bronze">Assinar Bronze</StripePlanButton>
            </div>
            <div className="tool-usage-paywall-plan is-featured">
              <strong>Prata</strong>
              <span>R$ 405,25/mês</span>
              <StripePlanButton featured plan="prata">
                Assinar Prata
              </StripePlanButton>
            </div>
          </div>

          <p className="tool-usage-paywall-note">Seu limite gratuito é renovado no início de cada mês.</p>
        </div>
      </section>
    </ToolShell>
  )
}
