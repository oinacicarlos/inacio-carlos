"use client"

import { useEffect, useMemo, useState } from "react"
import { BadgeCheck, Calculator, ChevronLeft, ChevronRight, Info } from "lucide-react"

type Screen = "steps" | "work-settings" | "result"
type WorkType = "product" | "manual" | "professional" | "creative"
type Difficulty = "standard" | "preparation" | "complex"
type TimeUnit = "hours" | "days"

type UnitOption = {
  id: string
  label: string
  singular: string
  plural: string
  question: string
}

type WorkTypeOption = {
  id: WorkType
  title: string
  description: string
}

type PricingFormData = {
  categoryId: WorkType | null
  unitId: string
  customUnit: string
  quantitySold: number
  productionQuantity: number
  directCosts: number
  workTime: number
  workTimeUnit: TimeUnit
  difficulty: Difficulty | null
}

type WorkProfile = {
  monthlyIncomeGoal: number
  workDaysPerMonth: number
  usableHoursPerDay: number
}

type PricingResult = {
  adjustedWorkValue: number
  allocatedBaseWorkValue: number
  allocatedDirectCosts: number
  complexityAdjustment: number
  errors: string[]
  extraReserve: number
  isProduct: boolean
  isValid: boolean
  maximumRange: number
  minimumRange: number
  productionQuantity: number
  productionRatio: number
  quantitySold: number
  suggestedPrice: number
  unitPrice: number
}

const STORAGE_KEY = "contafacil-pricing-work-settings"
const EXTRA_RESERVE_RATE = 0.15
const HOURS_PER_DAY = 8
const TOTAL_STEPS = 6

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

const workTypeOptions: WorkTypeOption[] = [
  {
    id: "product",
    title: "Produto feito por você",
    description: "Exemplos: bolo, doce, artesanato, roupa, alimento.",
  },
  {
    id: "manual",
    title: "Serviço manual ou técnico",
    description: "Exemplos: pintura, obra, mecânica, instalação, manutenção.",
  },
  {
    id: "professional",
    title: "Atendimento profissional",
    description: "Exemplos: consulta, sessão, aula, assessoria.",
  },
  {
    id: "creative",
    title: "Trabalho criativo ou digital",
    description: "Exemplos: vídeo, design, fotografia, conteúdo, site.",
  },
]

const unitOptionsByType: Record<WorkType, UnitOption[]> = {
  product: [
    { id: "unit", label: "Por unidade", singular: "unidade", plural: "unidades", question: "Quantas unidades serão produzidas?" },
    { id: "kg", label: "Por quilo", singular: "kg", plural: "kg", question: "Quantos quilos serão vendidos?" },
    { id: "liter", label: "Por litro", singular: "litro", plural: "litros", question: "Quantos litros serão vendidos?" },
    { id: "package", label: "Por pacote", singular: "pacote", plural: "pacotes", question: "Quantos pacotes serão vendidos?" },
    { id: "order", label: "Por encomenda", singular: "encomenda", plural: "encomendas", question: "Quantas encomendas serão feitas?" },
  ],
  manual: [
    { id: "square-meter", label: "Por metro quadrado", singular: "m²", plural: "m²", question: "Quantos metros quadrados serão trabalhados?" },
    { id: "meter", label: "Por metro", singular: "metro", plural: "metros", question: "Quantos metros serão trabalhados?" },
    { id: "unit", label: "Por unidade", singular: "unidade", plural: "unidades", question: "Quantas unidades serão feitas?" },
    { id: "hour", label: "Por hora", singular: "hora", plural: "horas", question: "Quantas horas serão cobradas?" },
    { id: "day", label: "Por diária", singular: "diária", plural: "diárias", question: "Quantas diárias serão cobradas?" },
    { id: "whole-service", label: "Pelo serviço inteiro", singular: "serviço", plural: "serviços", question: "Quantos serviços serão feitos?" },
  ],
  professional: [
    { id: "consultation", label: "Por consulta", singular: "consulta", plural: "consultas", question: "Quantas consultas serão realizadas?" },
    { id: "session", label: "Por sessão", singular: "sessão", plural: "sessões", question: "Quantas sessões serão realizadas?" },
    { id: "hour", label: "Por hora", singular: "hora", plural: "horas", question: "Quantas horas serão cobradas?" },
    { id: "appointment", label: "Por atendimento", singular: "atendimento", plural: "atendimentos", question: "Quantos atendimentos serão realizados?" },
    { id: "project", label: "Por projeto", singular: "projeto", plural: "projetos", question: "Quantos projetos serão realizados?" },
    { id: "package", label: "Por pacote", singular: "pacote", plural: "pacotes", question: "Quantos pacotes serão vendidos?" },
  ],
  creative: [
    { id: "video", label: "Por vídeo", singular: "vídeo", plural: "vídeos", question: "Quantos vídeos serão entregues?" },
    { id: "post", label: "Por postagem", singular: "postagem", plural: "postagens", question: "Quantas postagens serão entregues?" },
    { id: "piece", label: "Por peça", singular: "peça", plural: "peças", question: "Quantas peças serão entregues?" },
    { id: "hour", label: "Por hora", singular: "hora", plural: "horas", question: "Quantas horas serão cobradas?" },
    { id: "project", label: "Por projeto", singular: "projeto", plural: "projetos", question: "Quantos projetos serão entregues?" },
    { id: "package", label: "Por pacote", singular: "pacote", plural: "pacotes", question: "Quantos pacotes serão entregues?" },
  ],
}

const difficultyOptions: Array<{ id: Difficulty; title: string; description: string; multiplier: number }> = [
  {
    id: "standard",
    title: "Padrão",
    description: "É um trabalho comum, sem preparação ou exigência diferente.",
    multiplier: 1,
  },
  {
    id: "preparation",
    title: "Exige preparação",
    description: "Será necessário preparar, corrigir, pesquisar, desmontar ou adaptar alguma coisa.",
    multiplier: 1.15,
  },
  {
    id: "complex",
    title: "Personalizado ou complexo",
    description: "Possui muitos detalhes, é diferente do habitual ou exige cuidado especial.",
    multiplier: 1.3,
  },
]

const difficultyExamples: Record<WorkType, Record<Difficulty, string>> = {
  product: {
    standard: "Produto do modelo ou cardápio normal.",
    preparation: "Alteração de tamanho, sabor, formato ou acabamento.",
    complex: "Produto exclusivo, artístico ou feito totalmente sob medida.",
  },
  manual: {
    standard: "Local pronto e serviço de rotina.",
    preparation: "Precisa lixar, desmontar, corrigir ou preparar o local.",
    complex: "Difícil acesso, dano maior ou acabamento especial.",
  },
  professional: {
    standard: "Atendimento ou atividade de rotina.",
    preparation: "Precisa analisar documentos, exames ou informações antes.",
    complex: "Caso fora do padrão, com estudo ou responsabilidade maior.",
  },
  creative: {
    standard: "Entrega simples, seguindo um modelo conhecido.",
    preparation: "Precisa de roteiro, pesquisa, planejamento ou revisões.",
    complex: "Projeto exclusivo, estratégico ou com várias entregas.",
  },
}

const expenseHelpByType: Record<WorkType, string> = {
  product: "Inclua ingredientes, materiais, embalagem, entrega e outros gastos.",
  manual: "Inclua materiais, peças, ferramentas, transporte, ajudante e outros gastos.",
  professional: "Inclua materiais, sala, deslocamento, equipamentos e outros gastos.",
  creative: "Inclua equipe, equipamentos, programas, locação, transporte e outros gastos.",
}

function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

function formatQuantity(value: number) {
  return decimalFormatter.format(Number.isFinite(value) ? value : 0)
}

function toNumber(value: string) {
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
  return Number.isFinite(parsed) ? parsed : 0
}

function toPositiveNumber(value: string) {
  return Math.max(toNumber(value), 0)
}

function getDifficultyMultiplier(level: Difficulty) {
  return difficultyOptions.find(option => option.id === level)?.multiplier ?? 1
}

function getStepQuestion(type: WorkType | null, unit: UnitOption | null) {
  if (!type) {
    return "Como é vendido?"
  }

  if (unit) {
    return unit.question
  }

  if (type === "product") {
    return "Como você vende esse produto?"
  }

  return "Como você cobra esse serviço?"
}

function getUnitLabel(quantity: number, unit: UnitOption | null, customUnit: string) {
  const normalizedCustom = customUnit.trim()

  if (!unit) {
    return normalizedCustom || "unidade"
  }

  if (unit.id === "other") {
    return normalizedCustom || "unidade"
  }

  return quantity === 1 ? unit.singular : unit.plural
}

function createOtherUnit(customUnit: string): UnitOption {
  const fallback = customUnit.trim() || "unidade"

  return {
    id: "other",
    label: "Outra forma",
    singular: fallback,
    plural: fallback,
    question: `Qual quantidade em ${fallback} será vendida?`,
  }
}

function createBasePricingResult(values: Partial<PricingResult> = {}): PricingResult {
  const suggestedPrice = values.suggestedPrice ?? 0

  return {
    adjustedWorkValue: values.adjustedWorkValue ?? 0,
    allocatedBaseWorkValue: values.allocatedBaseWorkValue ?? 0,
    allocatedDirectCosts: values.allocatedDirectCosts ?? 0,
    complexityAdjustment: values.complexityAdjustment ?? 0,
    errors: values.errors ?? [],
    extraReserve: values.extraReserve ?? 0,
    isProduct: values.isProduct ?? false,
    isValid: values.isValid ?? false,
    maximumRange: values.maximumRange ?? suggestedPrice * 1.1,
    minimumRange: values.minimumRange ?? suggestedPrice * 0.9,
    productionQuantity: values.productionQuantity ?? 0,
    productionRatio: values.productionRatio ?? 1,
    quantitySold: values.quantitySold ?? 0,
    suggestedPrice,
    unitPrice: values.unitPrice ?? 0,
  }
}

function calculateCommonInputs(formData: PricingFormData, workProfile: WorkProfile) {
  const availableHoursPerMonth = workProfile.workDaysPerMonth * workProfile.usableHoursPerDay
  const baseHourlyValue = availableHoursPerMonth > 0 ? workProfile.monthlyIncomeGoal / availableHoursPerMonth : 0
  const totalWorkHours = formData.workTimeUnit === "days" ? formData.workTime * HOURS_PER_DAY : formData.workTime
  const baseWorkValue = totalWorkHours * baseHourlyValue
  const complexityMultiplier = getDifficultyMultiplier(formData.difficulty ?? "standard")
  const adjustedWorkValue = baseWorkValue * complexityMultiplier
  const complexityAdjustment = adjustedWorkValue - baseWorkValue

  return {
    adjustedWorkValue,
    baseWorkValue,
    complexityAdjustment,
  }
}

function withRanges(result: PricingResult) {
  return {
    ...result,
    maximumRange: result.suggestedPrice * 1.1,
    minimumRange: result.suggestedPrice * 0.9,
    unitPrice: result.quantitySold > 0 ? result.suggestedPrice / result.quantitySold : 0,
  }
}

function calculateProductPrice(formData: PricingFormData, workProfile: WorkProfile, errors: string[]) {
  const { adjustedWorkValue, baseWorkValue, complexityAdjustment } = calculateCommonInputs(formData, workProfile)
  const productionRatio =
    formData.productionQuantity > 0 && formData.quantitySold > 0
      ? formData.quantitySold / formData.productionQuantity
      : 0
  const batchSubtotal = formData.directCosts + adjustedWorkValue
  const batchExtraReserve = batchSubtotal * EXTRA_RESERVE_RATE
  const batchSuggestedPrice = batchSubtotal + batchExtraReserve
  const suggestedPrice = batchSuggestedPrice * productionRatio

  return withRanges(
    createBasePricingResult({
      adjustedWorkValue: adjustedWorkValue * productionRatio,
      allocatedBaseWorkValue: baseWorkValue * productionRatio,
      allocatedDirectCosts: formData.directCosts * productionRatio,
      complexityAdjustment: complexityAdjustment * productionRatio,
      errors,
      extraReserve: batchExtraReserve * productionRatio,
      isProduct: true,
      isValid: errors.length === 0,
      productionQuantity: formData.productionQuantity,
      productionRatio,
      quantitySold: formData.quantitySold,
      suggestedPrice,
    }),
  )
}

function calculateServicePrice(formData: PricingFormData, workProfile: WorkProfile, errors: string[]) {
  const { adjustedWorkValue, baseWorkValue, complexityAdjustment } = calculateCommonInputs(formData, workProfile)
  const subtotal = formData.directCosts + adjustedWorkValue
  const extraReserve = subtotal * EXTRA_RESERVE_RATE
  const suggestedPrice = subtotal + extraReserve

  return withRanges(
    createBasePricingResult({
      adjustedWorkValue,
      allocatedBaseWorkValue: baseWorkValue,
      allocatedDirectCosts: formData.directCosts,
      complexityAdjustment,
      errors,
      extraReserve,
      isProduct: false,
      isValid: errors.length === 0,
      productionQuantity: formData.quantitySold,
      productionRatio: 1,
      quantitySold: formData.quantitySold,
      suggestedPrice,
    }),
  )
}

function calculatePricing(formData: PricingFormData, workProfile: WorkProfile, selectedUnit: UnitOption | null) {
  const errors: string[] = []
  const isProduct = formData.categoryId === "product"

  if (!formData.categoryId) {
    errors.push("Escolha o que está sendo vendido.")
  }

  if (!selectedUnit || (formData.unitId === "other" && !formData.customUnit.trim())) {
    errors.push("Escolha como você vende ou cobra.")
  }

  if (formData.quantitySold <= 0) {
    errors.push("Informe uma quantidade maior que zero.")
  }

  if (isProduct && formData.productionQuantity <= 0) {
    errors.push("Informe quanto você consegue produzir nesse mesmo tempo.")
  }

  if (isProduct && formData.productionQuantity > 0 && formData.productionQuantity < formData.quantitySold) {
    errors.push("A quantidade vendida não pode ser maior que a quantidade produzida nesse tempo.")
  }

  if (formData.directCosts < 0) {
    errors.push("Os gastos não podem ser negativos.")
  }

  if (formData.workTime <= 0) {
    errors.push("Informe um tempo maior que zero.")
  }

  if (workProfile.monthlyIncomeGoal <= 0) {
    errors.push("Informe quanto gostaria que seu trabalho rendesse por mês.")
  }

  if (workProfile.workDaysPerMonth <= 0) {
    errors.push("Informe uma quantidade de dias maior que zero.")
  }

  if (workProfile.usableHoursPerDay <= 0) {
    errors.push("Informe uma quantidade de horas por dia maior que zero.")
  }

  if (!formData.difficulty) {
    errors.push("Escolha como será esse trabalho.")
  }

  const safeFormData = {
    ...formData,
    directCosts: Math.max(formData.directCosts, 0),
    productionQuantity: formData.productionQuantity > 0 ? formData.productionQuantity : formData.quantitySold,
    quantitySold: formData.quantitySold > 0 ? formData.quantitySold : 1,
    workTime: formData.workTime > 0 ? formData.workTime : 0,
  }
  const safeProfile = {
    monthlyIncomeGoal: workProfile.monthlyIncomeGoal > 0 ? workProfile.monthlyIncomeGoal : 0,
    usableHoursPerDay: workProfile.usableHoursPerDay > 0 ? workProfile.usableHoursPerDay : 1,
    workDaysPerMonth: workProfile.workDaysPerMonth > 0 ? workProfile.workDaysPerMonth : 1,
  }

  return isProduct
    ? calculateProductPrice(safeFormData, safeProfile, errors)
    : calculateServicePrice(safeFormData, safeProfile, errors)
}

export default function PricingCalculatorClient() {
  const [screen, setScreen] = useState<Screen>("steps")
  const [currentStep, setCurrentStep] = useState(0)
  const [workType, setWorkType] = useState<WorkType | null>(null)
  const [workName, setWorkName] = useState("")
  const [unitId, setUnitId] = useState("")
  const [customUnit, setCustomUnit] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [productionQuantity, setProductionQuantity] = useState("1")
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [directExpenses, setDirectExpenses] = useState("400")
  const [timeAmount, setTimeAmount] = useState("16")
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("hours")
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState("4000")
  const [workDaysMonth, setWorkDaysMonth] = useState("20")
  const [workHoursDay, setWorkHoursDay] = useState("6")
  const [hasSavedWorkSettings, setHasSavedWorkSettings] = useState(false)

  const availableUnits = workType ? unitOptionsByType[workType] : []
  const selectedUnit =
    unitId === "other"
      ? createOtherUnit(customUnit)
      : availableUnits.find(option => option.id === unitId) ?? null
  const quantityValue = toNumber(quantity)
  const productionQuantityValue = toNumber(productionQuantity)
  const unitLabel = getUnitLabel(quantityValue, selectedUnit, customUnit)
  const productionUnitLabel = getUnitLabel(productionQuantityValue, selectedUnit, customUnit)
  const isProduct = workType === "product"

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)

      if (!saved) {
        return
      }

      const parsed = JSON.parse(saved) as {
        desiredMonthlyIncome?: string
        workDaysMonth?: string
        workHoursDay?: string
      }

      if (parsed.desiredMonthlyIncome) {
        setDesiredMonthlyIncome(parsed.desiredMonthlyIncome)
      }

      if (parsed.workDaysMonth) {
        setWorkDaysMonth(parsed.workDaysMonth)
      }

      if (parsed.workHoursDay) {
        setWorkHoursDay(parsed.workHoursDay)
      }

      setHasSavedWorkSettings(true)
    } catch {
      setHasSavedWorkSettings(false)
    }
  }, [])

  useEffect(() => {
    if (!hasSavedWorkSettings) {
      return
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        desiredMonthlyIncome,
        workDaysMonth,
        workHoursDay,
      }),
    )
  }, [desiredMonthlyIncome, hasSavedWorkSettings, workDaysMonth, workHoursDay])

  const result = useMemo(
    () =>
      calculatePricing(
        {
          categoryId: workType,
          customUnit,
          difficulty,
          directCosts: toNumber(directExpenses),
          productionQuantity: toNumber(productionQuantity),
          quantitySold: toNumber(quantity),
          unitId,
          workTime: toNumber(timeAmount),
          workTimeUnit: timeUnit,
        },
        {
          monthlyIncomeGoal: toNumber(desiredMonthlyIncome),
          usableHoursPerDay: toNumber(workHoursDay),
          workDaysPerMonth: toNumber(workDaysMonth),
        },
        selectedUnit,
      ),
    [
      customUnit,
      desiredMonthlyIncome,
      difficulty,
      directExpenses,
      productionQuantity,
      quantity,
      selectedUnit,
      timeAmount,
      timeUnit,
      unitId,
      workDaysMonth,
      workHoursDay,
      workType,
    ],
  )

  const currentStepError = useMemo(() => {
    if (screen !== "steps") {
      return ""
    }

    if (currentStep === 0 && !workType) {
      return "Escolha uma opção para avançar."
    }

    if (currentStep === 1 && (!selectedUnit || (unitId === "other" && !customUnit.trim()))) {
      return "Escolha ou escreva a forma de venda."
    }

    if (currentStep === 2 && quantityValue <= 0) {
      return "Informe uma quantidade maior que zero."
    }

    if (currentStep === 2 && isProduct && productionQuantityValue <= 0) {
      return "Informe quanto você consegue produzir nesse mesmo tempo."
    }

    if (currentStep === 2 && isProduct && productionQuantityValue > 0 && productionQuantityValue < quantityValue) {
      return "A quantidade vendida não pode ser maior que a quantidade produzida nesse tempo."
    }

    if (currentStep === 3 && !difficulty) {
      return "Escolha uma opção para avançar."
    }

    if (currentStep === 4 && toNumber(directExpenses) < 0) {
      return "Os gastos não podem ser negativos."
    }

    if (currentStep === 5 && toNumber(timeAmount) <= 0) {
      return "Informe um tempo maior que zero."
    }

    return ""
  }, [
    currentStep,
    customUnit,
    difficulty,
    directExpenses,
    isProduct,
    productionQuantityValue,
    quantityValue,
    screen,
    selectedUnit,
    timeAmount,
    unitId,
    workType,
  ])

  const workSettingsError = useMemo(() => {
    if (toNumber(desiredMonthlyIncome) <= 0) {
      return "Informe quanto gostaria que seu trabalho rendesse por mês."
    }

    if (toNumber(workDaysMonth) <= 0) {
      return "Informe uma quantidade de dias maior que zero."
    }

    if (toNumber(workHoursDay) <= 0) {
      return "Informe uma quantidade de horas por dia maior que zero."
    }

    return ""
  }, [desiredMonthlyIncome, workDaysMonth, workHoursDay])

  const canContinue = screen === "steps" ? !currentStepError : !workSettingsError

  const handleWorkTypeSelect = (type: WorkType) => {
    setWorkType(type)
    setUnitId("")
    setCustomUnit("")
    setQuantity("1")
    setProductionQuantity("1")
  }

  const handleUnitSelect = (id: string) => {
    setUnitId(id)

    if (id === "whole-service" || id === "project") {
      setQuantity("1")
    }
  }

  const goBack = () => {
    if (screen === "result") {
      setScreen("steps")
      setCurrentStep(TOTAL_STEPS - 1)
      return
    }

    if (screen === "work-settings") {
      setScreen("steps")
      setCurrentStep(TOTAL_STEPS - 1)
      return
    }

    setCurrentStep(step => Math.max(0, step - 1))
  }

  const goNext = () => {
    if (!canContinue) {
      return
    }

    if (screen === "work-settings") {
      setHasSavedWorkSettings(true)
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          desiredMonthlyIncome,
          workDaysMonth,
          workHoursDay,
        }),
      )
      setScreen("result")
      return
    }

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(step => step + 1)
      return
    }

    setScreen(hasSavedWorkSettings ? "result" : "work-settings")
  }

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <section className="pricing-tool-step" aria-labelledby="pricing-step-1">
          <span className="pricing-tool-step-number">Etapa 1 de 6</span>
          <h2 id="pricing-step-1">O que você está vendendo?</h2>

          <div className="pricing-tool-option-cards">
            {workTypeOptions.map(option => (
              <button
                className={workType === option.id ? "is-selected" : ""}
                key={option.id}
                type="button"
                onClick={() => handleWorkTypeSelect(option.id)}
              >
                <strong>{option.title}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>

          <label className="pricing-tool-field">
            <span>Qual produto ou serviço?</span>
            <input
              aria-label="Qual produto ou serviço?"
              data-testid="pricing-work-name"
              placeholder="Ex.: bolo decorado, pintura de apartamento, criação de vídeo"
              value={workName}
              onChange={event => setWorkName(event.target.value)}
            />
          </label>
        </section>
      )
    }

    if (currentStep === 1) {
      return (
        <section className="pricing-tool-step" aria-labelledby="pricing-step-2">
          <span className="pricing-tool-step-number">Etapa 2 de 6</span>
          <h2 id="pricing-step-2">{getStepQuestion(workType, null)}</h2>

          <div className="pricing-tool-option-cards pricing-tool-option-cards--compact">
            {[...availableUnits, createOtherUnit(customUnit)].map(option => (
              <button
                className={unitId === option.id ? "is-selected" : ""}
                key={option.id}
                type="button"
                onClick={() => handleUnitSelect(option.id)}
              >
                <strong>{option.label}</strong>
              </button>
            ))}
          </div>

          {unitId === "other" ? (
            <label className="pricing-tool-field">
              <span>Escreva a forma de venda</span>
              <input
                aria-label="Outra forma de venda"
                data-testid="pricing-custom-unit"
                placeholder="Ex.: diária, peça, visita, lote"
                value={customUnit}
                onChange={event => setCustomUnit(event.target.value)}
              />
            </label>
          ) : null}
        </section>
      )
    }

    if (currentStep === 2) {
      return (
        <section className="pricing-tool-step" aria-labelledby="pricing-step-3">
          <span className="pricing-tool-step-number">Etapa 3 de 6</span>
          <h2 id="pricing-step-3">{getStepQuestion(workType, selectedUnit)}</h2>

          <div className={isProduct ? "pricing-tool-field-grid" : ""}>
            <label className="pricing-tool-field">
              <span>{isProduct ? `Quanto o cliente está comprando? (${unitLabel})` : "Quantidade"}</span>
              <input
                aria-label={isProduct ? "Quanto o cliente está comprando?" : "Quantidade"}
                data-testid="pricing-quantity"
                inputMode="decimal"
                value={quantity}
                onChange={event => setQuantity(event.target.value)}
              />
            </label>

            {isProduct ? (
              <label className="pricing-tool-field">
                <span>Quanto você consegue produzir nesse mesmo tempo? ({productionUnitLabel})</span>
                <input
                  aria-label="Quanto você consegue produzir nesse mesmo tempo?"
                  data-testid="pricing-production-quantity"
                  inputMode="decimal"
                  value={productionQuantity}
                  onChange={event => setProductionQuantity(event.target.value)}
                />
              </label>
            ) : null}
          </div>

          {selectedUnit ? (
            <div className="pricing-tool-inline-note">
              <Info size={16} strokeWidth={2.1} aria-hidden="true" />
              {isProduct ? (
                <p>
                  Isso ajuda a dividir corretamente seus gastos e seu tempo entre os produtos produzidos. Exemplo: venda
                  de {formatQuantity(quantityValue > 0 ? quantityValue : 1)} {unitLabel} dentro de um lote de{" "}
                  {formatQuantity(productionQuantityValue > 0 ? productionQuantityValue : 1)} {unitLabel}.
                </p>
              ) : (
                <p>
                  Exemplo: {formatQuantity(quantityValue > 0 ? quantityValue : 1)} {unitLabel}.
                </p>
              )}
            </div>
          ) : null}
        </section>
      )
    }

    if (currentStep === 3) {
      return (
        <section className="pricing-tool-step" aria-labelledby="pricing-step-4">
          <span className="pricing-tool-step-number">Etapa 4 de 6</span>
          <h2 id="pricing-step-4">Como será esse trabalho?</h2>

          <div className="pricing-tool-option-cards">
            {difficultyOptions.map(option => (
              <button
                className={difficulty === option.id ? "is-selected" : ""}
                key={option.id}
                type="button"
                onClick={() => setDifficulty(option.id)}
              >
                <strong>{option.title}</strong>
                <span>{option.description}</span>
                {workType ? <em>{difficultyExamples[workType][option.id]}</em> : null}
              </button>
            ))}
          </div>
        </section>
      )
    }

    if (currentStep === 4) {
      return (
        <section className="pricing-tool-step" aria-labelledby="pricing-step-5">
          <span className="pricing-tool-step-number">Etapa 5 de 6</span>
          <h2 id="pricing-step-5">Quanto você vai gastar para entregar?</h2>
          <p>{workType ? expenseHelpByType[workType] : "Inclua materiais, deslocamento, ferramentas e outros gastos."}</p>

          <label className="pricing-tool-field">
            <span>Gastos para entregar</span>
            <input
              aria-label="Gastos para entregar"
              data-testid="pricing-direct-expenses"
              inputMode="decimal"
              value={directExpenses}
              onChange={event => setDirectExpenses(event.target.value)}
            />
          </label>
        </section>
      )
    }

    return (
      <section className="pricing-tool-step" aria-labelledby="pricing-step-6">
        <span className="pricing-tool-step-number">Etapa 6 de 6</span>
        <h2 id="pricing-step-6">Quanto tempo você realmente trabalhará nisso?</h2>
        <p>
          Considere preparação, execução, atendimento e finalização. Não conte períodos em que você pode realizar outro
          trabalho.
        </p>

        <div className="pricing-tool-field-grid">
          <label className="pricing-tool-field">
            <span>Tempo</span>
            <input
              aria-label="Tempo de trabalho"
              data-testid="pricing-time-amount"
              inputMode="decimal"
              value={timeAmount}
              onChange={event => setTimeAmount(event.target.value)}
            />
          </label>

          <div className="pricing-tool-field">
            <span>Medida</span>
            <div className="pricing-tool-options" role="radiogroup" aria-label="Medida do tempo de trabalho">
              <button
                className={timeUnit === "hours" ? "is-selected" : ""}
                type="button"
                role="radio"
                aria-checked={timeUnit === "hours"}
                onClick={() => setTimeUnit("hours")}
              >
                Horas
              </button>
              <button
                className={timeUnit === "days" ? "is-selected" : ""}
                type="button"
                role="radio"
                aria-checked={timeUnit === "days"}
                onClick={() => setTimeUnit("days")}
              >
                Dias
              </button>
            </div>
          </div>
        </div>

        {timeUnit === "days" ? (
          <div className="pricing-tool-inline-note">
            <Info size={16} strokeWidth={2.1} aria-hidden="true" />
            <p>Para o cálculo, cada dia corresponde a 8 horas.</p>
          </div>
        ) : null}
      </section>
    )
  }

  const renderWorkSettings = () => (
    <section className="pricing-tool-step" aria-labelledby="pricing-work-settings">
      <span className="pricing-tool-step-number">Dados de trabalho</span>
      <h2 id="pricing-work-settings">Só falta entender o valor do seu trabalho</h2>

      <label className="pricing-tool-field">
        <span>Quanto você gostaria que seu trabalho rendesse por mês?</span>
        <input
          aria-label="Quanto você gostaria que seu trabalho rendesse por mês?"
          data-testid="pricing-desired-monthly-income"
          inputMode="decimal"
          value={desiredMonthlyIncome}
          onChange={event => setDesiredMonthlyIncome(event.target.value)}
        />
      </label>

      <div className="pricing-tool-field-grid">
        <label className="pricing-tool-field">
          <span>Dias por mês</span>
          <input
            aria-label="Quantos dias por mês você costuma trabalhar?"
            data-testid="pricing-work-days-month"
            inputMode="decimal"
            value={workDaysMonth}
            onChange={event => setWorkDaysMonth(event.target.value)}
          />
        </label>

        <label className="pricing-tool-field">
          <span>Horas por dia</span>
          <input
            aria-label="Quantas horas por dia você consegue dedicar?"
            data-testid="pricing-work-hours-day"
            inputMode="decimal"
            value={workHoursDay}
            onChange={event => setWorkHoursDay(event.target.value)}
          />
        </label>
      </div>

      <div className="pricing-tool-inline-note">
        <Info size={16} strokeWidth={2.1} aria-hidden="true" />
        <p>Considere apenas o tempo que você realmente consegue usar para produzir ou atender clientes.</p>
      </div>
    </section>
  )

  const renderResultIntro = () => {
    if (screen === "result" && result.isValid) {
      const rangeGuidance =
        difficulty === "complex"
          ? "Por ser um trabalho personalizado ou complexo, considere negociar mais próximo do valor máximo."
          : difficulty === "preparation"
            ? "Como existe preparação adicional, evite negociar abaixo do valor recomendado."
            : "Para um trabalho padrão, o valor recomendado é uma boa referência inicial."

      return (
        <>
          <span>Valor recomendado</span>
          <strong data-testid="pricing-suggested-price">{formatCurrency(result.suggestedPrice)}</strong>
          <p>
            Esse valor considera seus gastos, seu tempo de trabalho, a dificuldade do serviço e uma reserva para extras
            e imprevistos.
          </p>
          <div className="pricing-tool-range-card">
            <span>Faixa recomendada para negociação</span>
            <strong>
              Você pode cobrar entre{" "}
              <b data-testid="pricing-minimum-range">{formatCurrency(result.minimumRange)}</b> e{" "}
              <b data-testid="pricing-maximum-range">{formatCurrency(result.maximumRange)}</b>
            </strong>
            <p>Essa faixa permite ajustar o valor conforme o cliente, a qualidade da entrega e as condições do trabalho.</p>
            <p>{rangeGuidance}</p>
          </div>
          <div className="pricing-tool-unit-price">
            Equivale a <b data-testid="pricing-unit-price">{formatCurrency(result.unitPrice)}</b> por {unitLabel}
          </div>
        </>
      )
    }

    return (
      <>
        <span>Valor recomendado</span>
        <strong className="pricing-tool-empty-result">Responda às etapas</strong>
        <p>Responda às etapas para descobrir quanto cobrar.</p>
      </>
    )
  }

  return (
    <main className="accounting-landing pricing-tool-site">
      <header className="accounting-header" aria-label="Cabeçalho ContaFacil">
        <a className="accounting-logo" href="/" aria-label="ContaFacil">
          <span>Conta</span>Facil
        </a>

        <nav className="accounting-nav" aria-label="Navegação principal">
          <a href="/#servicos">Serviços</a>
          <a href="/#planos">Planos</a>
          <a href="/#ferramentas">Ferramentas</a>
          <a href="/#duvidas">Dúvidas</a>
        </nav>

        <div className="accounting-header-actions">
          <a className="accounting-login" href="/login">
            Login
          </a>
          <a className="accounting-header-cta" href="/diagnostico">
            <span>Abrir CNPJ</span>
            <span aria-hidden="true">›</span>
          </a>
        </div>
      </header>

      <section className="pricing-tool-section" aria-labelledby="pricing-tool-title">
        <div className="pricing-tool-head">
          <span>
            <Calculator size={18} strokeWidth={2.2} aria-hidden="true" />
            Ferramenta gratuita
          </span>
          <h1 id="pricing-tool-title">Descubra quanto cobrar</h1>
          <p>Responda algumas perguntas simples e veja um preço sugerido para o seu produto ou serviço.</p>
        </div>

        <div className="pricing-tool-card">
          <div className="pricing-tool-form" aria-label="Calculadora guiada de precificação">
            {screen === "steps" ? (
              <>
                <div className="pricing-tool-progress" aria-label={`Etapa ${currentStep + 1} de ${TOTAL_STEPS}`}>
                  <span>Etapa {currentStep + 1} de {TOTAL_STEPS}</span>
                  <div>
                    <i style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }} />
                  </div>
                </div>
                {renderStep()}
              </>
            ) : null}

            {screen === "work-settings" ? renderWorkSettings() : null}

            {screen === "result" ? (
              <section className="pricing-tool-step" aria-labelledby="pricing-result-ready">
                <span className="pricing-tool-step-number">Tudo pronto</span>
                <h2 id="pricing-result-ready">Seu valor recomendado está calculado.</h2>
                <p>
                  {workName.trim()
                    ? `Você pode revisar as respostas de ${workName.trim()} quando quiser.`
                    : "Você pode revisar suas respostas quando quiser."}
                </p>
              </section>
            ) : null}

            {(currentStepError || workSettingsError) && screen !== "result" ? (
              <div className="pricing-tool-inline-note" role="alert">
                <Info size={16} strokeWidth={2.1} aria-hidden="true" />
                <p>{screen === "steps" ? currentStepError : workSettingsError}</p>
              </div>
            ) : null}

            <div className="pricing-tool-actions">
              <button
                className="pricing-tool-secondary-action"
                type="button"
                onClick={goBack}
                disabled={screen === "steps" && currentStep === 0}
              >
                <ChevronLeft size={18} strokeWidth={2.1} aria-hidden="true" />
                Voltar
              </button>

              {screen === "result" ? (
                <button className="pricing-tool-secondary-action" type="button" onClick={() => setScreen("steps")}>
                  Alterar respostas
                </button>
              ) : (
                <button className="pricing-tool-next-action" type="button" onClick={goNext} disabled={!canContinue}>
                  {screen === "work-settings" || currentStep === TOTAL_STEPS - 1 ? "Ver preço" : "Avançar"}
                  <ChevronRight size={18} strokeWidth={2.1} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <aside className="pricing-tool-result" aria-label="Resultado da precificação">
            {renderResultIntro()}

            {screen === "result" && result.isValid ? (
              <>
                <details className="pricing-tool-breakdown">
                  <summary>Entenda o cálculo</summary>
                  <div className="pricing-tool-summary">
                    {result.isProduct ? (
                      <>
                        <div>
                          <span>Quantidade produzida no lote</span>
                          <strong data-testid="pricing-production-quantity-result">
                            {formatQuantity(result.productionQuantity)} {productionUnitLabel}
                          </strong>
                        </div>
                        <div>
                          <span>Quantidade vendida</span>
                          <strong data-testid="pricing-quantity-sold-result">
                            {formatQuantity(result.quantitySold)} {unitLabel}
                          </strong>
                        </div>
                      </>
                    ) : null}
                    <div>
                      <span>{result.isProduct ? "Gastos atribuídos a esta venda" : "Seus gastos"}</span>
                      <strong data-testid="pricing-expenses-result">{formatCurrency(result.allocatedDirectCosts)}</strong>
                    </div>
                    <div>
                      <span>{result.isProduct ? "Valor do trabalho atribuído a esta venda" : "Valor do seu trabalho"}</span>
                      <strong data-testid="pricing-work-value">{formatCurrency(result.allocatedBaseWorkValue)}</strong>
                    </div>
                    <div>
                      <span>Ajuste pela dificuldade</span>
                      <strong data-testid="pricing-difficulty-adjustment">{formatCurrency(result.complexityAdjustment)}</strong>
                    </div>
                    <div>
                      <span>Reserva para extras e imprevistos</span>
                      <strong data-testid="pricing-extra-reserve">{formatCurrency(result.extraReserve)}</strong>
                    </div>
                    <div>
                      <span>Valor recomendado</span>
                      <strong data-testid="pricing-total-price">{formatCurrency(result.suggestedPrice)}</strong>
                    </div>
                    <div className="is-highlighted">
                      <span>Valor por unidade de venda</span>
                      <strong data-testid="pricing-unit-price-summary">{formatCurrency(result.unitPrice)}</strong>
                    </div>
                  </div>
                </details>

                {workType === "professional" ? (
                  <div className="pricing-tool-note">
                    <Info size={17} strokeWidth={2.1} aria-hidden="true" />
                    <p>
                      Este cálculo é apenas uma estimativa. Algumas profissões possuem tabelas, regras ou valores mínimos
                      próprios da categoria.
                    </p>
                  </div>
                ) : null}

                <button className="pricing-tool-text-action" type="button" onClick={() => setScreen("work-settings")}>
                  Alterar meus dados de trabalho
                </button>
              </>
            ) : null}

            <a className="pricing-tool-cta" href="/diagnostico">
              <BadgeCheck size={19} strokeWidth={2.2} aria-hidden="true" />
              Falar com especialista
            </a>
          </aside>
        </div>
      </section>

      <footer className="accounting-footer" aria-label="Rodapé ContaFacil">
        <div className="accounting-footer-inner">
          <div className="accounting-footer-brand">
            <a className="accounting-logo" href="/" aria-label="ContaFacil">
              <span>Conta</span>Facil
            </a>
            <p>Assessoria empresarial para prestadores de serviço, MEIs e empresas que querem crescer com organização.</p>
          </div>

          <nav className="accounting-footer-nav" aria-label="Links do rodapé">
            <div>
              <h2>Menu</h2>
              <a href="/#servicos">Serviços</a>
              <a href="/#planos">Planos</a>
              <a href="/#ferramentas">Ferramentas</a>
              <a href="/#duvidas">Dúvidas</a>
              <a href="/login">Login</a>
            </div>

            <div>
              <h2>Ferramentas</h2>
              <a href="/ferramentas/gerador-contrato">Gerador de Contrato</a>
              <a href="/ferramentas/simulador-rescisao">Simulador de Rescisão</a>
              <a href="/ferramentas/simulador-contratacao">Simulador de Contratação</a>
              <a href="/ferramentas/calculadora-precificacao">Calculadora de Precificação</a>
            </div>

            <div>
              <h2>Redes sociais</h2>
              <a href="#">Instagram</a>
              <a href="#">LinkedIn</a>
              <a href="#">Facebook</a>
              <a href="#">WhatsApp</a>
            </div>
          </nav>
        </div>

        <div className="accounting-footer-bottom">
          <span>© 2026 ContaFacil. Todos os direitos reservados.</span>
          <a href="/diagnostico">Abrir CNPJ</a>
        </div>
      </footer>
    </main>
  )
}
