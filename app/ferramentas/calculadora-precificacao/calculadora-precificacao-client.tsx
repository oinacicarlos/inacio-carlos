"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BadgeCheck, Calculator, Info } from "lucide-react"
import { ToolShell } from "@/components/tool-shell"
import ToolResultGate from "@/components/tool-result-gate"
import { createIdempotencyKey, recordToolUsage } from "@/lib/tool-usage/record-client"

// Quanto tempo sem alterações até considerar a simulação "concluída" e
// contar como uma utilização. Evita contar quem só abriu a página e saiu.
const USAGE_SETTLE_DELAY_MS = 2500
const MARGIN_STORAGE_KEY = "tropa-pricing-margin"

const DEFAULT_WORK_NAME = ""
const DEFAULT_DIRECT_COSTS = "150"
const DEFAULT_LABOR_VALUE = "300"
const DEFAULT_MARGIN = "30"
const DEFAULT_QUANTITY = "1"

const marginPresets = ["20", "30", "40", "50"]

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

function formatQuantity(value: number) {
  return decimalFormatter.format(Number.isFinite(value) ? value : 0)
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
  return Number.isFinite(parsed) ? parsed : 0
}

function toPositiveNumber(value: string) {
  return Math.max(toNumber(value), 0)
}

export default function PricingCalculatorClient({
  trackUsage = false,
  isAuthenticated = false,
  embedded = false,
}: {
  trackUsage?: boolean
  isAuthenticated?: boolean
  embedded?: boolean
}) {
  const initialWorkName = DEFAULT_WORK_NAME
  const initialDirectCosts = embedded ? "" : DEFAULT_DIRECT_COSTS
  const initialLaborValue = embedded ? "" : DEFAULT_LABOR_VALUE
  const initialMargin = embedded ? "" : DEFAULT_MARGIN
  const initialQuantity = embedded ? "" : DEFAULT_QUANTITY
  const [workName, setWorkName] = useState(DEFAULT_WORK_NAME)
  const [directCosts, setDirectCosts] = useState(initialDirectCosts)
  const [laborValue, setLaborValue] = useState(initialLaborValue)
  const [marginPercent, setMarginPercent] = useState(initialMargin)
  const [quantity, setQuantity] = useState(initialQuantity)

  const usageRecordedRef = useRef(false)
  const idempotencyKeyRef = useRef<string | undefined>(undefined)
  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current = createIdempotencyKey()
  }

  useEffect(() => {
    if (embedded) return
    try {
      const saved = window.localStorage.getItem(MARGIN_STORAGE_KEY)
      if (saved) {
        setMarginPercent(saved)
      }
    } catch {
      // localStorage indisponível — segue com a margem padrão.
    }
  }, [embedded])

  useEffect(() => {
    if (embedded) return
    window.localStorage.setItem(MARGIN_STORAGE_KEY, marginPercent)
  }, [embedded, marginPercent])

  // Só conta como utilização se o usuário de fato alterou algum campo — abrir
  // a página com os valores padrão e sair não deve consumir o limite.
  const isDirty =
    workName !== initialWorkName ||
    directCosts !== initialDirectCosts ||
    laborValue !== initialLaborValue ||
    marginPercent !== initialMargin ||
    quantity !== initialQuantity

  const result = useMemo(() => {
    const costs = toPositiveNumber(directCosts)
    const labor = toPositiveNumber(laborValue)
    const margin = toNumber(marginPercent)
    const qty = toPositiveNumber(quantity)
    const totalCost = costs + labor

    const errors: string[] = []
    if (totalCost <= 0) errors.push("Informe seus gastos ou o valor do seu tempo.")
    if (margin <= 0) errors.push("Informe uma margem de lucro maior que zero.")
    if (margin >= 100) errors.push("A margem de lucro precisa ser menor que 100%.")
    if (qty <= 0) errors.push("Informe uma quantidade maior que zero.")

    const isValid = errors.length === 0
    const suggestedPrice = isValid ? totalCost / (1 - margin / 100) : 0
    const profit = suggestedPrice - totalCost
    const unitPrice = isValid && qty > 0 ? suggestedPrice / qty : 0

    return { costs, labor, margin, qty, totalCost, suggestedPrice, profit, unitPrice, errors, isValid }
  }, [directCosts, laborValue, marginPercent, quantity])

  useEffect(() => {
    if (!trackUsage || usageRecordedRef.current || !isDirty || !result.isValid) return

    const timer = setTimeout(() => {
      usageRecordedRef.current = true
      recordToolUsage("calculadora-precificacao", idempotencyKeyRef.current!)
    }, USAGE_SETTLE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isDirty, result, trackUsage])

  const content = (
      <section className="pricing-tool-section" aria-labelledby="pricing-tool-title">
        <div className="pricing-tool-head">
          <span>
            <Calculator size={18} strokeWidth={2.2} aria-hidden="true" />
            Ferramenta gratuita
          </span>
          <h1 id="pricing-tool-title">Descubra quanto cobrar</h1>
          <p>Informe seus custos, seu tempo e a margem de lucro que você quer — o preço ideal aparece na hora.</p>
        </div>

        <div className="pricing-tool-card">
          <form className="pricing-tool-form" aria-label="Calculadora de precificação">
            <label className="pricing-tool-field">
              <span>Nome do produto ou serviço, opcional</span>
              <input
                aria-label="Nome do produto ou serviço"
                data-testid="pricing-work-name"
                placeholder="Ex.: bolo decorado, pintura de apartamento, criação de vídeo"
                value={workName}
                onChange={event => setWorkName(event.target.value)}
              />
            </label>

            <label className="pricing-tool-field">
              <span>Quanto você gasta para entregar? (materiais, insumos, terceiros)</span>
              <input
                aria-label="Custos diretos"
                data-testid="pricing-direct-costs"
                inputMode="decimal"
                value={directCosts}
                onChange={event => setDirectCosts(event.target.value)}
              />
            </label>

            <label className="pricing-tool-field">
              <span>Quanto vale o seu tempo e trabalho nisso?</span>
              <input
                aria-label="Valor do seu tempo e trabalho"
                data-testid="pricing-labor-value"
                inputMode="decimal"
                value={laborValue}
                onChange={event => setLaborValue(event.target.value)}
              />
              <small>Uma estimativa do que você considera justo cobrar pela sua dedicação a esse trabalho.</small>
            </label>

            <div className="pricing-tool-field">
              <span>Qual margem de lucro você quer sobre o preço final?</span>
              <div className="pricing-tool-options" role="radiogroup" aria-label="Margem de lucro">
                {marginPresets.map(preset => (
                  <button
                    key={preset}
                    className={marginPercent === preset ? "is-selected" : ""}
                    type="button"
                    role="radio"
                    aria-checked={marginPercent === preset}
                    onClick={() => setMarginPercent(preset)}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
              <input
                aria-label="Margem de lucro em porcentagem"
                data-testid="pricing-margin"
                inputMode="decimal"
                value={marginPercent}
                onChange={event => setMarginPercent(event.target.value)}
              />
            </div>

            <label className="pricing-tool-field">
              <span>Quantas unidades você vai vender, opcional</span>
              <input
                aria-label="Quantidade vendida"
                data-testid="pricing-quantity"
                inputMode="decimal"
                value={quantity}
                onChange={event => setQuantity(event.target.value)}
              />
              <small>Usado só para calcular o preço por unidade. Deixe 1 se for um trabalho único.</small>
            </label>

            <div className="pricing-tool-inline-note">
              <Info size={16} strokeWidth={2.1} aria-hidden="true" />
              <p>
                Essa margem é sobre o preço final de venda — a forma mais direta de garantir que sobra exatamente esse
                percentual de lucro depois de cobrir seus custos.
              </p>
            </div>

            {!result.isValid ? (
              <div className="pricing-tool-inline-note" role="alert">
                <Info size={16} strokeWidth={2.1} aria-hidden="true" />
                <p>{result.errors[0]}</p>
              </div>
            ) : null}
          </form>

          <aside className="pricing-tool-result" aria-label="Resultado da precificação">
            {result.isValid ? (
              <>
                <ToolResultGate unlocked={isAuthenticated} redirectTo="/ferramentas/calculadora-precificacao">
                  <span>Valor recomendado</span>
                  <strong data-testid="pricing-suggested-price">{formatCurrency(result.suggestedPrice)}</strong>
                  <p>
                    {workName.trim()
                      ? `Preço sugerido para ${workName.trim()}, com ${formatQuantity(result.margin)}% de margem garantida.`
                      : `Esse valor já garante ${formatQuantity(result.margin)}% de margem depois de cobrir seus custos.`}
                  </p>

                  <div className="pricing-tool-summary">
                    <div>
                      <span>Custos diretos</span>
                      <strong data-testid="pricing-costs-result">{formatCurrency(result.costs)}</strong>
                    </div>
                    <div>
                      <span>Valor do seu trabalho</span>
                      <strong data-testid="pricing-labor-result">{formatCurrency(result.labor)}</strong>
                    </div>
                    <div>
                      <span>Custo total</span>
                      <strong data-testid="pricing-total-cost-result">{formatCurrency(result.totalCost)}</strong>
                    </div>
                    <div>
                      <span>Lucro (margem de {formatQuantity(result.margin)}%)</span>
                      <strong data-testid="pricing-profit-result">{formatCurrency(result.profit)}</strong>
                    </div>
                    <div className="is-highlighted">
                      <span>Preço sugerido</span>
                      <strong data-testid="pricing-total-price">{formatCurrency(result.suggestedPrice)}</strong>
                    </div>
                  </div>

                  {result.qty > 1 ? (
                    <div className="pricing-tool-unit-price">
                      Equivale a <b data-testid="pricing-unit-price">{formatCurrency(result.unitPrice)}</b> por unidade
                      ({formatQuantity(result.qty)} unidades)
                    </div>
                  ) : null}
                </ToolResultGate>
              </>
            ) : (
              <>
                <span>Valor recomendado</span>
                <strong className="pricing-tool-empty-result">Preencha os dados</strong>
                <p>Preencha os campos ao lado para descobrir quanto cobrar.</p>
              </>
            )}

            <a className="pricing-tool-cta" href="https://wa.me/5521979080457" target="_blank" rel="noreferrer">
              <BadgeCheck size={19} strokeWidth={2.2} aria-hidden="true" />
              Falar com especialista
            </a>
          </aside>
        </div>
      </section>
  )

  if (embedded) {
    return content
  }

  return <ToolShell mainClassName="pricing-tool-site">{content}</ToolShell>
}
