'use client'

import Link from 'next/link'
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Download,
  Pencil,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  Folder,
  X,
} from 'lucide-react'

type Regime = 'MEI' | 'Simples Nacional'
type ClientStatus = 'Ativo' | 'Inativo'

type ClientRow = {
  id: string
  name: string
  cnpj: string
  partnerName: string
  partnerCpf: string
  regime: Regime
  hasPayroll: boolean
  whatsapp: string
  email: string
  monthlyFee: number
  notes: string
  status: ClientStatus
}

type ClientFormState = {
  name: string
  cnpj: string
  partnerName: string
  partnerCpf: string
  regime: Regime
  status: ClientStatus
  hasPayroll: boolean
  whatsapp: string
  email: string
  monthlyFee: string
  notes: string
}

const EMPTY_FORM: ClientFormState = {
  name: '',
  cnpj: '',
  partnerName: '',
  partnerCpf: '',
  regime: 'Simples Nacional',
  status: 'Ativo',
  hasPayroll: false,
  whatsapp: '',
  email: '',
  monthlyFee: '',
  notes: '',
}

function mapRow(row: Record<string, unknown>): ClientRow {
  return {
    id: String(row.id),
    name: (row.name as string) ?? '',
    cnpj: (row.cnpj as string) ?? '',
    partnerName: (row.partner_name as string) ?? '',
    partnerCpf: (row.partner_cpf as string) ?? '',
    regime: row.regime === 'Simples Nacional' ? 'Simples Nacional' : 'MEI',
    hasPayroll: row.has_payroll === true || row.has_employees === true || row.has_pro_labore === true,
    whatsapp: (row.whatsapp as string) ?? '',
    email: (row.email as string) ?? '',
    monthlyFee: Number(row.monthly_fee ?? 0),
    notes: (row.notes as string) ?? '',
    status: row.status === 'Inativo' ? 'Inativo' : 'Ativo',
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function exportCsv(clients: ClientRow[]) {
  const header = ['Cliente', 'CNPJ', 'Regime', 'Folha', 'E-mail', 'WhatsApp', 'Mensalidade', 'Status']
  const rows = clients.map(client => [
    client.name,
    client.cnpj,
    client.regime,
    client.hasPayroll ? 'Sim' : 'Não',
    client.email,
    client.whatsapp,
    client.monthlyFee.toFixed(2).replace('.', ','),
    client.status,
  ])
  const csv = [header, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(';'))
    .join('\n')
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'clientes-nucleo-tropa.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function AdminHomeClientes() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [attachmentsTotal, setAttachmentsTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [regimeFilter, setRegimeFilter] = useState<'Todos' | Regime>('Todos')
  const [folhaFilter, setFolhaFilter] = useState<'Todos' | 'Com folha' | 'Sem folha'>('Todos')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ClientFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const [clientsRes, attachmentsRes] = await Promise.all([
      supabase.from('routine_clients').select('*').order('name', { ascending: true }),
      supabase.from('routine_client_attachments').select('id', { count: 'exact', head: true }),
    ])

    if (clientsRes.error) {
      setLoadError('Não consegui carregar os clientes agora.')
      setLoading(false)
      return
    }

    setClients((clientsRes.data ?? []).map(mapRow))
    setAttachmentsTotal(attachmentsRes.count ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return clients.filter(client => {
      if (term) {
        const haystack = `${client.name} ${client.cnpj} ${client.whatsapp} ${client.email}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      if (regimeFilter !== 'Todos' && client.regime !== regimeFilter) return false
      if (folhaFilter === 'Com folha' && !client.hasPayroll) return false
      if (folhaFilter === 'Sem folha' && client.hasPayroll) return false
      return true
    })
  }, [clients, search, regimeFilter, folhaFilter])

  const stats = useMemo(() => {
    const total = clients.length
    const active = clients.filter(client => client.status === 'Ativo').length
    const inactive = total - active
    const withPayroll = clients.filter(client => client.hasPayroll).length
    const payrollPct = total > 0 ? Math.round((withPayroll / total) * 100) : 0
    const recurringRevenue = clients.reduce((sum, client) => sum + client.monthlyFee, 0)
    return { total, active, inactive, withPayroll, payrollPct, recurringRevenue }
  }, [clients])

  function openCreateModal() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(client: ClientRow) {
    setEditingId(client.id)
    setForm({
      name: client.name,
      cnpj: client.cnpj,
      partnerName: client.partnerName,
      partnerCpf: client.partnerCpf,
      regime: client.regime,
      status: client.status,
      hasPayroll: client.hasPayroll,
      whatsapp: client.whatsapp,
      email: client.email,
      monthlyFee: client.monthlyFee ? String(client.monthlyFee) : '',
      notes: client.notes,
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) {
      setFormError('Informe o nome do cliente.')
      return
    }

    setSaving(true)
    setFormError('')

    const payload = {
      name: form.name.trim(),
      cnpj: form.cnpj.trim(),
      partner_name: form.partnerName.trim(),
      partner_cpf: form.partnerCpf.trim(),
      regime: form.regime,
      has_payroll: form.hasPayroll,
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim(),
      monthly_fee: form.monthlyFee ? Number(form.monthlyFee.replace(',', '.')) || 0 : 0,
      notes: form.notes,
      status: form.status,
      updated_at: new Date().toISOString(),
    }

    if (editingId) {
      const { data, error } = await supabase.from('routine_clients').update(payload).eq('id', editingId).select('*').single()
      setSaving(false)
      if (error || !data) {
        setFormError('Não consegui salvar as alterações.')
        return
      }
      setClients(current => current.map(client => (client.id === editingId ? mapRow(data) : client)))
      setModalOpen(false)
      return
    }

    const { data, error } = await supabase.from('routine_clients').insert(payload).select('*').single()
    setSaving(false)
    if (error || !data) {
      setFormError('Não consegui cadastrar o cliente.')
      return
    }
    setClients(current => [...current, mapRow(data)].sort((a, b) => a.name.localeCompare(b.name)))
    setModalOpen(false)
  }

  async function handleDelete(client: ClientRow) {
    if (!window.confirm(`Excluir ${client.name}? Isso remove também as competências desse cliente.`)) return
    const { error } = await supabase.from('routine_clients').delete().eq('id', client.id)
    if (error) {
      window.alert('Não consegui excluir esse cliente agora.')
      return
    }
    setClients(current => current.filter(c => c.id !== client.id))
  }

  return (
    <>
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
          <div>
            <h1>Clientes</h1>
            <p>Gerencie seus clientes e acompanhe suas informações.</p>
          </div>
          <div className="clientes-nucleo-actions">
            <button type="button" className="clientes-nucleo-btn ghost" onClick={() => exportCsv(filtered)}>
              <Download size={15} aria-hidden />
              Exportar
            </button>
            <Link href="/disparazap" className="clientes-nucleo-btn ghost">
              <Send size={15} aria-hidden />
              Disparos
            </Link>
            <button type="button" className="clientes-nucleo-btn primary" onClick={openCreateModal}>
              <UserPlus size={15} aria-hidden />
              Novo cliente
            </button>
          </div>
        </div>

        <div className="clientes-nucleo-stats">
          <div className="clientes-nucleo-stat">
            <span className="clientes-nucleo-stat-icon"><Users size={18} aria-hidden /></span>
            <div>
              <span>Total de clientes</span>
              <strong>{stats.total}</strong>
              <small>
                <span className="ok">Ativos {stats.active}</span> · <span>Inativos {stats.inactive}</span>
              </small>
            </div>
          </div>
          <div className="clientes-nucleo-stat">
            <span className="clientes-nucleo-stat-icon"><UserPlus size={18} aria-hidden /></span>
            <div>
              <span>Clientes com folha</span>
              <strong>{stats.withPayroll}</strong>
              <small>{stats.payrollPct}% do total</small>
            </div>
          </div>
          <div className="clientes-nucleo-stat">
            <span className="clientes-nucleo-stat-icon"><Wallet size={18} aria-hidden /></span>
            <div>
              <span>Receita mensal recorrente</span>
              <strong>{formatCurrency(stats.recurringRevenue)}</strong>
              <small>Mensalidades cadastradas</small>
            </div>
          </div>
          <div className="clientes-nucleo-stat">
            <span className="clientes-nucleo-stat-icon"><Folder size={18} aria-hidden /></span>
            <div>
              <span>Anexos totais</span>
              <strong>{attachmentsTotal}</strong>
              <small>Documentos</small>
            </div>
          </div>
        </div>

        <div className="clientes-nucleo-toolbar">
          <div className="clientes-nucleo-search">
            <Search size={16} aria-hidden />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ, WhatsApp ou e-mail"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <select value={regimeFilter} onChange={event => setRegimeFilter(event.target.value as typeof regimeFilter)}>
            <option value="Todos">Todos os regimes</option>
            <option value="MEI">MEI</option>
            <option value="Simples Nacional">Simples Nacional</option>
          </select>
          <select value={folhaFilter} onChange={event => setFolhaFilter(event.target.value as typeof folhaFilter)}>
            <option value="Todos">Com ou sem folha</option>
            <option value="Com folha">Com folha</option>
            <option value="Sem folha">Sem folha</option>
          </select>
        </div>

        <div className="clientes-nucleo-table-wrap">
          {loading ? (
            <div className="admin-home-empty">Carregando clientes…</div>
          ) : loadError ? (
            <div className="admin-home-empty">{loadError}</div>
          ) : filtered.length === 0 ? (
            <div className="admin-home-empty">Nenhum cliente encontrado com esse filtro.</div>
          ) : (
            <table className="clientes-nucleo-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>CNPJ</th>
                  <th>Regime</th>
                  <th>Folha</th>
                  <th>E-mail</th>
                  <th>Mensalidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <tr key={client.id}>
                    <td>
                      <div className="clientes-nucleo-name-cell">
                        <span className="clientes-nucleo-avatar">{getInitials(client.name)}</span>
                        {client.name || 'Sem nome'}
                      </div>
                    </td>
                    <td>{client.cnpj || '—'}</td>
                    <td>
                      <span className={client.regime === 'Simples Nacional' ? 'clientes-nucleo-chip blue' : 'clientes-nucleo-chip neutral'}>
                        {client.regime}
                      </span>
                    </td>
                    <td>
                      <span className={client.hasPayroll ? 'clientes-nucleo-chip ok' : 'clientes-nucleo-chip muted'}>
                        {client.hasPayroll ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td>{client.email || '—'}</td>
                    <td>{formatCurrency(client.monthlyFee)}</td>
                    <td>
                      <div className="clientes-nucleo-row-actions">
                        <button type="button" aria-label={`Editar ${client.name}`} onClick={() => openEditModal(client)}>
                          <Pencil size={15} aria-hidden />
                        </button>
                        <button type="button" aria-label={`Excluir ${client.name}`} onClick={() => handleDelete(client)}>
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
      </div>

      {modalOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !saving && setModalOpen(false)}>
          <form
            className="clientes-nucleo-modal"
            onClick={event => event.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <div className="clientes-nucleo-modal-head">
              <h2>{editingId ? 'Editar cliente' : 'Novo cliente'}</h2>
              <button type="button" aria-label="Fechar" onClick={() => setModalOpen(false)}>
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="clientes-nucleo-modal-grid">
              <label className="span-2">
                Nome
                <input
                  type="text"
                  value={form.name}
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  required
                />
              </label>
              <label>
                CNPJ
                <input
                  type="text"
                  value={form.cnpj}
                  onChange={event => setForm(current => ({ ...current, cnpj: event.target.value }))}
                />
              </label>
              <label>
                Regime
                <select
                  value={form.regime}
                  onChange={event => setForm(current => ({ ...current, regime: event.target.value as Regime }))}
                >
                  <option value="MEI">MEI</option>
                  <option value="Simples Nacional">Simples Nacional</option>
                </select>
              </label>
              <label>
                Nome do sócio
                <input
                  type="text"
                  value={form.partnerName}
                  onChange={event => setForm(current => ({ ...current, partnerName: event.target.value }))}
                />
              </label>
              <label>
                CPF do sócio
                <input
                  type="text"
                  value={form.partnerCpf}
                  onChange={event => setForm(current => ({ ...current, partnerCpf: event.target.value }))}
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
              <label>
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                Mensalidade (R$)
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.monthlyFee}
                  onChange={event => setForm(current => ({ ...current, monthlyFee: event.target.value }))}
                />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={event => setForm(current => ({ ...current, status: event.target.value as ClientStatus }))}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.hasPayroll}
                  onChange={event => setForm(current => ({ ...current, hasPayroll: event.target.checked }))}
                />
                Possui folha de pagamento
              </label>
              <label className="span-2">
                Observações
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
