'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Search, Send } from 'lucide-react'

type Template = {
  name: string
  status: string
  category: string
  language: string
  body: string
  bodyVariableCount: number
}

type ClientOption = { id: string; name: string; whatsapp: string }

function extractErrorMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message)
  return 'Não consegui enviar a mensagem.'
}

export default function WhatsappIndividual({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'client' | 'manual'>('client')
  const [clients, setClients] = useState<ClientOption[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')

  const [manualName, setManualName] = useState('')
  const [manualPhone, setManualPhone] = useState('')

  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templatesError, setTemplatesError] = useState('')
  const [templateKey, setTemplateKey] = useState('')
  const [variables, setVariables] = useState<string[]>([])

  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase.from('routine_clients').select('id,name,whatsapp')
      const options = (data ?? [])
        .filter((row: { whatsapp: string | null }) => row.whatsapp)
        .map((row: { id: string; name: string; whatsapp: string }) => ({ id: row.id, name: row.name, whatsapp: row.whatsapp }))
      setClients(options)
    }
    loadClients()
  }, [])

  useEffect(() => {
    async function loadTemplates() {
      setTemplatesLoading(true)
      setTemplatesError('')
      try {
        const response = await fetch('/api/whatsapp/templates')
        const data = await response.json()
        if (!response.ok || !data.ok) {
          setTemplatesError(
            data.error === 'unauthorized' || data.error === 'forbidden'
              ? 'Sua sessão não tem acesso aos templates do WhatsApp.'
              : 'Não consegui carregar os templates.',
          )
          return
        }
        setTemplates((data.templates as Template[]).filter(template => template.status === 'APPROVED'))
      } catch {
        setTemplatesError('Não consegui carregar os templates.')
      } finally {
        setTemplatesLoading(false)
      }
    }
    loadTemplates()
  }, [])

  const filteredClients = clients.filter(client => {
    const term = clientSearch.trim().toLowerCase()
    if (!term) return true
    return client.name.toLowerCase().includes(term)
  })

  const contactName = mode === 'client' ? clients.find(c => c.id === selectedClientId)?.name ?? '' : manualName
  const recipientPhone = mode === 'client' ? clients.find(c => c.id === selectedClientId)?.whatsapp ?? '' : manualPhone

  const selectedTemplate = useMemo(() => templates.find(t => `${t.name}__${t.language}` === templateKey) ?? null, [templates, templateKey])

  function handleSelectTemplate(key: string) {
    setTemplateKey(key)
    const template = templates.find(t => `${t.name}__${t.language}` === key)
    const count = template?.bodyVariableCount ?? 0
    setVariables(Array.from({ length: count }, (_, index) => (index === 0 ? contactName : '')))
  }

  async function handleSend() {
    setError('')
    setSuccess('')

    if (!recipientPhone.trim()) {
      setError('Informe o telefone do destinatário.')
      return
    }
    if (!selectedTemplate) {
      setError('Selecione um template aprovado.')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientPhone,
          templateName: selectedTemplate.name,
          languageCode: selectedTemplate.language,
          bodyParameters: variables,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) {
        setError(extractErrorMessage(data.error))
        return
      }
      setSuccess('Mensagem enviada.')
    } catch {
      setError('Não consegui enviar a mensagem agora.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="disparos-panel">
      <button type="button" className="module-soon-back disparos-back" onClick={onBack}>
        <ArrowLeft size={15} aria-hidden />
        Voltar
      </button>

      <h2>WhatsApp individual</h2>
      <p className="disparos-panel-hint">Envie uma mensagem por template para um contato específico.</p>

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
            <input type="text" placeholder="Buscar por nome" value={clientSearch} onChange={event => setClientSearch(event.target.value)} />
          </div>
          <div className="disparos-client-list">
            {filteredClients.length === 0 ? (
              <p className="routine-department-empty">Nenhum cliente com WhatsApp cadastrado encontrado.</p>
            ) : (
              filteredClients.map(client => (
                <label key={client.id} className="routine-bulk-item">
                  <input type="radio" name="wa-client" checked={selectedClientId === client.id} onChange={() => setSelectedClientId(client.id)} />
                  <span>{client.name}</span>
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
            Telefone
            <input type="text" value={manualPhone} onChange={event => setManualPhone(event.target.value)} placeholder="DDD + número" />
          </label>
        </div>
      )}

      <div className="clientes-nucleo-modal-grid">
        <label className="routine-email-field">
          Template
          {templatesLoading ? (
            <span className="disparos-muted">Carregando templates…</span>
          ) : templatesError ? (
            <span className="clientes-nucleo-modal-error">{templatesError}</span>
          ) : (
            <select value={templateKey} onChange={event => handleSelectTemplate(event.target.value)}>
              <option value="">Selecione um template aprovado</option>
              {templates.map(template => (
                <option key={`${template.name}__${template.language}`} value={`${template.name}__${template.language}`}>
                  {template.name} · {template.language}
                </option>
              ))}
            </select>
          )}
        </label>
        <label className="routine-email-field">
          Idioma
          <input type="text" value={selectedTemplate?.language ?? ''} readOnly disabled placeholder="Selecione um template" />
        </label>
      </div>

      {selectedTemplate && (
        <div className="disparos-template-preview">
          <p>{selectedTemplate.body}</p>
        </div>
      )}

      {variables.length > 0 && (
        <div className="disparos-field-group">
          {variables.map((value, index) => (
            <label key={index} className="routine-email-field">
              Variável {`{{${index + 1}}}`}
              <input
                type="text"
                value={value}
                onChange={event =>
                  setVariables(current => current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
                }
              />
            </label>
          ))}
        </div>
      )}

      {error && <p className="clientes-nucleo-modal-error">{error}</p>}
      {success && <p className="routine-email-success">{success}</p>}

      <div className="routine-email-actions">
        <span className="routine-email-to">Para: {recipientPhone || 'selecione um destinatário'}</span>
        <button type="button" className="clientes-nucleo-btn primary" onClick={handleSend} disabled={sending}>
          <Send size={14} aria-hidden />
          {sending ? 'Enviando…' : 'Enviar mensagem'}
        </button>
      </div>
    </div>
  )
}
