import type { TerminationResult } from "@/lib/termination-calculator/types"
import { formatCurrency } from "@/lib/termination-calculator/formatters"
import { Info, ReceiptText } from "lucide-react"

type TerminationBreakdownProps = {
  result: TerminationResult
}

export default function TerminationBreakdown({ result }: TerminationBreakdownProps) {
  if (!result.isValid) {
    return null
  }

  return (
    <>
      <section className="termination-breakdown" aria-label="Detalhamento da rescisão">
        <div className="termination-breakdown-title">
          <ReceiptText size={22} strokeWidth={2} aria-hidden="true" />
          <h2>Detalhamento da rescisão</h2>
        </div>

        <div className="termination-breakdown-grid">
          <div>
            {result.breakdown.map(line => (
              <div className={line.kind === "discount" ? "is-discount" : ""} key={`${line.label}-${line.meta ?? ""}`}>
                <span>
                  {line.label}
                  {line.meta ? <small>{line.meta}</small> : null}
                </span>
                <strong>{formatCurrency(line.value)}</strong>
              </div>
            ))}
          </div>

          <div>
            {result.info.map(line => (
              <div key={line.label}>
                <span>{line.label}</span>
                <strong>{line.meta ?? formatCurrency(line.value)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="termination-legal-card" aria-label="Aviso legal">
        <Info size={20} strokeWidth={2.1} aria-hidden="true" />
        <div>
          <p>
            Esta ferramenta apresenta uma estimativa para planejamento. Convenções coletivas, médias remuneratórias,
            estabilidade, afastamentos, faltas, incidências tributárias e particularidades contratuais podem alterar o
            cálculo final.
          </p>
          <strong>Confirme os valores com um profissional antes de efetuar o desligamento.</strong>
        </div>
      </section>

      <section className="termination-conversion-card" aria-label="Contato especialista">
        <div>
          <h2>Precisa confirmar a rescisão?</h2>
          <p>Fale com um especialista e evite erros no cálculo e no desligamento.</p>
        </div>
        <a className="termination-cta" href="/diagnostico">
          Falar com especialista
        </a>
      </section>
    </>
  )
}
