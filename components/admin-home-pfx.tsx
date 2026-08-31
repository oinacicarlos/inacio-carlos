'use client'

import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  AlertTriangle,
  CalendarClock,
  FileWarning,
  IdCard,
  Pencil,
  Search,
  Trash2,
  UploadCloud,
  UserPlus,
  X,
} from 'lucide-react'

type ClientType = 'PJ' | 'PF'
type ValidityStatus = 'valid' | 'soon' | 'expired' | 'missing'
type WhatsAppIntent = 'Cobrança' | 'Feedback' | 'Renovação'

const PFX_FILE_LIMIT_BYTES = 5 * 1024 * 1024

type PfxClientRow = {
  id: string
  clientName: string
  clientType: ClientType
  birdIdDone: boolean
  document: string
  pfxFileName: string
  pfxFileUrl: string
  pfxFileSize: number
  validityDate: string
  whatsapp: string
  notes: string
}

type PfxFormState = {
  clientName: string
  clientType: ClientType
  birdIdDone: boolean
  document: string
  validityDate: string
  whatsapp: string
  notes: string
  pfxFileName: string
  pfxFileUrl: string
  pfxFileSize: number
}

const EMPTY_FORM: PfxFormState = {
  clientName: '',
  clientType: 'PJ',
  birdIdDone: false,
  document: '',
  validityDate: '',
  whatsapp: '',
  notes: '',
  pfxFileName: '',
  pfxFileUrl: '',
  pfxFileSize: 0,
}

function mapRow(row: Record<string, unknown>): PfxClientRow {
  return {
    id: String(row.id),
    clientName: (row.client_name as string) ?? '',
    clientType: row.client_type === 'PF' ? 'PF' : 'PJ',
    birdIdDone: row.bird_id_done === true,
    document: (row.document as string) ?? '',
    pfxFileName: (row.pfx_file_name as string) ?? '',
    pfxFileUrl: (row.pfx_file_url as string) ?? '',
    pfxFileSize: Number(row.pfx_file_size ?? 0),
    validityDate: (row.validity_date as string) ?? '',
    whatsapp: (row.whatsapp as string) ?? '',
    notes: (row.notes as string) ?? '',
  }
}

function getValidityStatus(validityDate: string): ValidityStatus {
  if (!validityDate) return 'missing'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${validityDate}T00:00:00`)
  const days = Math.ceil((target.getTime() - today.getTime()) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 30) return 'soon'
  return 'valid'
}

function getValidityLabel(validityDate: string) {
  const status = getValidityStatus(validityDate)
  if (status === 'missing') return 'Sem validade'
  const formatted = new Date(`${validityDate}T00:00:00`).toLocaleDateString('pt-BR')
  if (status === 'expired') return `Vencido em ${formatted}`
  if (status === 'soon') return `Vence em ${formatted}`
  return formatted
}

function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length <= 11) return `55${digits}`
  return digits
}

function getWhatsappMessage(client: PfxClientRow, intent: WhatsAppIntent) {
  const name = client.clientName || 'tudo bem'
  const document = client.document ? ` documento ${client.document}` : ''
  const validity = client.validityDate ? new Date(`${client.validityDate}T00:00:00`).toLocaleDateString('pt-BR') : 'em breve'

  if (intent === 'Cobrança') return `Olá, ${name}! Tudo bem? Passando para falar sobre o certificado digital/PFX${document}. Podemos seguir com a regularização?`
  if (intent === 'Feedback') return `Olá, ${name}! Tudo bem? Gostaria de saber se deu tudo certo com o certificado digital/PFX e se você precisa de algum ajuste.`
  return `Olá, ${name}! Tudo bem? O certificado digital/PFX${document} vence em ${validity}. Podemos iniciar a renovação?`
}

function getWhatsappUrl(client: PfxClientRow, intent: WhatsAppIntent) {
  const phone = normalizeWhatsapp(client.whatsapp)
  const message = encodeURIComponent(getWhatsappMessage(client, intent))
  return `https://wa.me/${phone}?text=${message}`
}

function formatFileSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminHomePfx() {
  const [clients, setClients] = useState<PfxClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | ValidityStatus>('Todos')
  const [birdFilter, setBirdFilter] = useState<'Todos' | 'Feito' | 'Não Feito'>('Todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PfxFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [fileError, setFileError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const { data, error } = await supabase
      .from('pfx_clients')
      .select('*')
      .order('validity_date', { ascending: true, nullsFirst: false })

    if (error) {
      setLoadError('Não consegui carregar os certificados agora.')
      setLoading(false)
      return
    }

    setClients((data ?? []).map(mapRow))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return clients.filter(client => {
      if (term) {
        const haystack = `${client.clientName} ${client.document} ${client.whatsapp}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      if (statusFilter !== 'Todos' && getValidityStatus(client.validityDate) !== statusFilter) return false
      if (birdFilter === 'Feito' && !client.birdIdDone) return false
      if (birdFilter === 'Não Feito' && client.birdIdDone) return false
      return true
    })
  }, [clients, search, statusFilter, birdFilter])

  const counts = useMemo(() => {
    return clients.reduce(
      (acc, client) => {
        const status = getValidityStatus(client.validityDate)
        if (status === 'expired') acc.expired += 1
        if (status === 'soon') acc.soon += 1
        if (!client.birdIdDone) acc.pendingBird += 1
        if (!client.pfxFileName) acc.noFile += 1
        return acc
      },
      { expired: 0, soon: 0, pendingBird: 0, noFile: 0 },
    )
  }, [clients])

  function openCreateModal() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setFileError('')
    setModalOpen(true)
  }

  function openEditModal(client: PfxClientRow) {
    setEditingId(client.id)
    setForm({
      clientName: client.clientName,
      clientType: client.clientType,
      birdIdDone: client.birdIdDone,
      document: client.document,
      validityDate: client.validityDate,
      whatsapp: client.whatsapp,
      notes: client.notes,
      pfxFileName: client.pfxFileName,
      pfxFileUrl: client.pfxFileUrl,
      pfxFileSize: client.pfxFileSize,
    })
    setFormError('')
    setFileError('')
    setModalOpen(true)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setFileError('')

    if (file.size > PFX_FILE_LIMIT_BYTES) {
      setFileError('O arquivo precisa ter até 5 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm(current => ({
        ...current,
        pfxFileName: file.name,
        pfxFileUrl: String(reader.result ?? ''),
        pfxFileSize: file.size,
      }))
    }
    reader.onerror = () => setFileError('Não consegui ler esse arquivo.')
    reader.readAsDataURL(file)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.clientName.trim()) {
      setFormError('Informe o nome do cliente.')
      return
    }

    const digits = form.document.replace(/\D/g, '')
    const expectedLength = form.clientType === 'PF' ? 11 : 14
    if (digits && digits.length !== expectedLength) {
      setFormError(`Informe um ${form.clientType === 'PF' ? 'CPF' : 'CNPJ'} completo.`)
      return
    }

    setSaving(true)
    setFormError('')

    const payload = {
      client_name: form.clientName.trim(),
      client_type: form.clientType,
      bird_id_done: form.birdIdDone,
      document: form.document,
      pfx_file_name: form.pfxFileName,
      pfx_file_url: form.pfxFileUrl,
      pfx_file_size: form.pfxFileSize,
      validity_date: form.validityDate || null,
      whatsapp: form.whatsapp,
      notes: form.notes,
      updated_at: new Date().toISOString(),
    }

    if (editingId) {
      const { data, error } = await supabase.from('pfx_clients').update(payload).eq('id', editingId).select('*').single()
      setSaving(false)
      if (error || !data) {
        setFormError('Não consegui salvar as alterações.')
        return
      }
      setClients(current => current.map(client => (client.id === editingId ? mapRow(data) : client)))
      setModalOpen(false)
      return
    }

    const { data, error } = await supabase.from('pfx_clients').insert(payload).select('*').single()
    setSaving(false)
    if (error || !data) {
      setFormError('Não consegui cadastrar o cliente.')
      return
    }
    setClients(current => [mapRow(data), ...current])
    setModalOpen(false)
  }

  async function handleDelete(client: PfxClientRow) {
    if (!window.confirm(`Excluir o certificado de ${client.clientName}?`)) return
    const { error } = await supabase.from('pfx_clients').delete().eq('id', client.id)
    if (error) {
      window.alert('Não consegui excluir esse registro agora.')
      return
    }
    setClients(current => current.filter(c => c.id !== client.id))
  }

  return (
    <>
      <div className="clientes-nucleo-shell">
        <div className="clientes-nucleo-header">
          <div>
            <h1>PFX</h1>
            <p>Certificados digitais dos clientes e validade.</p>
          </div>
          <div className="clientes-nucleo-actions">
            <button type="button" className="clientes-nucleo-btn primary" onClick={openCreateModal}>
              <UserPlus size={15} aria-hidden />
              Novo cliente
            </button>
          </div>
        </div>

        <div className="clientes-nucleo-stats">
          <div className="clientes-nucleo-stat">
            <span className="clientes-nucleo-stat-icon tone-danger"><AlertTriangle size={18} aria-hidden /></span>
            <div>
              <span>Vencidos</span>
              <strong>{counts.expired}</strong>
            </div>
          </div>
          <div className="clientes-nucleo-stat">
            <span className="clientes-nucleo-stat-icon tone-warn"><CalendarClock size={18} aria-hidden /></span>
            <div>
              <span>Próximos 30 dias</span>
              <strong>{counts.soon}</strong>
            </div>
          </div>
          <div className="clientes-nucleo-stat">
            <span className="clientes-nucleo-stat-icon"><IdCard size={18} aria-hidden /></span>
            <div>
              <span>Bird-ID pendente</span>
              <strong>{counts.pendingBird}</strong>
            </div>
          </div>
          <div className="clientes-nucleo-stat">
            <span className="clientes-nucleo-stat-icon"><FileWarning size={18} aria-hidden /></span>
            <div>
              <span>Sem arquivo</span>
              <strong>{counts.noFile}</strong>
            </div>
          </div>
        </div>

        <div className="clientes-nucleo-toolbar">
          <div className="clientes-nucleo-search">
            <Search size={16} aria-hidden />
            <input
              type="text"
              placeholder="Buscar por nome, documento ou WhatsApp"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}>
            <option value="Todos">Todas as validades</option>
            <option value="expired">Vencidos</option>
            <option value="soon">Próximos 30 dias</option>
            <option value="valid">Válidos</option>
            <option value="missing">Sem validade</option>
          </select>
          <select value={birdFilter} onChange={event => setBirdFilter(event.target.value as typeof birdFilter)}>
            <option value="Todos">Bird-ID: todos</option>
            <option value="Feito">Bird-ID feito</option>
            <option value="Não Feito">Bird-ID pendente</option>
          </select>
        </div>

        <div className="clientes-nucleo-table-wrap">
          {loading ? (
            <div className="admin-home-empty">Carregando certificados…</div>
          ) : loadError ? (
            <div className="admin-home-empty">{loadError}</div>
          ) : filtered.length === 0 ? (
            <div className="admin-home-empty">Nenhum cliente encontrado com esse filtro.</div>
          ) : (
            <table className="clientes-nucleo-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Documento</th>
                  <th>Validade</th>
                  <th>Bird-ID</th>
                  <th>WhatsApp</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => {
                  const status = getValidityStatus(client.validityDate)
                  const hasWhatsapp = normalizeWhatsapp(client.whatsapp) !== ''
                  return (
                    <tr key={client.id}>
                      <td>
                        <div className="clientes-nucleo-name-cell">
                          <span className="clientes-nucleo-avatar">{client.clientName.slice(0, 2).toUpperCase() || '?'}</span>
                          {client.clientName || 'Sem nome'}
                        </div>
                      </td>
                      <td>{client.clientType}</td>
                      <td>{client.document || '—'}</td>
                      <td>
                        <span
                          className={
                            status === 'expired'
                              ? 'clientes-nucleo-chip danger'
                              : status === 'soon'
                                ? 'clientes-nucleo-chip warn'
                                : status === 'valid'
                                  ? 'clientes-nucleo-chip ok'
                                  : 'clientes-nucleo-chip muted'
                          }
                        >
                          {getValidityLabel(client.validityDate)}
                        </span>
                      </td>
                      <td>
                        <span className={client.birdIdDone ? 'clientes-nucleo-chip ok' : 'clientes-nucleo-chip muted'}>
                          {client.birdIdDone ? 'Feito' : 'Não feito'}
                        </span>
                      </td>
                      <td>
                        <div className="pfx-whatsapp-actions">
                          {(['Cobrança', 'Feedback', 'Renovação'] as WhatsAppIntent[]).map(intent => (
                            <a
                              key={intent}
                              href={hasWhatsapp ? getWhatsappUrl(client, intent) : undefined}
                              target="_blank"
                              rel="noreferrer"
                              aria-disabled={!hasWhatsapp}
                              onClick={event => {
                                if (!hasWhatsapp) event.preventDefault()
                              }}
                              className={hasWhatsapp ? 'pfx-whatsapp-chip' : 'pfx-whatsapp-chip disabled'}
                            >
                              {intent}
                            </a>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="clientes-nucleo-row-actions">
                          <button type="button" aria-label={`Editar ${client.clientName}`} onClick={() => openEditModal(client)}>
                            <Pencil size={15} aria-hidden />
                          </button>
                          <button type="button" aria-label={`Excluir ${client.clientName}`} onClick={() => handleDelete(client)}>
                            <Trash2 size={15} aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !saving && setModalOpen(false)}>
          <form className="clientes-nucleo-modal" onClick={event => event.stopPropagation()} onSubmit={handleSubmit}>
            <div className="clientes-nucleo-modal-head">
              <h2>{editingId ? 'Editar cliente PFX' : 'Novo cliente PFX'}</h2>
              <button type="button" aria-label="Fechar" onClick={() => setModalOpen(false)}>
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="clientes-nucleo-modal-grid">
              <label className="span-2">
                Cliente
                <input
                  type="text"
                  value={form.clientName}
                  onChange={event => setForm(current => ({ ...current, clientName: event.target.value }))}
                  required
                />
              </label>
              <label>
                Tipo
                <select
                  value={form.clientType}
                  onChange={event => setForm(current => ({ ...current, clientType: event.target.value as ClientType }))}
                >
                  <option value="PJ">PJ</option>
                  <option value="PF">PF</option>
                </select>
              </label>
              <label>
                Bird-ID
                <select
                  value={form.birdIdDone ? 'Feito' : 'Não Feito'}
                  onChange={event => setForm(current => ({ ...current, birdIdDone: event.target.value === 'Feito' }))}
                >
                  <option value="Feito">Feito</option>
                  <option value="Não Feito">Não Feito</option>
                </select>
              </label>
              <label>
                Documento
                <input
                  type="text"
                  value={form.document}
                  onChange={event => setForm(current => ({ ...current, document: event.target.value }))}
                  placeholder={form.clientType === 'PF' ? 'CPF' : 'CNPJ'}
                />
              </label>
              <label>
                Validade
                <input
                  type="date"
                  value={form.validityDate}
                  onChange={event => setForm(current => ({ ...current, validityDate: event.target.value }))}
                />
              </label>
              <label>
                WhatsApp
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={event => setForm(current => ({ ...current, whatsapp: event.target.value }))}
                />
              </label>
              <label className="span-2">
                Arquivo PFX
                <div className="pfx-file-field">
                  <label className="clientes-nucleo-btn ghost pfx-file-btn">
                    <UploadCloud size={15} aria-hidden />
                    {form.pfxFileName ? 'Trocar arquivo' : 'Enviar arquivo'}
                    <input type="file" accept=".pfx,.p12,application/x-pkcs12" onChange={handleFileChange} hidden />
                  </label>
                  {form.pfxFileName && (
                    <span className="pfx-file-name">
                      {form.pfxFileName} {form.pfxFileSize ? `· ${formatFileSize(form.pfxFileSize)}` : ''}
                    </span>
                  )}
                </div>
                {fileError && <span className="clientes-nucleo-modal-error">{fileError}</span>}
              </label>
              <label className="span-2">
                Observação
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={event => setForm(current => ({ ...current, notes: event.target.value }))}
                />
              </label>
            </div>

            {formError && <p className="clientes-nucleo-modal-error">{formError}</p>}

            <div className="clientes-nucleo-modal-foot">
              <button type="button" className="clientes-nucleo-btn ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="clientes-nucleo-btn primary" disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
