export type TerminationType = "noCause" | "resignation" | "mutual" | "cause"

export type NoticeOption = "indemnified" | "worked" | "mixed" | "notWorked" | "waived" | "none"

export type TerminationInput = {
  salary: number
  additionalAverage: number
  admissionDate: string
  terminationDate: string
  daysWorkedInMonth: number
  expiredVacations: number
  fgtsBalance: number
  otherDiscounts: number
  terminationType: TerminationType
  noticeOption: NoticeOption
  mixedNoticeWorkedDays: number
  mixedNoticeIndemnifiedDays: number
}

export type MoneyLine = {
  label: string
  value: number
  meta?: string
  kind?: "earning" | "discount" | "info"
}

export type TerminationResult = {
  isValid: boolean
  errors: string[]
  remunerationBase: number
  completedYears: number
  noticeDays: number
  indemnifiedNoticeDays: number
  projectedDate: Date | null
  thirteenthMonths: number
  vacationMonths: number
  fgtsPenaltyRate: number
  salaryBalance: number
  indemnifiedNotice: number
  thirteenthProportional: number
  vacationProportionalBase: number
  vacationProportionalThird: number
  expiredVacationBase: number
  expiredVacationThird: number
  fgtsPenalty: number
  noticeDiscount: number
  informedDiscounts: number
  grossSeverance: number
  estimatedAfterDiscounts: number
  estimatedCompanyCost: number
  breakdown: MoneyLine[]
  info: MoneyLine[]
}
