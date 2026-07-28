"use client"

import { FormEvent, useEffect, useState } from "react"
import { Paperclip, Plus, X } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import {
  ALLOWED_ATTACHMENT_TYPES,
  ATTACHMENT_BUCKET,
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  MAX_ATTACHMENT_SIZE_BYTES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type ClientRequest,
  type RequestCategory,
  type RequestPriority,
} from "@/lib/client-requests/constants"

type View = "list" | "new" | { detail: ClientRequest }

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

function statusClassName(status: ClientRequest["status"]) {
  if (status === "concluida") return "is-done"
  if (status === "cancelada") return "is-canceled"
  return "is-open"
}

export default function RequestsPanel() {
  const [requests, setRequests] = useState<ClientRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>("list")

  useEffect(() => {
    let active = true

    async function loadRequests() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (active) setLoading(false)
        return
      }

      const { data } = await supabase
        .from("client_requests")
        .select("id, category, title, description, priority, status, attachment_path, created_at")
        .order("created_at", { ascending: false })

      if (active) {
        setRequests((data as ClientRequest[]) ?? [])
        setLoading(false)
      }
    }

    loadRequests()
    return () => {
      active = false
    }
  }, [])

  function handleCreated(request: ClientRequest) {
    setRequests((current) => [request, ...current])
    setView("list")
  }

  if (view === "new") {
    return <RequestForm onCancel={() => setView("list")} onCreated={handleCreated} />
  }

  if (typeof view === "object") {
    return <RequestDetail request={view.detail} onBack={() => setView("list")} />
  }

  return (
    <article className="client-hub-panel">
      <div className="client-hub-section-head client-requests-head">
        <div>
          <h2>Solicitações</h2>
          <p>Acompanhamento das suas solicitações enviadas.</p>
        </div>
        <button className="client-requests-new-button" type="button" onClick={() => setView("new")}>
          <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
          Nova solicitação
        </button>
      </div>

      {loading ? (
        <p className="client-hub-empty-state">Carregando...</p>
      ) : requests.length === 0 ? (
        <p className="client-hub-empty-state">Nenhuma solicitação enviada ainda.</p>
      ) : (
        <div className="client-hub-request-list">
          {requests.map((request) => (
            <button
              className="client-hub-request client-requests-item"
              type="button"
              key={request.id}
              onClick={() => setView({ detail: request })}
            >
              <div>
                <strong>{request.title}</strong>
                <span>
                  {CATEGORY_LABELS[request.category]} · {formatDate(request.created_at)}
                  {request.priority === "urgente" ? " · Urgente" : ""}
                </span>
              </div>
              <em className={statusClassName(request.status)}>{STATUS_LABELS[request.status]}</em>
            </button>
          ))}
        </div>
      )}
    </article>
  )
}

function RequestDetail({ request, onBack }: { request: ClientRequest; onBack: () => void }) {
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadAttachmentUrl() {
      if (!request.attachment_path) return

      const { data } = await supabase.storage
        .from(ATTACHMENT_BUCKET)
        .createSignedUrl(request.attachment_path, 60 * 5)

      if (active && data?.signedUrl) {
        setAttachmentUrl(data.signedUrl)
      }
    }

    loadAttachmentUrl()
    return () => {
      active = false
    }
  }, [request.attachment_path])

  return (
    <article className="client-hub-panel">
      <div className="client-hub-section-head client-requests-head">
        <div>
          <h2>{request.title}</h2>
          <p>
            {CATEGORY_LABELS[request.category]} · Enviada em {formatDate(request.created_at)}
          </p>
        </div>
        <button className="client-requests-back-button" type="button" onClick={onBack}>
          Voltar
        </button>
      </div>

      <div className="client-requests-detail-meta">
        <div>
          <span>Status</span>
          <em className={statusClassName(request.status)}>{STATUS_LABELS[request.status]}</em>
        </div>
        <div>
          <span>Prioridade</span>
          <strong>{PRIORITY_LABELS[request.priority]}</strong>
        </div>
      </div>

      <div className="client-requests-detail-description">
        <span>Descrição</span>
        <p>{request.description || "Sem descrição adicional."}</p>
      </div>

      {request.attachment_path && (
        <div className="client-requests-detail-attachment">
          <span>Anexo</span>
          {attachmentUrl ? (
            <a href={attachmentUrl} target="_blank" rel="noreferrer">
              <Paperclip size={15} strokeWidth={2.2} aria-hidden="true" />
              Abrir anexo
            </a>
          ) : (
            <p>Carregando link do anexo...</p>
          )}
        </div>
      )}
    </article>
  )
}

function RequestForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (request: ClientRequest) => void }) {
  const [category, setCategory] = useState<RequestCategory>(CATEGORY_OPTIONS[0].value)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<RequestPriority>("normal")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    setError("")

    if (!selected) {
      setFile(null)
      return
    }

    if (!ALLOWED_ATTACHMENT_TYPES.includes(selected.type)) {
      setError("Formato de arquivo não suportado. Envie PDF, imagem (PNG/JPEG/WEBP) ou Word.")
      event.target.value = ""
      setFile(null)
      return
    }

    if (selected.size > MAX_ATTACHMENT_SIZE_BYTES) {
      setError("O arquivo deve ter até 10 MB.")
      event.target.value = ""
      setFile(null)
      return
    }

    setFile(selected)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Informe um título para a solicitação.")
      return
    }

    setSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Sua sessão expirou. Atualize a página e faça login novamente.")
        setSubmitting(false)
        return
      }

      let attachmentPath: string | null = null

      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
        const path = `${user.id}/${Date.now()}-${safeName}`

        const { error: uploadError } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file)

        if (uploadError) {
          setError("Não foi possível enviar o anexo. Tente novamente.")
          setSubmitting(false)
          return
        }

        attachmentPath = path
      }

      const { data, error: insertError } = await supabase
        .from("client_requests")
        .insert({
          user_id: user.id,
          category,
          title: title.trim(),
          description: description.trim(),
          priority,
          attachment_path: attachmentPath,
        })
        .select("id, category, title, description, priority, status, attachment_path, created_at")
        .single()

      if (insertError || !data) {
        setError("Não foi possível enviar a solicitação. Tente novamente.")
        setSubmitting(false)
        return
      }

      onCreated(data as ClientRequest)
    } catch {
      setError("Não foi possível enviar a solicitação. Tente novamente.")
      setSubmitting(false)
    }
  }

  return (
    <article className="client-hub-panel">
      <div className="client-hub-section-head client-requests-head">
        <div>
          <h2>Nova solicitação</h2>
          <p>Preencha os dados abaixo para enviar sua solicitação.</p>
        </div>
        <button className="client-requests-back-button" type="button" onClick={onCancel} aria-label="Cancelar">
          <X size={16} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>

      <form className="client-requests-form" onSubmit={handleSubmit}>
        <label className="client-requests-field">
          <span>Categoria</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as RequestCategory)}>
            {CATEGORY_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="client-requests-field">
          <span>Título</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Resuma sua solicitação em poucas palavras"
          />
        </label>

        <label className="client-requests-field">
          <span>Descrição</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Detalhe o que você precisa"
            rows={4}
          />
        </label>

        <div className="client-requests-field">
          <span>Prioridade</span>
          <div className="client-requests-priority-options">
            {(["normal", "urgente"] as RequestPriority[]).map((option) => (
              <label key={option} className={priority === option ? "is-active" : ""}>
                <input
                  type="radio"
                  name="priority"
                  value={option}
                  checked={priority === option}
                  onChange={() => setPriority(option)}
                />
                {PRIORITY_LABELS[option]}
              </label>
            ))}
          </div>
        </div>

        <label className="client-requests-field">
          <span>Anexo (opcional)</span>
          <input type="file" accept={ALLOWED_ATTACHMENT_TYPES.join(",")} onChange={handleFileChange} />
        </label>

        {error && <p className="client-requests-error">{error}</p>}

        <div className="client-requests-form-actions">
          <button type="button" className="client-requests-back-button" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="client-requests-new-button" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar solicitação"}
          </button>
        </div>
      </form>
    </article>
  )
}
