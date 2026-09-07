'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { CheckSquare, Pencil, Plus, Search, Trash2, X } from 'lucide-react'

type TaskChannel = 'WhatsApp' | 'E-mail' | 'Ligação' | 'Pessoalmente' | 'Outro'
type TaskStatus = 'Aberta' | 'Fazendo' | 'Concluída'

const CHANNELS: TaskChannel[] = ['WhatsApp', 'E-mail', 'Ligação', 'Pessoalmente', 'Outro']
const STATUSES: TaskStatus[] = ['Aberta', 'Fazendo', 'Concluída']

type ClientOption = { id: string; name: string }

type TaskRow = {
  id: string
  clientId: string | null
  clientName: string
  title: string
  instructions: string
  channel: TaskChannel
  status: TaskStatus
}

type TaskFormState = {
  clientId: string
  title: string
  instructions: string
  channel: TaskChannel
  status: TaskStatus
}

const EMPTY_FORM: TaskFormState = {
  clientId: '',
  title: '',
  instructions: '',
  channel: 'WhatsApp',
  status: 'Aberta',
}

function mapRow(row: Record<string, unknown>): TaskRow {
  return {
    id: String(row.id),
    clientId: (row.client_id as string) ?? null,
    clientName: (row.client_name_cache as string) ?? '',
    title: (row.title as string) ?? '',
    instructions: (row.instructions as string) ?? '',
    channel: (CHANNELS.includes(row.channel as TaskChannel) ? row.channel : 'Outro') as TaskChannel,
    status: (STATUSES.includes(row.status as TaskStatus) ? row.status : 'Aberta') as TaskStatus,
  }
}

function statusToneClass(status: TaskStatus) {
  if (status === 'Concluída') return 'ok'
  if (status === 'Fazendo') return 'blue'
  return 'neutral'
}

export default function AdminHomeTarefas() {
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | TaskStatus>('Todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TaskFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const [tasksRes, clientsRes] = await Promise.all([
      supabase.from('admin_tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('routine_clients').select('id,name').order('name', { ascending: true }),
    ])

    if (tasksRes.error) {
      setLoadError('Não consegui carregar as tarefas agora.')
      setLoading(false)
      return
    }

    setTasks((tasksRes.data ?? []).map(mapRow))
    setClients((clientsRes.data ?? []).map(row => ({ id: String(row.id), name: (row.name as string) ?? '' })))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return tasks.filter(task => {
      if (statusFilter !== 'Todos' && task.status !== statusFilter) return false
      if (term) {
        const haystack = `${task.title} ${task.instructions} ${task.clientName}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [tasks, search, statusFilter])

  const openStats = useMemo(() => {
    const abertas = tasks.filter(task => task.status !== 'Concluída').length
    return { abertas, total: tasks.length }
  }, [tasks])

  function openCreateModal() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(task: TaskRow) {
    setEditingId(task.id)
    setForm({
      clientId: task.clientId ?? '',
      title: task.title,
      instructions: task.instructions,
      channel: task.channel,
      status: task.status,
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.title.trim()) {
      setFormError('Informe o título da tarefa.')
      return
    }

    setSaving(true)
    setFormError('')

    const clientName = form.clientId ? clients.find(client => client.id === form.clientId)?.name ?? '' : ''
    const payload = {
      client_id: form.clientId || null,
      client_name_cache: clientName,
      title: form.title.trim(),
      instructions: form.instructions.trim(),
      channel: form.channel,
      status: form.status,
      updated_at: new Date().toISOString(),
    }

    if (editingId) {
      const { data, error } = await supabase.from('admin_tasks').update(payload).eq('id', editingId).select('*').single()
      setSaving(false)
      if (error || !data) {
        setFormError('Não consegui salvar as alterações.')
        return
      }
      setTasks(current => current.map(task => (task.id === editingId ? mapRow(data) : task)))
      setModalOpen(false)
      return
    }

    const { data, error } = await supabase.from('admin_tasks').insert(payload).select('*').single()
    setSaving(false)
    if (error || !data) {
      setFormError('Não consegui cadastrar a tarefa.')
      return
    }
    setTasks(current => [mapRow(data), ...current])
    setModalOpen(false)
  }

  async function handleStatusChange(task: TaskRow, status: TaskStatus) {
    setTasks(current => current.map(item => (item.id === task.id ? { ...item, status } : item)))
    const { error } = await supabase
      .from('admin_tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', task.id)
    if (error) {
      setTasks(current => current.map(item => (item.id === task.id ? { ...item, status: task.status } : item)))
      window.alert('Não consegui atualizar o status agora.')
    }
  }

  async function handleDelete(task: TaskRow) {
    if (!window.confirm(`Excluir a tarefa "${task.title}"?`)) return
    const { error } = await supabase.from('admin_tasks').delete().eq('id', task.id)
    if (error) {
      window.alert('Não consegui excluir essa tarefa agora.')
      return
    }
    setTasks(current => current.filter(item => item.id !== task.id))
  }

  return (
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
        <div>
          <h1>Tarefas</h1>
          <p>Demandas dos clientes organizadas em um lugar só.</p>
        </div>
        <div className="clientes-nucleo-actions">
          <button type="button" className="clientes-nucleo-btn primary" onClick={openCreateModal}>
            <Plus size={15} aria-hidden />
            Nova tarefa
          </button>
        </div>
      </div>

      <div className="clientes-nucleo-toolbar">
        <div className="clientes-nucleo-search">
          <Search size={16} aria-hidden />
          <input
            type="text"
            placeholder="Buscar por título, empresa ou instrução"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="Todos">Todos os status</option>
          {STATUSES.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="clientes-nucleo-table-wrap">
        {loading ? (
          <div className="admin-home-empty">Carregando tarefas…</div>
        ) : loadError ? (
          <div className="admin-home-empty">{loadError}</div>
        ) : filtered.length === 0 ? (
          <div className="admin-home-empty">
            {tasks.length === 0 ? 'Nenhuma tarefa cadastrada ainda.' : 'Nenhuma tarefa com esse filtro.'}
          </div>
        ) : (
          <table className="clientes-nucleo-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Título</th>
                <th>Canal</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <tr
                  key={task.id}
                  className={task.status === 'Concluída' ? 'clientes-nucleo-row-clickable tarefa-done' : 'clientes-nucleo-row-clickable'}
                  onClick={() => openEditModal(task)}
                >
                  <td>{task.clientName || '—'}</td>
                  <td>
                    <div className="tarefa-title-cell">
                      <strong>{task.title}</strong>
                      {task.instructions && <span>{task.instructions}</span>}
                    </div>
                  </td>
                  <td>{task.channel}</td>
                  <td onClick={event => event.stopPropagation()}>
                    <select
                      className={`tarefa-status-select clientes-nucleo-chip ${statusToneClass(task.status)}`}
                      value={task.status}
                      onChange={event => handleStatusChange(task, event.target.value as TaskStatus)}
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="clientes-nucleo-row-actions" onClick={event => event.stopPropagation()}>
                      <button type="button" aria-label={`Editar ${task.title}`} onClick={() => openEditModal(task)}>
                        <Pencil size={15} aria-hidden />
                      </button>
                      <button type="button" aria-label={`Excluir ${task.title}`} onClick={() => handleDelete(task)}>
                        <Trash2 size={15} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !loadError && tasks.length > 0 && (
        <p className="tarefa-footnote">
          {openStats.abertas} em aberto · {openStats.total} no total
        </p>
      )}

      {modalOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !saving && setModalOpen(false)}>
          <form className="clientes-nucleo-modal" onClick={event => event.stopPropagation()} onSubmit={handleSubmit}>
            <div className="clientes-nucleo-modal-head">
              <h2>{editingId ? 'Editar tarefa' : 'Nova tarefa'}</h2>
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
                >
                  <option value="">Sem empresa / interno</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name || 'Sem nome'}
                    </option>
                  ))}
                </select>
              </label>
              <label className="span-2">
                Título
                <input
                  type="text"
                  value={form.title}
                  onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
              <label className="span-2">
                Instruções
                <textarea
                  rows={4}
                  value={form.instructions}
                  onChange={event => setForm(current => ({ ...current, instructions: event.target.value }))}
                />
              </label>
              <label>
                Canal
                <select
                  value={form.channel}
                  onChange={event => setForm(current => ({ ...current, channel: event.target.value as TaskChannel }))}
                >
                  {CHANNELS.map(channel => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={event => setForm(current => ({ ...current, status: event.target.value as TaskStatus }))}
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
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
