const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type EmailContactInput = {
  name: string
  email: string
}

export type ParsedEmailContact = EmailContactInput & {
  normalizedEmail: string
  valid: boolean
  duplicate: boolean
  error: string | null
}

export function normalizeEmail(value: string) {
  const trimmed = value.trim().toLowerCase()
  return EMAIL_PATTERN.test(trimmed) ? trimmed : ''
}

export function maskEmail(value: string | undefined | null) {
  if (!value) return null
  const [user, domain] = value.split('@')
  if (!domain) return value
  const visible = user.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(user.length - 2, 1))}@${domain}`
}

export function parseEmailContactsText(value: string): ParsedEmailContact[] {
  const seen = new Set<string>()

  return value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter((line, index) => {
      if (index !== 0) return true
      return !/^nome\s*[,;]\s*e-?mail$/i.test(line)
    })
    .map(line => {
      const separator = line.includes(';') ? ';' : ','
      const [rawName, ...emailParts] = line.split(separator)
      const name = (rawName ?? '').trim()
      const email = emailParts.join(separator).trim()
      const normalizedEmail = normalizeEmail(email)
      const duplicate = normalizedEmail ? seen.has(normalizedEmail) : false

      if (normalizedEmail) {
        seen.add(normalizedEmail)
      }

      return {
        name,
        email,
        normalizedEmail,
        valid: Boolean(name && normalizedEmail && !duplicate),
        duplicate,
        error: !name ? 'Nome ausente' : !normalizedEmail ? 'E-mail inválido' : duplicate ? 'Duplicado' : null,
      }
    })
}
