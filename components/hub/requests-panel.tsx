"use client"

import { FormEvent, useEffect, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FileQuestion,
  FileText,
  Landmark,
  LifeBuoy,
  LockKeyhole,
  MessageCircle,
  Paperclip,
  ReceiptText,
  Scale,
  Send,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"
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
import {
  REQUEST_FLOW_SECTORS,
  findRequestFlowSector,
  type RequestFlowAction,
  type RequestFlowSectorId,
  type RequestFlowTemplate,
} from "@/lib/client-requests/flow"
import { buildStructuredDescription, validateIntakeField } from "@/lib/client-requests/product-intake"

type View = "list" | "new" | { detail: ClientRequest }
export type RequestIntent = "billing_due_date" | "document_upload"

type RequestTemplate = RequestFlowTemplate

const SECTOR_ICONS: Record<RequestFlowSectorId, LucideIcon> = {
  legalizacao: Landmark,
  pessoal: Users,
  fiscal: ReceiptText,
  contabil: Scale,
  comercial: BriefcaseBusiness,
  suporte: LifeBuoy,
}

const ACTION_ICONS: Record<RequestFlowAction["actionType"], LucideIcon> = {
  product: Building2,
  process: FileText,
  route: ArrowRight,
  request: FileQuestion,
  contact: MessageCircle,
}

function sectorForIntent(intent: RequestIntent | null): RequestFlowSectorId | null {
  if (intent === "billing_due_date") return "suporte"
  if (intent === "document_upload") return "contabil"
  return null
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

function statusClassName(status: ClientRequest["status"]) {
  if (status === "concluida") return "is-done"
  if (status === "cancelada") return "is-canceled"
  return "is-open"
}

export default function RequestsPanel({
  initialIntent,
  canCreateRequests,
  onUpgrade,
  onFlowAction,
}: {
  initialIntent?: RequestIntent | null
  canCreateRequests: boolean
  onUpgrade: () => void
  onFlowAction: (action: RequestFlowAction) => void
}) {
  const [requests, setRequests] = useState<ClientRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>("list")
  const [selectedSectorId, setSelectedSectorId] = useState<RequestFlowSectorId | null>(sectorForIntent(initialIntent ?? null))
  const [draftTemplate, setDraftTemplate] = useState<RequestTemplate | null>(null)
  const [blockedTopicTitle, setBlockedTopicTitle] = useState("")
  const selectedSector = findRequestFlowSector(selectedSectorId)

  useEffect(() => {
    if (!canCreateRequests && view === "new") {
      setView("list")
      setDraftTemplate(null)
    }
  }, [canCreateRequests, view])

  useEffect(() => {
    const nextSector = sectorForIntent(initialIntent ?? null)
    if (nextSector) setSelectedSectorId(nextSector)
  }, [initialIntent])

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
    setDraftTemplate(null)
    setBlockedTopicTitle("")
  }

  function openTemplate(template: RequestTemplate) {
    if (!canCreateRequests) return
    setDraftTemplate(template)
    setBlockedTopicTitle("")
    setView("new")
  }

  function selectSector(sectorId: RequestFlowSectorId | null) {
    setSelectedSectorId(sectorId)
    setBlockedTopicTitle("")
  }

  function handleTopicAction(action: RequestFlowAction, topicTitle: string) {
    if (action.actionType === "request") {
      if (!canCreateRequests) {
        setBlockedTopicTitle(topicTitle)
        return
      }

      openTemplate(action.template)
      return
    }

    setBlockedTopicTitle("")
    onFlowAction(action)
  }

  if (view === "new") {
    if (!canCreateRequests) {
      return null
    }

    return (
      <div
        className="client-hub-modal-backdrop"
        role="presentation"
        onMouseDown={() => {
          setDraftTemplate(null)
          setView("list")
        }}
      >
        <div
          className="client-hub-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="client-requests-form-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <RequestForm
            initialTemplate={draftTemplate}
            onCancel={() => {
              setDraftTemplate(null)
              setView("list")
            }}
            onCreated={handleCreated}
          />
        </div>
      </div>
    )
  }

  if (typeof view === "object") {
    return <RequestDetail request={view.detail} onBack={() => setView("list")} />
  }

  return (
    <article className="client-hub-panel client-requests-flow-panel">
      <div className="client-hub-section-head client-requests-head">
        <div>
          <h2>Solicitações</h2>
          <p>Escolha o setor e o assunto para seguir pelo caminho certo.</p>
        </div>
      </div>

      {!canCreateRequests ? (
        <div className="client-requests-upgrade-state">
          <span className="client-requests-upgrade-icon" aria-hidden="true">
            <LockKeyhole size={20} strokeWidth={2.2} />
          </span>
          <div>
            <strong>Solicitações contábeis estão disponíveis nos planos pagos.</strong>
            <p>Você ainda pode usar as ferramentas gratuitas, comprar produtos avulsos e acompanhar seu perfil normalmente.</p>
          </div>
          <button className="client-requests-new-button" type="button" onClick={onUpgrade}>
            Conhecer planos
          </button>
        </div>
      ) : null}

      <div className="client-requests-flow" aria-label="Fluxo orientado de solicitações">
        {!selectedSector ? (
          <>
            <div className="client-requests-step-head">
              <span>1</span>
              <div>
                <strong>Escolha o setor</strong>
                <p>Comece pela área que melhor combina com o que você precisa.</p>
              </div>
            </div>

            <div className="client-requests-sector-grid">
              {REQUEST_FLOW_SECTORS.map((sector) => {
                const Icon = SECTOR_ICONS[sector.id]

                return (
                  <button
                    className="client-requests-sector-card"
                    type="button"
                    key={sector.id}
                    onClick={() => selectSector(sector.id)}
                  >
                    <span className="client-requests-card-icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={2.2} />
                    </span>
                    <strong>{sector.title}</strong>
                    <small>{sector.description}</small>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="client-requests-topic-zone">
            <div className="client-requests-step-head">
              <span>2</span>
              <div>
                <strong>Escolha o assunto</strong>
                <p>{selectedSector.title}: só aparecem os caminhos desse setor.</p>
              </div>
              <button className="client-requests-back-button" type="button" onClick={() => selectSector(null)}>
                Trocar setor
              </button>
            </div>

            <div className="client-requests-topic-grid">
              {selectedSector.topics.map((topic) => {
                const Icon = ACTION_ICONS[topic.action.actionType]
                const isRequestBlocked = topic.action.actionType === "request" && !canCreateRequests

                return (
                  <button
                    className={isRequestBlocked ? "client-requests-topic-card is-locked" : "client-requests-topic-card"}
                    type="button"
                    key={topic.id}
                    onClick={() => handleTopicAction(topic.action, topic.title)}
                  >
                    <span className="client-requests-card-icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={2.2} />
                    </span>
                    <span>
                      <strong>{topic.title}</strong>
                      <small>{topic.description}</small>
                    </span>
                    <em>
                      {isRequestBlocked ? "Plano pago" : topic.action.label}
                      <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                    </em>
                  </button>
                )
              })}
            </div>

            {blockedTopicTitle ? (
              <div className="client-requests-topic-blocked">
                <strong>{blockedTopicTitle}</strong>
                <p>Solicitações contábeis estão disponíveis nos planos pagos.</p>
                <button className="client-requests-new-button" type="button" onClick={onUpgrade}>
                  Aumentar plano
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <section className="client-requests-history" aria-label="Histórico de solicitações">
        <div className="client-requests-history-head">
          <strong>Histórico</strong>
          <span>{requests.length} solicitação{requests.length === 1 ? "" : "es"}</span>
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
      </section>
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

function RequestForm({
  initialTemplate,
  onCancel,
  onCreated,
}: {
  initialTemplate: RequestTemplate | null
  onCancel: () => void
  onCreated: (request: ClientRequest) => void
}) {
  const [category, setCategory] = useState<RequestCategory>(initialTemplate?.category ?? CATEGORY_OPTIONS[0].value)
  const [title, setTitle] = useState(initialTemplate?.title ?? "")
  const [description, setDescription] = useState(initialTemplate?.fields?.length ? "" : (initialTemplate?.body ?? ""))
  const [priority, setPriority] = useState<RequestPriority>("normal")
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    Object.fromEntries((initialTemplate?.fields ?? []).map((field) => [field.name, ""])),
  )
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setCategory(initialTemplate?.category ?? CATEGORY_OPTIONS[0].value)
    setTitle(initialTemplate?.title ?? "")
    setDescription(initialTemplate?.fields?.length ? "" : (initialTemplate?.body ?? ""))
    setPriority("normal")
    setFieldValues(Object.fromEntries((initialTemplate?.fields ?? []).map((field) => [field.name, ""])))
    setFile(null)
    setError("")
  }, [initialTemplate])

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

    for (const field of initialTemplate?.fields ?? []) {
      const value = (fieldValues[field.name] ?? "").trim()
      const fieldError = validateIntakeField(field, value)
      if (fieldError) {
        setError(fieldError)
        return
      }
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

      const finalDescription = initialTemplate?.fields?.length
        ? buildStructuredDescription(initialTemplate, fieldValues, description)
        : [initialTemplate?.body, description.trim()].filter(Boolean).join("\n\n")

      const response = await fetch("/api/client-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title: title.trim(),
          description: finalDescription,
          priority,
          attachment_path: attachmentPath,
        }),
      })

      const data = (await response.json().catch(() => null)) as { request?: ClientRequest; error?: string } | null

      if (!response.ok || !data?.request) {
        setError(data?.error || "Não foi possível enviar a solicitação. Tente novamente.")
        setSubmitting(false)
        return
      }

      onCreated(data.request)
    } catch {
      setError("Não foi possível enviar a solicitação. Tente novamente.")
      setSubmitting(false)
    }
  }

  return (
    <article className="client-hub-panel">
      <div className="client-hub-section-head client-requests-head">
        <div>
          <h2 id="client-requests-form-title">Nova solicitação</h2>
          <p>Preencha os dados abaixo para enviar sua solicitação.</p>
        </div>
        <button className="client-requests-back-button" type="button" onClick={onCancel} aria-label="Cancelar">
          <X size={16} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>

      <form className="client-requests-form" onSubmit={handleSubmit}>
        {initialTemplate?.fields?.length ? (
          <div className="client-requests-special-fields">
            {initialTemplate.fields.map((field) => (
              <label className={field.type === "textarea" ? "client-requests-field is-wide" : "client-requests-field"} key={field.name}>
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    value={fieldValues[field.name] ?? ""}
                    onChange={(event) => setFieldValues((current) => ({ ...current, [field.name]: event.target.value }))}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    value={fieldValues[field.name] ?? ""}
                    onChange={(event) => setFieldValues((current) => ({ ...current, [field.name]: event.target.value }))}
                    placeholder={field.placeholder}
                  />
                )}
              </label>
            ))}
          </div>
        ) : null}

        <div className="client-requests-field">
          <span>Categoria</span>
          <div className="client-requests-category-pills">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                className={category === option.value ? "is-active" : ""}
                type="button"
                value={option.value}
                key={option.value}
                onClick={() => setCategory(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

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
          <span>{initialTemplate?.fields?.length ? "Observações adicionais" : "Descrição"}</span>
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
            <Send size={15} strokeWidth={2.4} aria-hidden="true" />
            {submitting ? "Enviando..." : "Enviar solicitação"}
          </button>
        </div>
      </form>
    </article>
  )
}
