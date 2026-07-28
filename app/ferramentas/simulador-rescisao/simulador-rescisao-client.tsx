"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BadgeCheck, Calculator, Info } from "lucide-react"
import { calculateTermination } from "@/lib/termination-calculator/calculations"
import { formatCurrency, parseLocalDate, parseMoneyInput } from "@/lib/termination-calculator/formatters"
import type { NoticeOption, TerminationInput, TerminationType } from "@/lib/termination-calculator/types"
import { ToolShell } from "@/components/tool-shell"
import ToolResultGate from "@/components/tool-result-gate"
import { createIdempotencyKey, recordToolUsage } from "@/lib/tool-usage/record-client"

const terminationTypeHelp: Record<TerminationType, string> = {
  noCause: "A empresa decide encerrar o contrato. Dá direito a todas as verbas, incluindo multa do FGTS.",
  resignation: "O funcionário pede para sair. Não há multa do FGTS nem saque do fundo.",
  mutual: "Empresa e funcionário concordam em encerrar juntos. Verbas reduzidas pela metade em alguns pontos.",
  cause: "Demissão por falta grave comprovada. O funcionário perde a maioria dos direitos rescisórios.",
}

// Quanto tempo sem alterações até considerar a simulação "concluída" e
// contar como uma utilização. Evita contar quem só abriu a página e saiu.
const USAGE_SETTLE_DELAY_MS = 2500

type FormValues = {
  salary: string
  admissionDate: string
  terminationDate: string
  fgtsBalance: string
  otherDiscounts: string
  terminationType: TerminationType
}

const defaultValues: FormValues = {
  salary: "3000",
  admissionDate: "2026-01-01",
  terminationDate: "2026-06-30",
  fgtsBalance: "4000",
  otherDiscounts: "0",
  terminationType: "noCause",
}

function getDefaultNotice(type: TerminationType): NoticeOption {
  if (type === "cause") {
    return "none"
  }

  if (type === "resignation") {
    return "worked"
  }

  return "indemnified"
}

function getWorkedDays(value: string) {
  const date = parseLocalDate(value)
  return date ? Math.min(30, Math.max(0, date.getDate())) : 0
}

function toInput(values: FormValues): TerminationInput {
  return {
    additionalAverage: 0,
    admissionDate: values.admissionDate,
    daysWorkedInMonth: getWorkedDays(values.terminationDate),
    expiredVacations: 0,
    fgtsBalance: parseMoneyInput(values.fgtsBalance),
    mixedNoticeIndemnifiedDays: 0,
    mixedNoticeWorkedDays: 0,
    noticeOption: getDefaultNotice(values.terminationType),
    otherDiscounts: parseMoneyInput(values.otherDiscounts),
    salary: parseMoneyInput(values.salary),
    terminationDate: values.terminationDate,
    terminationType: values.terminationType,
  }
}

export default function TerminationSimulatorClient({
  trackUsage = false,
  isAuthenticated = false,
}: {
  trackUsage?: boolean
  isAuthenticated?: boolean
}) {
  const [values, setValues] = useState<FormValues>(defaultValues)
  const input = useMemo(() => toInput(values), [values])
  const result = useMemo(() => calculateTermination(input), [input])

  const usageRecordedRef = useRef(false)
  const idempotencyKeyRef = useRef<string | undefined>(undefined)
  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current = createIdempotencyKey()
  }

  // Só conta como utilização se o usuário de fato alterou algum campo — abrir
  // a página com os valores padrão e sair não deve consumir o limite.
  const isDirty = useMemo(
    () => (Object.keys(defaultValues) as (keyof FormValues)[]).some((key) => values[key] !== defaultValues[key]),
    [values],
  )

  useEffect(() => {
    if (!trackUsage || usageRecordedRef.current || !isDirty || !result.isValid) return

    const timer = setTimeout(() => {
      usageRecordedRef.current = true
      recordToolUsage("simulador-rescisao", idempotencyKeyRef.current!)
    }, USAGE_SETTLE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isDirty, result, trackUsage])

  const composition = result.isValid
    ? [
        { label: "Saldo de salário", value: result.salaryBalance },
        { label: "13º proporcional", value: result.thirteenthProportional },
        {
          label: "Férias + 1/3",
          value: result.vacationProportionalBase + result.vacationProportionalThird,
        },
        { label: "Multa do FGTS", value: result.fgtsPenalty },
        { label: "Descontos", value: result.informedDiscounts, discount: true },
      ].filter(item => item.value > 0 || item.discount)
    : []

  const handleFieldChange = (field: keyof FormValues, value: string) => {
    setValues(current => ({ ...current, [field]: value }))
  }

  return (
    <ToolShell mainClassName="termination-page">
      <section className="termination-simple-section" aria-labelledby="termination-title">
        <div className="termination-simple-head">
          <span>
            <Calculator size={18} strokeWidth={2.2} aria-hidden="true" />
            Cálculo estimado para contratos CLT
          </span>
          <h1 id="termination-title">Simulador de Rescisão</h1>
          <p>Uma calculadora simplificada para estimar as principais verbas da rescisão.</p>
        </div>

        <div className="termination-simple-card">
          <form className="termination-simple-form" aria-label="Calculadora simples de rescisão">
            <label className="termination-simple-field">
              <span>Salário bruto mensal</span>
              <input
                data-testid="termination-salary"
                inputMode="decimal"
                value={values.salary}
                onChange={event => handleFieldChange("salary", event.target.value)}
              />
            </label>

            <div className="termination-simple-field-grid">
              <label className="termination-simple-field">
                <span>Data de admissão</span>
                <input
                  type="date"
                  value={values.admissionDate}
                  onChange={event => handleFieldChange("admissionDate", event.target.value)}
                />
              </label>

              <label className="termination-simple-field">
                <span>Data de saída</span>
                <input
                  type="date"
                  value={values.terminationDate}
                  onChange={event => handleFieldChange("terminationDate", event.target.value)}
                />
              </label>
            </div>

            <div className="termination-simple-field">
              <span>Tipo de desligamento</span>
              <div className="termination-simple-options" role="radiogroup" aria-label="Tipo de desligamento">
                <button
                  className={values.terminationType === "noCause" ? "is-selected" : ""}
                  type="button"
                  role="radio"
                  aria-checked={values.terminationType === "noCause"}
                  onClick={() => handleFieldChange("terminationType", "noCause")}
                >
                  Sem justa causa
                </button>
                <button
                  className={values.terminationType === "resignation" ? "is-selected" : ""}
                  type="button"
                  role="radio"
                  aria-checked={values.terminationType === "resignation"}
                  onClick={() => handleFieldChange("terminationType", "resignation")}
                >
                  Pedido de demissão
                </button>
                <button
                  className={values.terminationType === "mutual" ? "is-selected" : ""}
                  type="button"
                  role="radio"
                  aria-checked={values.terminationType === "mutual"}
                  onClick={() => handleFieldChange("terminationType", "mutual")}
                >
                  Acordo
                </button>
                <button
                  className={values.terminationType === "cause" ? "is-selected" : ""}
                  type="button"
                  role="radio"
                  aria-checked={values.terminationType === "cause"}
                  onClick={() => handleFieldChange("terminationType", "cause")}
                >
                  Justa causa
                </button>
              </div>
              <p className="termination-simple-type-help">{terminationTypeHelp[values.terminationType]}</p>
            </div>

            <div className="termination-simple-field-grid">
              <label className="termination-simple-field">
                <span>Saldo do FGTS</span>
                <input
                  inputMode="decimal"
                  value={values.fgtsBalance}
                  onChange={event => handleFieldChange("fgtsBalance", event.target.value)}
                />
              </label>

              <label className="termination-simple-field">
                <span>Descontos</span>
                <input
                  inputMode="decimal"
                  value={values.otherDiscounts}
                  onChange={event => handleFieldChange("otherDiscounts", event.target.value)}
                />
              </label>
            </div>
          </form>

          <aside className="termination-simple-result" aria-label="Resultado da rescisão">
            {result.isValid ? (
              <>
                <ToolResultGate unlocked={isAuthenticated} redirectTo="/ferramentas/simulador-rescisao">
                  <span>Estimativa da rescisão</span>
                  <strong data-testid="termination-estimated-after-discounts">
                    {formatCurrency(result.estimatedAfterDiscounts)}
                  </strong>
                  <p>Cálculo resumido para planejamento. Não é valor líquido definitivo.</p>

                  <div className="termination-simple-composition">
                    {composition.map(item => (
                      <div className={item.discount ? "is-discount" : ""} key={item.label}>
                        <span>{item.label}</span>
                        <b>{formatCurrency(item.value)}</b>
                      </div>
                    ))}
                    <div className="is-highlighted">
                      <span>Custo estimado da empresa</span>
                      <b data-testid="termination-company-cost">{formatCurrency(result.estimatedCompanyCost)}</b>
                    </div>
                  </div>

                  <div className="termination-simple-note">
                    <Info size={17} strokeWidth={2.1} aria-hidden="true" />
                    <p>INSS, IRRF e particularidades contratuais não estão incluídos nesta estimativa.</p>
                  </div>
                </ToolResultGate>

                <a className="termination-simple-cta" href="/diagnostico">
                  <BadgeCheck size={19} strokeWidth={2.2} aria-hidden="true" />
                  Falar com especialista
                </a>
              </>
            ) : (
              <>
                <span>Resultado</span>
                <strong>Preencha os dados</strong>
                <div className="termination-simple-errors" role="alert">
                  {result.errors.map(error => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              </>
            )}
          </aside>
        </div>
      </section>
    </ToolShell>
  )
}
