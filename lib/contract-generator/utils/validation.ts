import type { ContractGeneratorState, ContractParty } from "../types"
import { onlyDigits, parseMoney } from "./formatting"

export type ValidationResult = {
  isValid: boolean
  errors: Record<string, string>
}

function allSame(value: string) {
  return /^(\d)\1+$/.test(value)
}

export function isValidCpf(value: string) {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || allSame(cpf)) return false
  const calc = (base: number) => {
    const sum = cpf
      .slice(0, base - 1)
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (base - index), 0)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return calc(10) === Number(cpf[9]) && calc(11) === Number(cpf[10])
}

export function isValidCnpj(value: string) {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14 || allSame(cnpj)) return false
  const calc = (length: 12 | 13) => {
    const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const sum = cnpj
      .slice(0, length)
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * weights[index], 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13])
}

export function isValidEmail(value: string) {
  if (!value.trim()) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function add(errors: Record<string, string>, key: string, message: string) {
  if (!errors[key]) errors[key] = message
}

function validateParty(party: ContractParty, index: number, errors: Record<string, string>) {
  const prefix = `party-${index}`
  if (!party.name.trim()) add(errors, `${prefix}-name`, "Informe o nome.")
  if (!party.document.trim()) add(errors, `${prefix}-document`, party.kind === "company" ? "Informe o CNPJ." : "Informe o CPF.")
  if (party.document.trim()) {
    const valid = party.kind === "company" ? isValidCnpj(party.document) : isValidCpf(party.document)
    if (!valid) add(errors, `${prefix}-document`, party.kind === "company" ? "Digite um CNPJ válido." : "Digite um CPF válido.")
  }
  if (!party.address.trim()) add(errors, `${prefix}-address`, "Informe o endereço completo.")
  if (party.email && !isValidEmail(party.email)) add(errors, `${prefix}-email`, "Digite um e-mail válido.")
  if (party.kind === "company") {
    if (!party.representativeName.trim()) add(errors, `${prefix}-representativeName`, "Informe o representante.")
    if (!party.representativeDocument.trim()) add(errors, `${prefix}-representativeDocument`, "Informe o CPF do representante.")
    if (party.representativeDocument.trim() && !isValidCpf(party.representativeDocument)) {
      add(errors, `${prefix}-representativeDocument`, "Digite um CPF válido.")
    }
    if (!party.representativeRole.trim()) add(errors, `${prefix}-representativeRole`, "Informe o cargo ou função.")
  }
}

function validateDetails(state: ContractGeneratorState, errors: Record<string, string>) {
  const { contractType, details } = state
  if (contractType === "service") {
    if (!details.serviceName.trim()) add(errors, "details-serviceName", "Informe qual serviço será realizado.")
    if (!details.description.trim()) add(errors, "details-description", "Descreva o que será feito.")
    if (!details.included.trim()) add(errors, "details-included", "Informe o que está incluído.")
    if (!details.serviceMode.trim()) add(errors, "details-serviceMode", "Escolha como será o serviço.")
  }
  if (contractType === "goods_sale") {
    if (!details.itemName.trim()) add(errors, "details-itemName", "Informe o bem vendido.")
    if (!details.itemDescription.trim()) add(errors, "details-itemDescription", "Descreva o bem.")
    if (!details.quantity.trim()) add(errors, "details-quantity", "Informe a quantidade.")
    if (!details.condition.trim()) add(errors, "details-condition", "Informe o estado de conservação.")
    if (!details.deliveryMethod.trim()) add(errors, "details-deliveryMethod", "Informe a forma de entrega.")
  }
  if (contractType === "commercial_partnership") {
    if (!details.partnershipGoal.trim()) add(errors, "details-partnershipGoal", "Informe o objetivo da parceria.")
    if (!details.partyAActivities.trim()) add(errors, "details-partyAActivities", "Informe o que o primeiro participante fará.")
    if (!details.partyBActivities.trim()) add(errors, "details-partyBActivities", "Informe o que o segundo participante fará.")
    if (!details.commissionFormat.trim()) add(errors, "details-commissionFormat", "Informe o formato da comissão.")
  }
  if (contractType === "debt_acknowledgment") {
    const debtAmount = parseMoney(details.debtAmount)
    const remaining = parseMoney(details.remainingBalance || details.debtAmount)
    const installmentAmount = parseMoney(details.debtInstallmentAmount)
    const installments = Number(details.debtInstallments)
    if (debtAmount <= 0) add(errors, "details-debtAmount", "Informe o valor da dívida.")
    if (!details.debtOrigin.trim()) add(errors, "details-debtOrigin", "Informe a origem da dívida.")
    if (remaining < 0) add(errors, "details-remainingBalance", "O saldo não pode ser negativo.")
    if (parseMoney(details.paidAmount) < 0) add(errors, "details-paidAmount", "O valor pago não pode ser negativo.")
    if (installmentAmount < 0) add(errors, "details-debtInstallmentAmount", "A parcela não pode ser negativa.")
    if (details.debtPaymentMode === "installments") {
      if (!installments || installments <= 0) add(errors, "details-debtInstallments", "Informe a quantidade de parcelas.")
      if (installmentAmount <= 0) add(errors, "details-debtInstallmentAmount", "Informe o valor de cada parcela.")
      if (!details.debtFirstDueDate) add(errors, "details-debtFirstDueDate", "Informe o primeiro vencimento.")
      if (installments > 0 && installmentAmount > 0 && Math.abs(installments * installmentAmount - remaining) > 0.05) {
        add(errors, "details-debtInstallmentAmount", "A soma das parcelas precisa corresponder ao saldo da dívida.")
      }
    }
  }
}

function validatePayment(state: ContractGeneratorState, errors: Record<string, string>) {
  if (state.contractType === "debt_acknowledgment") return
  const amount = parseMoney(state.payment.totalAmount)
  if (!state.payment.mode.trim()) add(errors, "payment-mode", "Escolha a forma de cobrança.")
  if (amount <= 0 && state.payment.mode !== "Por comissão") add(errors, "payment-totalAmount", "Informe um valor maior que zero.")
  if (state.payment.installments && Number(state.payment.installments) < 0) add(errors, "payment-installments", "As parcelas não podem ser negativas.")
  ;[
    ["payment-totalAmount", state.payment.totalAmount],
    ["payment-upfrontAmount", state.payment.upfrontAmount],
    ["payment-installmentAmount", state.payment.installmentAmount],
    ["payment-lateFine", state.payment.lateFine],
    ["payment-monthlyInterest", state.payment.monthlyInterest],
  ].forEach(([key, value]) => {
    if (String(value).trim() && parseMoney(String(value)) < 0) add(errors, key, "Informe um valor igual ou maior que zero.")
  })
  if (Number(state.payment.lateFine) >= 100) add(errors, "payment-lateFine", "Use um percentual menor que 100%.")
  if (Number(state.payment.monthlyInterest) >= 100) add(errors, "payment-monthlyInterest", "Use um percentual menor que 100%.")
}

function validateDates(state: ContractGeneratorState, errors: Record<string, string>) {
  if (state.dates.startDate && state.dates.endDate && state.dates.endDate < state.dates.startDate) {
    add(errors, "dates-endDate", "A data de término não pode ser anterior à data de início.")
  }
  if (state.contractType === "goods_sale" && !state.dates.deliveryDate) {
    add(errors, "dates-deliveryDate", "Informe a data de entrega.")
  }
}

export function validateContractState(state: ContractGeneratorState): ValidationResult {
  const errors: Record<string, string> = {}

  if (!state.contractType) add(errors, "contractType", "Escolha o que você quer formalizar.")
  state.parties.forEach((party, index) => validateParty(party, index, errors))
  validateDetails(state, errors)
  validatePayment(state, errors)
  validateDates(state, errors)

  if (!state.signature.city.trim()) add(errors, "signature-city", "Informe a cidade.")
  if (!state.signature.state.trim()) add(errors, "signature-state", "Informe o estado.")
  if (!state.signature.date) add(errors, "signature-date", "Informe a data de assinatura.")
  state.signature.witnesses.slice(0, state.signature.witnessCount === "two" ? 2 : state.signature.witnessCount === "one" ? 1 : 0).forEach((witness, index) => {
    if (witness.document.trim() && !isValidCpf(witness.document)) add(errors, `witness-${index}-document`, "Digite um CPF válido.")
  })

  return { isValid: Object.keys(errors).length === 0, errors }
}
