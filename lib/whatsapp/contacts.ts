export type WhatsAppContactInput = {
  name: string
  phone: string
}

export type ParsedWhatsAppContact = WhatsAppContactInput & {
  normalizedPhone: string
  valid: boolean
  duplicate: boolean
  error: string | null
}

export function onlyWhatsAppDigits(value: string) {
  return value.replace(/\D/g, "")
}

export function normalizeBrazilianWhatsAppPhone(value: unknown) {
  if (typeof value !== "string") return null

  const digits = onlyWhatsAppDigits(value)
  if (!digits) return null

  const withoutInternationalPrefix = digits.startsWith("00") ? digits.slice(2) : digits
  const normalized = withoutInternationalPrefix.startsWith("55")
    ? withoutInternationalPrefix
    : withoutInternationalPrefix.length === 10 || withoutInternationalPrefix.length === 11
      ? `55${withoutInternationalPrefix}`
      : withoutInternationalPrefix

  return normalized.length === 12 || normalized.length === 13 ? normalized : null
}

export function maskWhatsAppPhone(value: string | undefined | null) {
  if (!value) return null

  const digits = onlyWhatsAppDigits(value)
  if (!digits) return null

  return digits.length <= 4 ? "*".repeat(digits.length) : `${"*".repeat(digits.length - 4)}${digits.slice(-4)}`
}

export function parseWhatsAppContactsText(value: string): ParsedWhatsAppContact[] {
  const seen = new Set<string>()

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line, index) => {
      if (index !== 0) return true
      return !/^nome\s*[,;]\s*telefone$/i.test(line)
    })
    .map((line) => {
      const separator = line.includes(";") ? ";" : ","
      const [rawName, ...phoneParts] = line.split(separator)
      const name = (rawName ?? "").trim()
      const phone = phoneParts.join(separator).trim()
      const normalizedPhone = normalizeBrazilianWhatsAppPhone(phone)
      const duplicate = normalizedPhone ? seen.has(normalizedPhone) : false

      if (normalizedPhone) {
        seen.add(normalizedPhone)
      }

      return {
        name,
        phone,
        normalizedPhone: normalizedPhone ?? "",
        valid: Boolean(name && normalizedPhone && !duplicate),
        duplicate,
        error: !name
          ? "Nome ausente"
          : !normalizedPhone
            ? "Telefone inválido"
            : duplicate
              ? "Duplicado"
              : null,
      }
    })
}
