import type { TerminationResult as TerminationResultType, TerminationType } from "@/lib/termination-calculator/types"
import { formatCurrency, formatDate } from "@/lib/termination-calculator/formatters"
import { BadgeCheck, Info } from "lucide-react"

type TerminationResultProps = {
  result: TerminationResultType
  terminationType: TerminationType
}

export default function TerminationResult({ result, terminationType }: TerminationResultProps) {
  if (!result.isValid) {
    return (
      <aside className="termination-result" aria-label="Resultado da simulação">
        <span>Resultado</span>
        <strong>Preencha os dados</strong>
        <p>Informe os campos obrigatórios para visualizar a estimativa da rescisão.</p>
      </aside>
    )
  }

  return (
    <aside className="termination-result" aria-label="Resultado da simulação">
      <span>Estimativa após descontos informados</span>
      <strong data-testid="termination-estimated-after-discounts">
        {formatCurrency(result.estimatedAfterDiscounts)}
      </strong>
      <p>Este valor não é líquido definitivo e não inclui INSS, IRRF ou outras incidências específicas.</p>

      <div className="termination-result-grid">
        <div>
          <span>Valor bruto estimado das verbas</span>
          <b data-testid="termination-gross">{formatCurrency(result.grossSeverance)}</b>
        </div>
        <div>
          <span>Descontos informados</span>
          <b data-testid="termination-discounts">{formatCurrency(result.informedDiscounts)}</b>
        </div>
        <div>
          <span>Multa rescisória do FGTS</span>
          <b data-testid="termination-fgts-penalty">{formatCurrency(result.fgtsPenalty)}</b>
        </div>
        <div className="is-highlighted">
          <span>Custo estimado para a empresa</span>
          <b data-testid="termination-company-cost">{formatCurrency(result.estimatedCompanyCost)}</b>
        </div>
      </div>

      {result.projectedDate ? (
        <div className="termination-result-note">
          <Info size={16} strokeWidth={2.1} aria-hidden="true" />
          <p>Data projetada pelo aviso: {formatDate(result.projectedDate)}</p>
        </div>
      ) : null}

      {terminationType === "mutual" ? (
        <div className="termination-result-note">
          <Info size={16} strokeWidth={2.1} aria-hidden="true" />
          <p>
            Em regra, o trabalhador poderá movimentar até 80% do saldo disponível do FGTS. O saque não compõe o
            pagamento direto feito pela empresa.
          </p>
        </div>
      ) : null}

      <div className="termination-result-note">
        <Info size={16} strokeWidth={2.1} aria-hidden="true" />
        <p>INSS, IRRF, consignados, pensão alimentícia e outras incidências específicas não estão incluídos.</p>
      </div>

      <a className="termination-cta" href="/diagnostico">
        <BadgeCheck size={19} strokeWidth={2.2} aria-hidden="true" />
        Falar com especialista
      </a>
    </aside>
  )
}
