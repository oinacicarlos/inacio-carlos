import type { ContractClause, ContractGeneratorState } from "../types"
import { clause, describeParty, signatureParagraph } from "../utils/clauseHelpers"
import { formatDate, formatMoneyWithWords, parseMoney } from "../utils/formatting"

export function buildDebtContract(state: ContractGeneratorState): ContractClause[] {
  const [debtor, creditor] = state.parties
  const { details, termination } = state
  const debtAmount = parseMoney(details.debtAmount)
  const paidAmount = parseMoney(details.paidAmount)
  const remaining = parseMoney(details.remainingBalance || details.debtAmount)
  const clauses: ContractClause[] = [
    clause("parties", "1. Identificação das partes", [describeParty(debtor, "DEVEDOR"), describeParty(creditor, "CREDOR")], 1),
    clause(
      "acknowledgment",
      "2. Reconhecimento da dívida",
      [
        `O devedor reconhece dever ao credor o valor de ${formatMoneyWithWords(debtAmount)}.`,
        details.debtOrigin ? `Origem da dívida: ${details.debtOrigin}.` : "",
        details.debtDate ? `Data em que a dívida surgiu: ${formatDate(details.debtDate)}.` : "",
        details.previousPayment === "yes" ? `Pagamento anterior informado: ${formatMoneyWithWords(paidAmount)}. Saldo restante: ${formatMoneyWithWords(remaining)}.` : "",
      ],
      2,
    ),
    clause(
      "payment",
      "3. Forma de pagamento",
      details.debtPaymentMode === "installments"
        ? [
            `O saldo será pago em ${details.debtInstallments || "___"} parcelas mensais de ${formatMoneyWithWords(parseMoney(details.debtInstallmentAmount))}.`,
            details.debtFirstDueDate ? `A primeira parcela vencerá em ${formatDate(details.debtFirstDueDate)}.` : "",
          ]
        : [`O pagamento será feito em parcela única, no valor de ${formatMoneyWithWords(remaining)}.`],
      3,
    ),
    clause("late-payment", "4. Atraso no pagamento", [termination.defaultCondition || "Em caso de atraso, o credor poderá cobrar os valores vencidos e comunicar o devedor para regularização.", termination.penaltyValue ? `Multa ou encargo combinado: ${termination.penaltyValue}${termination.penaltyType === "percent" ? "%" : ""}.` : ""], 4),
    clause("discharge", "5. Quitação", ["A quitação integral ocorrerá somente após o pagamento completo do saldo reconhecido neste instrumento."], 5),
    clause("communication", "6. Comunicação entre as partes", ["As partes deverão informar eventual alteração de contato e guardar comprovantes de pagamento e recebimento."], 6),
    clause("venue", "7. Local para solução de conflitos", [`As partes elegem o foro da comarca de ${state.signature.city || "________________"} - ${state.signature.state || "__"} para solucionar conflitos deste instrumento.`], 7),
    clause("signature", "Cidade e data", [signatureParagraph(state)], 8),
  ]
  return clauses.filter((item) => item.paragraphs.length).sort((a, b) => a.order - b.order)
}
