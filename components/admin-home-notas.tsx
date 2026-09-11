'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { NotebookPen, Save } from 'lucide-react'

const NOTE_ID = 'main'
const AUTOSAVE_DELAY_MS = 1500

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function formatSavedTime(date: Date | null) {
  if (!date) return ''
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function AdminHomeNotas() {
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const contentRef = useRef(content)
  contentRef.current = content
  const savedContentRef = useRef(savedContent)
  savedContentRef.current = savedContent
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function loadNote() {
      setLoading(true)
      setLoadError('')
      const { data, error } = await supabase.from('notepad').select('content').eq('id', NOTE_ID).maybeSingle()
      if (error) {
        setLoadError('Não consegui carregar o bloco de notas.')
        setLoading(false)
        return
      }
      setContent(data?.content ?? '')
      setSavedContent(data?.content ?? '')
      setLoading(false)
    }
    loadNote()
  }, [])

  const save = useCallback(async () => {
    const value = contentRef.current
    if (value === savedContentRef.current) return

    setStatus('saving')
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('notepad')
      .upsert({ id: NOTE_ID, content: value, updated_at: new Date().toISOString(), updated_by: user?.id ?? null }, { onConflict: 'id' })

    if (error) {
      setStatus('error')
      return
    }

    setSavedContent(value)
    setLastSavedAt(new Date())
    setStatus('saved')
  }, [])

  useEffect(() => {
    if (loading) return
    if (content === savedContent) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      save()
    }, AUTOSAVE_DELAY_MS)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [content, savedContent, loading, save])

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (contentRef.current === savedContentRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  function handleManualSave() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    save()
  }

  const hasUnsavedChanges = content !== savedContent
  const statusLabel =
    status === 'saving'
      ? 'Salvando…'
      : status === 'error'
        ? 'Não consegui salvar agora.'
        : hasUnsavedChanges
          ? 'Alterações não salvas'
          : lastSavedAt
            ? `Salvo às ${formatSavedTime(lastSavedAt)}`
            : 'Tudo salvo'

  return (
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
        <div>
          <h1>Notas</h1>
          <p>Um bloco de notas único, compartilhado, pra jogar qualquer coisa rápido.</p>
        </div>
        <div className="clientes-nucleo-actions">
          <button type="button" className="clientes-nucleo-btn primary" onClick={handleManualSave} disabled={!hasUnsavedChanges || status === 'saving'}>
            <Save size={15} aria-hidden />
            Salvar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-home-empty">Carregando notas…</div>
      ) : loadError ? (
        <div className="admin-home-empty">{loadError}</div>
      ) : (
        <div className="notepad-shell">
          <textarea
            className="notepad-textarea"
            value={content}
            onChange={event => setContent(event.target.value)}
            placeholder="Escreva aqui…"
            spellCheck={false}
          />
          <div className={`notepad-status is-${status === 'error' ? 'error' : hasUnsavedChanges ? 'pending' : 'ok'}`}>
            <NotebookPen size={13} aria-hidden />
            <span>{statusLabel}</span>
          </div>
        </div>
      )}
    </div>
  )
}
