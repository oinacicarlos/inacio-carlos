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

export type OfflineBillingReminderKind = "initial" | "reminder_5d" | "due_date"

const REMINDER_COPY: Record<OfflineBillingReminderKind, {
  eyebrow: string
  subject: (referenceLabel: string) => string
  introHtml: (referenceLabel: string) => string
  introText: (referenceLabel: string) => string
}> = {
  initial: {
    eyebrow: "Boleto disponível",
    subject: referenceLabel => `Boleto de ${referenceLabel} disponível`,
    introHtml: referenceLabel => `O boleto de <strong style="color:#1a1d23;font-weight:600">${referenceLabel}</strong> já está disponível para pagamento.`,
    introText: referenceLabel => `O boleto de ${referenceLabel} já está disponível.`,
  },
  reminder_5d: {
    eyebrow: "Lembrete de vencimento",
    subject: referenceLabel => `Lembrete: boleto de ${referenceLabel} vence em breve`,
    introHtml: referenceLabel => `O boleto de <strong style="color:#1a1d23;font-weight:600">${referenceLabel}</strong> vence em breve. Regularize com antecedência para evitar juros e multa.`,
    introText: referenceLabel => `O boleto de ${referenceLabel} vence em breve. Regularize com antecedência para evitar juros e multa.`,
  },
  due_date: {
    eyebrow: "Vence hoje",
    subject: referenceLabel => `Seu boleto vence hoje - ${referenceLabel}`,
    introHtml: referenceLabel => `O boleto de <strong style="color:#1a1d23;font-weight:600">${referenceLabel}</strong> vence hoje. Regularize o pagamento para evitar juros e multa.`,
    introText: referenceLabel => `O boleto de ${referenceLabel} vence hoje. Regularize o pagamento para evitar juros e multa.`,
  },
}

export function buildOfflineBillingEmail({
  clientName,
  referenceMonth,
  dueDate,
  amount,
  boletoUrl,
  isTest = false,
  originalRecipients = "",
  reminderKind = "initial",
}: {
  clientName: string
  referenceMonth: string
  dueDate: string
  amount: string
  boletoUrl: string
  isTest?: boolean
  originalRecipients?: string
  reminderKind?: OfflineBillingReminderKind
}) {
  const copy = REMINDER_COPY[reminderKind]
  const referenceLabel = formatBillingReference(referenceMonth)
  const dueDateLabel = formatBillingDueDate(dueDate)
  const escapedClientName = escapeEmailHtml(clientName)
  const escapedReferenceLabel = escapeEmailHtml(referenceLabel)
  const escapedDueDateLabel = escapeEmailHtml(dueDateLabel)
  const escapedAmount = escapeEmailHtml(amount)
  const escapedBoletoUrl = escapeEmailHtml(boletoUrl)
  const escapedOriginalRecipients = escapeEmailHtml(originalRecipients)
  const testContextText = isTest && originalRecipients
    ? `\n\nCliente real: ${clientName}\nDestinatário original: ${originalRecipients}`
    : ""
  const testContextHtml = isTest && originalRecipients
    ? `<div style="font:600 12px Arial,sans-serif;color:#92400e;margin-top:8px;text-transform:none;letter-spacing:0">Cliente real: ${escapedClientName}<br>Destinatário original: ${escapedOriginalRecipients}</div>`
    : ""
  const previewNotice = isTest
    ? `<tr>
        <td style="padding:0 0 18px 0">
          <div style="border:1px solid #fde68a;background:#fffbeb;border-radius:10px;padding:12px 14px;color:#92400e;font:700 12px Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase">
            E-mail de teste para conferência interna
            ${testContextHtml}
          </div>
        </td>
      </tr>`
    : ""

  return {
    subject: copy.subject(referenceLabel),
    text: `${isTest ? `E-mail de teste para conferência interna.${testContextText}\n\n` : ""}Olá, ${clientName}.

${copy.introText(referenceLabel)}

Vencimento: ${dueDateLabel}
Valor: ${amount}

Acesse o boleto pelo link abaixo:
${boletoUrl}

Se o pagamento já tiver sido realizado, desconsidere esta mensagem.

Atenciosamente,
Tropa`,
    html: `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Boleto disponível</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1a1d23">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f5f7;padding:40px 14px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px">
            ${previewNotice}
            <tr>
              <td style="padding:0 4px 24px 4px">
                <div style="font-size:19px;line-height:1;font-weight:700;color:#1a1d23;letter-spacing:.01em">Tropa</div>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:1px solid #e6e7eb;border-radius:12px;overflow:hidden">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:36px 36px 20px 36px;background:#ffffff">
                      <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8a8f9a;margin:0 0 14px 0">${copy.eyebrow}</div>
                      <h1 style="font-size:22px;line-height:1.3;color:#1a1d23;margin:0 0 10px 0;font-weight:700">Olá, ${escapedClientName}.</h1>
                      <p style="font-size:15px;line-height:1.6;color:#5b5f6a;margin:0">${copy.introHtml(escapedReferenceLabel)}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:4px 36px 8px 36px">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafb;border:1px solid #ececef;border-radius:10px">
                        <tr>
                          <td style="padding:16px 20px;border-bottom:1px solid #ececef">
                            <div style="font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#8a8f9a;margin-bottom:5px">Competência</div>
                            <div style="font-size:15px;font-weight:600;color:#1a1d23">${escapedReferenceLabel}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px 20px;border-bottom:1px solid #ececef">
                            <div style="font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#8a8f9a;margin-bottom:5px">Vencimento</div>
                            <div style="font-size:15px;font-weight:600;color:#1a1d23">${escapedDueDateLabel}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px 20px">
                            <div style="font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#8a8f9a;margin-bottom:5px">Valor</div>
                            <div style="font-size:19px;font-weight:700;color:#1a1d23">${escapedAmount}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 36px 8px 36px">
                      <a href="${escapedBoletoUrl}" style="display:block;background:#1a1d23;border-radius:8px;color:#ffffff;text-decoration:none;text-align:center;font-size:14px;font-weight:600;padding:13px 18px">Abrir boleto</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 36px 32px 36px">
                      <p style="font-size:12.5px;line-height:1.6;color:#8a8f9a;margin:0">Também anexamos o PDF do boleto neste e-mail. Se o pagamento já tiver sido realizado, desconsidere esta mensagem.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 4px 0 4px">
                <p style="font-size:12px;line-height:1.6;color:#a0a4ad;margin:0">Atenciosamente,<br><strong style="color:#5b5f6a;font-weight:600">Tropa</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  }
}

function escapeEmailHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
