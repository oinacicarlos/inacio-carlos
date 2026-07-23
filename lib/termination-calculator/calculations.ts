import type { MoneyLine, TerminationInput, TerminationResult } from "./types"
import { formatDate, parseLocalDate } from "./formatters"

const dayMs = 24 * 60 * 60 * 1000

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

function wholeNumber(value: number) {
  return Math.max(0, Math.floor(Number.isFinite(value) ? value : 0))
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}

function dateOnlyTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function inclusiveDays(start: Date, end: Date) {
  return Math.max(0, Math.floor((dateOnlyTime(end) - dateOnlyTime(start)) / dayMs) + 1)
}

function intersectionDays(startA: Date, endA: Date, startB: Date, endB: Date) {
  const start = new Date(Math.max(dateOnlyTime(startA), dateOnlyTime(startB)))
  const end = new Date(Math.min(dateOnlyTime(endA), dateOnlyTime(endB)))
  return inclusiveDays(start, end)
}

export function calculateCompletedYears(admissionDate: Date, terminationDate: Date) {
  let years = terminationDate.getFullYear() - admissionDate.getFullYear()
  const anniversary = new Date(terminationDate.getFullYear(), admissionDate.getMonth(), admissionDate.getDate())

  if (terminationDate < anniversary) {
    years -= 1
  }

  return Math.max(0, years)
}

export function calculateNoticeDays(completedYears: number) {
  return Math.min(90, 30 + 3 * Math.max(0, completedYears))
}

export function calculateProjectedDate(terminationDate: Date, indemnifiedNoticeDays: number) {
  return indemnifiedNoticeDays > 0 ? addDays(terminationDate, indemnifiedNoticeDays) : null
}

export function calculateThirteenthMonths(admissionDate: Date, endDate: Date) {
  const year = endDate.getFullYear()
  let months = 0

  for (let month = 0; month < 12; month += 1) {
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    const effectiveStart = admissionDate > monthStart ? admissionDate : monthStart
    const effectiveEnd = endDate < monthEnd ? endDate : monthEnd

    if (effectiveEnd >= effectiveStart && inclusiveDays(effectiveStart, effectiveEnd) >= 15) {
      months += 1
    }
  }

  return Math.min(12, months)
}

export function calculateVacationMonths(admissionDate: Date, endDate: Date) {
  let acquisitionStart = new Date(endDate.getFullYear(), admissionDate.getMonth(), admissionDate.getDate())

  if (acquisitionStart > endDate) {
    acquisitionStart = new Date(endDate.getFullYear() - 1, admissionDate.getMonth(), admissionDate.getDate())
  }

  let months = 0

  for (let index = 0; index < 12; index += 1) {
    const periodStart = addMonths(acquisitionStart, index)
    const periodEnd = addDays(addMonths(acquisitionStart, index + 1), -1)

    if (intersectionDays(periodStart, periodEnd, admissionDate, endDate) >= 15) {
      months += 1
    }
  }

  return Math.min(12, months)
}

function emptyResult(errors: string[]): TerminationResult {
  return {
    isValid: false,
    errors,
    remunerationBase: 0,
    completedYears: 0,
    noticeDays: 0,
    indemnifiedNoticeDays: 0,
    projectedDate: null,
    thirteenthMonths: 0,
    vacationMonths: 0,
    fgtsPenaltyRate: 0,
    salaryBalance: 0,
    indemnifiedNotice: 0,
    thirteenthProportional: 0,
    vacationProportionalBase: 0,
    vacationProportionalThird: 0,
    expiredVacationBase: 0,
    expiredVacationThird: 0,
    fgtsPenalty: 0,
    noticeDiscount: 0,
    informedDiscounts: 0,
    grossSeverance: 0,
    estimatedAfterDiscounts: 0,
    estimatedCompanyCost: 0,
    breakdown: [],
    info: [],
  }
}

export function calculateTermination(input: TerminationInput): TerminationResult {
  const admissionDate = parseLocalDate(input.admissionDate)
  const terminationDate = parseLocalDate(input.terminationDate)
  const errors: string[] = []

  if (input.salary <= 0) {
    errors.push("Informe um salário bruto mensal maior que zero.")
  }

  if (!admissionDate) {
    errors.push("Informe uma data de admissão válida.")
  }

  if (!terminationDate) {
    errors.push("Informe uma data de desligamento válida.")
  }

  if (admissionDate && terminationDate && terminationDate < admissionDate) {
    errors.push("A data de desligamento não pode ser anterior à admissão.")
  }

  if (input.daysWorkedInMonth < 0 || input.daysWorkedInMonth > 30) {
    errors.push("Os dias trabalhados no mês devem estar entre 0 e 30.")
  }

  if (input.expiredVacations < 0) {
    errors.push("Férias vencidas não podem ser negativas.")
  }

  if (input.fgtsBalance < 0 || input.otherDiscounts < 0 || input.additionalAverage < 0) {
    errors.push("Campos monetários não podem ser negativos.")
  }

  if (!admissionDate || !terminationDate || errors.length > 0) {
    return emptyResult(errors)
  }

  const remunerationBase = input.salary + input.additionalAverage
  const daysWorked = clamp(input.daysWorkedInMonth, 0, 30)
  const completedYears = calculateCompletedYears(admissionDate, terminationDate)
  const noticeDays = input.terminationType === "cause" ? 0 : calculateNoticeDays(completedYears)
  let indemnifiedNoticeDays = 0
  let noticeDiscount = 0

  if (input.terminationType === "noCause") {
    if (input.noticeOption === "indemnified") {
      indemnifiedNoticeDays = noticeDays
    }

    if (input.noticeOption === "mixed") {
      const workedDays = wholeNumber(input.mixedNoticeWorkedDays)
      const indemnifiedDays = wholeNumber(input.mixedNoticeIndemnifiedDays)

      if (workedDays + indemnifiedDays > noticeDays) {
        errors.push("No aviso misto, os dias trabalhados e indenizados não podem ultrapassar o aviso total.")
      }

      indemnifiedNoticeDays = Math.min(indemnifiedDays, noticeDays)
    }
  }

  if (input.terminationType === "mutual" && input.noticeOption === "indemnified") {
    indemnifiedNoticeDays = noticeDays
  }

  if (input.terminationType === "resignation" && input.noticeOption === "notWorked") {
    noticeDiscount = Math.min(remunerationBase, (remunerationBase / 30) * 30)
  }

  if (errors.length > 0) {
    return emptyResult(errors)
  }

  const projectedDate = calculateProjectedDate(terminationDate, indemnifiedNoticeDays)
  const proportionalEndDate = projectedDate ?? terminationDate
  const salaryBalance = (remunerationBase / 30) * daysWorked
  const isCause = input.terminationType === "cause"
  const thirteenthMonths = isCause ? 0 : calculateThirteenthMonths(admissionDate, proportionalEndDate)
  const vacationMonths = isCause ? 0 : calculateVacationMonths(admissionDate, proportionalEndDate)
  const indemnifiedNoticeBase = (remunerationBase / 30) * indemnifiedNoticeDays
  const indemnifiedNotice = input.terminationType === "mutual" ? indemnifiedNoticeBase * 0.5 : indemnifiedNoticeBase
  const thirteenthProportional = isCause ? 0 : (remunerationBase / 12) * thirteenthMonths
  const vacationProportionalBase = isCause ? 0 : (remunerationBase / 12) * vacationMonths
  const vacationProportionalThird = vacationProportionalBase / 3
  const expiredVacationCount = wholeNumber(input.expiredVacations)
  const expiredVacationBase = remunerationBase * expiredVacationCount
  const expiredVacationThird = expiredVacationBase / 3
  const fgtsPenaltyRate = input.terminationType === "noCause" ? 0.4 : input.terminationType === "mutual" ? 0.2 : 0
  const fgtsPenalty = input.fgtsBalance * fgtsPenaltyRate
  const grossSeverance =
    salaryBalance +
    indemnifiedNotice +
    thirteenthProportional +
    vacationProportionalBase +
    vacationProportionalThird +
    expiredVacationBase +
    expiredVacationThird
  const informedDiscounts = noticeDiscount + input.otherDiscounts
  const estimatedAfterDiscounts = Math.max(0, grossSeverance - informedDiscounts)
  const estimatedCompanyCost = estimatedAfterDiscounts + fgtsPenalty
  const breakdownSource: MoneyLine[] = [
    { label: "Saldo de salário", value: salaryBalance, meta: `${daysWorked} dias` },
    { label: "Aviso prévio indenizado", value: indemnifiedNotice, meta: `${indemnifiedNoticeDays} dias` },
    { label: "13º proporcional", value: thirteenthProportional, meta: `${thirteenthMonths}/12` },
    { label: "Férias proporcionais", value: vacationProportionalBase, meta: `${vacationMonths}/12` },
    { label: "1/3 das férias proporcionais", value: vacationProportionalThird },
    { label: "Férias vencidas", value: expiredVacationBase, meta: `${expiredVacationCount} período(s)` },
    { label: "1/3 das férias vencidas", value: expiredVacationThird },
    { label: "Multa do FGTS", value: fgtsPenalty, meta: `${Math.round(fgtsPenaltyRate * 100)}%` },
    { label: "Desconto do aviso não cumprido", value: noticeDiscount, kind: "discount" },
    { label: "Outros descontos", value: input.otherDiscounts, kind: "discount" },
  ]
  const breakdown = breakdownSource.filter(line => line.value > 0)

  const info: MoneyLine[] = [
    { label: "Tempo de empresa", value: completedYears, meta: `${completedYears} ano(s) completo(s)`, kind: "info" },
    { label: "Dias de aviso", value: noticeDays, meta: `${noticeDays} dias`, kind: "info" },
    { label: "Data projetada do aviso", value: 0, meta: projectedDate ? formatDate(projectedDate) : "-", kind: "info" },
    { label: "Avos de 13º", value: thirteenthMonths, meta: `${thirteenthMonths}/12`, kind: "info" },
    { label: "Avos de férias", value: vacationMonths, meta: `${vacationMonths}/12`, kind: "info" },
    { label: "Saldo do FGTS informado", value: input.fgtsBalance, kind: "info" },
    { label: "Percentual da multa", value: fgtsPenaltyRate, meta: `${Math.round(fgtsPenaltyRate * 100)}%`, kind: "info" },
  ]

  return {
    isValid: true,
    errors,
    remunerationBase,
    completedYears,
    noticeDays,
    indemnifiedNoticeDays,
    projectedDate,
    thirteenthMonths,
    vacationMonths,
    fgtsPenaltyRate,
    salaryBalance,
    indemnifiedNotice,
    thirteenthProportional,
    vacationProportionalBase,
    vacationProportionalThird,
    expiredVacationBase,
    expiredVacationThird,
    fgtsPenalty,
    noticeDiscount,
    informedDiscounts,
    grossSeverance,
    estimatedAfterDiscounts,
    estimatedCompanyCost,
    breakdown,
    info,
  }
}
