"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Check, HelpCircle, Minus, Plus, X } from "lucide-react"
import { StripePlanButton } from "@/components/stripe-plan-button"
import { PLAN_DETAILS, type CheckoutPlanSlug } from "@/lib/plans"

type Regime = "" | "pessoa_fisica" | "mei" | "simples" | "presumido" | "real"
type Notas = "" | "ate1" | "ate2" | "ate5" | "mais5"
type Atendimento = "" | "email" | "email_whatsapp" | "email_whatsapp_telefone"

const REGIME_OPTIONS: { value: Exclude<Regime, "">; label: string }[] = [
  { value: "pessoa_fisica", label: "Pessoa Física" },
  { value: "mei", label: "MEI" },
  { value: "simples", label: "Simples Nacional" },
  { value: "presumido", label: "Lucro Presumido" },
  { value: "real", label: "Lucro Real" },
]

const NOTAS_OPTIONS: { value: Exclude<Notas, "">; label: string }[] = [
  { value: "ate1", label: "Até 1" },
  { value: "ate2", label: "Até 2" },
  { value: "ate5", label: "Até 5" },
  { value: "mais5", label: "Mais de 5" },
]

const NOTAS_VALUES: Record<Exclude<Notas, "">, number> = {
  ate1: 1,
  ate2: 2,
  ate5: 5,
  mais5: 6,
}

const ATENDIMENTO_OPTIONS: { value: Exclude<Atendimento, "">; label: string }[] = [
  { value: "email", label: "E-mail" },
  { value: "email_whatsapp", label: "E-mail + WhatsApp" },
  { value: "email_whatsapp_telefone", label: "E-mail + WhatsApp + Telefone" },
]

const PLAN_NOTAS_CAP: Record<CheckoutPlanSlug, number> = {
  bronze: 1,
  prata: 2,
  ouro: 5,
  diamante: 5,
}

const MAX_FUNCIONARIOS: Record<"mei" | "simples", number> = {
  mei: 1,
  simples: 2,
}

const PLAN_ORDER: CheckoutPlanSlug[] = ["bronze", "prata", "ouro", "diamante"]

function calculatePlan(regime: "mei" | "simples", funcionarios: number, notas: Notas): CheckoutPlanSlug {
  if (regime === "mei") {
    const notaCount = notas ? NOTAS_VALUES[notas] : 0
    return funcionarios >= 1 || notaCount > 1 ? "prata" : "bronze"
  }
  return funcionarios >= 2 ? "diamante" : "ouro"
}

export default function PlanCalculator() {
  const [regime, setRegime] = useState<Regime>("")
  const [funcionarios, setFuncionarios] = useState(0)
  const [notas, setNotas] = useState<Notas>("")
  const [atendimento, setAtendimento] = useState<Atendimento>("")
  const [showCompare, setShowCompare] = useState(false)

  const maxFuncionarios = regime === "mei" || regime === "simples" ? MAX_FUNCIONARIOS[regime] : 0

  function handleRegimeChange(value: Regime) {
    setRegime(value)
    const max = value === "mei" || value === "simples" ? MAX_FUNCIONARIOS[value] : 0
    setFuncionarios((current) => Math.min(current, max))
    if (value !== "mei" && value !== "simples") {
      setNotas("")
    }
  }

  const plan = useMemo(() => {
    if (regime !== "mei" && regime !== "simples") return null
    return calculatePlan(regime, funcionarios, notas)
  }, [regime, funcionarios, notas])

  const planDetails = plan ? PLAN_DETAILS[plan] : null
  const exceedsNotas = plan && notas ? NOTAS_VALUES[notas] > PLAN_NOTAS_CAP[plan] : false
  const priceDigits = planDetails?.priceValue?.replace("R$", "").trim() ?? ""
  const atendimentoLabel = ATENDIMENTO_OPTIONS.find((option) => option.value === atendimento)?.label
  const needsNotas = regime === "mei" || regime === "simples"
  const answeredSteps = [regime, regime ? "equipe" : "", needsNotas ? notas : "nao-aplicavel", atendimento].filter(Boolean).length

  const showGatewayResult = regime === "pessoa_fisica"
  const showConsultivoResult = regime === "presumido" || regime === "real"
  const isComplete = Boolean(regime && atendimento && (!needsNotas || notas))
  const showPlanResult = Boolean(isComplete && plan && notas)

  useEffect(() => {
    if (!showCompare) return
    document.body.style.overflow = "hidden"
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowCompare(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [showCompare])

  return (
    <div className="plan-calc">
      <div className={`plan-calc-panels${isComplete ? " has-result" : ""}`}>
        <form className="plan-calc-form" onSubmit={(event) => event.preventDefault()}>
          <div className="plan-calc-form-head">
            <div>
              <p>Responda e veja o plano ideal</p>
              <span>{answeredSteps} de 4 respostas preenchidas</span>
            </div>
          </div>

          <div className="plan-calc-progress" aria-hidden="true">
            <span style={{ width: `${(answeredSteps / 4) * 100}%` }} />
          </div>

          <label className="plan-calc-field">
            <span className="plan-calc-field-label">
              <em className="plan-calc-step-badge">1</em>
              Qual o seu regime?
            </span>
            <select value={regime} onChange={(event) => handleRegimeChange(event.target.value as Regime)}>
              <option value="" disabled>
                Selecione o regime
              </option>
              {REGIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="plan-calc-field">
            <span className="plan-calc-field-label">
              <em className="plan-calc-step-badge">2</em>
              Quantos sócios ou funcionários sua empresa tem?
            </span>
            <small className="plan-calc-field-hint">
              MEI: 0 e até 1 nota fica Bronze; 1 aqui ou mais de 1 nota vai para Prata. Simples: 0 ou 1 fica
              Ouro; 2 vai para Diamante.
            </small>
            <div className="plan-calc-stepper">
              <button
                type="button"
                onClick={() => setFuncionarios((current) => Math.max(0, current - 1))}
                disabled={maxFuncionarios === 0 || funcionarios === 0}
                aria-label="Diminuir"
              >
                <Minus size={14} strokeWidth={2.4} aria-hidden="true" />
              </button>
              <span>{String(funcionarios).padStart(2, "0")}</span>
              <button
                type="button"
                onClick={() => setFuncionarios((current) => Math.min(maxFuncionarios, current + 1))}
                disabled={maxFuncionarios === 0 || funcionarios === maxFuncionarios}
                aria-label="Aumentar"
              >
                <Plus size={14} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </div>
          </div>

          <label className="plan-calc-field">
            <span className="plan-calc-field-label">
              <em className="plan-calc-step-badge">3</em>
              Quantas notas você emite por mês?
            </span>
            <select
              value={notas}
              onChange={(event) => setNotas(event.target.value as Notas)}
              disabled={regime !== "mei" && regime !== "simples"}
            >
              <option value="" disabled>
                Selecione uma das opções
              </option>
              {NOTAS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="plan-calc-field">
            <span className="plan-calc-field-label">
              <em className="plan-calc-step-badge">4</em>
              Como você prefere ser atendido?
            </span>
            <select value={atendimento} onChange={(event) => setAtendimento(event.target.value as Atendimento)}>
              <option value="" disabled>
                Selecione uma das opções
              </option>
              {ATENDIMENTO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </form>

        {isComplete && (
          <aside className={`plan-calc-result${showPlanResult ? " is-ready" : ""}`} aria-live="polite">
            <div className="plan-calc-result-status">
              <span>Resultado</span>
              <strong>{answeredSteps}/4</strong>
            </div>

            {showGatewayResult && (
              <>
                <p className="plan-calc-result-title">
                  Primeiro passo <strong>Abrir CNPJ</strong>
                </p>
                <p className="plan-calc-result-sub">
                  Você ainda opera como pessoa física. Nossa equipe te ajuda a escolher entre MEI, Simples Nacional ou
                  outro enquadramento.
                </p>
                <a className="accounting-plan-button is-primary" href="/abrir-cnpj">
                  Abrir meu CNPJ
                  <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
                </a>
              </>
            )}

            {showConsultivoResult && (
              <>
                <p className="plan-calc-result-title">
                  Melhor caminho <strong>Atendimento consultivo</strong>
                </p>
                <p className="plan-calc-result-sub">
                  Lucro Presumido e Lucro Real pedem uma proposta sob medida para porte, operação e rotina fiscal.
                </p>
                <a className="accounting-plan-button is-primary" href="/abrir-cnpj">
                  Falar com a equipe
                  <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
                </a>
              </>
            )}

            {showPlanResult && plan && planDetails && (
              <>
                <div className="plan-calc-result-head">
                  <p className="plan-calc-result-title">
                    Indicamos o plano <strong>{planDetails.label}</strong>
                  </p>
                  <button
                    type="button"
                    className="plan-calc-help"
                    onClick={() => setShowCompare(true)}
                    aria-label="Ver os 4 planos"
                    aria-expanded={showCompare}
                  >
                    <HelpCircle size={18} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>

                <div className="plan-calc-price">
                  <span>R$</span>
                  <strong>{priceDigits}</strong>
                  <span>/ mês</span>
                </div>

                <p className="plan-calc-result-sub">
                  {atendimentoLabel
                    ? `Inclui o atendimento ${atendimentoLabel.toLowerCase()} que você selecionou.`
                    : "Você pode ajustar o canal de atendimento antes de contratar."}
                </p>

                <ul className="plan-calc-benefits">
                  {planDetails.benefits.map((benefit) => (
                    <li key={benefit}>
                      <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {exceedsNotas && (
                  <p className="plan-calc-note">
                    Seu volume de notas fiscais passa do que está incluso nesse plano. Trabalhamos com taxa por emissão
                    adicional e alinhamos os detalhes no atendimento.
                  </p>
                )}

                <StripePlanButton plan={plan} featured>
                  Contratar {planDetails.label}
                </StripePlanButton>
              </>
            )}
          </aside>
        )}
      </div>

      {showCompare && (
        <div className="plan-calc-modal-overlay" onClick={() => setShowCompare(false)}>
          <div className="plan-calc-modal" onClick={(event) => event.stopPropagation()}>
            <div className="plan-calc-modal-head">
              <p>Os 4 planos da Tropa</p>
              <button type="button" onClick={() => setShowCompare(false)} aria-label="Fechar">
                <X size={18} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>

            <div className="plan-calc-compare-grid">
              {PLAN_ORDER.map((slug) => {
                const details = PLAN_DETAILS[slug]
                const priceOnly = details.priceValue?.replace("R$", "").trim() ?? ""
                return (
                  <div className={`plan-calc-compare-card${slug === plan ? " is-current" : ""}`} key={slug}>
                    <strong>{details.label}</strong>
                    <span className="plan-calc-compare-price">
                      R$ {priceOnly}
                      <em>/mês</em>
                    </span>
                    <ul className="plan-calc-compare-benefits">
                      {details.benefits.map((benefit) => (
                        <li key={benefit}>
                          <Check size={13} strokeWidth={2.4} aria-hidden="true" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <StripePlanButton plan={slug}>Contratar</StripePlanButton>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
