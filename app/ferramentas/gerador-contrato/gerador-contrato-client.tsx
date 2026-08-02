"use client"

import { useEffect, useMemo, useReducer, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  FileSignature,
  Printer,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react"
import { CONTRACT_CHOICES, DRAFT_KEY, RESPONSIBILITY_OPTIONS, createInitialContractState } from "@/lib/contract-generator/constants"
import type { ContractGeneratorState, ContractParty, ContractType, StageItem } from "@/lib/contract-generator/types"
import { contractToPlainText, getContractFileName, getContractTitle, getSummaryRows, buildContractClauses, TOOL_NOTICE } from "@/lib/contract-generator/utils/contractBuilder"
import { validateContractState } from "@/lib/contract-generator/utils/validation"
import { generateContractPdf } from "@/lib/contract-generator/utils/pdf"
import { ToolShell } from "@/components/tool-shell"
import ToolResultGate from "@/components/tool-result-gate"
import AuthGateModal from "@/components/auth-gate-modal"
import { createIdempotencyKey, recordToolUsage } from "@/lib/tool-usage/record-client"

type Screen = "intro" | "steps" | "review"
type Updater = (state: ContractGeneratorState) => ContractGeneratorState

const TOTAL_STEPS = 6

const paymentModes = ["Pagamento único", "Entrada e saldo", "Parcelado", "Mensal", "Por etapa", "Por hora", "Por diária", "Por comissão"]
const lateModes = ["Apenas avisar", "Multa e juros", "Suspender serviço", "Cancelar após atraso"]
const serviceModes = ["Serviço único", "Durante um período", "Mensal ou recorrente", "Dividido em etapas"]
const deliveryConditions = ["No estado em que se encontra", "Revisado ou testado", "Com alguma garantia", "Outra condição"]
const commissionFormats = ["Comissão em porcentagem", "Comissão em valor fixo", "Divisão de receita", "Outro formato"]
const terminationOptions = [
  "Pode encerrar mediante aviso",
  "Deve avisar com antecedência",
  "O que já foi realizado deve ser pago",
  "A entrada não será devolvida após o início",
  "Haverá multa de cancelamento",
  "Poderá haver suspensão por falta de pagamento",
]

function reducer(state: ContractGeneratorState, updater: Updater) {
  return updater(state)
}

function hasDependentAnswers(state: ContractGeneratorState) {
  return Boolean(
    state.details.serviceName ||
      state.details.itemName ||
      state.details.partnershipGoal ||
      state.details.debtOrigin ||
      state.payment.totalAmount ||
      state.parties.some((party) => party.name),
  )
}

function fieldId(key: string) {
  return `contract-${key}`
}

export default function ContractGeneratorClient({
  trackUsage = false,
  isAuthenticated = false,
  embedded = false,
}: {
  trackUsage?: boolean
  isAuthenticated?: boolean
  embedded?: boolean
}) {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, undefined, createInitialContractState)
  const [screen, setScreen] = useState<Screen>(embedded ? "steps" : "intro")
  const [step, setStep] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState("")
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const usageRecordedRef = useRef(false)
  const idempotencyKeyRef = useRef<string | undefined>(undefined)
  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current = createIdempotencyKey()
  }

  useEffect(() => {
    if (!trackUsage || usageRecordedRef.current || screen !== "review") return
    usageRecordedRef.current = true
    recordToolUsage("gerador-contrato", idempotencyKeyRef.current!)
  }, [screen, trackUsage])
  const [draftLoaded, setDraftLoaded] = useState(false)

  const selectedChoice = CONTRACT_CHOICES.find((choice) => choice.id === state.contractType)
  const clauses = useMemo(() => buildContractClauses(state), [state])
  const validation = useMemo(() => validateContractState(state), [state])
  const summaryRows = useMemo(() => getSummaryRows(state), [state])
  const plainText = useMemo(() => contractToPlainText(state, clauses), [state, clauses])

  const update = (updater: Updater) => dispatch(updater)

  useEffect(() => {
    if (embedded) return
    const saved = window.localStorage.getItem(DRAFT_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as ContractGeneratorState
      if (parsed.saveDraftLocally) {
        dispatch(() => parsed)
        setDraftLoaded(true)
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY)
    }
  }, [])

  useEffect(() => {
    if (embedded) return
    if (state.saveDraftLocally) {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state))
    }
  }, [embedded, state])

  function setContractType(contractType: ContractType) {
    if (state.contractType && state.contractType !== contractType && hasDependentAnswers(state)) {
      const confirmed = window.confirm("Alterar o tipo de contrato poderá remover algumas respostas. Deseja continuar?")
      if (!confirmed) return
    }
    const choice = CONTRACT_CHOICES.find((item) => item.id === contractType)
    update((current) => ({
      ...createInitialContractState(),
      contractType,
      parties: current.parties.map((party, index) => ({ ...party, label: choice?.partyLabels[index] || party.label })),
      saveDraftLocally: current.saveDraftLocally,
    }))
  }

  function updateParty(index: number, patch: Partial<ContractParty>) {
    update((current) => ({
      ...current,
      parties: current.parties.map((party, partyIndex) => (partyIndex === index ? { ...party, ...patch } : party)),
    }))
  }

  function updateDetails(patch: Partial<ContractGeneratorState["details"]>) {
    update((current) => ({ ...current, details: { ...current.details, ...patch } }))
  }

  function updatePayment(patch: Partial<ContractGeneratorState["payment"]>) {
    update((current) => ({ ...current, payment: { ...current.payment, ...patch } }))
  }

  function updateDates(patch: Partial<ContractGeneratorState["dates"]>) {
    update((current) => ({ ...current, dates: { ...current.dates, ...patch } }))
  }

  function updateSignature(patch: Partial<ContractGeneratorState["signature"]>) {
    update((current) => ({ ...current, signature: { ...current.signature, ...patch } }))
  }

  function goNext() {
    if (step === 0 && !state.contractType) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    if (step === TOTAL_STEPS - 1) {
      setScreen("review")
      setShowErrors(true)
      return
    }
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1))
  }

  function resetAll() {
    window.localStorage.removeItem(DRAFT_KEY)
    dispatch(() => createInitialContractState())
    setScreen(embedded ? "steps" : "intro")
    setStep(0)
    setShowErrors(false)
    setCopyFeedback("")
  }

  function goBack() {
    if (step === 0) {
      if (!embedded) setScreen("intro")
      return
    }
    setStep((current) => current - 1)
  }

  function deleteDraft() {
    window.localStorage.removeItem(DRAFT_KEY)
    update((current) => ({ ...current, saveDraftLocally: false }))
    setDraftLoaded(false)
  }

  async function copyText() {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
    await navigator.clipboard.writeText(plainText)
    setCopyFeedback("Texto copiado.")
    window.setTimeout(() => setCopyFeedback(""), 1800)
  }

  function printContract() {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
    window.print()
  }

  function downloadPdf() {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
    if (!validation.isValid) {
      setShowErrors(true)
      return
    }
    generateContractPdf(state, clauses, getContractFileName(state))
  }

  function handleAuthenticated() {
    setAuthModalOpen(false)
    router.refresh()
  }

  const error = (key: string) => (showErrors ? validation.errors[key] : "")

  function input(
    key: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    options?: { type?: string; placeholder?: string; multiline?: boolean },
  ) {
    const id = fieldId(key)
    const message = error(key)
    return (
      <label className="contract-tool-field" htmlFor={id}>
        <span>{label}</span>
        {options?.multiline ? (
          <textarea id={id} value={value} placeholder={options.placeholder} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(message)} aria-describedby={message ? `${id}-error` : undefined} />
        ) : (
          <input id={id} type={options?.type || "text"} value={value} placeholder={options?.placeholder} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(message)} aria-describedby={message ? `${id}-error` : undefined} />
        )}
        {message ? (
          <small id={`${id}-error`} role="alert">
            {message}
          </small>
        ) : null}
      </label>
    )
  }

  function optionButton(label: string, selected: boolean, onClick: () => void) {
    return (
      <button key={label} className={selected ? "is-selected" : ""} type="button" onClick={onClick}>
        {label}
      </button>
    )
  }

  function renderIntro() {
    return (
      <section className="contract-tool-section contract-tool-intro" aria-labelledby="contract-tool-title">
        <div className="pricing-tool-head">
          <span>
            <FileSignature size={18} strokeWidth={2.2} aria-hidden="true" />
            Ferramenta gratuita
          </span>
          <h1 id="contract-tool-title">Gerador de contrato</h1>
          <p>Formalize um serviço, uma venda, uma parceria ou um pagamento em poucos passos.</p>
        </div>
        <button className="pricing-tool-next-action contract-tool-start" type="button" onClick={() => setScreen("steps")}>
          Criar contrato
          <ChevronRight size={18} strokeWidth={2.1} aria-hidden="true" />
        </button>
        {draftLoaded ? <p className="contract-tool-draft-note">Encontramos um rascunho salvo somente neste navegador.</p> : null}
      </section>
    )
  }

  function renderChooseType() {
    return (
      <section className="pricing-tool-step">
        <span className="pricing-tool-step-number">Etapa 1</span>
        <h2>O que você quer formalizar?</h2>
        <p>Escolha a situação mais próxima do seu acordo.</p>
        <div className="pricing-tool-option-cards">
          {CONTRACT_CHOICES.map((choice) => (
            <button key={choice.id} className={state.contractType === choice.id ? "is-selected" : ""} type="button" onClick={() => setContractType(choice.id)}>
              <strong>{choice.choiceTitle}</strong>
              <span>{choice.description}</span>
              <em>{choice.examples}</em>
            </button>
          ))}
        </div>
        {error("contractType") ? <p className="contract-tool-error">{error("contractType")}</p> : null}
      </section>
    )
  }

  function renderPartyForm(party: ContractParty, index: number) {
    const label = selectedChoice?.partyLabels[index] || `Participante ${index + 1}`
    const prefix = `party-${index}`
    return (
      <div className="contract-tool-party">
        <div className="contract-tool-party-head">
          <h3>{label}</h3>
          <div className="pricing-tool-options contract-tool-compact-options">
            {optionButton("Pessoa", party.kind === "person", () => updateParty(index, { kind: "person", document: "", representativeDocument: "" }))}
            {optionButton("Empresa", party.kind === "company", () => updateParty(index, { kind: "company", document: "" }))}
          </div>
        </div>
        <div className="pricing-tool-field-grid">
          {input(`${prefix}-name`, party.kind === "company" ? "Razão social" : "Nome completo", party.name, (value) => updateParty(index, { name: value }))}
          {input(`${prefix}-document`, party.kind === "company" ? "CNPJ" : "CPF", party.document, (value) => updateParty(index, { document: value }))}
          {party.kind === "person" ? input(`${prefix}-secondaryDocument`, "RG ou documento, opcional", party.secondaryDocument, (value) => updateParty(index, { secondaryDocument: value })) : input(`${prefix}-tradeName`, "Nome fantasia, opcional", party.tradeName, (value) => updateParty(index, { tradeName: value }))}
          {party.kind === "person" ? input(`${prefix}-civilStatus`, "Estado civil, opcional", party.civilStatus, (value) => updateParty(index, { civilStatus: value })) : input(`${prefix}-representativeName`, "Nome do representante", party.representativeName, (value) => updateParty(index, { representativeName: value }))}
          {party.kind === "person" ? input(`${prefix}-profession`, "Profissão, opcional", party.profession, (value) => updateParty(index, { profession: value })) : input(`${prefix}-representativeDocument`, "CPF do representante", party.representativeDocument, (value) => updateParty(index, { representativeDocument: value }))}
          {party.kind === "company" ? input(`${prefix}-representativeRole`, "Cargo ou função", party.representativeRole, (value) => updateParty(index, { representativeRole: value })) : null}
          {input(`${prefix}-email`, "E-mail, opcional", party.email, (value) => updateParty(index, { email: value }))}
          {input(`${prefix}-phone`, "Telefone, opcional", party.phone, (value) => updateParty(index, { phone: value }))}
        </div>
        {input(`${prefix}-address`, "Endereço completo", party.address, (value) => updateParty(index, { address: value }), { multiline: true })}
      </div>
    )
  }

  function renderParties() {
    return (
      <section className="pricing-tool-step">
        <span className="pricing-tool-step-number">Etapa 2</span>
        <h2>Quem participa deste contrato?</h2>
        <p>Use os dados que aparecerão na identificação do documento.</p>
        {!embedded && (
          <button
            className="contract-tool-text-button"
            type="button"
            onClick={() => {
              const saved = window.localStorage.getItem(DRAFT_KEY)
              if (!saved) return
              const parsed = JSON.parse(saved) as ContractGeneratorState
              updateParty(0, parsed.parties[0])
            }}
          >
            Preencher com meus dados salvos neste dispositivo
          </button>
        )}
        {state.parties.map((party, index) => (
          <div key={index}>{renderPartyForm(party, index)}</div>
        ))}
      </section>
    )
  }

  function renderDetails() {
    const type = state.contractType
    const { details } = state
    return (
      <section className="pricing-tool-step">
        <span className="pricing-tool-step-number">Etapa 3</span>
        <h2>O que foi combinado?</h2>
        <p>Descreva o acordo com palavras simples.</p>
        {type === "service" ? (
          <>
            <div className="pricing-tool-field-grid">
              {input("details-serviceName", "Nome do serviço", details.serviceName, (value) => updateDetails({ serviceName: value }))}
              {input("details-location", "Local de realização, opcional", details.location, (value) => updateDetails({ location: value }))}
            </div>
            {input("details-description", "Descrição do que será feito", details.description, (value) => updateDetails({ description: value }), { multiline: true })}
            {input("details-included", "O que está incluído", details.included, (value) => updateDetails({ included: value }), { multiline: true })}
            {input("details-notIncluded", "O que não está incluído, opcional", details.notIncluded, (value) => updateDetails({ notIncluded: value }), { multiline: true })}
            <div className="pricing-tool-field-grid">
              {input("details-deliveries", "Quantidade de entregas, opcional", details.deliveries, (value) => updateDetails({ deliveries: value }))}
              {input("details-revisions", "Revisões ou alterações, opcional", details.revisions, (value) => updateDetails({ revisions: value }))}
            </div>
            <div className="pricing-tool-options">{serviceModes.map((mode) => optionButton(mode, details.serviceMode === mode, () => updateDetails({ serviceMode: mode })))}</div>
            {details.serviceMode === "Dividido em etapas" ? renderStages() : null}
          </>
        ) : null}
        {type === "goods_sale" ? (
          <>
            <div className="pricing-tool-field-grid">
              {input("details-itemName", "Nome do bem", details.itemName, (value) => updateDetails({ itemName: value }))}
              {input("details-quantity", "Quantidade", details.quantity, (value) => updateDetails({ quantity: value }))}
              {input("details-brand", "Marca, opcional", details.brand, (value) => updateDetails({ brand: value }))}
              {input("details-model", "Modelo, opcional", details.model, (value) => updateDetails({ model: value }))}
              {input("details-serialNumber", "Número de série, opcional", details.serialNumber, (value) => updateDetails({ serialNumber: value }))}
              {input("details-condition", "Estado de conservação", details.condition, (value) => updateDetails({ condition: value }))}
            </div>
            {input("details-itemDescription", "Descrição", details.itemDescription, (value) => updateDetails({ itemDescription: value }), { multiline: true })}
            {input("details-knownIssues", "Defeitos ou observações conhecidas", details.knownIssues, (value) => updateDetails({ knownIssues: value }), { multiline: true })}
            {input("details-deliveryMethod", "Local e forma de entrega", details.deliveryMethod, (value) => updateDetails({ deliveryMethod: value }), { multiline: true })}
            <div className="pricing-tool-options">{deliveryConditions.map((condition) => optionButton(condition, details.deliveryCondition === condition, () => updateDetails({ deliveryCondition: condition })))}</div>
          </>
        ) : null}
        {type === "commercial_partnership" ? (
          <>
            {input("details-partnershipGoal", "Objetivo da parceria", details.partnershipGoal, (value) => updateDetails({ partnershipGoal: value }), { multiline: true })}
            <div className="pricing-tool-field-grid">
              {input("details-partyAActivities", "Atividades do primeiro participante", details.partyAActivities, (value) => updateDetails({ partyAActivities: value }), { multiline: true })}
              {input("details-partyBActivities", "Atividades do segundo participante", details.partyBActivities, (value) => updateDetails({ partyBActivities: value }), { multiline: true })}
            </div>
            {input("details-involvedProduct", "Produto ou serviço envolvido", details.involvedProduct, (value) => updateDetails({ involvedProduct: value }))}
            {input("details-referralRules", "Como os clientes serão indicados", details.referralRules, (value) => updateDetails({ referralRules: value }), { multiline: true })}
            {input("details-commissionDueWhen", "Quando a comissão será devida", details.commissionDueWhen, (value) => updateDetails({ commissionDueWhen: value }))}
            <div className="pricing-tool-options">{commissionFormats.map((format) => optionButton(format, details.commissionFormat === format, () => updateDetails({ commissionFormat: format })))}</div>
            <div className="pricing-tool-field-grid">
              {input("details-exclusivity", "Exclusividade", details.exclusivity, (value) => updateDetails({ exclusivity: value }))}
              {input("details-partnershipTerm", "Prazo da parceria", details.partnershipTerm, (value) => updateDetails({ partnershipTerm: value }))}
            </div>
          </>
        ) : null}
        {type === "debt_acknowledgment" ? (
          <>
            <div className="pricing-tool-field-grid">
              {input("details-debtAmount", "Valor total da dívida", details.debtAmount, (value) => updateDetails({ debtAmount: value }))}
              {input("details-debtDate", "Data em que a dívida surgiu, opcional", details.debtDate, (value) => updateDetails({ debtDate: value }), { type: "date" })}
            </div>
            {input("details-debtOrigin", "Motivo ou origem da dívida", details.debtOrigin, (value) => updateDetails({ debtOrigin: value }), { multiline: true })}
            <div className="pricing-tool-options">
              {optionButton("Não houve pagamento anterior", details.previousPayment !== "yes", () => updateDetails({ previousPayment: "no", paidAmount: "" }))}
              {optionButton("Houve pagamento anterior", details.previousPayment === "yes", () => updateDetails({ previousPayment: "yes" }))}
            </div>
            {details.previousPayment === "yes" ? (
              <div className="pricing-tool-field-grid">
                {input("details-paidAmount", "Valor já pago", details.paidAmount, (value) => updateDetails({ paidAmount: value }))}
                {input("details-remainingBalance", "Saldo restante", details.remainingBalance, (value) => updateDetails({ remainingBalance: value }))}
              </div>
            ) : null}
            <div className="pricing-tool-options">
              {optionButton("Pagamento único", details.debtPaymentMode === "single", () => updateDetails({ debtPaymentMode: "single" }))}
              {optionButton("Parcelado", details.debtPaymentMode === "installments", () => updateDetails({ debtPaymentMode: "installments" }))}
            </div>
            {details.debtPaymentMode === "installments" ? (
              <div className="pricing-tool-field-grid">
                {input("details-debtInstallments", "Número de parcelas", details.debtInstallments, (value) => updateDetails({ debtInstallments: value }), { type: "number" })}
                {input("details-debtInstallmentAmount", "Valor de cada parcela", details.debtInstallmentAmount, (value) => updateDetails({ debtInstallmentAmount: value }))}
                {input("details-debtFirstDueDate", "Data do primeiro vencimento", details.debtFirstDueDate, (value) => updateDetails({ debtFirstDueDate: value }), { type: "date" })}
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    )
  }

  function renderStages() {
    const stages = state.details.stages
    const updateStage = (index: number, patch: Partial<StageItem>) => {
      updateDetails({ stages: stages.map((stage, stageIndex) => (stageIndex === index ? { ...stage, ...patch } : stage)) })
    }
    return (
      <div className="contract-tool-stage-list">
        {stages.map((stage, index) => (
          <div className="contract-tool-stage" key={index}>
            {input(`stage-${index}-title`, "Nome da etapa", stage.title, (value) => updateStage(index, { title: value }))}
            {input(`stage-${index}-description`, "Descrição", stage.description, (value) => updateStage(index, { description: value }))}
            <div className="pricing-tool-field-grid">
              {input(`stage-${index}-due`, "Data ou prazo", stage.due, (value) => updateStage(index, { due: value }))}
              {input(`stage-${index}-amount`, "Valor da etapa, opcional", stage.amount, (value) => updateStage(index, { amount: value }))}
            </div>
            <button className="contract-tool-text-button" type="button" onClick={() => updateDetails({ stages: stages.filter((_, stageIndex) => stageIndex !== index) })}>
              Remover etapa
            </button>
          </div>
        ))}
        <button className="pricing-tool-secondary-action contract-tool-inline-action" type="button" onClick={() => updateDetails({ stages: [...stages, { title: "", description: "", due: "", amount: "" }] })}>
          Adicionar etapa
        </button>
      </div>
    )
  }

  function renderPaymentAndDates() {
    return (
      <section className="pricing-tool-step">
        <span className="pricing-tool-step-number">Etapa 4</span>
        {state.contractType === "debt_acknowledgment" ? (
          <>
            <h2>Como será o pagamento?</h2>
            <p>O pagamento da dívida foi definido na etapa anterior.</p>
            {input("payment-method", "Forma de pagamento", state.payment.method, (value) => updatePayment({ method: value }))}
          </>
        ) : (
          <>
            <h2>Qual será o valor e como será pago?</h2>
            <div className="pricing-tool-options">{paymentModes.map((mode) => optionButton(mode, state.payment.mode === mode, () => updatePayment({ mode })))}</div>
            <div className="pricing-tool-field-grid">
              {input("payment-totalAmount", state.payment.mode === "Por comissão" ? "Base ou valor estimado, opcional" : "Valor total", state.payment.totalAmount, (value) => updatePayment({ totalAmount: value }))}
              {input("payment-method", "Forma de pagamento", state.payment.method, (value) => updatePayment({ method: value }))}
              {state.payment.mode === "Entrada e saldo" ? input("payment-upfrontAmount", "Valor da entrada", state.payment.upfrontAmount, (value) => updatePayment({ upfrontAmount: value })) : null}
              {state.payment.mode === "Entrada e saldo" ? input("payment-upfrontDate", "Data da entrada", state.payment.upfrontDate, (value) => updatePayment({ upfrontDate: value }), { type: "date" }) : null}
              {state.payment.mode === "Parcelado" ? input("payment-installments", "Quantidade de parcelas", state.payment.installments, (value) => updatePayment({ installments: value }), { type: "number" }) : null}
              {state.payment.mode === "Parcelado" ? input("payment-installmentAmount", "Valor das parcelas", state.payment.installmentAmount, (value) => updatePayment({ installmentAmount: value })) : null}
              {state.payment.mode === "Parcelado" ? input("payment-firstDueDate", "Primeiro vencimento", state.payment.firstDueDate, (value) => updatePayment({ firstDueDate: value }), { type: "date" }) : null}
              {state.payment.mode === "Mensal" ? input("payment-monthlyDueDay", "Dia de vencimento mensal", state.payment.monthlyDueDay, (value) => updatePayment({ monthlyDueDay: value }), { type: "number" }) : null}
              {input("payment-pixKey", "Chave Pix, opcional", state.payment.pixKey, (value) => updatePayment({ pixKey: value }))}
            </div>
            {input("payment-bankDetails", "Dados bancários, opcional", state.payment.bankDetails, (value) => updatePayment({ bankDetails: value }), { multiline: true })}
            {input("payment-notes", "Observações sobre pagamento", state.payment.notes, (value) => updatePayment({ notes: value }), { multiline: true })}
            <h3 className="contract-tool-subtitle">Em caso de atraso, o que foi combinado?</h3>
            <div className="pricing-tool-options">{lateModes.map((mode) => optionButton(mode, state.payment.lateMode === mode, () => updatePayment({ lateMode: mode })))}</div>
            {state.payment.lateMode === "Multa e juros" ? (
              <div className="pricing-tool-field-grid">
                {input("payment-lateFine", "Multa por atraso (%)", state.payment.lateFine, (value) => updatePayment({ lateFine: value }), { type: "number" })}
                {input("payment-monthlyInterest", "Juros mensais (%)", state.payment.monthlyInterest, (value) => updatePayment({ monthlyInterest: value }), { type: "number" })}
              </div>
            ) : null}
          </>
        )}

        <h3 className="contract-tool-subtitle">Quando começa e quando termina?</h3>
        <div className="pricing-tool-field-grid">
          {input("dates-startDate", "Data de início", state.dates.startDate, (value) => updateDates({ startDate: value }), { type: "date" })}
          {input("dates-endDate", "Data de término", state.dates.endDate, (value) => updateDates({ endDate: value }), { type: "date" })}
          {input("dates-deliveryDeadline", "Prazo de entrega", state.dates.deliveryDeadline, (value) => updateDates({ deliveryDeadline: value }))}
          {input("dates-priorNoticeDays", "Aviso prévio para não renovar", state.dates.priorNoticeDays, (value) => updateDates({ priorNoticeDays: value }), { type: "number" })}
        </div>
        <label className="hiring-tool-checkbox">
          <input type="checkbox" checked={state.dates.noEndDate} onChange={(event) => updateDates({ noEndDate: event.target.checked })} />
          Sem data final
        </label>
        <div className="pricing-tool-options">
          {optionButton("Sem renovação", state.dates.renewal === "Sem renovação", () => updateDates({ renewal: "Sem renovação" }))}
          {optionButton("Renovação mensal", state.dates.renewal === "Renovação mensal", () => updateDates({ renewal: "Renovação mensal" }))}
          {optionButton("Renovação automática", state.dates.renewal === "Renovação automática", () => updateDates({ renewal: "Renovação automática" }))}
        </div>
        {state.contractType === "service" ? (
          <label className="hiring-tool-checkbox">
            <input type="checkbox" checked={state.dates.dependsOnClient} onChange={(event) => updateDates({ dependsOnClient: event.target.checked })} />
            O prazo depende do cliente enviar informações, materiais ou aprovações
          </label>
        ) : null}
        {state.contractType === "goods_sale" ? (
          <div className="pricing-tool-field-grid">
            {input("dates-deliveryDate", "Data da entrega", state.dates.deliveryDate, (value) => updateDates({ deliveryDate: value }), { type: "date" })}
            {input("dates-deliveryResponsible", "Responsável pela entrega", state.dates.deliveryResponsible, (value) => updateDates({ deliveryResponsible: value }))}
            {input("dates-deliveryLocation", "Local da entrega", state.dates.deliveryLocation, (value) => updateDates({ deliveryLocation: value }))}
            {input("dates-transportCost", "Custo do transporte", state.dates.transportCost, (value) => updateDates({ transportCost: value }))}
            {input("dates-transportPaidBy", "Quem assume o custo", state.dates.transportPaidBy, (value) => updateDates({ transportPaidBy: value }))}
          </div>
        ) : null}
      </section>
    )
  }

  function renderResponsibilities() {
    const options = state.contractType ? RESPONSIBILITY_OPTIONS[state.contractType] : RESPONSIBILITY_OPTIONS.service
    const toggle = (side: "partyA" | "partyB", item: string) => {
      update((current) => {
        const selected = current.responsibilities[side]
        return {
          ...current,
          responsibilities: {
            ...current.responsibilities,
            [side]: selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item],
          },
        }
      })
    }
    const terminationToggle = (item: string) => {
      update((current) => {
        const options = current.termination.options.includes(item)
          ? current.termination.options.filter((value) => value !== item)
          : [...current.termination.options.filter((value) => !(item.includes("multa") && value.includes("sem custo"))), item]
        return { ...current, termination: { ...current.termination, options } }
      })
    }
    return (
      <section className="pricing-tool-step">
        <span className="pricing-tool-step-number">Etapa 5</span>
        <h2>O que cada lado precisa fazer?</h2>
        <div className="contract-tool-check-grid">
          <div>
            <h3>{selectedChoice?.partyLabels[0] || "Primeiro lado"}</h3>
            {options.partyA.map((item) => (
              <label className="hiring-tool-checkbox" key={item}>
                <input type="checkbox" checked={state.responsibilities.partyA.includes(item)} onChange={() => toggle("partyA", item)} />
                {item}
              </label>
            ))}
          </div>
          <div>
            <h3>{selectedChoice?.partyLabels[1] || "Segundo lado"}</h3>
            {options.partyB.map((item) => (
              <label className="hiring-tool-checkbox" key={item}>
                <input type="checkbox" checked={state.responsibilities.partyB.includes(item)} onChange={() => toggle("partyB", item)} />
                {item}
              </label>
            ))}
          </div>
        </div>
        {input("responsibilities-custom", "Responsabilidade personalizada, opcional", state.responsibilities.custom, (value) => update((current) => ({ ...current, responsibilities: { ...current.responsibilities, custom: value } })), { multiline: true })}

        <h3 className="contract-tool-subtitle">{state.contractType === "debt_acknowledgment" ? "O que acontecerá se alguma parcela não for paga?" : "O que acontece se alguém quiser encerrar o contrato?"}</h3>
        <div className="contract-tool-check-grid">
          {terminationOptions.map((item) => (
            <label className="hiring-tool-checkbox" key={item}>
              <input type="checkbox" checked={state.termination.options.includes(item)} onChange={() => terminationToggle(item)} />
              {item}
            </label>
          ))}
        </div>
        <div className="pricing-tool-field-grid">
          {input("termination-priorNoticeDays", "Dias de aviso prévio", state.termination.priorNoticeDays, (value) => update((current) => ({ ...current, termination: { ...current.termination, priorNoticeDays: value } })), { type: "number" })}
          {input("termination-penaltyValue", "Multa, opcional", state.termination.penaltyValue, (value) => update((current) => ({ ...current, termination: { ...current.termination, penaltyValue: value } })))}
        </div>
        <div className="pricing-tool-options">
          {optionButton("Valor fixo", state.termination.penaltyType === "fixed", () => update((current) => ({ ...current, termination: { ...current.termination, penaltyType: "fixed" } })))}
          {optionButton("Percentual", state.termination.penaltyType === "percent", () => update((current) => ({ ...current, termination: { ...current.termination, penaltyType: "percent" } })))}
        </div>
        {input("termination-defaultCondition", "Outra condição, opcional", state.termination.defaultCondition, (value) => update((current) => ({ ...current, termination: { ...current.termination, defaultCondition: value } })), { multiline: true })}
      </section>
    )
  }

  function renderOptional() {
    const toggle = (key: keyof ContractGeneratorState["optionalClauses"], value: boolean | string) => {
      update((current) => ({ ...current, optionalClauses: { ...current.optionalClauses, [key]: value } }))
    }
    const options: Array<[keyof ContractGeneratorState["optionalClauses"], string, string]> = [
      ["confidentiality", "Confidencialidade", "As partes não poderão divulgar informações reservadas."],
      ["materialUse", "Uso do material criado", "Para serviços criativos, digitais e consultivos."],
      ["imageUse", "Uso de imagem", "Autorizações para imagem, voz, marca ou canais."],
      ["revisionLimit", "Limite de revisões", "Defina revisões incluídas e extras."],
      ["warranty", "Garantia", "Prazo e cobertura combinados."],
      ["nonSolicit", "Não contratação direta", "Para parcerias ou equipes terceirizadas."],
      ["exclusivity", "Exclusividade", "Produto, serviço, território ou prazo exclusivo."],
    ]
    const hasAnyOptionalClause = options.some(([key]) => state.optionalClauses[key] === true)

    return (
      <details className="pricing-tool-breakdown contract-tool-optional-clauses">
        <summary>{hasAnyOptionalClause ? "Proteções adicionais selecionadas" : "Incluir alguma proteção adicional? (opcional)"}</summary>
        <div className="pricing-tool-summary">
          <div className="pricing-tool-option-cards pricing-tool-option-cards--compact">
            {options.map(([key, title, description]) => (
              <button key={String(key)} className={state.optionalClauses[key] === true ? "is-selected" : ""} type="button" onClick={() => toggle(key, state.optionalClauses[key] !== true)}>
                <strong>{title}</strong>
                <span>{description}</span>
              </button>
            ))}
          </div>
          {state.optionalClauses.materialUse ? input("optional-materialUseNotes", "Condições de uso do material", state.optionalClauses.materialUseNotes, (value) => toggle("materialUseNotes", value), { multiline: true }) : null}
          {state.optionalClauses.imageUse ? input("optional-imageUseNotes", "Canais, prazo e remuneração do uso de imagem", state.optionalClauses.imageUseNotes, (value) => toggle("imageUseNotes", value), { multiline: true }) : null}
          {state.optionalClauses.revisionLimit ? input("optional-revisionLimitNotes", "Quantidade de revisões e valor de extras", state.optionalClauses.revisionLimitNotes, (value) => toggle("revisionLimitNotes", value), { multiline: true }) : null}
          {state.optionalClauses.warranty ? input("optional-warrantyNotes", "Prazo e cobertura da garantia", state.optionalClauses.warrantyNotes, (value) => toggle("warrantyNotes", value), { multiline: true }) : null}
          {state.optionalClauses.nonSolicit ? input("optional-restrictionTerm", "Prazo da restrição", state.optionalClauses.restrictionTerm, (value) => toggle("restrictionTerm", value)) : null}
          {state.optionalClauses.exclusivity ? input("optional-exclusivityNotes", "Quem fica exclusivo, território e prazo", state.optionalClauses.exclusivityNotes, (value) => toggle("exclusivityNotes", value), { multiline: true }) : null}
        </div>
      </details>
    )
  }

  function renderSignature() {
    const witnessTotal = state.signature.witnessCount === "two" ? 2 : state.signature.witnessCount === "one" ? 1 : 0
    return (
      <section className="pricing-tool-step">
        <span className="pricing-tool-step-number">Etapa 6</span>
        <h2>Onde e quando o contrato será assinado?</h2>
        <div className="pricing-tool-field-grid">
          {input("signature-city", "Cidade", state.signature.city, (value) => updateSignature({ city: value }))}
          {input("signature-state", "Estado", state.signature.state, (value) => updateSignature({ state: value }))}
          {input("signature-date", "Data", state.signature.date, (value) => updateSignature({ date: value }), { type: "date" })}
        </div>
        <h3 className="contract-tool-subtitle">Como o documento será assinado?</h3>
        <div className="pricing-tool-options">
          {optionButton("Impresso e assinado", state.signature.mode === "printed", () => updateSignature({ mode: "printed" }))}
          {optionButton("Assinatura eletrônica", state.signature.mode === "electronic", () => updateSignature({ mode: "electronic" }))}
          {optionButton("Ainda não sei", state.signature.mode === "unknown", () => updateSignature({ mode: "unknown" }))}
        </div>
        <p>O sistema apenas gera o documento. Ele não realiza assinatura eletrônica.</p>
        <h3 className="contract-tool-subtitle">Deseja incluir espaço para testemunhas?</h3>
        <div className="pricing-tool-options">
          {optionButton("Sem testemunhas", state.signature.witnessCount === "none", () => updateSignature({ witnessCount: "none" }))}
          {optionButton("Uma testemunha", state.signature.witnessCount === "one", () => updateSignature({ witnessCount: "one" }))}
          {optionButton("Duas testemunhas", state.signature.witnessCount === "two", () => updateSignature({ witnessCount: "two" }))}
        </div>
        {Array.from({ length: witnessTotal }).map((_, index) => (
          <div className="pricing-tool-field-grid" key={index}>
            {input(`witness-${index}-name`, `Nome da testemunha ${index + 1}`, state.signature.witnesses[index].name, (value) =>
              updateSignature({ witnesses: state.signature.witnesses.map((witness, witnessIndex) => (witnessIndex === index ? { ...witness, name: value } : witness)) }),
            )}
            {input(`witness-${index}-document`, `CPF da testemunha ${index + 1}`, state.signature.witnesses[index].document, (value) =>
              updateSignature({ witnesses: state.signature.witnesses.map((witness, witnessIndex) => (witnessIndex === index ? { ...witness, document: value } : witness)) }),
            )}
          </div>
        ))}
        <p>Você poderá preencher os dados das testemunhas agora ou manualmente depois.</p>

        <h3 className="contract-tool-subtitle">Mais alguma coisa?</h3>
        {renderOptional()}
      </section>
    )
  }

  function renderCurrentStep() {
    if (step === 0) return renderChooseType()
    if (step === 1) return renderParties()
    if (step === 2) return renderDetails()
    if (step === 3) return renderPaymentAndDates()
    if (step === 4) return renderResponsibilities()
    return renderSignature()
  }

  function renderSummary() {
    return (
      <aside className="pricing-tool-result contract-tool-summary" aria-label="Resumo do contrato">
        <span>Resumo do contrato</span>
        {summaryRows.length ? (
          <div className="pricing-tool-summary">
            {summaryRows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p>Suas respostas aparecerão aqui.</p>
        )}
        {!embedded && (
          <>
            <label className="hiring-tool-checkbox">
              <input
                type="checkbox"
                checked={state.saveDraftLocally}
                onChange={(event) => update((current) => ({ ...current, saveDraftLocally: event.target.checked }))}
              />
              Salvar rascunho neste dispositivo
            </label>
            {state.saveDraftLocally ? <p>Este rascunho ficará salvo somente neste navegador.</p> : null}
            <button className="contract-tool-text-button" type="button" onClick={deleteDraft}>
              <Trash2 size={16} aria-hidden="true" />
              Excluir rascunho
            </button>
          </>
        )}
        <button className="contract-tool-text-button" type="button" onClick={resetAll}>
          <RotateCcw size={16} aria-hidden="true" />
          Limpar todos os dados
        </button>
      </aside>
    )
  }

  function renderSteps() {
    return (
      <section className="contract-tool-section" aria-labelledby="contract-flow-title">
        <div className="pricing-tool-head">
          <span>
            <FileSignature size={18} strokeWidth={2.2} aria-hidden="true" />
            Gerador de contrato
          </span>
          <h1 id="contract-flow-title">Responda algumas perguntas e gere um documento pronto para revisar e assinar.</h1>
        </div>
        <div className="pricing-tool-card contract-tool-card">
          <div className="pricing-tool-form">
            <div className="pricing-tool-progress" aria-label={`Etapa ${step + 1} de ${TOTAL_STEPS}`}>
              <span>Etapa {step + 1} de {TOTAL_STEPS}</span>
              <div>
                <i style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
              </div>
            </div>
            {renderCurrentStep()}
            <div className="pricing-tool-actions">
              <button className="pricing-tool-secondary-action" type="button" onClick={goBack} disabled={embedded && step === 0}>
                <ChevronLeft size={18} strokeWidth={2.1} aria-hidden="true" />
                Voltar
              </button>
              <button className="pricing-tool-next-action" type="button" onClick={goNext}>
                {step === TOTAL_STEPS - 1 ? "Revisar contrato" : "Avançar"}
                <ChevronRight size={18} strokeWidth={2.1} aria-hidden="true" />
              </button>
            </div>
          </div>
          {renderSummary()}
        </div>
      </section>
    )
  }

  function renderReview() {
    return (
      <section className="contract-tool-section contract-tool-review-section" aria-labelledby="contract-review-title">
        <div className="pricing-tool-head">
          <span>
            <BadgeCheck size={18} strokeWidth={2.2} aria-hidden="true" />
            Seu contrato está pronto para revisão
          </span>
          <h1 id="contract-review-title">Revise seu contrato</h1>
          <p>Confira as respostas, edite o que precisar e gere o PDF quando estiver tudo certo.</p>
        </div>
        <div className="contract-tool-review-grid">
          <div className="contract-tool-review-cards">
            {["Tipo de contrato", "Participantes", "Objeto", "Pagamento e prazo", "Responsabilidades e cancelamento", "Assinatura e proteções"].map((title, index) => (
              <div className="contract-tool-review-card" key={title}>
                <span>{title}</span>
                <button type="button" onClick={() => {
                  setStep(Math.min(index, TOTAL_STEPS - 1))
                  setScreen("steps")
                }}>
                  Editar
                </button>
              </div>
            ))}
          </div>
          <ToolResultGate
            unlocked={isAuthenticated}
            redirectTo="/ferramentas/gerador-contrato"
            message="Seu contrato já está pronto. Crie uma conta grátis para ver, copiar e baixar o PDF."
          >
            <article className="contract-tool-preview" id="contract-print-area">
              <h2>{getContractTitle(state.contractType)}</h2>
              {clauses.map((item) => (
                <section key={item.id}>
                  <h3>{item.title}</h3>
                  {item.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </section>
              ))}
              <section>
                <h3>Assinaturas</h3>
                {state.parties.map((party, index) => (
                  <div className="contract-tool-sign-line" key={index}>
                    <span />
                    <p>{party.name || `Parte ${index + 1}`}</p>
                  </div>
                ))}
              </section>
              {state.signature.witnessCount !== "none" ? (
                <section>
                  <h3>Testemunhas</h3>
                  {state.signature.witnesses.slice(0, state.signature.witnessCount === "two" ? 2 : 1).map((witness, index) => (
                    <div className="contract-tool-sign-line" key={index}>
                      <span />
                      <p>{index + 1}. {witness.name || "Nome"} - CPF: {witness.document || "________________"}</p>
                    </div>
                  ))}
                </section>
              ) : null}
              <footer>{TOOL_NOTICE}</footer>
            </article>
          </ToolResultGate>
        </div>
        {!validation.isValid && showErrors ? (
          <div className="pricing-tool-inline-note" role="alert">
            <p>Alguns campos obrigatórios ainda precisam ser preenchidos antes de gerar o PDF.</p>
          </div>
        ) : null}
        <div className="contract-tool-review-actions">
          <button className="pricing-tool-secondary-action" type="button" onClick={() => setScreen("steps")}>
            Editar respostas
          </button>
          <button className="pricing-tool-secondary-action" type="button" onClick={copyText}>
            <ClipboardCopy size={18} aria-hidden="true" />
            Copiar texto
          </button>
          <button className="pricing-tool-secondary-action" type="button" onClick={printContract}>
            <Printer size={18} aria-hidden="true" />
            Imprimir
          </button>
          <button className="pricing-tool-next-action" type="button" onClick={downloadPdf} disabled={!validation.isValid}>
            <Save size={18} aria-hidden="true" />
            Gerar PDF
          </button>
          <button className="pricing-tool-secondary-action" type="button" onClick={resetAll}>
            Recomeçar
          </button>
          <a className="pricing-tool-cta contract-tool-specialist" href="https://wa.me/5521979080457" target="_blank" rel="noreferrer">
            <BadgeCheck size={19} strokeWidth={2.2} aria-hidden="true" />
            Falar com especialista
          </a>
        </div>
        {copyFeedback ? <p className="contract-tool-copy-feedback">{copyFeedback}</p> : null}
      </section>
    )
  }

  const content = (
    <>
      {screen === "intro" ? renderIntro() : null}
      {screen === "steps" ? renderSteps() : null}
      {screen === "review" ? renderReview() : null}
      <AuthGateModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
        redirectTo="/ferramentas/gerador-contrato"
      />
    </>
  )

  if (embedded) {
    return content
  }

  return <ToolShell mainClassName="pricing-tool-site contract-tool-site">{content}</ToolShell>
}
