'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ChevronLeft, ChevronRight, Layers, Plus, Trash2, Users2, X } from 'lucide-react'
import {
  type RoutineClient,
  type RoutineClientCustomObligation,
  type RoutineCompetence,
  type RoutineCompetenceStatus,
  type RoutineDepartmentFilter,
  type RoutineItem,
  type RoutineRegime,
  ROUTINE_DEPARTMENTS,
  buildRoutineItemsPayload,
  formatRoutineCompetence,
  getRoutineCompetenceStatus,
  getRoutineDepartmentStatus,
  mapRoutineClient,
  mapRoutineCompetence,
  mapRoutineCustomObligation,
  mapRoutineItem,
  matchesRoutineDepartmentFilter,
  normalizeRoutineCompetenceMonth,
  shiftRoutineCompetenceMonth,
} from '@/lib/routine-engine'
import RoutineCompetenceDetail from '@/components/routine-competence-detail'

function statusToneClass(status: string) {
  if (status === 'Enviado') return 'ok'
  if (status === 'Anexado') return 'warn'
  if (status === 'Inacabado') return 'danger'
  return 'muted'
}

export default function AdminHomeCompetencias() {
  const [clients, setClients] = useState<RoutineClient[]>([])
  const [competences, setCompetences] = useState<RoutineCompetence[]>([])
  const [items, setItems] = useState<RoutineItem[]>([])
  const [customObligations, setCustomObligations] = useState<RoutineClientCustomObligation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [month, setMonth] = useState(() => normalizeRoutineCompetenceMonth(''))
  const [clientFilter, setClientFilter] = useState('Todos')
  const [regimeFilter, setRegimeFilter] = useState<'Todos' | RoutineRegime>('Todos')
  const [fiscalFilter, setFiscalFilter] = useState<RoutineDepartmentFilter>('Todos')
  const [dpFilter, setDpFilter] = useState<RoutineDepartmentFilter>('Todos')
  const [statusFilter, setStatusFilter] = useState<'Todos' | RoutineCompetenceStatus>('Todos')

  const [selectedCompetenceId, setSelectedCompetenceId] = useState<string | null>(null)

  const [newPeriodOpen, setNewPeriodOpen] = useState(false)
  const [newPeriodClientId, setNewPeriodClientId] = useState('')
  const [newPeriodError, setNewPeriodError] = useState('')
  const [newPeriodSaving, setNewPeriodSaving] = useState(false)

  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkClientIds, setBulkClientIds] = useState<string[]>([])
  const [bulkSaving, setBulkSaving] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const [clientsRes, competencesRes, itemsRes, obligationsRes] = await Promise.all([
      supabase.from('routine_clients').select('*').order('name', { ascending: true }),
      supabase.from('routine_competences').select('*').order('competence_month', { ascending: false }),
      supabase.from('routine_items').select('*').order('sort_order', { ascending: true }),
      supabase.from('routine_client_custom_obligations').select('*'),
    ])

    if (clientsRes.error || competencesRes.error || itemsRes.error) {
      setLoadError('Não consegui carregar as competências agora.')
      setLoading(false)
      return
    }

    setClients((clientsRes.data ?? []).map(mapRoutineClient))
    setCompetences((competencesRes.data ?? []).map(mapRoutineCompetence))
    setItems((itemsRes.data ?? []).map(mapRoutineItem))
    setCustomObligations((obligationsRes.data ?? []).map(mapRoutineCustomObligation))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const clientsWithCompetenceThisMonth = useMemo(
    () => new Set(competences.filter(c => c.competenceMonth === month).map(c => c.clientId)),
    [competences, month],
  )

  const eligibleClients = useMemo(
    () => clients.filter(client => !clientsWithCompetenceThisMonth.has(client.id)),
    [clients, clientsWithCompetenceThisMonth],
  )

  const monthRows = useMemo(() => {
    return competences
      .filter(c => c.competenceMonth === month)
      .map(competence => {
        const client = clients.find(c => c.id === competence.clientId)
        const competenceItems = items.filter(item => item.competenceId === competence.id)
        return { competence, client, items: competenceItems }
      })
      .filter((row): row is { competence: RoutineCompetence; client: RoutineClient; items: RoutineItem[] } => Boolean(row.client))
      .filter(row => {
        if (clientFilter !== 'Todos' && row.competence.clientId !== clientFilter) return false
        if (regimeFilter !== 'Todos' && row.client.regime !== regimeFilter) return false
        const fiscalStatus = getRoutineDepartmentStatus(row.client, row.items, 'Fiscal')
        if (!matchesRoutineDepartmentFilter(fiscalStatus, fiscalFilter)) return false
        const dpStatus = getRoutineDepartmentStatus(row.client, row.items, 'Departamento Pessoal')
        if (!matchesRoutineDepartmentFilter(dpStatus, dpFilter)) return false
        const overall = getRoutineCompetenceStatus(row.client, row.items)
        if (statusFilter !== 'Todos' && overall !== statusFilter) return false
        return true
      })
      .sort((a, b) => a.client.name.localeCompare(b.client.name))
  }, [competences, items, clients, month, clientFilter, regimeFilter, fiscalFilter, dpFilter, statusFilter])

  const selected = useMemo(() => {
    if (!selectedCompetenceId) return null
    const competence = competences.find(c => c.id === selectedCompetenceId)
    if (!competence) return null
    const client = clients.find(c => c.id === competence.clientId)
    if (!client) return null
    const competenceItems = items.filter(item => item.competenceId === competence.id)
    return { competence, client, items: competenceItems }
  }, [selectedCompetenceId, competences, clients, items])

  async function createCompetenceForClient(client: RoutineClient, monthValue: string) {
    const normalizedMonth = normalizeRoutineCompetenceMonth(monthValue)
    const alreadyExists = competences.some(c => c.clientId === client.id && c.competenceMonth === normalizedMonth)
    if (alreadyExists) {
      throw new Error('Essa empresa já tem rotinas cadastradas nessa competência.')
    }

    const { data: competenceRow, error: competenceError } = await supabase
      .from('routine_competences')
      .insert({ client_id: client.id, competence_month: normalizedMonth, updated_at: new Date().toISOString() })
      .select('*')
      .single()

    if (competenceError || !competenceRow) {
      throw new Error('Não consegui criar a competência.')
    }

    const newCompetence = mapRoutineCompetence(competenceRow)
    const itemsPayload = buildRoutineItemsPayload(client, newCompetence.id, customObligations)

    let newItems: RoutineItem[] = []
    if (itemsPayload.length > 0) {
      const { data: itemRows, error: itemsError } = await supabase.from('routine_items').insert(itemsPayload).select('*')
      if (itemsError) {
        throw new Error('Competência criada, mas não consegui gerar as rotinas.')
      }
      newItems = (itemRows ?? []).map(mapRoutineItem)
    }

    setCompetences(current => [newCompetence, ...current])
    setItems(current => [...current, ...newItems])
    return newCompetence
  }

  async function handleCreateSinglePeriod(event: React.FormEvent) {
    event.preventDefault()
    const client = clients.find(c => c.id === newPeriodClientId)
    if (!client) {
      setNewPeriodError('Selecione um cliente.')
      return
    }
    setNewPeriodSaving(true)
    setNewPeriodError('')
    try {
      const competence = await createCompetenceForClient(client, month)
      setNewPeriodOpen(false)
      setNewPeriodClientId('')
      setSelectedCompetenceId(competence.id)
    } catch (error) {
      setNewPeriodError(error instanceof Error ? error.message : 'Não consegui criar a competência.')
    } finally {
      setNewPeriodSaving(false)
    }
  }

  async function handleCreateBulkPeriods() {
    if (bulkClientIds.length === 0) {
      setBulkOpen(false)
      return
    }
    setBulkSaving(true)

    const missing = bulkClientIds.filter(id => !clientsWithCompetenceThisMonth.has(id))
    if (missing.length === 0) {
      setBulkSaving(false)
      setBulkOpen(false)
      setBulkClientIds([])
      return
    }

    const normalizedMonth = normalizeRoutineCompetenceMonth(month)
    const payload = missing.map(id => ({ client_id: id, competence_month: normalizedMonth, updated_at: new Date().toISOString() }))
    const { data: competenceRows, error: competenceError } = await supabase.from('routine_competences').insert(payload).select('*')

    if (competenceError || !competenceRows) {
      setBulkSaving(false)
      window.alert('Não consegui criar as competências em massa.')
      return
    }

    const newCompetences = competenceRows.map(mapRoutineCompetence)
    const itemsPayload = newCompetences.flatMap(competence => {
      const client = clients.find(c => c.id === competence.clientId)
      if (!client) return []
      return buildRoutineItemsPayload(client, competence.id, customObligations)
    })

    let newItems: RoutineItem[] = []
    if (itemsPayload.length > 0) {
      const { data: itemRows } = await supabase.from('routine_items').insert(itemsPayload).select('*')
      newItems = (itemRows ?? []).map(mapRoutineItem)
    }

    setCompetences(current => [...newCompetences, ...current])
    setItems(current => [...current, ...newItems])
    setBulkSaving(false)
    setBulkOpen(false)
    setBulkClientIds([])
  }

  async function handleDeleteCompetence(competence: RoutineCompetence, clientName: string) {
    if (!window.confirm(`Excluir a competência de ${clientName}? Isso remove também as rotinas desse período.`)) return
    const { error } = await supabase.from('routine_competences').delete().eq('id', competence.id)
    if (error) {
      window.alert('Não consegui excluir essa competência agora.')
      return
    }
    setCompetences(current => current.filter(c => c.id !== competence.id))
    setItems(current => current.filter(item => item.competenceId !== competence.id))
    if (selectedCompetenceId === competence.id) setSelectedCompetenceId(null)
  }

  function handleItemsChanged(nextItems: RoutineItem[]) {
    setItems(current => {
      const byId = new Map(current.map(item => [item.id, item]))
      nextItems.forEach(item => byId.set(item.id, item))
      return Array.from(byId.values())
    })
  }

  function handleObligationsChanged(next: RoutineClientCustomObligation[]) {
    setCustomObligations(next)
  }

  if (selected) {
    return (
      <RoutineCompetenceDetail
        competence={selected.competence}
        client={selected.client}
        items={selected.items}
        customObligations={customObligations.filter(o => o.clientId === selected.client.id)}
        onBack={() => setSelectedCompetenceId(null)}
        onItemsChanged={handleItemsChanged}
        onObligationsChanged={obligations =>
          handleObligationsChanged([...customObligations.filter(o => o.clientId !== selected.client.id), ...obligations])
        }
      />
    )
  }

  return (
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
        <div>
          <h1>Competências</h1>
          <p>Rotinas mensais por cliente, geradas a partir do regime e das obrigações de cada um.</p>
        </div>
        <div className="clientes-nucleo-actions">
          <button type="button" className="clientes-nucleo-btn ghost" onClick={() => setBulkOpen(true)}>
            <Users2 size={15} aria-hidden />
            Processar em massa
          </button>
          <button type="button" className="clientes-nucleo-btn primary" onClick={() => setNewPeriodOpen(true)}>
            <Plus size={15} aria-hidden />
            Novo período
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
        <select value={clientFilter} onChange={event => setClientFilter(event.target.value)}>
          <option value="Todos">Todos os clientes</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <select value={regimeFilter} onChange={event => setRegimeFilter(event.target.value as typeof regimeFilter)}>
          <option value="Todos">Todos os regimes</option>
          <option value="MEI">MEI</option>
          <option value="Simples Nacional">Simples Nacional</option>
        </select>
        <select value={fiscalFilter} onChange={event => setFiscalFilter(event.target.value as RoutineDepartmentFilter)}>
          <option value="Todos">Fiscal: todos</option>
          <option value="Feito">Fiscal: feito</option>
          <option value="Pendente">Fiscal: pendente</option>
          <option value="Não se aplica">Fiscal: não se aplica</option>
        </select>
        <select value={dpFilter} onChange={event => setDpFilter(event.target.value as RoutineDepartmentFilter)}>
          <option value="Todos">DP: todos</option>
          <option value="Feito">DP: feito</option>
          <option value="Pendente">DP: pendente</option>
          <option value="Não se aplica">DP: não se aplica</option>
        </select>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="Todos">Status: todos</option>
          <option value="Enviado">Status: enviado</option>
          <option value="Inacabado">Status: inacabado</option>
        </select>
      </div>

      <div className="clientes-nucleo-table-wrap">
        {loading ? (
          <div className="admin-home-empty">Carregando competências…</div>
        ) : loadError ? (
          <div className="admin-home-empty">{loadError}</div>
        ) : monthRows.length === 0 ? (
          <div className="admin-home-empty">Nenhuma competência lançada para {formatRoutineCompetence(month)} com esse filtro.</div>
        ) : (
          <table className="clientes-nucleo-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Regime</th>
                <th>Fiscal</th>
                <th>Departamento Pessoal</th>
                <th>Geral</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {monthRows.map(row => {
                const fiscalStatus = getRoutineDepartmentStatus(row.client, row.items, 'Fiscal')
                const dpStatus = getRoutineDepartmentStatus(row.client, row.items, 'Departamento Pessoal')
                const overall = getRoutineCompetenceStatus(row.client, row.items)
                return (
                  <tr key={row.competence.id}>
                    <td>
                      <div className="clientes-nucleo-name-cell">
                        <span className="clientes-nucleo-avatar">{row.client.name.slice(0, 2).toUpperCase() || '?'}</span>
                        {row.client.name}
                      </div>
                    </td>
                    <td>{row.client.regime}</td>
                    <td>
                      <span className={`clientes-nucleo-chip ${statusToneClass(fiscalStatus)}`}>{fiscalStatus}</span>
                    </td>
                    <td>
                      <span className={`clientes-nucleo-chip ${statusToneClass(dpStatus)}`}>{dpStatus}</span>
                    </td>
                    <td>
                      <span className={`clientes-nucleo-chip ${statusToneClass(overall)}`}>{overall}</span>
                    </td>
                    <td>
                      <div className="clientes-nucleo-row-actions">
                        <button
                          type="button"
                          className="routine-open-btn"
                          onClick={() => setSelectedCompetenceId(row.competence.id)}
                        >
                          <Layers size={14} aria-hidden />
                          Abrir
                        </button>
                        <button
                          type="button"
                          aria-label={`Excluir competência de ${row.client.name}`}
                          onClick={() => handleDeleteCompetence(row.competence, row.client.name)}
                        >
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

      {newPeriodOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !newPeriodSaving && setNewPeriodOpen(false)}>
          <form className="clientes-nucleo-modal" onClick={event => event.stopPropagation()} onSubmit={handleCreateSinglePeriod}>
            <div className="clientes-nucleo-modal-head">
              <h2>Novo período</h2>
              <button type="button" aria-label="Fechar" onClick={() => setNewPeriodOpen(false)}>
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="clientes-nucleo-modal-grid">
              <label className="span-2">
                Cliente
                <select value={newPeriodClientId} onChange={event => setNewPeriodClientId(event.target.value)} required>
                  <option value="">Selecione um cliente</option>
                  {eligibleClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="span-2">
                Competência
                <input type="text" value={formatRoutineCompetence(month)} readOnly disabled />
              </label>
            </div>
            {newPeriodError && <p className="clientes-nucleo-modal-error">{newPeriodError}</p>}
            <div className="clientes-nucleo-modal-foot">
              <button type="button" className="clientes-nucleo-btn ghost" onClick={() => setNewPeriodOpen(false)} disabled={newPeriodSaving}>
                Cancelar
              </button>
              <button type="submit" className="clientes-nucleo-btn primary" disabled={newPeriodSaving}>
                {newPeriodSaving ? 'Criando…' : 'Criar período'}
              </button>
            </div>
          </form>
        </div>
      )}

      {bulkOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !bulkSaving && setBulkOpen(false)}>
          <div className="clientes-nucleo-modal" onClick={event => event.stopPropagation()}>
            <div className="clientes-nucleo-modal-head">
              <h2>Processar em massa — {formatRoutineCompetence(month)}</h2>
              <button type="button" aria-label="Fechar" onClick={() => setBulkOpen(false)}>
                <X size={18} aria-hidden />
              </button>
            </div>
            <p className="routine-bulk-hint">
              Clientes que já têm competência em {formatRoutineCompetence(month)} são pulados automaticamente.
            </p>
            <div className="routine-bulk-list">
              {clients.map(client => {
                const hasAlready = clientsWithCompetenceThisMonth.has(client.id)
                const checked = bulkClientIds.includes(client.id)
                return (
                  <label key={client.id} className={hasAlready ? 'routine-bulk-item disabled' : 'routine-bulk-item'}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={hasAlready}
                      onChange={event => {
                        setBulkClientIds(current =>
                          event.target.checked ? [...current, client.id] : current.filter(id => id !== client.id),
                        )
                      }}
                    />
                    <span>{client.name}</span>
                    {hasAlready && <span className="clientes-nucleo-chip muted">já tem período</span>}
                  </label>
                )
              })}
            </div>
            <div className="clientes-nucleo-modal-foot">
              <button
                type="button"
                className="clientes-nucleo-btn ghost"
                onClick={() => setBulkClientIds(eligibleClients.map(c => c.id))}
                disabled={bulkSaving}
              >
                Selecionar todos elegíveis
              </button>
              <button type="button" className="clientes-nucleo-btn primary" onClick={handleCreateBulkPeriods} disabled={bulkSaving}>
                {bulkSaving ? 'Processando…' : `Criar para ${bulkClientIds.length} cliente(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
