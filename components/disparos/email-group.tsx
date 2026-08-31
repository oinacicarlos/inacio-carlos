'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Search, Send } from 'lucide-react'
import { parseEmailContactsText } from '@/lib/email/contacts'
import ContactsImport from '@/components/disparos/contacts-import'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ClientOption = { id: string; name: string; email: string }

type RecipientResult = { id: string; name: string; email: string; status: string; error_message: string | null }

export default function EmailGroup({ onBack }: { onBack: () => void }) {
  const [source, setSource] = useState<'clientes' | 'lista'>('clientes')
  const [clients, setClients] = useState<ClientOption[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [pastedText, setPastedText] = useState('')

  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [progress, setProgress] = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [results, setResults] = useState<RecipientResult[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase.from('routine_clients').select('id,name,email')
      const options = (data ?? [])
        .filter((row: { email: string | null }) => row.email && EMAIL_PATTERN.test(row.email))
        .map((row: { id: string; name: string; email: string }) => ({ id: row.id, name: row.name, email: row.email }))
      setClients(options)
    }
    loadClients()
  }, [])

  const filteredClients = clients.filter(client => {
    const term = clientSearch.trim().toLowerCase()
    if (!term) return true
    return client.name.toLowerCase().includes(term) || client.email.toLowerCase().includes(term)
  })

  const contactsText =
    source === 'clientes'
      ? clients
          .filter(client => selectedClientIds.includes(client.id))
          .map(client => `${client.name},${client.email}`)
          .join('\n')
      : pastedText

  const parsed = parseEmailContactsText(contactsText)
  const sendableCount = parsed.filter(contact => contact.valid).length
  const invalidCount = parsed.filter(contact => !contact.normalizedEmail || !contact.name).length
  const duplicateCount = parsed.filter(contact => contact.duplicate).length

  async function handleCreateAndSend() {
    setError('')
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setError('Preencha nome da campanha, assunto e mensagem.')
      return
    }
    if (sendableCount < 1) {
      setError('Selecione ou cole ao menos um contato válido.')
      return
    }

    setCreating(true)
    try {
      const createResponse = await fetch('/api/marketing/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, body, contactsText }),
      })
      const createData = await createResponse.json()
      if (!createResponse.ok || !createData.ok) {
        setError(createData.error || 'Não consegui criar a campanha.')
        setCreating(false)
        return
      }

      const id = createData.campaign.id as string
      setCampaignId(id)
      const total = createData.campaign.total_contacts as number
      setProgress({ sent: 0, failed: 0, total })

      let finished = false
      let sentTotal = 0
      let failedTotal = 0
      while (!finished) {
        const startResponse = await fetch(`/api/marketing/email/campaigns/${id}/start`, { method: 'POST' })
        const startData = await startResponse.json()
        if (!startResponse.ok || !startData.ok) {
          setError(startData.error || 'Não consegui processar o envio.')
          break
        }
        sentTotal += startData.processed.sent
        failedTotal += startData.processed.failed
        setProgress({ sent: sentTotal, failed: failedTotal, total })
        finished = startData.finished
      }

      setDone(true)
    } catch {
      setError('Não consegui processar essa campanha agora.')
    } finally {
      setCreating(false)
    }
  }

  if (done && campaignId) {
    return (
      <div className="disparos-panel">
        <button type="button" className="module-soon-back disparos-back" onClick={onBack}>
          <ArrowLeft size={15} aria-hidden />
          Voltar
        </button>
        <h2>Campanha enviada</h2>
        <p className="disparos-panel-hint">
          {progress?.sent ?? 0} enviado(s), {progress?.failed ?? 0} falha(s) de {progress?.total ?? 0} destinatário(s).
        </p>
        <button type="button" className="clientes-nucleo-btn primary" onClick={onBack}>
          Concluir
        </button>
      </div>
    )
  }

  return (
    <div className="disparos-panel">
      <button type="button" className="module-soon-back disparos-back" onClick={onBack}>
        <ArrowLeft size={15} aria-hidden />
        Voltar
      </button>

      <h2>E-mail em grupo</h2>
      <p className="disparos-panel-hint">Envie o mesmo e-mail para vários clientes, com histórico salvo.</p>

      <label className="routine-email-field">
        Nome da campanha
        <input type="text" value={name} onChange={event => setName(event.target.value)} />
      </label>

      <div className="disparos-tabs">
        <button type="button" className={source === 'clientes' ? 'disparos-tab active' : 'disparos-tab'} onClick={() => setSource('clientes')}>
          Selecionar clientes
        </button>
        <button type="button" className={source === 'lista' ? 'disparos-tab active' : 'disparos-tab'} onClick={() => setSource('lista')}>
          Colar lista
        </button>
      </div>

      {source === 'clientes' ? (
        <div className="disparos-field-group">
          <div className="clientes-nucleo-search">
            <Search size={16} aria-hidden />
            <input type="text" placeholder="Buscar por nome ou e-mail" value={clientSearch} onChange={event => setClientSearch(event.target.value)} />
          </div>
          <div className="routine-bulk-list disparos-client-list">
            {filteredClients.map(client => (
              <label key={client.id} className="routine-bulk-item">
                <input
                  type="checkbox"
                  checked={selectedClientIds.includes(client.id)}
                  onChange={event =>
                    setSelectedClientIds(current =>
                      event.target.checked ? [...current, client.id] : current.filter(id => id !== client.id),
                    )
                  }
                />
                <span>
                  {client.name} <span className="disparos-muted">· {client.email}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <ContactsImport
          firstColumnLabel="Nome"
          secondColumnLabel="E-mail"
          secondColumnAliases={['email', 'e-mail', 'mail']}
          exampleRows={[
            ['João da Silva', 'joao@exemplo.com'],
            ['Maria Souza', 'maria@exemplo.com'],
          ]}
          fileBaseName="modelo_disparos_email"
          value={pastedText}
          onChange={setPastedText}
        />
      )}

      <label className="routine-email-field">
        Assunto
        <input type="text" value={subject} onChange={event => setSubject(event.target.value)} />
      </label>
      <label className="routine-email-field">
        Mensagem
        <textarea rows={7} value={body} onChange={event => setBody(event.target.value)} />
      </label>

      <div className="disparos-summary">
        <span>{sendableCount} pronto(s)</span>
        <span>{invalidCount} inválido(s)</span>
        <span>{duplicateCount} duplicado(s)</span>
      </div>

      {error && <p className="clientes-nucleo-modal-error">{error}</p>}
      {progress && !done && (
        <p className="routine-email-success">
          Enviando… {progress.sent + progress.failed} de {progress.total}
        </p>
      )}

      <div className="routine-email-actions">
        <span className="routine-email-to">{sendableCount} destinatário(s) vão receber</span>
        <button type="button" className="clientes-nucleo-btn primary" onClick={handleCreateAndSend} disabled={creating}>
          <Send size={14} aria-hidden />
          {creating ? 'Enviando…' : 'Criar e enviar'}
        </button>
      </div>
    </div>
  )
}
