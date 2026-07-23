import { CONTRACT_CHOICES } from "../constants"
import type { ContractClause, ContractGeneratorState, ContractParty, ContractType } from "../types"
import { formatDate, formatMoneyWithWords, joinFilled, parseMoney } from "./formatting"

export function getChoice(type: ContractType | null) {
  return CONTRACT_CHOICES.find((choice) => choice.id === type) ?? CONTRACT_CHOICES[0]
}

export function partyName(party: ContractParty) {
  return party.kind === "company" ? party.name.trim() : party.name.trim()
}

export function describeParty(party: ContractParty, legalLabel: string) {
  if (party.kind === "company") {
    return `${legalLabel}: ${party.name || "________________"}, inscrita no CNPJ nº ${party.document || "________________"}, com sede em ${party.address || "________________"}, neste ato representada por ${party.representativeName || "________________"}, CPF nº ${party.representativeDocument || "________________"}, ${party.representativeRole || "representante"}.`
  }
  return `${legalLabel}: ${party.name || "________________"}, CPF nº ${party.document || "________________"}${party.secondaryDocument ? `, documento de identidade nº ${party.secondaryDocument}` : ""}${party.civilStatus ? `, ${party.civilStatus}` : ""}${party.profession ? `, ${party.profession}` : ""}, residente em ${party.address || "________________"}.`
}

export function clause(id: string, title: string, paragraphs: Array<string | false | null | undefined>, order: number, optional = false): ContractClause {
  return {
    id,
    title,
    paragraphs: paragraphs.filter((paragraph): paragraph is string => typeof paragraph === "string" && Boolean(paragraph.trim())),
    order,
    optional,
  }
}

export function paymentText(state: ContractGeneratorState) {
  const { payment } = state
  const amount = parseMoney(payment.totalAmount)
  const formatted = amount > 0 ? formatMoneyWithWords(amount) : "valor definido pelas partes"
  const method = payment.method ? ` por ${payment.method}` : ""
  const notes = payment.notes ? ` Observações: ${payment.notes}.` : ""

  if (payment.mode === "Entrada e saldo") {
    return `O valor total será de ${formatted}, com entrada de ${formatMoneyWithWords(parseMoney(payment.upfrontAmount))}${payment.upfrontDate ? ` em ${formatDate(payment.upfrontDate)}` : ""}, e saldo nas condições combinadas${method}.${notes}`
  }
  if (payment.mode === "Parcelado") {
    return `O valor total será de ${formatted}, pago em ${payment.installments || "___"} parcelas de ${formatMoneyWithWords(parseMoney(payment.installmentAmount))}, com primeiro vencimento em ${formatDate(payment.firstDueDate) || "data a definir"}${method}.${notes}`
  }
  if (payment.mode === "Mensal") {
    return `O pagamento será mensal, no valor de ${formatted}, com vencimento todo dia ${payment.monthlyDueDay || "__"}${method}.${notes}`
  }
  if (payment.mode === "Por etapa") {
    return `O pagamento será feito por etapa, conforme entregas e valores indicados neste contrato${method}.${notes}`
  }
  if (payment.mode === "Por comissão") {
    return `A remuneração seguirá o formato de comissão informado pelas partes: ${payment.notes || "condições descritas no objeto do contrato"}.`
  }
  if (payment.mode === "Por hora") return `A cobrança será por hora, no valor de ${formatted}${method}.${notes}`
  if (payment.mode === "Por diária") return `A cobrança será por diária, no valor de ${formatted}${method}.${notes}`
  return `O pagamento será único, no valor de ${formatted}${method}.${notes}`
}

export function latePaymentText(state: ContractGeneratorState) {
  const { payment } = state
  if (!payment.lateMode) return ""
  if (payment.lateMode === "Multa e juros") {
    return `Em caso de atraso, poderão ser cobrados multa de ${payment.lateFine || "___"}% e juros de ${payment.monthlyInterest || "___"}% ao mês, além da correção de valores vencidos, quando aplicável.`
  }
  if (payment.lateMode === "Suspender serviço") return "Em caso de atraso, a execução do serviço ou entrega poderá ser suspensa até a regularização do pagamento."
  if (payment.lateMode === "Cancelar após atraso") return "Em caso de atraso persistente, a parte credora poderá encerrar o contrato após comunicação à outra parte."
  return "Em caso de atraso, a parte em atraso deverá ser avisada para regularizar o pagamento."
}

export function dateText(state: ContractGeneratorState) {
  const { dates } = state
  const pieces = [
    dates.startDate ? `início em ${formatDate(dates.startDate)}` : "",
    dates.noEndDate ? "sem data final determinada" : dates.endDate ? `término em ${formatDate(dates.endDate)}` : "",
    dates.deliveryDeadline ? `prazo de entrega: ${dates.deliveryDeadline}` : "",
    dates.renewal ? `renovação: ${dates.renewal}` : "",
  ]
  return joinFilled(pieces, "; ") || "Os prazos serão definidos pelas partes por escrito."
}

export function signatureParagraph(state: ContractGeneratorState) {
  const date = formatDate(state.signature.date) || "____ de ______________ de ______"
  const city = joinFilled([state.signature.city, state.signature.state], " - ") || "________________"
  return `${city}, ${date}.`
}

export function responsibilitiesText(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "As responsabilidades serão as descritas neste contrato e nas comunicações entre as partes."
}

export function optionalClauses(state: ContractGeneratorState, startOrder: number) {
  const { optionalClauses: optional } = state
  const clauses: ContractClause[] = []
  if (optional.confidentiality) {
    clauses.push(
      clause(
        "confidentiality",
        "Confidencialidade",
        ["As partes se comprometem a não divulgar informações reservadas recebidas em razão deste contrato, salvo autorização por escrito ou obrigação legal."],
        startOrder,
        true,
      ),
    )
  }
  if (optional.materialUse) {
    clauses.push(
      clause(
        "material-use",
        "Uso dos materiais criados",
        [
          "Após o pagamento dos valores devidos, o cliente poderá utilizar os materiais entregues conforme a finalidade combinada.",
          optional.materialUseNotes,
        ],
        startOrder + clauses.length,
        true,
      ),
    )
  }
  if (optional.imageUse) {
    clauses.push(clause("image-use", "Uso de imagem", ["O uso de imagem, voz, marca ou conteúdo pessoal dependerá das condições informadas pelas partes.", optional.imageUseNotes], startOrder + clauses.length, true))
  }
  if (optional.revisionLimit) {
    clauses.push(clause("revision-limit", "Limite de revisões", [optional.revisionLimitNotes || "As revisões ficam limitadas ao número informado no escopo. Alterações extras poderão ser cobradas à parte."], startOrder + clauses.length, true))
  }
  if (optional.warranty) {
    clauses.push(clause("warranty", "Garantia", [optional.warrantyNotes || "A garantia cobre apenas falhas diretamente relacionadas ao serviço ou bem descrito, dentro do prazo combinado."], startOrder + clauses.length, true))
  }
  if (optional.nonSolicit) {
    clauses.push(clause("non-solicit", "Não contratação direta", [`As partes não deverão contratar diretamente profissionais ou parceiros apresentados pela outra parte pelo prazo de ${optional.restrictionTerm || "prazo combinado"} sem autorização por escrito.`], startOrder + clauses.length, true))
  }
  if (optional.exclusivity) {
    clauses.push(clause("exclusivity", "Exclusividade", [optional.exclusivityNotes || "A exclusividade observará os limites de produto, serviço, território e prazo informados pelas partes."], startOrder + clauses.length, true))
  }
  return clauses
}
