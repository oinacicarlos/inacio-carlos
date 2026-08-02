export function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

export function isValidCpf(value: string) {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  const calculateDigit = (base: string, factor: number) => {
    const total = base.split("").reduce((sum, digit) => {
      const result = sum + Number(digit) * factor
      factor -= 1
      return result
    }, 0)
    const rest = (total * 10) % 11
    return rest === 10 ? 0 : rest
  }

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10)
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11)

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10])
}

export function isValidCnpj(value: string) {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false

  const calculateDigit = (base: string, factors: number[]) => {
    const total = base.split("").reduce((sum, digit, index) => sum + Number(digit) * factors[index], 0)
    const rest = total % 11
    return rest < 2 ? 0 : 11 - rest
  }

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13])
}
