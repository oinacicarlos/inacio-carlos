'use client'

import { type FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Search, Send } from 'lucide-react'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ClientOption = { id: string; name: string; email: string }

export default function EmailIndividual({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'client' | 'manual'>('client')
  const [clients, setClients] = useState<ClientOption[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')

  const [manualName, setManualName] = useState('')
  const [manualEmail, setManualEmail] = useState('')

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const recipientEmail = mode === 'client' ? clients.find(c => c.id === selectedClientId)?.email ?? '' : manualEmail.trim()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!EMAIL_PATTERN.test(recipientEmail)) {
      setError('Selecione ou informe um e-mail válido.')
      return
    }
    if (!subject.trim() || !body.trim()) {
      setError('Preencha assunto e mensagem.')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/marketing/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipientEmail, subject, text: body }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) {
        setError(data.error || 'Não consegui enviar o e-mail.')
        return
      }
      setSuccess(`E-mail enviado para ${recipientEmail}.`)
      setSubject('')
      setBody('')
    } catch {
      setError('Não consegui enviar o e-mail agora.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="disparos-panel" onSubmit={handleSubmit}>
      <button type="button" className="module-soon-back disparos-back" onClick={onBack}>
        <ArrowLeft size={15} aria-hidden />
        Voltar
      </button>

      <h2>E-mail individual</h2>
      <p className="disparos-panel-hint">Envie um e-mail avulso para um cliente ou para um endereço digitado na hora.</p>

      <div className="disparos-tabs">
        <button type="button" className={mode === 'client' ? 'disparos-tab active' : 'disparos-tab'} onClick={() => setMode('client')}>
          Buscar cliente
        </button>
        <button type="button" className={mode === 'manual' ? 'disparos-tab active' : 'disparos-tab'} onClick={() => setMode('manual')}>
          Digitar manualmente
        </button>
      </div>

      {mode === 'client' ? (
        <div className="disparos-field-group">
          <div className="clientes-nucleo-search">
            <Search size={16} aria-hidden />
            <input type="text" placeholder="Buscar por nome ou e-mail" value={clientSearch} onChange={event => setClientSearch(event.target.value)} />
          </div>
          <div className="disparos-client-list">
            {filteredClients.length === 0 ? (
              <p className="routine-department-empty">Nenhum cliente com e-mail cadastrado encontrado.</p>
            ) : (
              filteredClients.map(client => (
                <label key={client.id} className="routine-bulk-item">
                  <input type="radio" name="client" checked={selectedClientId === client.id} onChange={() => setSelectedClientId(client.id)} />
                  <span>
                    {client.name} <span className="disparos-muted">· {client.email}</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="clientes-nucleo-modal-grid disparos-field-group">
          <label>
            Nome
            <input type="text" value={manualName} onChange={event => setManualName(event.target.value)} />
          </label>
          <label>
            E-mail
            <input type="email" value={manualEmail} onChange={event => setManualEmail(event.target.value)} />
          </label>
        </div>
      )}

      <label className="routine-email-field">
        Assunto
        <input type="text" value={subject} onChange={event => setSubject(event.target.value)} />
      </label>
      <label className="routine-email-field">
        Mensagem
        <textarea rows={8} value={body} onChange={event => setBody(event.target.value)} />
      </label>

      {error && <p className="clientes-nucleo-modal-error">{error}</p>}
      {success && <p className="routine-email-success">{success}</p>}

      <div className="routine-email-actions">
        <span className="routine-email-to">Para: {recipientEmail || 'selecione um destinatário'}</span>
        <button type="submit" className="clientes-nucleo-btn primary" disabled={sending}>
          <Send size={14} aria-hidden />
          {sending ? 'Enviando…' : 'Enviar e-mail'}
        </button>
      </div>
    </form>
  )
}
