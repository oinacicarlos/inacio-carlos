import { CONTRACT_TITLES } from "../constants"
import { buildDebtContract } from "../templates/debtContract"
import { buildGoodsSaleContract } from "../templates/goodsSaleContract"
import { buildPartnershipContract } from "../templates/partnershipContract"
import { buildServiceContract } from "../templates/serviceContract"
import type { ContractClause, ContractGeneratorState, ContractType } from "../types"
import { formatDate, joinFilled, parseMoney } from "./formatting"

export const TOOL_NOTICE =
  "Este documento foi gerado com base nas informações fornecidas pelo usuário e serve como modelo geral. Situações específicas, atividades regulamentadas, operações de alto valor ou condições especiais podem exigir análise profissional."

export function getContractTitle(type: ContractType | null) {
  return type ? CONTRACT_TITLES[type] : "Contrato"
}

export function buildContractClauses(state: ContractGeneratorState): ContractClause[] {
  if (state.contractType === "goods_sale") return buildGoodsSaleContract(state)
  if (state.contractType === "commercial_partnership") return buildPartnershipContract(state)
  if (state.contractType === "debt_acknowledgment") return buildDebtContract(state)
  return buildServiceContract(state)
}

export function getContractObject(state: ContractGeneratorState) {
  const { details } = state
  if (state.contractType === "goods_sale") return details.itemName
  if (state.contractType === "commercial_partnership") return details.partnershipGoal
  if (state.contractType === "debt_acknowledgment") return details.debtOrigin || details.debtAmount
  return details.serviceName
}

export function getMainValue(state: ContractGeneratorState) {
  if (state.contractType === "debt_acknowledgment") return parseMoney(state.details.remainingBalance || state.details.debtAmount)
  return parseMoney(state.payment.totalAmount)
}

export function contractToPlainText(state: ContractGeneratorState, clauses: ContractClause[]) {
  const lines = [getContractTitle(state.contractType).toUpperCase(), ""]
  clauses.forEach((clauseItem) => {
    lines.push(clauseItem.title)
    clauseItem.paragraphs.forEach((paragraph) => lines.push(paragraph))
    lines.push("")
  })
  lines.push("Assinaturas")
  state.parties.forEach((party) => {
    lines.push("________________________________________")
    lines.push(party.name || "Parte")
  })
  const witnessTotal = state.signature.witnessCount === "two" ? 2 : state.signature.witnessCount === "one" ? 1 : 0
  if (witnessTotal) {
    lines.push("")
    lines.push("Testemunhas")
    state.signature.witnesses.slice(0, witnessTotal).forEach((witness, index) => {
      lines.push("________________________________________")
      lines.push(`${index + 1}. ${witness.name || "Nome"} - CPF: ${witness.document || "________________"}`)
    })
  }
  lines.push("")
  lines.push(TOOL_NOTICE)
  return lines.join("\n")
}

export function getContractFileName(state: ContractGeneratorState) {
  const type = getContractTitle(state.contractType)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  const party = (state.parties[0]?.name || "cliente")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return `${type}-${party || "cliente"}.pdf`
}

export function getSummaryRows(state: ContractGeneratorState) {
  const rows: Array<{ label: string; value: string }> = []
  if (state.contractType) rows.push({ label: "Tipo", value: getContractTitle(state.contractType) })
  const participants = state.parties.map((party) => party.name).filter(Boolean).join(" e ")
  if (participants) rows.push({ label: "Participantes", value: participants })
  const object = getContractObject(state)
  if (object) rows.push({ label: "Objeto", value: object })
  const value = getMainValue(state)
  if (value > 0) rows.push({ label: "Valor", value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value) })
  const dateText = joinFilled([
    state.dates.startDate ? `Início em ${formatDate(state.dates.startDate)}` : "",
    state.dates.endDate ? `Término em ${formatDate(state.dates.endDate)}` : "",
    state.dates.deliveryDeadline,
  ])
  if (dateText) rows.push({ label: "Prazo", value: dateText })
  return rows
}
