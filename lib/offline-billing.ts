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
  isTest = false,
  originalRecipients = "",
}: {
  clientName: string
  referenceMonth: string
  dueDate: string
  amount: string
  boletoUrl: string
  isTest?: boolean
  originalRecipients?: string
}) {
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
    ? `<div style="font:600 12px Arial,sans-serif;color:#3b4b6b;margin-top:8px;text-transform:none;letter-spacing:0">Cliente real: ${escapedClientName}<br>Destinatário original: ${escapedOriginalRecipients}</div>`
    : ""
  const previewNotice = isTest
    ? `<tr>
        <td style="padding:0 0 18px 0">
          <div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:14px;padding:12px 14px;color:#1e3a8a;font:700 12px Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase">
            E-mail de teste para conferência interna
            ${testContextHtml}
          </div>
        </td>
      </tr>`
    : ""

  return {
    subject: `Boleto de ${referenceLabel} disponível`,
    text: `${isTest ? `E-mail de teste para conferência interna.${testContextText}\n\n` : ""}Olá, ${clientName}.

O boleto de ${referenceLabel} já está disponível.

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
  <body style="margin:0;padding:0;background:#f6f9ff;font-family:Arial,Helvetica,sans-serif;color:#071233">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f6f9ff;padding:28px 14px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px">
            ${previewNotice}
            <tr>
              <td style="padding:0 0 14px 0">
                <div style="font-size:30px;line-height:1;font-weight:800;color:#0b5cff;letter-spacing:-.01em">Tropa</div>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:1px solid #d9e4f5;border-radius:22px;box-shadow:0 18px 45px rgba(15,35,75,.08);overflow:hidden">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:30px 30px 22px 30px;background:#ffffff">
                      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0b5cff;margin:0 0 12px 0">Boleto disponível</div>
                      <h1 style="font-size:28px;line-height:1.12;color:#071233;margin:0 0 12px 0;font-weight:800">Olá, ${escapedClientName}.</h1>
                      <p style="font-size:16px;line-height:1.55;color:#53617d;margin:0">O boleto de <strong style="color:#071233">${escapedReferenceLabel}</strong> já está disponível para pagamento.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 30px 6px 30px">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7faff;border:1px solid #e2eaf8;border-radius:18px">
                        <tr>
                          <td style="padding:18px 18px 16px 18px;border-bottom:1px solid #e2eaf8">
                            <div style="font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#657394;margin-bottom:6px">Competência</div>
                            <div style="font-size:18px;font-weight:800;color:#071233">${escapedReferenceLabel}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px 18px;border-bottom:1px solid #e2eaf8">
                            <div style="font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#657394;margin-bottom:6px">Vencimento</div>
                            <div style="font-size:18px;font-weight:800;color:#071233">${escapedDueDateLabel}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px 18px">
                            <div style="font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#657394;margin-bottom:6px">Valor</div>
                            <div style="font-size:24px;font-weight:800;color:#071233">${escapedAmount}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 30px 4px 30px">
                      <a href="${escapedBoletoUrl}" style="display:block;background:#0b5cff;border-radius:14px;color:#ffffff;text-decoration:none;text-align:center;font-size:15px;font-weight:800;padding:14px 18px">Abrir boleto</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 30px 28px 30px">
                      <p style="font-size:13px;line-height:1.55;color:#657394;margin:0">Também anexamos o PDF do boleto neste e-mail. Se o pagamento já tiver sido realizado, desconsidere esta mensagem.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 4px 0 4px">
                <p style="font-size:12px;line-height:1.5;color:#7b88a4;margin:0">Atenciosamente,<br><strong style="color:#071233">Tropa</strong></p>
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
