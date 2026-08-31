'use client'

import { type FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Plus, Send, Trash2, UploadCloud } from 'lucide-react'
import {
  type RoutineClient,
  type RoutineClientCustomObligation,
  type RoutineCompetence,
  type RoutineDepartment,
  type RoutineEmailScope,
  type RoutineItem,
  type RoutineItemStatus,
  ROUTINE_ATTACHMENT_LIMIT_BYTES,
  ROUTINE_CLIENT_ATTACHMENTS_BUCKET,
  ROUTINE_DEPARTMENTS,
  ROUTINE_ITEM_STATUSES,
  buildRoutineEmailSubject,
  buildRoutineMessage,
  formatRoutineCompetence,
  genId,
  getRoutineDepartmentStatus,
  hasValidRoutineEmail,
  isRoutineItemApplicableToClient,
  mapRoutineCustomObligation,
  mapRoutineItem,
  sanitizeAttachmentFileName,
} from '@/lib/routine-engine'

function statusToneClass(status: string) {
  if (status === 'Enviado') return 'ok'
  if (status === 'Anexado') return 'warn'
  if (status === 'Inacabado') return 'danger'
  return 'muted'
}

const EMPTY_OBLIGATION_FORM = {
  name: '',
  department: 'Obrigações específicas' as RoutineDepartment,
  category: '',
  requiresFile: true,
  notes: '',
}

export default function RoutineCompetenceDetail({
  competence,
  client,
  items,
  customObligations,
  onBack,
  onItemsChanged,
  onObligationsChanged,
}: {
  competence: RoutineCompetence
  client: RoutineClient
  items: RoutineItem[]
  customObligations: RoutineClientCustomObligation[]
  onBack: () => void
  onItemsChanged: (items: RoutineItem[]) => void
  onObligationsChanged: (obligations: RoutineClientCustomObligation[]) => void
}) {
  const monthLabel = formatRoutineCompetence(competence.competenceMonth)

  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})

  const [obligationOpen, setObligationOpen] = useState(false)
  const [obligationForm, setObligationForm] = useState(EMPTY_OBLIGATION_FORM)
  const [obligationSaving, setObligationSaving] = useState(false)
  const [obligationError, setObligationError] = useState('')

  const scopes: RoutineEmailScope[] = [
    'Geral',
    ...ROUTINE_DEPARTMENTS.filter(department =>
      items.some(item => item.department === department && isRoutineItemApplicableToClient(client, item)),
    ),
  ]

  const [activeScope, setActiveScope] = useState<RoutineEmailScope>('Geral')
  const [savedDrafts, setSavedDrafts] = useState<Record<string, { subject: string; body: string }>>({})
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [sendSuccess, setSendSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadDrafts() {
      const { data } = await supabase.from('routine_email_drafts').select('*').eq('competence_id', competence.id)
      if (cancelled) return
      const map: Record<string, { subject: string; body: string }> = {}
      ;(data ?? []).forEach((row: Record<string, unknown>) => {
        map[row.scope as string] = { subject: (row.subject as string) ?? '', body: (row.body as string) ?? '' }
      })
      setSavedDrafts(map)
    }
    loadDrafts()
    return () => {
      cancelled = true
    }
  }, [competence.id])

  useEffect(() => {
    const existing = savedDrafts[activeScope]
    if (existing) {
      setSubject(existing.subject)
      setBody(existing.body)
    } else {
      setSubject(buildRoutineEmailSubject(activeScope, monthLabel))
      setBody(buildRoutineMessage(activeScope, client, items, monthLabel))
    }
    setSendError('')
    setSendSuccess('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScope, savedDrafts])

  async function handleUpdateItem(itemId: string, updates: Partial<RoutineItem>) {
    const currentItem = items.find(item => item.id === itemId)
    if (!currentItem) return

    let sentAt = currentItem.sentAt
    if (updates.status === 'Enviado') sentAt = currentItem.sentAt || new Date().toISOString()
    if (updates.status && updates.status !== 'Enviado') sentAt = ''

    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.fileName !== undefined) dbUpdates.file_name = updates.fileName
    if (updates.fileStoragePath !== undefined) dbUpdates.file_storage_path = updates.fileStoragePath
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes
    dbUpdates.sent_at = sentAt || null

    const { error } = await supabase.from('routine_items').update(dbUpdates).eq('id', itemId)
    if (error) {
      window.alert('Não consegui salvar essa rotina agora.')
      return
    }

    onItemsChanged([{ ...currentItem, ...updates, sentAt, updatedAt: dbUpdates.updated_at as string }])
  }

  async function handleFileUpload(item: RoutineItem, file: File) {
    if (file.size > ROUTINE_ATTACHMENT_LIMIT_BYTES) {
      setFileErrors(current => ({ ...current, [item.id]: 'Arquivo até 10 MB.' }))
      return
    }
    setFileErrors(current => ({ ...current, [item.id]: '' }))
    setUploading(current => ({ ...current, [item.id]: true }))

    const path = `${client.id}/routine-items/${item.id}/${Date.now()}-${genId()}-${sanitizeAttachmentFileName(file.name)}`
    const { error: uploadError } = await supabase.storage.from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET).upload(path, file)

    if (uploadError) {
      setUploading(current => ({ ...current, [item.id]: false }))
      setFileErrors(current => ({ ...current, [item.id]: 'Não consegui enviar o arquivo.' }))
      return
    }

    const previousPath = item.fileStoragePath
    await handleUpdateItem(item.id, { fileName: file.name, fileStoragePath: path, status: 'Anexado' })

    if (previousPath) {
      await supabase.storage.from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET).remove([previousPath])
    }

    setUploading(current => ({ ...current, [item.id]: false }))
  }

  async function handleAddObligation(event: FormEvent) {
    event.preventDefault()
    if (!obligationForm.name.trim()) {
      setObligationError('Informe o nome da obrigação.')
      return
    }
    setObligationSaving(true)
    setObligationError('')

    const sortOrder = 900 + customObligations.filter(o => o.active).length
    const { data, error } = await supabase
      .from('routine_client_custom_obligations')
      .insert({
        client_id: client.id,
        name: obligationForm.name.trim(),
        department: obligationForm.department,
        category: obligationForm.category.trim() || 'Personalizada',
        requires_file: obligationForm.requiresFile,
        active: true,
        notes: obligationForm.notes,
        sort_order: sortOrder,
      })
      .select('*')
      .single()

    if (error || !data) {
      setObligationSaving(false)
      setObligationError('Não consegui salvar essa obrigação.')
      return
    }

    const obligation = mapRoutineCustomObligation(data)
    onObligationsChanged([...customObligations, obligation])

    const { data: itemRow } = await supabase
      .from('routine_items')
      .insert({
        competence_id: competence.id,
        routine_name: obligation.name,
        department: obligation.department,
        category: obligation.category,
        requires_file: obligation.requiresFile,
        is_custom: true,
        custom_obligation_id: obligation.id,
        sort_order: obligation.sortOrder,
        status: 'Pendente',
      })
      .select('*')
      .single()

    if (itemRow) onItemsChanged([mapRoutineItem(itemRow)])

    setObligationSaving(false)
    setObligationForm(EMPTY_OBLIGATION_FORM)
    setObligationOpen(false)
  }

  async function handleDeleteObligation(obligation: RoutineClientCustomObligation) {
    if (!window.confirm(`Remover a obrigação "${obligation.name}"?`)) return
    const { error } = await supabase.from('routine_client_custom_obligations').delete().eq('id', obligation.id)
    if (error) {
      window.alert('Não consegui remover essa obrigação agora.')
      return
    }
    onObligationsChanged(customObligations.filter(o => o.id !== obligation.id))
  }

  async function saveDraft() {
    await supabase
      .from('routine_email_drafts')
      .upsert({ competence_id: competence.id, scope: activeScope, subject, body, updated_at: new Date().toISOString() }, { onConflict: 'competence_id,scope' })
    setSavedDrafts(current => ({ ...current, [activeScope]: { subject, body } }))
  }

  async function handleSendEmail() {
    if (!client.email || !hasValidRoutineEmail(client.email)) {
      setSendError('Esse cliente não tem um e-mail válido cadastrado.')
      return
    }
    if (!subject.trim() || !body.trim()) {
      setSendError('Preencha assunto e mensagem.')
      return
    }

    setSending(true)
    setSendError('')
    setSendSuccess('')

    const scopedItems = activeScope === 'Geral' ? items : items.filter(item => item.department === activeScope)
    const sentItemIds = scopedItems
      .filter(item => isRoutineItemApplicableToClient(client, item) && item.status !== 'Não precisa')
      .map(item => item.id)

    try {
      const response = await fetch('/api/contabilidade/enviar-rotinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: client.email, subject, text: body, itemIds: sentItemIds }),
      })
      if (!response.ok) throw new Error('send-failed')

      const now = new Date().toISOString()
      if (sentItemIds.length > 0) {
        await supabase.from('routine_items').update({ status: 'Enviado', sent_at: now, updated_at: now }).in('id', sentItemIds)
        onItemsChanged(
          items
            .filter(item => sentItemIds.includes(item.id))
            .map(item => ({ ...item, status: 'Enviado' as RoutineItemStatus, sentAt: now })),
        )
      }
      setSendSuccess('E-mail enviado com sucesso.')
    } catch {
      setSendError('Não consegui enviar o e-mail agora.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
        <div>
          <button type="button" className="module-soon-back routine-back-btn" onClick={onBack}>
            <ArrowLeft size={15} aria-hidden />
            Competências
          </button>
          <h1>{client.name}</h1>
          <p>
            {monthLabel} · {client.regime}
          </p>
        </div>
      </div>

      {ROUTINE_DEPARTMENTS.map(department => {
        const departmentItems = items
          .filter(item => item.department === department && isRoutineItemApplicableToClient(client, item))
          .sort((a, b) => a.sortOrder - b.sortOrder)

        if (department !== 'Obrigações específicas' && departmentItems.length === 0) return null

        const status = getRoutineDepartmentStatus(client, items, department)

        return (
          <div key={department} className="routine-department">
            <div className="routine-department-head">
              <h3>{department}</h3>
              <span className={`clientes-nucleo-chip ${statusToneClass(status)}`}>{status}</span>
            </div>

            {departmentItems.length === 0 ? (
              <p className="routine-department-empty">Nenhuma obrigação personalizada ainda para esse cliente.</p>
            ) : (
              <div className="routine-item-list">
                {departmentItems.map(item => (
                  <div key={item.id} className="routine-item-row">
                    <div className="routine-item-main">
                      <strong>{item.routineName}</strong>
                      <span>{item.category}</span>
                    </div>
                    <select
                      value={item.status}
                      onChange={event => handleUpdateItem(item.id, { status: event.target.value as RoutineItemStatus })}
                    >
                      {ROUTINE_ITEM_STATUSES.map(statusOption => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </select>
                    <label className="routine-file-btn">
                      <UploadCloud size={14} aria-hidden />
                      {item.fileName ? 'Trocar' : 'Anexar'}
                      <input
                        type="file"
                        hidden
                        onChange={event => {
                          const file = event.target.files?.[0]
                          if (file) handleFileUpload(item, file)
                        }}
                      />
                    </label>
                    {uploading[item.id] ? (
                      <span className="routine-file-name">Enviando…</span>
                    ) : item.fileName ? (
                      <span className="routine-file-name">{item.fileName}</span>
                    ) : null}
                    {fileErrors[item.id] && <span className="clientes-nucleo-modal-error">{fileErrors[item.id]}</span>}
                  </div>
                ))}
              </div>
            )}

            {department === 'Obrigações específicas' && (
              <div className="routine-obligation-panel">
                {customObligations.filter(o => o.active).length > 0 && (
                  <div className="routine-obligation-list">
                    {customObligations
                      .filter(o => o.active)
                      .map(obligation => (
                        <div key={obligation.id} className="routine-obligation-row">
                          <span>{obligation.name}</span>
                          <button type="button" onClick={() => handleDeleteObligation(obligation)} aria-label={`Remover ${obligation.name}`}>
                            <Trash2 size={13} aria-hidden />
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {obligationOpen ? (
                  <form className="routine-obligation-form" onSubmit={handleAddObligation}>
                    <input
                      type="text"
                      placeholder="Nome da obrigação"
                      value={obligationForm.name}
                      onChange={event => setObligationForm(current => ({ ...current, name: event.target.value }))}
                    />
                    <select
                      value={obligationForm.department}
                      onChange={event =>
                        setObligationForm(current => ({ ...current, department: event.target.value as RoutineDepartment }))
                      }
                    >
                      {ROUTINE_DEPARTMENTS.filter(d => d !== 'Obrigatoriedade').map(d => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Categoria (opcional)"
                      value={obligationForm.category}
                      onChange={event => setObligationForm(current => ({ ...current, category: event.target.value }))}
                    />
                    <label className="routine-obligation-checkbox">
                      <input
                        type="checkbox"
                        checked={obligationForm.requiresFile}
                        onChange={event => setObligationForm(current => ({ ...current, requiresFile: event.target.checked }))}
                      />
                      Exige arquivo
                    </label>
                    {obligationError && <p className="clientes-nucleo-modal-error">{obligationError}</p>}
                    <div className="routine-obligation-form-actions">
                      <button type="button" className="clientes-nucleo-btn ghost" onClick={() => setObligationOpen(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="clientes-nucleo-btn primary" disabled={obligationSaving}>
                        {obligationSaving ? 'Salvando…' : 'Adicionar'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button type="button" className="clientes-nucleo-btn ghost" onClick={() => setObligationOpen(true)}>
                    <Plus size={14} aria-hidden />
                    Nova obrigação
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}

      <div className="routine-email-panel">
        <div className="routine-email-tabs">
          {scopes.map(scope => (
            <button
              key={scope}
              type="button"
              className={scope === activeScope ? 'routine-email-tab active' : 'routine-email-tab'}
              onClick={() => setActiveScope(scope)}
            >
              {scope}
            </button>
          ))}
        </div>

        <label className="routine-email-field">
          Assunto
          <input type="text" value={subject} onChange={event => setSubject(event.target.value)} onBlur={saveDraft} />
        </label>
        <label className="routine-email-field">
          Mensagem
          <textarea rows={8} value={body} onChange={event => setBody(event.target.value)} onBlur={saveDraft} />
        </label>

        {sendError && <p className="clientes-nucleo-modal-error">{sendError}</p>}
        {sendSuccess && <p className="routine-email-success">{sendSuccess}</p>}

        <div className="routine-email-actions">
          <span className="routine-email-to">Para: {client.email || 'sem e-mail cadastrado'}</span>
          <button type="button" className="clientes-nucleo-btn primary" onClick={handleSendEmail} disabled={sending}>
            <Send size={14} aria-hidden />
            {sending ? 'Enviando…' : 'Enviar e-mail'}
          </button>
        </div>
      </div>
    </div>
  )
}
