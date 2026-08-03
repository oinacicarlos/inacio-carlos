"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import {
  ABERTURA_STATUS_LABELS,
  ALTERACAO_STATUS_LABELS,
  CERTIFICADO_STATUS_LABELS,
  MEI_STATUS_LABELS,
  type AberturaStatus,
  type AlteracaoStatus,
  type CertificadoStatus,
  type MeiStatus,
} from "@/lib/onboarding/constants"

type AdminOnlineOnboardingActionsProps = {
  onboardingId: string
  wantsMei: boolean
  wantsCertificado: boolean
  wantsAbertura: boolean
  wantsAlteracao: boolean
  initialMeiStatus: MeiStatus
  initialCertificadoStatus: CertificadoStatus
  initialAberturaStatus: AberturaStatus
  initialAlteracaoStatus: AlteracaoStatus
}

function StatusSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Record<T, string>
  onChange: (value: T) => void
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option value={optionValue} key={optionValue}>{optionLabel as string}</option>
        ))}
      </select>
    </label>
  )
}

export default function AdminOnlineOnboardingActions({
  onboardingId,
  wantsMei,
  wantsCertificado,
  wantsAbertura,
  wantsAlteracao,
  initialMeiStatus,
  initialCertificadoStatus,
  initialAberturaStatus,
  initialAlteracaoStatus,
}: AdminOnlineOnboardingActionsProps) {
  const router = useRouter()
  const [meiStatus, setMeiStatus] = useState(initialMeiStatus)
  const [certificadoStatus, setCertificadoStatus] = useState(initialCertificadoStatus)
  const [aberturaStatus, setAberturaStatus] = useState(initialAberturaStatus)
  const [alteracaoStatus, setAlteracaoStatus] = useState(initialAlteracaoStatus)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch(`/api/admin/onboarding/${onboardingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(wantsMei ? { mei_status: meiStatus } : {}),
          ...(wantsCertificado ? { certificado_status: certificadoStatus } : {}),
          ...(wantsAbertura ? { abertura_status: aberturaStatus } : {}),
          ...(wantsAlteracao ? { alteracao_status: alteracaoStatus } : {}),
        }),
      })
      const payload = await response.json().catch(() => null) as { error?: string } | null

      if (!response.ok) {
        throw new Error(payload?.error ?? "Não foi possível salvar.")
      }

      setMessage("Atualizado")
      router.refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-online-onboarding-actions" onSubmit={handleSubmit}>
      <div className="admin-online-onboarding-grid">
        {wantsMei ? (
          <StatusSelect label="MEI" value={meiStatus} options={MEI_STATUS_LABELS} onChange={setMeiStatus} />
        ) : null}
        {wantsCertificado ? (
          <StatusSelect label="Certificado" value={certificadoStatus} options={CERTIFICADO_STATUS_LABELS} onChange={setCertificadoStatus} />
        ) : null}
        {wantsAbertura ? (
          <StatusSelect label="Abertura" value={aberturaStatus} options={ABERTURA_STATUS_LABELS} onChange={setAberturaStatus} />
        ) : null}
        {wantsAlteracao ? (
          <StatusSelect label="Alteração" value={alteracaoStatus} options={ALTERACAO_STATUS_LABELS} onChange={setAlteracaoStatus} />
        ) : null}
      </div>

      <div className="admin-online-onboarding-footer">
        <button type="submit" disabled={saving}>
          <Save size={14} strokeWidth={2.2} aria-hidden="true" />
          {saving ? "Salvando..." : "Salvar status"}
        </button>
        {message ? <p className="admin-online-request-message">{message}</p> : null}
        {error ? <p className="admin-online-request-error">{error}</p> : null}
      </div>
    </form>
  )
}
