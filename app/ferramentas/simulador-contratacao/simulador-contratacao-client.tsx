"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BadgeCheck, Calculator, Info } from "lucide-react"
import { ToolShell } from "@/components/tool-shell"
import ToolResultGate from "@/components/tool-result-gate"
import { createIdempotencyKey, recordToolUsage } from "@/lib/tool-usage/record-client"

// Quanto tempo sem alterações até considerar a simulação "concluída" e
// contar como uma utilização. Evita contar quem só abriu a página e saiu.
const USAGE_SETTLE_DELAY_MS = 2500

type Regime = "simplesRegular" | "simplesAnexoIv" | "presumidoReal"

const DEFAULT_SALARY = "2500"
const DEFAULT_REGIME: Regime = "simplesRegular"
const DEFAULT_TRANSPORT = "220"
const DEFAULT_DEDUCT_TRANSPORT = false
const DEFAULT_MEAL = "550"
const DEFAULT_HEALTH = "0"
const DEFAULT_OTHER = "0"

const regimeRates: Record<Regime, number> = {
  simplesRegular: 0,
  simplesAnexoIv: 0,
  presumidoReal: 28.8,
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

function toNumber(value: string) {
  const sanitized = value.trim().replace(/\s/g, "").replace(/[^\d,.-]/g, "")

  if (!sanitized) {
    return 0
  }

  const hasThousandsGrouping = (parts: string[]) =>
    parts.length > 1 && parts.slice(1).every(part => part.length === 3)

  const lastComma = sanitized.lastIndexOf(",")
  const lastDot = sanitized.lastIndexOf(".")
  let normalized = sanitized

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : "."
    const thousandsSeparator = decimalSeparator === "," ? "." : ","
    normalized = sanitized
      .replace(new RegExp(`\\${thousandsSeparator}`, "g"), "")
      .replace(decimalSeparator, ".")
  } else if (lastComma >= 0) {
    const parts = sanitized.split(",")
    normalized = hasThousandsGrouping(parts) ? parts.join("") : `${parts.slice(0, -1).join("")}.${parts.at(-1)}`
  } else if (lastDot >= 0) {
    const parts = sanitized.split(".")
    normalized = hasThousandsGrouping(parts) ? parts.join("") : `${parts.slice(0, -1).join("")}.${parts.at(-1)}`
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

export default function HiringSimulatorClient({
  trackUsage = false,
  isAuthenticated = false,
}: {
  trackUsage?: boolean
  isAuthenticated?: boolean
}) {
  const [salary, setSalary] = useState(DEFAULT_SALARY)
  const [regime, setRegime] = useState<Regime>(DEFAULT_REGIME)
  const [taxRate, setTaxRate] = useState(String(regimeRates.simplesRegular))
  const [transport, setTransport] = useState(DEFAULT_TRANSPORT)
  const [deductTransport, setDeductTransport] = useState(DEFAULT_DEDUCT_TRANSPORT)
  const [meal, setMeal] = useState(DEFAULT_MEAL)
  const [health, setHealth] = useState(DEFAULT_HEALTH)
  const [other, setOther] = useState(DEFAULT_OTHER)

  const usageRecordedRef = useRef(false)
  const idempotencyKeyRef = useRef<string | undefined>(undefined)
  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current = createIdempotencyKey()
  }

  // Só conta como utilização se o usuário de fato alterou algum campo — abrir
  // a página com os valores padrão e sair não deve consumir o limite.
  const isDirty =
    salary !== DEFAULT_SALARY ||
    regime !== DEFAULT_REGIME ||
    transport !== DEFAULT_TRANSPORT ||
    deductTransport !== DEFAULT_DEDUCT_TRANSPORT ||
    meal !== DEFAULT_MEAL ||
    health !== DEFAULT_HEALTH ||
    other !== DEFAULT_OTHER

  const result = useMemo(() => {
    const baseSalary = Math.max(toNumber(salary), 0)
    const employerRate = regime === "simplesRegular" ? 0 : toNumber(taxRate) / 100
    const transportValue = toNumber(transport)
    const transportDiscountLimit = baseSalary * 0.06
    const transportDiscount = deductTransport ? Math.min(transportValue, transportDiscountLimit) : 0
    const transportCost = Math.max(0, transportValue - transportDiscount)
    const benefits = transportCost + toNumber(meal) + toNumber(health) + toNumber(other)
    const thirteenthProvision = baseSalary / 12
    const vacationProvision = (baseSalary * 4) / 3 / 12
    const baseProvisions = thirteenthProvision + vacationProvision
    const fgtsOnSalary = baseSalary * 0.08
    const fgtsOnProvisions = baseProvisions * 0.08
    const employerChargesOnSalary = baseSalary * employerRate
    const employerChargesOnProvisions = baseProvisions * employerRate
    const employerCharges = employerChargesOnSalary + employerChargesOnProvisions
    const total =
      baseSalary +
      thirteenthProvision +
      vacationProvision +
      fgtsOnSalary +
      fgtsOnProvisions +
      employerChargesOnSalary +
      employerChargesOnProvisions +
      benefits
    const multiplier = baseSalary > 0 ? total / baseSalary : 0

    return {
      baseSalary,
      baseProvisions,
      benefits,
      employerCharges,
      employerChargesOnProvisions,
      employerChargesOnSalary,
      fgtsOnProvisions,
      fgtsOnSalary,
      multiplier,
      thirteenthProvision,
      total,
      vacationProvision,
      yearlyTotal: total * 12,
    }
  }, [deductTransport, health, meal, other, regime, salary, taxRate, transport])

  useEffect(() => {
    if (!trackUsage || usageRecordedRef.current || !isDirty || result.baseSalary <= 0) return

    const timer = setTimeout(() => {
      usageRecordedRef.current = true
      recordToolUsage("simulador-contratacao", idempotencyKeyRef.current!)
    }, USAGE_SETTLE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isDirty, result, trackUsage])

  const handleRegimeChange = (nextRegime: Regime) => {
    setRegime(nextRegime)
    setTaxRate(String(regimeRates[nextRegime]))
  }

  const showTaxRateField = regime !== "simplesRegular"
  const regimeHelp: Record<Regime, string> = {
    simplesRegular: "Empresas do Simples Nacional (fora do Anexo IV) não pagam encargo patronal adicional sobre a folha.",
    simplesAnexoIv: "No Anexo IV, a empresa paga a parte patronal do INSS por fora do Simples — informe a alíquota se souber.",
    presumidoReal: "No Lucro Presumido ou Real, os encargos patronais completos costumam ficar entre 26% e 30% do salário.",
  }

  return (
    <ToolShell mainClassName="hiring-tool-site">
      <section className="hiring-tool-section" aria-labelledby="hiring-tool-title">
        <div className="hiring-tool-head">
          <span>
            <Calculator size={18} strokeWidth={2.2} aria-hidden="true" />
            Ferramenta gratuita
          </span>
          <h1 id="hiring-tool-title">Simulador de contratação</h1>
          <p>Uma estimativa simples para entender o custo mensal de um funcionário antes de contratar.</p>
        </div>

        <div className="hiring-tool-card">
          <form className="hiring-tool-form" aria-label="Calculadora de contratação">
            <label className="hiring-tool-field">
              <span>Salário bruto mensal</span>
              <input
                aria-label="Salário bruto mensal"
                data-testid="hiring-salary"
                inputMode="decimal"
                value={salary}
                onChange={event => setSalary(event.target.value)}
              />
            </label>

            <div className="hiring-tool-field">
              <span>Regime da empresa</span>
              <div className="hiring-tool-regime-tabs" role="radiogroup" aria-label="Regime da empresa">
                <button
                  className={regime === "simplesRegular" ? "is-selected" : ""}
                  type="button"
                  role="radio"
                  aria-checked={regime === "simplesRegular"}
                  onClick={() => handleRegimeChange("simplesRegular")}
                >
                  Simples
                </button>
                <button
                  className={regime === "simplesAnexoIv" ? "is-selected" : ""}
                  type="button"
                  role="radio"
                  aria-checked={regime === "simplesAnexoIv"}
                  onClick={() => handleRegimeChange("simplesAnexoIv")}
                >
                  Anexo IV
                </button>
                <button
                  className={regime === "presumidoReal" ? "is-selected" : ""}
                  type="button"
                  role="radio"
                  aria-checked={regime === "presumidoReal"}
                  onClick={() => handleRegimeChange("presumidoReal")}
                >
                  Presumido/Real
                </button>
              </div>
              <p className="hiring-tool-regime-help">{regimeHelp[regime]}</p>
            </div>

            {showTaxRateField ? (
              <label className="hiring-tool-field">
                <span>Encargos patronais estimados (%)</span>
                <input
                  aria-label="Encargos patronais estimados"
                  data-testid="hiring-tax-rate"
                  inputMode="decimal"
                  value={taxRate}
                  onChange={event => setTaxRate(event.target.value)}
                />
                <small>Não sabe o valor exato? Deixe a estimativa acima e ajuste depois com seu contador.</small>
              </label>
            ) : null}

            <div className="hiring-tool-field-grid" aria-label="Benefícios mensais">
              <div className="hiring-tool-field">
                <span>Vale transporte</span>
                <input
                  aria-label="Vale-transporte"
                  data-testid="hiring-transport"
                  inputMode="decimal"
                  value={transport}
                  onChange={event => setTransport(event.target.value)}
                />
              </div>

              <label className="hiring-tool-field">
                <span>Vale alimentação/refeição</span>
                <input
                  aria-label="Vale alimentação/refeição"
                  data-testid="hiring-meal"
                  inputMode="decimal"
                  value={meal}
                  onChange={event => setMeal(event.target.value)}
                />
              </label>

              <label className="hiring-tool-field">
                <span>Plano de saúde</span>
                <input
                  aria-label="Plano de saúde"
                  data-testid="hiring-health"
                  inputMode="decimal"
                  value={health}
                  onChange={event => setHealth(event.target.value)}
                />
              </label>

              <label className="hiring-tool-field">
                <span>Outros benefícios</span>
                <input
                  aria-label="Outros benefícios"
                  data-testid="hiring-other"
                  inputMode="decimal"
                  value={other}
                  onChange={event => setOther(event.target.value)}
                />
              </label>
            </div>

            <label className="hiring-tool-checkbox">
              <input
                type="checkbox"
                aria-label="Descontar até 6% do VT do empregado"
                data-testid="hiring-transport-discount"
                checked={deductTransport}
                onChange={event => setDeductTransport(event.target.checked)}
              />
              <span>Descontar até 6% do VT do empregado</span>
              <Info size={16} strokeWidth={2.1} aria-hidden="true" />
            </label>
          </form>

          <aside className="hiring-tool-result" aria-label="Resultado da simulação">
            <ToolResultGate unlocked={isAuthenticated} redirectTo="/ferramentas/simulador-contratacao">
              <span>Custo médio mensal</span>
              <strong data-testid="hiring-total">{formatCurrency(result.total)}</strong>
              <p>
                Aproximadamente <b data-testid="hiring-multiplier">{result.multiplier.toFixed(2).replace(".", ",")}x</b>{" "}
                o salário bruto informado.
              </p>

              <div className="hiring-tool-summary">
                <div>
                  <span>Salário</span>
                  <strong data-testid="hiring-summary-salary">{formatCurrency(result.baseSalary)}</strong>
                </div>
                <div>
                  <span>Encargos</span>
                  <strong data-testid="hiring-summary-employer-charges">{formatCurrency(result.employerCharges)}</strong>
                </div>
                <div>
                  <span>Provisões</span>
                  <strong data-testid="hiring-summary-provisions">{formatCurrency(result.baseProvisions)}</strong>
                </div>
                <div>
                  <span>Benefícios</span>
                  <strong data-testid="hiring-summary-benefits">{formatCurrency(result.benefits)}</strong>
                </div>
                <div className="is-highlighted">
                  <span>Custo anual</span>
                  <strong data-testid="hiring-summary-yearly">{formatCurrency(result.yearlyTotal)}</strong>
                </div>
              </div>

              <div className="hiring-tool-note">
                <Info size={17} strokeWidth={2.1} aria-hidden="true" />
                <p>Estimativa para planejamento. O valor final pode variar conforme convenção coletiva e regime tributário.</p>
              </div>
            </ToolResultGate>

            <a className="hiring-tool-cta" href="/diagnostico">
              <BadgeCheck size={19} strokeWidth={2.2} aria-hidden="true" />
              Falar com especialista
            </a>
          </aside>
        </div>
      </section>
    </ToolShell>
  )
}
