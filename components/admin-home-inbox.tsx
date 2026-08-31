'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Search, Send } from 'lucide-react'

type Conversation = {
  id: string
  phone: string
  name: string | null
  last_message_text: string | null
  last_message_at: string | null
  unread_count: number
  status: string
  interested: boolean
  opted_out: boolean
  customer_service_window_expires_at: string | null
}

type InboxMessage = {
  id: string
  direction: 'inbound' | 'outbound'
  type: string
  text: string | null
  button_text: string | null
  template_name: string | null
  status: string | null
  meta_timestamp: string | null
  created_at: string
}

type Filter = 'all' | 'unread' | 'interested' | 'optout'

function formatRelativeTime(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Agora'
  if (diffMin < 60) return `Há ${diffMin}m`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `Há ${diffHour}h`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function getMessageText(message: InboxMessage) {
  if (message.text) return message.text
  if (message.button_text) return message.button_text
  if (message.template_name) return `Template: ${message.template_name}`
  return message.type === 'unsupported' ? 'Mensagem não suportada' : 'Mensagem'
}

function getWindowState(expiresAt: string | null) {
  if (!expiresAt) return { active: false, label: 'Janela encerrada', detail: '' }
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return { active: false, label: 'Janela encerrada', detail: '' }
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return { active: true, label: 'Janela de atendimento ativa', detail: `${hours}h ${minutes}min restantes` }
}

export default function AdminHomeInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<InboxMessage[]>([])

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const [listLoading, setListLoading] = useState(true)
  const [threadLoading, setThreadLoading] = useState(false)
  const [error, setError] = useState('')

  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId

  async function loadConversations(silent = false) {
    if (!silent) setListLoading(true)
    try {
      const params = new URLSearchParams({ filter })
      if (search.trim()) params.set('search', search.trim())
      const response = await fetch(`/api/whatsapp/conversations?${params.toString()}`)
      const data = await response.json()
      if (!response.ok || !data.ok) {
        if (!silent) setError('Não consegui carregar a caixa de entrada.')
        return
      }
      setConversations(data.conversations)
      if (!silent && !selectedIdRef.current && data.conversations.length > 0) {
        setSelectedId(data.conversations[0].id)
      }
    } finally {
      if (!silent) setListLoading(false)
    }
  }

  async function loadConversation(id: string, silent = false) {
    if (!id) return
    if (!silent) setThreadLoading(true)
    try {
      const response = await fetch(`/api/whatsapp/conversations/${id}`)
      const data = await response.json()
      if (!response.ok || !data.ok) {
        if (!silent) setError('Não consegui carregar essa conversa.')
        return
      }
      setSelected(data.conversation)
      setMessages(data.messages)

      if (data.conversation.unread_count > 0) {
        fetch(`/api/whatsapp/conversations/${id}/read`, { method: 'POST' })
        setConversations(current => current.map(c => (c.id === id ? { ...c, unread_count: 0 } : c)))
      }
    } finally {
      if (!silent) setThreadLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
    const interval = setInterval(() => {
      loadConversations(true)
      if (selectedIdRef.current) loadConversation(selectedIdRef.current, true)
    }, 6000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search])

  useEffect(() => {
    if (selectedId) loadConversation(selectedId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  async function handleSendReply(event: FormEvent) {
    event.preventDefault()
    if (!selected || sending || !reply.trim()) return

    setSending(true)
    setError('')
    try {
      const response = await fetch('/api/whatsapp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selected.id, text: reply.trim() }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Não consegui enviar a resposta.')
        return
      }
      setReply('')
      loadConversation(selected.id, true)
      loadConversations(true)
    } catch {
      setError('Não consegui enviar a resposta agora.')
    } finally {
      setSending(false)
    }
  }

  const windowState = selected ? getWindowState(selected.customer_service_window_expires_at) : { active: false, label: '', detail: '' }
  const canReply = Boolean(selected) && !selected?.opted_out && windowState.active

  return (
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
        <div>
          <h1>Caixa de entrada</h1>
          <p>Conversas de WhatsApp com seus clientes e leads.</p>
        </div>
      </div>

      <div className="inbox-layout">
        <aside className="inbox-list-pane">
          <div className="clientes-nucleo-search">
            <Search size={16} aria-hidden />
            <input type="text" placeholder="Buscar" value={search} onChange={event => setSearch(event.target.value)} />
          </div>
          <div className="inbox-filters">
            {(['all', 'unread', 'interested', 'optout'] as Filter[]).map(item => (
              <button key={item} type="button" className={filter === item ? 'inbox-filter active' : 'inbox-filter'} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Todas' : item === 'unread' ? 'Não lidas' : item === 'interested' ? 'Interessados' : 'Opt-out'}
              </button>
            ))}
          </div>

          <div className="inbox-conversation-list">
            {listLoading ? (
              <p className="routine-department-empty">Carregando…</p>
            ) : conversations.length === 0 ? (
              <p className="routine-department-empty">Nenhuma conversa encontrada.</p>
            ) : (
              conversations.map(conversation => (
                <button
                  key={conversation.id}
                  type="button"
                  className={conversation.id === selectedId ? 'inbox-conversation-item active' : 'inbox-conversation-item'}
                  onClick={() => setSelectedId(conversation.id)}
                >
                  <div className="inbox-conversation-top">
                    <strong>{conversation.name || 'Contato sem nome'}</strong>
                    <span>{formatRelativeTime(conversation.last_message_at)}</span>
                  </div>
                  <div className="inbox-conversation-bottom">
                    <span className="inbox-conversation-preview">{conversation.last_message_text || conversation.phone}</span>
                    {conversation.unread_count > 0 && <span className="inbox-unread-badge">{conversation.unread_count}</span>}
                  </div>
                  <div className="inbox-conversation-tags">
                    {conversation.interested && <span className="clientes-nucleo-chip ok">Interessado</span>}
                    {conversation.opted_out && <span className="clientes-nucleo-chip danger">Opt-out</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="inbox-thread-pane">
          {threadLoading ? (
            <div className="admin-home-empty">Carregando conversa…</div>
          ) : !selected ? (
            <div className="admin-home-empty">Selecione uma conversa.</div>
          ) : (
            <>
              <div className="inbox-thread-header">
                <div>
                  <strong>{selected.name || 'Contato sem nome'}</strong>
                  <span className="disparos-muted">{selected.phone}</span>
                </div>
                <div className="inbox-thread-tags">
                  {selected.interested && <span className="clientes-nucleo-chip ok">Interessado</span>}
                  {selected.opted_out && <span className="clientes-nucleo-chip danger">Opt-out</span>}
                  <span className={`clientes-nucleo-chip ${windowState.active ? 'ok' : 'muted'}`}>{windowState.label}</span>
                  {windowState.detail && <span className="disparos-muted">{windowState.detail}</span>}
                </div>
              </div>

              <div className="inbox-messages">
                {messages.map(message => (
                  <div key={message.id} className={message.direction === 'inbound' ? 'inbox-bubble inbound' : 'inbox-bubble outbound'}>
                    {message.type === 'template' && <span className="inbox-bubble-tag">Campanha</span>}
                    {message.type === 'button' && <span className="inbox-bubble-tag">Resposta rápida</span>}
                    <p>{getMessageText(message)}</p>
                    <div className="inbox-bubble-footer">
                      <span>{formatRelativeTime(message.meta_timestamp || message.created_at)}</span>
                      {message.direction === 'outbound' && <span>{message.status || 'accepted'}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {error && <p className="clientes-nucleo-modal-error">{error}</p>}

              {canReply ? (
                <form className="inbox-reply" onSubmit={handleSendReply}>
                  <input
                    type="text"
                    placeholder="Escreva uma resposta…"
                    value={reply}
                    onChange={event => setReply(event.target.value)}
                    maxLength={4096}
                  />
                  <button type="submit" className="clientes-nucleo-btn primary" disabled={sending || !reply.trim()}>
                    <Send size={14} aria-hidden />
                  </button>
                </form>
              ) : (
                <div className="inbox-reply-blocked">
                  {selected.opted_out
                    ? 'Este contato pediu opt-out — não é possível responder por texto livre.'
                    : 'A janela de atendimento de 24h terminou. Use um template aprovado (disparo individual) para reiniciar a conversa.'}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
