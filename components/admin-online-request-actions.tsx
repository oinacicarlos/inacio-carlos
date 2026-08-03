"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, Save } from "lucide-react"
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type RequestPriority,
  type RequestStatus,
} from "@/lib/client-requests/constants"

type AdminOnlineRequestActionsProps = {
  requestId: string
  initialStatus: RequestStatus
  initialPriority: RequestPriority
  initialInternalNote?: string | null
  hasAttachment: boolean
}

export default function AdminOnlineRequestActions({
  requestId,
  initialStatus,
  initialPriority,
  initialInternalNote,
  hasAttachment,
}: AdminOnlineRequestActionsProps) {
  const router = useRouter()
  const [status, setStatus] = useState<RequestStatus>(initialStatus)
  const [priority, setPriority] = useState<RequestPriority>(initialPriority)
  const [internalNote, setInternalNote] = useState(initialInternalNote ?? "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch(`/api/admin/client-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          priority,
          internal_note: internalNote,
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
    <form className="admin-online-request-actions" onSubmit={handleSubmit}>
      <div className="admin-online-request-grid">
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as RequestStatus)}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Prioridade</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value as RequestPriority)}>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span>Observação interna</span>
        <textarea
          value={internalNote}
          maxLength={2000}
          rows={3}
          placeholder="Anote próximos passos, pendências ou retorno combinado."
          onChange={(event) => setInternalNote(event.target.value)}
        />
      </label>

      <div className="admin-online-request-footer">
        {hasAttachment ? (
          <a href={`/api/admin/client-requests/${requestId}/attachment`} target="_blank" rel="noreferrer">
            <ExternalLink size={14} strokeWidth={2.2} aria-hidden="true" />
            Abrir anexo
          </a>
        ) : (
          <span>Sem anexo</span>
        )}
        <button type="submit" disabled={saving}>
          <Save size={14} strokeWidth={2.2} aria-hidden="true" />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {message ? <p className="admin-online-request-message">{message}</p> : null}
      {error ? <p className="admin-online-request-error">{error}</p> : null}
    </form>
  )
}
