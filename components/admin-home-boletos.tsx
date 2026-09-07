'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ChevronLeft, ChevronRight, CopyPlus, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { formatRoutineCompetence, shiftRoutineCompetenceMonth } from '@/lib/routine-engine'

type BoletoSent = 'Enviado' | 'Não enviado'
type BoletoStatus = 'Aberto' | 'Pago' | 'Vencido'

const SENT_OPTIONS: BoletoSent[] = ['Enviado', 'Não enviado']
const STATUS_OPTIONS: BoletoStatus[] = ['Aberto', 'Pago', 'Vencido']

const FIRST_MONTH = '2026-09-01'

type ClientOption = { id: string; name: string }

type BoletoRow = {
  id: string
  competenceMonth: string
  clientId: string | null
  clientName: string
  dueDay: number
  amount: number
  boletoSent: BoletoSent
  status: BoletoStatus
}

type BoletoFormState = {
  clientId: string
  dueDay: string
  amount: string
  boletoSent: BoletoSent
  status: BoletoStatus
}

const EMPTY_FORM: BoletoFormState = {
  clientId: '',
  dueDay: '5',
  amount: '',
  boletoSent: 'Não enviado',
  status: 'Aberto',
}

function mapRow(row: Record<string, unknown>): BoletoRow {
  return {
    id: String(row.id),
    competenceMonth: (row.competence_month as string) ?? '',
    clientId: (row.client_id as string) ?? null,
    clientName: (row.client_name_cache as string) ?? '',
    dueDay: Number(row.due_day ?? 0),
    amount: Number(row.amount ?? 0),
    boletoSent: (SENT_OPTIONS.includes(row.boleto_status as BoletoSent) ? row.boleto_status : 'Não enviado') as BoletoSent,
    status: (STATUS_OPTIONS.includes(row.status as BoletoStatus) ? row.status : 'Aberto') as BoletoStatus,
  }
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function parseAmount(input: string): number {
  const cleaned = input.trim().replace(/\s/g, '').replace(/r\$/i, '')
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function clampDay(input: string): number {
  const parsed = Math.round(Number(input))
  if (!Number.isFinite(parsed)) return 1
  return Math.min(31, Math.max(1, parsed))
}

function isLate(boleto: BoletoRow) {
  if (boleto.status === 'Pago') return false
  const monthDate = new Date(`${boleto.competenceMonth}T00:00:00`)
  if (Number.isNaN(monthDate.getTime())) return false
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  if (monthDate < currentMonthStart) return true
  if (monthDate.getTime() === currentMonthStart.getTime() && now.getDate() > boleto.dueDay) return true
  return false
}

function sentToneClass(sent: BoletoSent) {
  return sent === 'Enviado' ? 'ok' : 'neutral'
}

function statusToneClass(status: BoletoStatus) {
  if (status === 'Pago') return 'ok'
  if (status === 'Vencido') return 'danger'
  return 'neutral'
}

export default function AdminHomeBoletos() {
  const [boletos, setBoletos] = useState<BoletoRow[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [month, setMonth] = useState(FIRST_MONTH)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | BoletoStatus>('Todos')
  const [sentFilter, setSentFilter] = useState<'Todos' | BoletoSent>('Todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BoletoFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [copying, setCopying] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const [boletosRes, clientsRes] = await Promise.all([
      supabase.from('admin_boletos').select('*').order('due_day', { ascending: true }),
      supabase.from('routine_clients').select('id,name').order('name', { ascending: true }),
    ])

    if (boletosRes.error) {
      setLoadError('Não consegui carregar os boletos agora.')
      setLoading(false)
      return
    }

    setBoletos((boletosRes.data ?? []).map(mapRow))
    setClients((clientsRes.data ?? []).map(row => ({ id: String(row.id), name: (row.name as string) ?? '' })))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const prevMonth = useMemo(() => shiftRoutineCompetenceMonth(month, -1), [month])

  const monthBoletos = useMemo(
    () => boletos.filter(boleto => boleto.competenceMonth === month),
    [boletos, month],
  )

  const prevMonthHasData = useMemo(
    () => boletos.some(boleto => boleto.competenceMonth === prevMonth),
    [boletos, prevMonth],
  )

  const clientsWithBoletoThisMonth = useMemo(
    () => new Set(monthBoletos.map(boleto => boleto.clientId).filter(Boolean)),
    [monthBoletos],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return monthBoletos
      .filter(boleto => {
        if (statusFilter !== 'Todos' && boleto.status !== statusFilter) return false
        if (sentFilter !== 'Todos' && boleto.boletoSent !== sentFilter) return false
        if (term && !boleto.clientName.toLowerCase().includes(term)) return false
        return true
      })
      .sort((a, b) => a.dueDay - b.dueDay || a.clientName.localeCompare(b.clientName))
  }, [monthBoletos, search, statusFilter, sentFilter])

  const stats = useMemo(() => {
    const abertas = monthBoletos.filter(boleto => boleto.status !== 'Pago').length
    const pagos = monthBoletos.filter(boleto => boleto.status === 'Pago').length
    const total = monthBoletos.reduce((sum, boleto) => sum + boleto.amount, 0)
    return { abertas, pagos, total }
  }, [monthBoletos])

  function openCreateModal() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(boleto: BoletoRow) {
    setEditingId(boleto.id)
    setForm({
      clientId: boleto.clientId ?? '',
      dueDay: String(boleto.dueDay || 5),
      amount: boleto.amount ? String(boleto.amount).replace('.', ',') : '',
      boletoSent: boleto.boletoSent,
      status: boleto.status,
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.clientId) {
      setFormError('Selecione a empresa.')
      return
    }

    setSaving(true)
    setFormError('')

    const clientName = clients.find(client => client.id === form.clientId)?.name ?? ''
    const payload = {
      competence_month: month,
      client_id: form.clientId,
      client_name_cache: clientName,
      due_day: clampDay(form.dueDay),
      amount: parseAmount(form.amount),
      boleto_status: form.boletoSent,
      status: form.status,
      updated_at: new Date().toISOString(),
    }

    if (editingId) {
      const { data, error } = await supabase.from('admin_boletos').update(payload).eq('id', editingId).select('*').single()
      setSaving(false)
      if (error || !data) {
        setFormError('Não consegui salvar as alterações.')
        return
      }
      setBoletos(current => current.map(boleto => (boleto.id === editingId ? mapRow(data) : boleto)))
      setModalOpen(false)
      return
    }

    const { data, error } = await supabase.from('admin_boletos').insert(payload).select('*').single()
    setSaving(false)
    if (error || !data) {
      setFormError('Não consegui cadastrar o boleto.')
      return
    }
    setBoletos(current => [...current, mapRow(data)])
    setModalOpen(false)
  }

  async function handleInlineUpdate(boleto: BoletoRow, patch: Partial<Pick<BoletoRow, 'boletoSent' | 'status'>>) {
    const previous = boletos
    setBoletos(current => current.map(item => (item.id === boleto.id ? { ...item, ...patch } : item)))
    const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (patch.boletoSent !== undefined) dbPatch.boleto_status = patch.boletoSent
    if (patch.status !== undefined) dbPatch.status = patch.status
    const { error } = await supabase.from('admin_boletos').update(dbPatch).eq('id', boleto.id)
    if (error) {
      setBoletos(previous)
      window.alert('Não consegui atualizar o boleto agora.')
    }
  }

  async function handleDelete(boleto: BoletoRow) {
    if (!window.confirm(`Excluir o boleto de ${boleto.clientName || 'empresa sem nome'} em ${formatRoutineCompetence(month)}?`)) return
    const { error } = await supabase.from('admin_boletos').delete().eq('id', boleto.id)
    if (error) {
      window.alert('Não consegui excluir esse boleto agora.')
      return
    }
    setBoletos(current => current.filter(item => item.id !== boleto.id))
  }

  async function handleCopyPrevMonth() {
    const source = boletos.filter(boleto => boleto.competenceMonth === prevMonth)
    const pending = source.filter(boleto => !boleto.clientId || !clientsWithBoletoThisMonth.has(boleto.clientId))
    if (pending.length === 0) {
      window.alert('Nada novo para copiar — todas as empresas do mês anterior já têm boleto neste mês.')
      return
    }
    if (!window.confirm(`Copiar ${pending.length} boleto(s) de ${formatRoutineCompetence(prevMonth)} para ${formatRoutineCompetence(month)}?`)) {
      return
    }
    setCopying(true)
    const insertPayload = pending.map(boleto => ({
      competence_month: month,
      client_id: boleto.clientId,
      client_name_cache: boleto.clientName,
      due_day: boleto.dueDay,
      amount: boleto.amount,
      boleto_status: 'Não enviado',
      status: 'Aberto',
      updated_at: new Date().toISOString(),
    }))
    const { data, error } = await supabase.from('admin_boletos').insert(insertPayload).select('*')
    setCopying(false)
    if (error || !data) {
      window.alert('Não consegui copiar os boletos agora.')
      return
    }
    setBoletos(current => [...current, ...data.map(mapRow)])
  }

  return (
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
        <div>
          <h1>Boletos</h1>
          <p>Controle interno das cobranças mensais, uma competência por mês.</p>
        </div>
        <div className="clientes-nucleo-actions">
          {prevMonthHasData && (
            <button type="button" className="clientes-nucleo-btn ghost" onClick={handleCopyPrevMonth} disabled={copying}>
              <CopyPlus size={15} aria-hidden />
              {copying ? 'Copiando…' : `Copiar de ${formatRoutineCompetence(prevMonth)}`}
            </button>
          )}
          <button type="button" className="clientes-nucleo-btn primary" onClick={openCreateModal}>
            <Plus size={15} aria-hidden />
            Novo boleto
          </button>
        </div>
      </div>

      <div className="routine-month-bar">
        <button type="button" onClick={() => setMonth(current => shiftRoutineCompetenceMonth(current, -1))} aria-label="Mês anterior">
          <ChevronLeft size={16} aria-hidden />
        </button>
        <span>{formatRoutineCompetence(month)}</span>
        <button type="button" onClick={() => setMonth(current => shiftRoutineCompetenceMonth(current, 1))} aria-label="Próximo mês">
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>

      <div className="clientes-nucleo-toolbar">
        <div className="clientes-nucleo-search">
          <Search size={16} aria-hidden />
          <input
            type="text"
            placeholder="Buscar por empresa"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="Todos">Todos os status</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select value={sentFilter} onChange={event => setSentFilter(event.target.value as typeof sentFilter)}>
          <option value="Todos">Boleto: todos</option>
          <option value="Enviado">Boleto: enviado</option>
          <option value="Não enviado">Boleto: não enviado</option>
        </select>
      </div>

      <div className="clientes-nucleo-table-wrap">
        {loading ? (
          <div className="admin-home-empty">Carregando boletos…</div>
        ) : loadError ? (
          <div className="admin-home-empty">{loadError}</div>
        ) : filtered.length === 0 ? (
          <div className="admin-home-empty">
            {monthBoletos.length === 0
              ? `Nenhum boleto em ${formatRoutineCompetence(month)}.${prevMonthHasData ? ` Use "Copiar de ${formatRoutineCompetence(prevMonth)}" ou "Novo boleto".` : ' Comece com "Novo boleto".'}`
              : 'Nenhum boleto com esse filtro.'}
          </div>
        ) : (
          <table className="clientes-nucleo-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Dia</th>
                <th>Valor</th>
                <th>Boleto</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(boleto => {
                const late = isLate(boleto)
                return (
                  <tr
                    key={boleto.id}
                    className={late ? 'clientes-nucleo-row-clickable boleto-late' : 'clientes-nucleo-row-clickable'}
                    onClick={() => openEditModal(boleto)}
                  >
                    <td>{boleto.clientName || '—'}</td>
                    <td className="boleto-day">dia {boleto.dueDay}</td>
                    <td>{formatBRL(boleto.amount)}</td>
                    <td onClick={event => event.stopPropagation()}>
                      <select
                        className={`tarefa-status-select clientes-nucleo-chip ${sentToneClass(boleto.boletoSent)}`}
                        value={boleto.boletoSent}
                        onChange={event => handleInlineUpdate(boleto, { boletoSent: event.target.value as BoletoSent })}
                      >
                        {SENT_OPTIONS.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td onClick={event => event.stopPropagation()}>
                      <select
                        className={`tarefa-status-select clientes-nucleo-chip ${statusToneClass(boleto.status)}`}
                        value={boleto.status}
                        onChange={event => handleInlineUpdate(boleto, { status: event.target.value as BoletoStatus })}
                      >
                        {STATUS_OPTIONS.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="clientes-nucleo-row-actions" onClick={event => event.stopPropagation()}>
                        <button type="button" aria-label={`Editar boleto de ${boleto.clientName}`} onClick={() => openEditModal(boleto)}>
                          <Pencil size={15} aria-hidden />
                        </button>
                        <button type="button" aria-label={`Excluir boleto de ${boleto.clientName}`} onClick={() => handleDelete(boleto)}>
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

      {!loading && !loadError && monthBoletos.length > 0 && (
        <p className="tarefa-footnote">
          {stats.abertas} em aberto · {stats.pagos} pagos · total {formatBRL(stats.total)}
        </p>
      )}

      {modalOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !saving && setModalOpen(false)}>
          <form className="clientes-nucleo-modal" onClick={event => event.stopPropagation()} onSubmit={handleSubmit}>
            <div className="clientes-nucleo-modal-head">
              <h2>{editingId ? 'Editar boleto' : 'Novo boleto'} — {formatRoutineCompetence(month)}</h2>
              <button type="button" aria-label="Fechar" onClick={() => setModalOpen(false)}>
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="clientes-nucleo-modal-grid">
              <label className="span-2">
                Empresa
                <select
                  value={form.clientId}
                  onChange={event => setForm(current => ({ ...current, clientId: event.target.value }))}
                  required
                >
                  <option value="">Selecione a empresa</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name || 'Sem nome'}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Dia do vencimento
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={form.dueDay}
                  onChange={event => setForm(current => ({ ...current, dueDay: event.target.value }))}
                />
              </label>
              <label>
                Valor (R$)
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={event => setForm(current => ({ ...current, amount: event.target.value }))}
                />
              </label>
              <label>
                Boleto
                <select
                  value={form.boletoSent}
                  onChange={event => setForm(current => ({ ...current, boletoSent: event.target.value as BoletoSent }))}
                >
                  {SENT_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={event => setForm(current => ({ ...current, status: event.target.value as BoletoStatus }))}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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
    </div>
  )
}
