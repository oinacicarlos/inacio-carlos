const MONTH_LABELS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
]

export function getBillingReferenceFromDueDate(dueDate: string) {
  const date = new Date(`${dueDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ""

  date.setMonth(date.getMonth() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`
}

export function getBillingDueDateFromReference(referenceMonth: string, dueDay: number) {
  const reference = new Date(`${referenceMonth}T00:00:00`)
  if (Number.isNaN(reference.getTime())) return ""

  const dueMonth = new Date(reference.getFullYear(), reference.getMonth() + 1, 1)
  const lastDay = new Date(dueMonth.getFullYear(), dueMonth.getMonth() + 1, 0).getDate()
  const safeDay = Math.min(Math.max(1, Math.trunc(dueDay)), lastDay)

  return `${dueMonth.getFullYear()}-${String(dueMonth.getMonth() + 1).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`
}

export function getBillingReferenceFromDueMonth(dueMonth: string) {
  const dueDate = new Date(`${dueMonth}T00:00:00`)
  if (Number.isNaN(dueDate.getTime())) return ""

  dueDate.setMonth(dueDate.getMonth() - 1)
  return `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-01`
}

export function getBillingDueDateFromDueMonth(dueMonth: string, dueDay: number) {
  const dueDate = new Date(`${dueMonth}T00:00:00`)
  if (Number.isNaN(dueDate.getTime())) return ""

  const lastDay = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate()
  const safeDay = Math.min(Math.max(1, Math.trunc(dueDay)), lastDay)

  return `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`
}

export function formatBillingReference(referenceMonth: string) {
  const date = new Date(`${referenceMonth}T00:00:00`)
  if (Number.isNaN(date.getTime())) return "mês informado"

  return `${MONTH_LABELS[date.getMonth()]} de ${date.getFullYear()}`
}

export function formatBillingDueDate(dueDate: string) {
  const date = new Date(`${dueDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dueDate

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function buildOfflineBillingEmail({
  clientName,
  referenceMonth,
  dueDate,
  amount,
  boletoUrl,
}: {
  clientName: string
  referenceMonth: string
  dueDate: string
  amount: string
  boletoUrl: string
}) {
  const referenceLabel = formatBillingReference(referenceMonth)
  const dueDateLabel = formatBillingDueDate(dueDate)

  return {
    subject: `Boleto de ${referenceLabel} disponível`,
    text: `Olá, ${clientName}.

O boleto de ${referenceLabel} já está disponível.

Vencimento: ${dueDateLabel}
Valor: ${amount}

Acesse o boleto pelo link abaixo:
${boletoUrl}

Se o pagamento já tiver sido realizado, desconsidere esta mensagem.

Atenciosamente,
Tropa`,
  }
}
