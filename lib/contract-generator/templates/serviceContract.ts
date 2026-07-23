import type { ContractClause, ContractGeneratorState } from "../types"
import {
  clause,
  dateText,
  describeParty,
  latePaymentText,
  optionalClauses,
  paymentText,
  responsibilitiesText,
  signatureParagraph,
} from "../utils/clauseHelpers"

export function buildServiceContract(state: ContractGeneratorState): ContractClause[] {
  const [client, provider] = state.parties
  const { details, dates, responsibilities, termination } = state
  const clauses: ContractClause[] = [
    clause("parties", "1. Identificação das partes", [describeParty(client, "CONTRATANTE"), describeParty(provider, "CONTRATADO")], 1),
    clause("object", "2. Objeto do contrato", [`O presente contrato tem por objeto a prestação do serviço de ${details.serviceName || "________________"}.`], 2),
    clause(
      "scope",
      "3. Descrição e escopo do serviço",
      [
        details.description,
        details.included ? `Está incluído: ${details.included}.` : "",
        details.location ? `Local de realização: ${details.location}.` : "",
        details.serviceMode ? `Formato do serviço: ${details.serviceMode}.` : "",
      ],
      3,
    ),
    clause("deliveries", "4. Entregas", [details.deliveries ? `Entregas combinadas: ${details.deliveries}.` : "", details.revisions ? `Revisões ou alterações incluídas: ${details.revisions}.` : ""], 4),
    clause("not-included", "5. O que não está incluído", [details.notIncluded], 5, true),
    clause("provider-responsibilities", "6. Responsabilidades do prestador", [responsibilitiesText(responsibilities.partyB)], 6),
    clause("client-responsibilities", "7. Responsabilidades do cliente", [responsibilitiesText(responsibilities.partyA), responsibilities.custom], 7),
    clause("payment", "8. Valor e forma de pagamento", [paymentText(state)], 8),
    clause("late-payment", "9. Atraso de pagamento", [latePaymentText(state)], 9, true),
    clause(
      "deadlines",
      "10. Prazos",
      [
        dateText(state),
        dates.dependsOnClient
          ? "Quando o prazo depender do envio de informações, materiais, acesso ou aprovações pelo contratante, a contagem poderá ficar suspensa até que esses itens sejam fornecidos."
          : "",
      ],
      10,
    ),
    clause("changes", "11. Alterações e serviços adicionais", ["Alterações fora do escopo descrito deverão ser combinadas por escrito e poderão gerar novo prazo ou cobrança adicional."], 11),
    clause(
      "termination",
      "12. Cancelamento e encerramento",
      [
        termination.options.join("; "),
        termination.priorNoticeDays ? `Quando houver aviso prévio, ele deverá ser feito com ${termination.priorNoticeDays} dias de antecedência.` : "",
        termination.penaltyValue ? `Multa de cancelamento: ${termination.penaltyValue}${termination.penaltyType === "percent" ? "%" : ""}.` : "",
        termination.defaultCondition,
      ],
      12,
    ),
    ...optionalClauses(state, 13),
    clause("data", "Tratamento de dados pessoais", ["As partes utilizarão dados pessoais somente para executar este contrato, cumprir obrigações legais e manter registros necessários da relação contratual."], 20),
    clause("communication", "Comunicação entre as partes", ["As comunicações poderão ocorrer pelos contatos informados pelas partes, especialmente e-mail, telefone ou aplicativo de mensagens."], 21),
    clause("general", "Disposições gerais", ["A tolerância de uma parte quanto a eventual descumprimento não significa renúncia de direito. Qualquer alteração relevante deverá ser registrada por escrito."], 22),
    clause("venue", "Local para solução de conflitos", [`As partes elegem o foro da comarca de ${state.signature.city || "________________"} - ${state.signature.state || "__"} para solucionar dúvidas ou conflitos decorrentes deste contrato.`], 23),
    clause("signature", "Cidade e data", [signatureParagraph(state)], 24),
  ]

  if (details.serviceMode === "Dividido em etapas" && details.stages.length) {
    clauses.splice(
      4,
      0,
      clause(
        "stages",
        "5. Etapas do serviço",
        details.stages.map((stage, index) => `${index + 1}. ${stage.title}: ${stage.description}${stage.due ? ` Prazo: ${stage.due}.` : ""}${stage.amount ? ` Valor: ${stage.amount}.` : ""}`),
        5,
      ),
    )
  }

  return clauses.filter((item) => item.paragraphs.length).sort((a, b) => a.order - b.order)
}
