import type { ContractClause, ContractGeneratorState } from "../types"
import { clause, describeParty, optionalClauses, paymentText, signatureParagraph } from "../utils/clauseHelpers"
import { formatDate } from "../utils/formatting"

export function buildGoodsSaleContract(state: ContractGeneratorState): ContractClause[] {
  const [seller, buyer] = state.parties
  const { details, dates, responsibilities, termination } = state
  const clauses: ContractClause[] = [
    clause("parties", "1. Identificação das partes", [describeParty(seller, "VENDEDOR"), describeParty(buyer, "COMPRADOR")], 1),
    clause(
      "object",
      "2. Bem vendido",
      [
        `O vendedor vende ao comprador o bem ${details.itemName || "________________"}.`,
        details.itemDescription ? `Descrição: ${details.itemDescription}.` : "",
        details.quantity ? `Quantidade: ${details.quantity}.` : "",
        details.brand ? `Marca: ${details.brand}.` : "",
        details.model ? `Modelo: ${details.model}.` : "",
        details.serialNumber ? `Número de série: ${details.serialNumber}.` : "",
      ],
      2,
    ),
    clause("condition", "3. Estado de conservação", [`Estado informado: ${details.condition || "________________"}.`, details.knownIssues ? `Defeitos ou observações conhecidas: ${details.knownIssues}.` : "", details.deliveryCondition ? `Condição de entrega: ${details.deliveryCondition}.` : ""], 3),
    clause("payment", "4. Valor e forma de pagamento", [paymentText(state)], 4),
    clause(
      "delivery",
      "5. Entrega do bem",
      [
        details.deliveryMethod ? `Forma de entrega: ${details.deliveryMethod}.` : "",
        dates.deliveryDate ? `Data de entrega: ${formatDate(dates.deliveryDate)}.` : "",
        dates.deliveryResponsible ? `Responsável pela entrega: ${dates.deliveryResponsible}.` : "",
        dates.deliveryLocation ? `Local da entrega: ${dates.deliveryLocation}.` : "",
        dates.transportCost ? `Custo de transporte: ${dates.transportCost}.` : "",
        dates.transportPaidBy ? `Responsável pelo custo: ${dates.transportPaidBy}.` : "",
      ],
      5,
    ),
    clause("seller-responsibilities", "6. Responsabilidades do vendedor", [responsibilities.partyA.join("; ")], 6),
    clause("buyer-responsibilities", "7. Responsabilidades do comprador", [responsibilities.partyB.join("; "), responsibilities.custom], 7),
    clause(
      "termination",
      "8. Cancelamento",
      [
        termination.options.join("; "),
        termination.priorNoticeDays ? `Aviso prévio: ${termination.priorNoticeDays} dias.` : "",
        termination.penaltyValue ? `Multa de cancelamento: ${termination.penaltyValue}${termination.penaltyType === "percent" ? "%" : ""}.` : "",
        termination.defaultCondition,
      ],
      8,
    ),
    ...optionalClauses(state, 9),
    clause("general", "Disposições gerais", ["O comprador declara ter recebido informações sobre o bem e poderá conferi-lo no momento da entrega. Alterações deste acordo deverão ser registradas por escrito."], 20),
    clause("venue", "Local para solução de conflitos", [`As partes elegem o foro da comarca de ${state.signature.city || "________________"} - ${state.signature.state || "__"} para solucionar conflitos deste contrato.`], 21),
    clause("signature", "Cidade e data", [signatureParagraph(state)], 22),
  ]
  return clauses.filter((item) => item.paragraphs.length).sort((a, b) => a.order - b.order)
}
