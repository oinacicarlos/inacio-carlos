export type ContractType = "service" | "goods_sale" | "commercial_partnership" | "debt_acknowledgment"
export type PartyKind = "person" | "company"
export type SignatureMode = "printed" | "electronic" | "unknown"
export type WitnessCount = "none" | "one" | "two"

export type ContractClause = {
  id: string
  title: string
  paragraphs: string[]
  order: number
  optional?: boolean
}

export type ContractParty = {
  kind: PartyKind
  label: string
  name: string
  document: string
  secondaryDocument: string
  civilStatus: string
  profession: string
  address: string
  email: string
  phone: string
  tradeName: string
  representativeName: string
  representativeDocument: string
  representativeRole: string
}

export type StageItem = {
  title: string
  description: string
  due: string
  amount: string
}

export type ContractDetails = {
  serviceName: string
  description: string
  included: string
  notIncluded: string
  location: string
  deliveries: string
  revisions: string
  serviceMode: string
  stages: StageItem[]
  itemName: string
  itemDescription: string
  quantity: string
  brand: string
  model: string
  serialNumber: string
  condition: string
  knownIssues: string
  deliveryMethod: string
  deliveryCondition: string
  partnershipGoal: string
  partyAActivities: string
  partyBActivities: string
  involvedProduct: string
  referralRules: string
  commissionDueWhen: string
  exclusivity: string
  partnershipTerm: string
  commissionFormat: string
  debtAmount: string
  debtOrigin: string
  debtDate: string
  previousPayment: string
  paidAmount: string
  remainingBalance: string
  debtPaymentMode: string
  debtInstallments: string
  debtInstallmentAmount: string
  debtFirstDueDate: string
}

export type PaymentData = {
  mode: string
  totalAmount: string
  upfrontAmount: string
  upfrontDate: string
  installments: string
  installmentAmount: string
  firstDueDate: string
  monthlyDueDay: string
  method: string
  pixKey: string
  bankDetails: string
  notes: string
  lateMode: string
  lateFine: string
  monthlyInterest: string
}

export type DateData = {
  startDate: string
  endDate: string
  deliveryDeadline: string
  noEndDate: boolean
  renewal: string
  priorNoticeDays: string
  dependsOnClient: boolean
  deliveryDate: string
  deliveryResponsible: string
  deliveryLocation: string
  transportCost: string
  transportPaidBy: string
}

export type ResponsibilityData = {
  partyA: string[]
  partyB: string[]
  custom: string
}

export type TerminationData = {
  options: string[]
  priorNoticeDays: string
  penaltyType: string
  penaltyValue: string
  defaultCondition: string
}

export type OptionalClauseData = {
  confidentiality: boolean
  materialUse: boolean
  imageUse: boolean
  revisionLimit: boolean
  warranty: boolean
  nonSolicit: boolean
  exclusivity: boolean
  materialUseNotes: string
  imageUseNotes: string
  warrantyNotes: string
  revisionLimitNotes: string
  restrictionTerm: string
  exclusivityNotes: string
}

export type SignatureData = {
  city: string
  state: string
  date: string
  mode: SignatureMode
  witnessCount: WitnessCount
  witnesses: Array<{ name: string; document: string }>
}

export type ContractGeneratorState = {
  contractType: ContractType | null
  parties: ContractParty[]
  details: ContractDetails
  payment: PaymentData
  dates: DateData
  responsibilities: ResponsibilityData
  termination: TerminationData
  optionalClauses: OptionalClauseData
  signature: SignatureData
  saveDraftLocally: boolean
}

export type ContractTemplateConfig = {
  id: ContractType
  title: string
  description: string
  choiceTitle: string
  examples: string
  partyLabels: [string, string]
  legalPartyLabels: [string, string]
  buildClauses: (formData: ContractGeneratorState) => ContractClause[]
}
