"use client"

import { FormEvent, useEffect, useState } from "react"
import { CreditCard, FileQuestion, FileText, Paperclip, Plus, Send, UploadCloud, X } from "lucide-react"
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
export type RequestIntent = "billing_due_date" | "document_upload"
type RequestTemplate = {
  label: string
  description: string
  category: RequestCategory
  title: string
  body: string
  icon: typeof FileText
}

const REQUEST_TEMPLATES: RequestTemplate[] = [
  {
    label: "Emitir nota fiscal",
    description: "Dados do tomador, serviço, valor e observações.",
    category: "emissao_nota_fiscal",
    title: "Emitir nota fiscal",
    body: "Preciso emitir uma nota fiscal. Seguem os dados do tomador, descrição do serviço, valor e observações:",
    icon: FileText,
  },
  {
    label: "Enviar documento",
    description: "Contrato, comprovante, guia, extrato ou arquivo para análise.",
    category: "envio_documento",
    title: "Envio de documento",
    body: "Estou enviando um documento para análise da equipe:",
    icon: UploadCloud,
  },
  {
    label: "Alterar vencimento",
    description: "Solicite ajuste da data de cobrança do plano.",
    category: "duvida_atendimento",
    title: "Solicitar alteração da data de vencimento",
    body: "Gostaria de alterar a data de vencimento da minha assinatura para o dia:",
    icon: CreditCard,
  },
  {
    label: "Dúvida contábil",
    description: "Impostos, rotina mensal, DAS, pró-labore ou orientação geral.",
    category: "duvida_atendimento",
    title: "Dúvida contábil",
    body: "Tenho uma dúvida sobre:",
    icon: FileQuestion,
  },
  {
    label: "Alteração cadastral",
    description: "Endereço, atividade, razão social, sócios ou dados fiscais.",
    category: "alteracao_cadastral",
    title: "Alteração cadastral",
    body: "Preciso alterar os seguintes dados cadastrais:",
    icon: FileText,
  },
  {
    label: "Inscrição municipal",
    description: "Pedidos e pendências ligados à prefeitura.",
    category: "inscricao_municipal",
    title: "Inscrição municipal",
    body: "Preciso de ajuda com inscrição municipal:",
    icon: FileText,
  },
  {
    label: "Inscrição estadual",
    description: "Pedidos e pendências ligados ao estado.",
    category: "inscricao_estadual",
    title: "Inscrição estadual",
    body: "Preciso de ajuda com inscrição estadual:",
    icon: FileText,
  },
]

function templateForIntent(intent: RequestIntent | null) {
  if (intent === "billing_due_date") return REQUEST_TEMPLATES.find((template) => template.title.includes("vencimento"))
  if (intent === "document_upload") return REQUEST_TEMPLATES.find((template) => template.category === "envio_documento")
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

export default function RequestsPanel({ initialIntent }: { initialIntent?: RequestIntent | null }) {
  const [requests, setRequests] = useState<ClientRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>(initialIntent ? "new" : "list")
  const [draftTemplate, setDraftTemplate] = useState<RequestTemplate | null>(templateForIntent(initialIntent ?? null) ?? null)

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
  }

  function openTemplate(template: RequestTemplate) {
    setDraftTemplate(template)
    setView("new")
  }

  if (view === "new") {
    return (
      <RequestForm
        initialTemplate={draftTemplate}
        onCancel={() => {
          setDraftTemplate(null)
          setView("list")
        }}
        onCreated={handleCreated}
      />
    )
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

      <div className="client-requests-template-strip" aria-label="Atalhos de solicitação">
        {REQUEST_TEMPLATES.slice(0, 4).map((template) => {
          const Icon = template.icon
          return (
          <button
            type="button"
            key={template.label}
            onClick={() => openTemplate(template)}
          >
            <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
            {template.label}
          </button>
          )
        })}
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
  const [description, setDescription] = useState(initialTemplate?.body ?? "")
  const [priority, setPriority] = useState<RequestPriority>("normal")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function applyTemplate(template: (typeof REQUEST_TEMPLATES)[number]) {
    setCategory(template.category)
    setTitle(template.title)
    setDescription(template.body)
  }

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
        <div className="client-requests-field">
          <span>Escolha um atalho</span>
          <div className="client-requests-template-grid">
            {REQUEST_TEMPLATES.map((template) => {
              const Icon = template.icon
              const isActive = title === template.title
              return (
                <button
                  className={isActive ? "is-active" : ""}
                  type="button"
                  key={template.label}
                  onClick={() => applyTemplate(template)}
                >
                  <Icon size={17} strokeWidth={2.2} aria-hidden="true" />
                  <strong>{template.label}</strong>
                  <small>{template.description}</small>
                </button>
              )
            })}
          </div>
        </div>

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
            <Send size={15} strokeWidth={2.4} aria-hidden="true" />
            {submitting ? "Enviando..." : "Enviar solicitação"}
          </button>
        </div>
      </form>
    </article>
  )
}
