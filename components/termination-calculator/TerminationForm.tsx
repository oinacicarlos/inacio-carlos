import type { NoticeOption, TerminationInput, TerminationType } from "@/lib/termination-calculator/types"

type TerminationFormProps = {
  values: {
    salary: string
    additionalAverage: string
    admissionDate: string
    terminationDate: string
    daysWorkedInMonth: string
    expiredVacations: string
    fgtsBalance: string
    otherDiscounts: string
    terminationType: TerminationType
    noticeOption: NoticeOption
    mixedNoticeWorkedDays: string
    mixedNoticeIndemnifiedDays: string
  }
  errors: string[]
  noticeDays: number
  onFieldChange: (field: keyof TerminationFormProps["values"], value: string) => void
  onTypeChange: (type: TerminationType) => void
  onNoticeChange: (notice: NoticeOption) => void
}

const terminationOptions: Array<{ label: string; value: TerminationType }> = [
  { label: "Sem justa causa", value: "noCause" },
  { label: "Pedido de demissão", value: "resignation" },
  { label: "Rescisão por acordo", value: "mutual" },
  { label: "Justa causa", value: "cause" },
]

const noticeOptions: Record<TerminationType, Array<{ label: string; value: NoticeOption }>> = {
  noCause: [
    { label: "Indenizado", value: "indemnified" },
    { label: "Trabalhado", value: "worked" },
    { label: "Misto", value: "mixed" },
  ],
  resignation: [
    { label: "Trabalhado", value: "worked" },
    { label: "Não cumprido", value: "notWorked" },
    { label: "Dispensado", value: "waived" },
  ],
  mutual: [
    { label: "Indenizado", value: "indemnified" },
    { label: "Trabalhado", value: "worked" },
  ],
  cause: [{ label: "Sem aviso", value: "none" }],
}

export default function TerminationForm({
  errors,
  noticeDays,
  onFieldChange,
  onNoticeChange,
  onTypeChange,
  values,
}: TerminationFormProps) {
  const currentNoticeOptions = noticeOptions[values.terminationType]

  return (
    <form className="termination-form" aria-label="Simulador de rescisão">
      <section className="termination-form-section">
        <h2>Dados do contrato</h2>
        <div className="termination-field-grid">
          <label className="termination-field">
            <span>Salário bruto mensal</span>
            <input
              aria-describedby="salary-error"
              data-testid="termination-salary"
              inputMode="decimal"
              value={values.salary}
              onChange={event => onFieldChange("salary", event.target.value)}
            />
          </label>

          <label className="termination-field">
            <span>Média mensal de adicionais</span>
            <input
              aria-describedby="additional-help"
              inputMode="decimal"
              value={values.additionalAverage}
              onChange={event => onFieldChange("additionalAverage", event.target.value)}
            />
            <small id="additional-help">Comissões, horas extras e outros adicionais habituais.</small>
          </label>

          <label className="termination-field">
            <span>Data de admissão</span>
            <input
              type="date"
              value={values.admissionDate}
              onChange={event => onFieldChange("admissionDate", event.target.value)}
            />
          </label>

          <label className="termination-field">
            <span>Data do desligamento</span>
            <input
              type="date"
              value={values.terminationDate}
              onChange={event => onFieldChange("terminationDate", event.target.value)}
            />
          </label>

          <label className="termination-field">
            <span>Dias trabalhados no mês</span>
            <input
              inputMode="numeric"
              max={30}
              min={0}
              type="number"
              value={values.daysWorkedInMonth}
              onChange={event => onFieldChange("daysWorkedInMonth", event.target.value)}
            />
          </label>

          <label className="termination-field">
            <span>Férias vencidas pendentes</span>
            <input
              inputMode="numeric"
              min={0}
              type="number"
              value={values.expiredVacations}
              onChange={event => onFieldChange("expiredVacations", event.target.value)}
            />
            <small>Informe apenas períodos adquiridos e ainda não pagos ou gozados.</small>
          </label>

          <label className="termination-field">
            <span>Saldo do FGTS</span>
            <input
              aria-describedby="fgts-help"
              inputMode="decimal"
              value={values.fgtsBalance}
              onChange={event => onFieldChange("fgtsBalance", event.target.value)}
            />
            <small id="fgts-help">Consulte o extrato do FGTS para maior precisão.</small>
          </label>

          <label className="termination-field">
            <span>Outros descontos</span>
            <input
              aria-describedby="discounts-help"
              inputMode="decimal"
              value={values.otherDiscounts}
              onChange={event => onFieldChange("otherDiscounts", event.target.value)}
            />
            <small id="discounts-help">Adiantamentos, faltas ou descontos autorizados.</small>
          </label>
        </div>
      </section>

      <section className="termination-form-section">
        <h2>Tipo de desligamento</h2>
        <div className="termination-option-grid" role="radiogroup" aria-label="Tipo de desligamento">
          {terminationOptions.map(option => (
            <button
              className={values.terminationType === option.value ? "is-selected" : ""}
              key={option.value}
              type="button"
              role="radio"
              aria-checked={values.terminationType === option.value}
              onClick={() => onTypeChange(option.value)}
            >
              <span aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>

        {values.terminationType !== "cause" ? (
          <div className="termination-notice-block">
            <div className="termination-field">
              <span>Aviso prévio</span>
              <div className="termination-notice-options" role="radiogroup" aria-label="Aviso prévio">
                {currentNoticeOptions.map(option => (
                  <button
                    className={values.noticeOption === option.value ? "is-selected" : ""}
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={values.noticeOption === option.value}
                    onClick={() => onNoticeChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {values.noticeOption === "mixed" ? (
              <div className="termination-field-grid">
                <label className="termination-field">
                  <span>Dias trabalhados de aviso</span>
                  <input
                    inputMode="numeric"
                    max={noticeDays}
                    min={0}
                    type="number"
                    value={values.mixedNoticeWorkedDays}
                    onChange={event => onFieldChange("mixedNoticeWorkedDays", event.target.value)}
                  />
                </label>

                <label className="termination-field">
                  <span>Dias indenizados de aviso</span>
                  <input
                    inputMode="numeric"
                    max={noticeDays}
                    min={0}
                    type="number"
                    value={values.mixedNoticeIndemnifiedDays}
                    onChange={event => onFieldChange("mixedNoticeIndemnifiedDays", event.target.value)}
                  />
                </label>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {errors.length > 0 ? (
        <div className="termination-errors" role="alert">
          {errors.map(error => (
            <p id="salary-error" key={error}>
              {error}
            </p>
          ))}
        </div>
      ) : null}
    </form>
  )
}

export type { TerminationInput }
