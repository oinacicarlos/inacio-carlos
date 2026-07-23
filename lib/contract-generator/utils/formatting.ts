export function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0)
}

export function parseMoney(value: string) {
  if (!value) return 0
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatDate(value: string) {
  if (!value) return ""
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day))
}

export function joinFilled(parts: Array<string | undefined | null>, separator = ", ") {
  return parts.map((part) => part?.trim()).filter(Boolean).join(separator)
}

const units = ["", "um", "dois", "tres", "quatro", "cinco", "seis", "sete", "oito", "nove"]
const teens = [
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
]
const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
const hundreds = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
]

function belowThousand(value: number): string {
  if (value === 0) return ""
  if (value === 100) return "cem"
  if (value < 10) return units[value]
  if (value < 20) return teens[value - 10]
  if (value < 100) {
    const ten = Math.floor(value / 10)
    const unit = value % 10
    return unit ? `${tens[ten]} e ${units[unit]}` : tens[ten]
  }
  const hundred = Math.floor(value / 100)
  const rest = value % 100
  return rest ? `${hundreds[hundred]} e ${belowThousand(rest)}` : hundreds[hundred]
}

function integerToWords(value: number): string {
  if (value === 0) return "zero"
  const millions = Math.floor(value / 1_000_000)
  const thousands = Math.floor((value % 1_000_000) / 1000)
  const rest = value % 1000
  const pieces: string[] = []

  if (millions) pieces.push(millions === 1 ? "um milhao" : `${integerToWords(millions)} milhoes`)
  if (thousands) pieces.push(thousands === 1 ? "mil" : `${belowThousand(thousands)} mil`)
  if (rest) pieces.push(belowThousand(rest))

  return pieces.join(" e ")
}

export function moneyToWords(value: number) {
  const safeValue = Math.max(0, Math.round((Number.isFinite(value) ? value : 0) * 100))
  const reais = Math.floor(safeValue / 100)
  const centavos = safeValue % 100
  const reaisText = `${integerToWords(reais)} ${reais === 1 ? "real" : "reais"}`
  if (!centavos) return reaisText
  return `${reaisText} e ${integerToWords(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`
}

export function formatMoneyWithWords(value: number) {
  return `${formatMoney(value)} (${moneyToWords(value)})`
}
