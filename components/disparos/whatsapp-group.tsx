'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import ContactsImport from '@/components/disparos/contacts-import'

const WHATSAPP_CAMPAIGN_TEST_CAP = 5

type Template = {
  name: string
  status: string
  category: string
  language: string
  body: string
  bodyVariableCount: number
}

type ValidateRow = { name: string; phone: string; situation: string; error: string | null }

type RecipientResult = {
  id: string
  name: string
  phone: string
  status: string
  error_message: string | null
}

export default function WhatsappGroup({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('')
  const [contactsText, setContactsText] = useState('')

  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templatesError, setTemplatesError] = useState('')
  const [templateKey, setTemplateKey] = useState('')

  const [validateSummary, setValidateSummary] = useState<{ totalImported: number; ready: number; invalid: number; duplicates: number; optouts: number } | null>(null)
  const [validateRows, setValidateRows] = useState<ValidateRow[]>([])
  const [validating, setValidating] = useState(false)

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [results, setResults] = useState<RecipientResult[]>([])
  const [done, setDone] = useState(false)

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

  useEffect(() => {
    if (!contactsText.trim()) {
      setValidateSummary(null)
      setValidateRows([])
      return
    }
    const timeout = setTimeout(async () => {
      setValidating(true)
      try {
        const response = await fetch('/api/whatsapp/contacts/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contactsText }),
        })
        const data = await response.json()
        if (response.ok && data.ok) {
          setValidateSummary(data.summary)
          setValidateRows(data.rows)
        }
      } catch {
        // silent — validation is a live preview, not a hard requirement
      } finally {
        setValidating(false)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [contactsText])

  const selectedTemplate = templates.find(t => `${t.name}__${t.language}` === templateKey) ?? null

  async function handleCreateAndStart() {
    setError('')
    if (!name.trim()) {
      setError('Dê um nome para a campanha.')
      return
    }
    if (!selectedTemplate) {
      setError('Selecione um template aprovado.')
      return
    }
    if (!validateSummary || validateSummary.ready < 1) {
      setError('Cole ao menos um contato válido.')
      return
    }
    if (validateSummary.ready > WHATSAPP_CAMPAIGN_TEST_CAP) {
      setError(`Trava ativa: use até ${WHATSAPP_CAMPAIGN_TEST_CAP} contatos aptos por campanha.`)
      return
    }

    setCreating(true)
    try {
      const createResponse = await fetch('/api/whatsapp/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          templateName: selectedTemplate.name,
          templateLanguage: selectedTemplate.language,
          templateCategory: selectedTemplate.category,
          contactsText,
        }),
      })
      const createData = await createResponse.json()
      if (!createResponse.ok || !createData.ok) {
        setError(createData.error || 'Não consegui criar a campanha.')
        setCreating(false)
        return
      }

      const id = createData.campaign.id as string
      setCampaignId(id)

      const startResponse = await fetch(`/api/whatsapp/campaigns/${id}/start`, { method: 'POST' })
      const startData = await startResponse.json()
      if (!startResponse.ok || !startData.ok) {
        setError(startData.error || 'Campanha criada, mas não consegui disparar.')
        setCreating(false)
        return
      }

      const detailResponse = await fetch(`/api/whatsapp/campaigns/${id}`)
      const detailData = await detailResponse.json()
      if (detailResponse.ok && detailData.ok) {
        setResults(detailData.recipients)
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
        <h2>Campanha disparada</h2>
        <div className="clientes-nucleo-table-wrap">
          <table className="clientes-nucleo-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map(recipient => (
                <tr key={recipient.id}>
                  <td>{recipient.name}</td>
                  <td>{recipient.phone}</td>
                  <td>
                    <span
                      className={`clientes-nucleo-chip ${
                        recipient.status === 'sent' || recipient.status === 'delivered' || recipient.status === 'read'
                          ? 'ok'
                          : recipient.status === 'failed'
                            ? 'danger'
                            : 'muted'
                      }`}
                    >
                      {recipient.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="clientes-nucleo-btn primary" onClick={onBack} style={{ marginTop: 16 }}>
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

      <h2>WhatsApp em grupo</h2>
      <p className="disparos-panel-hint">
        Campanha por template para vários contatos de uma vez. Trava ativa: até {WHATSAPP_CAMPAIGN_TEST_CAP} contatos aptos por campanha.
      </p>

      <label className="routine-email-field">
        Nome da campanha
        <input type="text" value={name} onChange={event => setName(event.target.value)} />
      </label>

      <ContactsImport
        firstColumnLabel="Nome"
        secondColumnLabel="Telefone"
        secondColumnAliases={['telefone', 'phone', 'celular', 'whatsapp']}
        exampleRows={[
          ['João da Silva', '21999999999'],
          ['Maria Souza', '5521988887777'],
        ]}
        fileBaseName="modelo_disparos_whatsapp"
        value={contactsText}
        onChange={setContactsText}
      />

      {validating && <span className="disparos-muted">Validando…</span>}

      {validateSummary && (
        <div className="disparos-summary">
          <span>{validateSummary.ready} pronto(s)</span>
          <span>{validateSummary.invalid} inválido(s)</span>
          <span>{validateSummary.duplicates} duplicado(s)</span>
          <span>{validateSummary.optouts} opt-out</span>
        </div>
      )}

      {validateRows.length > 0 && (
        <div className="clientes-nucleo-table-wrap">
          <table className="clientes-nucleo-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {validateRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.name}</td>
                  <td>{row.phone}</td>
                  <td>
                    <span className={`clientes-nucleo-chip ${row.situation === 'ready' ? 'ok' : row.situation === 'invalid' ? 'danger' : 'muted'}`}>
                      {row.situation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <select value={templateKey} onChange={event => setTemplateKey(event.target.value)}>
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

      {error && <p className="clientes-nucleo-modal-error">{error}</p>}

      <div className="routine-email-actions">
        <span className="routine-email-to">{validateSummary?.ready ?? 0} destinatário(s) vão receber</span>
        <button type="button" className="clientes-nucleo-btn primary" onClick={handleCreateAndStart} disabled={creating}>
          <Send size={14} aria-hidden />
          {creating ? 'Enviando…' : 'Criar e disparar'}
        </button>
      </div>
    </div>
  )
}
