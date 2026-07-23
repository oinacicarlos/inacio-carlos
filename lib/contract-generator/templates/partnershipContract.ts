import type { ContractClause, ContractGeneratorState } from "../types"
import {
  clause,
  dateText,
  describeParty,
  optionalClauses,
  paymentText,
  responsibilitiesText,
  signatureParagraph,
} from "../utils/clauseHelpers"

export function buildPartnershipContract(state: ContractGeneratorState): ContractClause[] {
  const [partyA, partyB] = state.parties
  const { details, responsibilities, termination } = state
  const clauses: ContractClause[] = [
    clause("parties", "1. Identificação das partes", [describeParty(partyA, "PARTE A"), describeParty(partyB, "PARTE B")], 1),
    clause(
      "object",
      "2. Objetivo da parceria",
      [
        details.partnershipGoal,
        details.involvedProduct ? `Produto ou serviço envolvido: ${details.involvedProduct}.` : "",
        details.referralRules ? `Regras de indicação: ${details.referralRules}.` : "",
      ],
      2,
    ),
    clause("activities", "3. Atividades de cada participante", [`Parte A: ${details.partyAActivities || "________________"}.`, `Parte B: ${details.partyBActivities || "________________"}.`], 3),
    clause("commission", "4. Comissão ou divisão de receita", [`Formato: ${details.commissionFormat || "________________"}.`, details.commissionDueWhen ? `A comissão será devida quando: ${details.commissionDueWhen}.` : "", paymentText(state)], 4),
    clause("term", "5. Prazo da parceria", [details.partnershipTerm || dateText(state), details.exclusivity ? `Exclusividade: ${details.exclusivity}.` : ""], 5),
    clause("party-a-responsibilities", "6. Responsabilidades da Parte A", [responsibilitiesText(responsibilities.partyA)], 6),
    clause("party-b-responsibilities", "7. Responsabilidades da Parte B", [responsibilitiesText(responsibilities.partyB), responsibilities.custom], 7),
    clause(
      "termination",
      "8. Encerramento",
      [
        termination.options.join("; "),
        termination.priorNoticeDays ? `A parceria poderá ser encerrada mediante aviso com ${termination.priorNoticeDays} dias de antecedência.` : "",
        termination.defaultCondition,
      ],
      8,
    ),
    ...optionalClauses(state, 9),
    clause("communication", "Comunicação e prestação de contas", ["As partes deverão manter registros simples das indicações, vendas, comissões e pagamentos relacionados a esta parceria."], 18),
    clause("venue", "Local para solução de conflitos", [`As partes elegem o foro da comarca de ${state.signature.city || "________________"} - ${state.signature.state || "__"} para solucionar conflitos deste contrato.`], 19),
    clause("signature", "Cidade e data", [signatureParagraph(state)], 20),
  ]
  return clauses.filter((item) => item.paragraphs.length).sort((a, b) => a.order - b.order)
}
