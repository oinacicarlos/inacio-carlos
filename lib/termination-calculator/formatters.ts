export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0)

export function parseMoneyInput(value: string) {
  const sanitized = value.trim().replace(/\s/g, "").replace(/[^\d,.-]/g, "")

  if (!sanitized) {
    return 0
  }

  const hasThousandsGrouping = (parts: string[]) =>
    parts.length > 1 && parts.slice(1).every(part => part.length === 3)

  const lastComma = sanitized.lastIndexOf(",")
  const lastDot = sanitized.lastIndexOf(".")
  let normalized = sanitized

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : "."
    const thousandsSeparator = decimalSeparator === "," ? "." : ","
    normalized = sanitized
      .replace(new RegExp(`\\${thousandsSeparator}`, "g"), "")
      .replace(decimalSeparator, ".")
  } else if (lastComma >= 0) {
    const parts = sanitized.split(",")
    normalized = hasThousandsGrouping(parts) ? parts.join("") : `${parts.slice(0, -1).join("")}.${parts.at(-1)}`
  } else if (lastDot >= 0) {
    const parts = sanitized.split(".")
    normalized = hasThousandsGrouping(parts) ? parts.join("") : `${parts.slice(0, -1).join("")}.${parts.at(-1)}`
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

export function parseLocalDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

export function formatDate(value: Date | null) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("pt-BR").format(value)
}
