'use client'

import { type ChangeEvent, useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Download, Folder, Pencil, Trash2, Upload, X } from 'lucide-react'
import { ROUTINE_ATTACHMENT_LIMIT_BYTES, ROUTINE_CLIENT_ATTACHMENTS_BUCKET, genId, sanitizeAttachmentFileName } from '@/lib/routine-engine'

type AttachmentCategory = 'socios' | 'endereco' | 'contratos' | 'cnpj_inscricoes' | 'licencas' | 'procuracao'

export type LegacyDocument = { id?: string; name: string; url: string; size?: number; type?: string }

const CATEGORIES: { key: AttachmentCategory; label: string; description: string }[] = [
  { key: 'socios', label: 'Sócios', description: 'Documentos dos sócios, CPF, RG e dados pessoais.' },
  { key: 'endereco', label: 'Endereço', description: 'Comprovantes, IPTU, contrato de locação e afins.' },
  { key: 'contratos', label: 'Contratos', description: 'Contrato social, alterações e documentos societários.' },
  { key: 'cnpj_inscricoes', label: 'CNPJ e Inscrições', description: 'Cartão CNPJ, inscrição municipal e estadual.' },
  { key: 'licencas', label: 'Licenças', description: 'Alvarás, licenças e autorizações específicas.' },
  { key: 'procuracao', label: 'Procuração', description: 'Procurações digitais, autorizações e acessos.' },
]

type Attachment = {
  id: string
  category: AttachmentCategory
  displayName: string
  storagePath: string
  fileSize: number
  updatedAt: string
}

function mapAttachment(row: Record<string, unknown>): Attachment {
  return {
    id: String(row.id),
    category: (row.category as AttachmentCategory) ?? 'contratos',
    displayName: (row.display_name as string) || (row.file_name as string) || 'Arquivo',
    storagePath: (row.storage_path as string) ?? '',
    fileSize: Number(row.file_size ?? 0),
    updatedAt: (row.updated_at as string) ?? '',
  }
}

function formatFileSize(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('pt-BR')
}

export default function ClientAttachmentsModal({
  clientId,
  clientName,
  legacyDocuments,
  onClose,
  onCountChange,
}: {
  clientId: string
  clientName: string
  legacyDocuments: LegacyDocument[]
  onClose: () => void
  onCountChange: (delta: number) => void
}) {
  const [activeCategory, setActiveCategory] = useState<AttachmentCategory>('socios')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const loadAttachments = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: loadErr } = await supabase
      .from('routine_client_attachments')
      .select('*')
      .eq('client_id', clientId)
      .order('updated_at', { ascending: false })

    if (loadErr) {
      setError('Não consegui carregar os anexos agora.')
      setLoading(false)
      return
    }
    setAttachments((data ?? []).map(mapAttachment))
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    loadAttachments()
  }, [loadAttachments])

  const categoryAttachments = attachments.filter(item => item.category === activeCategory)
  const activeCategoryInfo = CATEGORIES.find(category => category.key === activeCategory) ?? CATEGORIES[0]

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return
    event.target.value = ''

    setUploading(true)
    setError('')

    for (const file of Array.from(files)) {
      if (file.size > ROUTINE_ATTACHMENT_LIMIT_BYTES) {
        setError(`"${file.name}" passa de 10 MB e não foi enviado.`)
        continue
      }

      const path = `${clientId}/${activeCategory}/${Date.now()}-${genId()}-${sanitizeAttachmentFileName(file.name)}`
      const { error: uploadErr } = await supabase.storage.from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET).upload(path, file)
      if (uploadErr) {
        setError(`Não consegui enviar "${file.name}".`)
        continue
      }

      const { data, error: insertErr } = await supabase
        .from('routine_client_attachments')
        .insert({
          client_id: clientId,
          category: activeCategory,
          display_name: file.name,
          file_name: file.name,
          storage_path: path,
          mime_type: file.type || null,
          file_size: file.size,
        })
        .select('*')
        .single()

      if (insertErr || !data) {
        await supabase.storage.from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET).remove([path])
        setError(`Arquivo enviado, mas não consegui salvar "${file.name}".`)
        continue
      }

      setAttachments(current => [mapAttachment(data), ...current])
      onCountChange(1)
    }

    setUploading(false)
  }

  async function handleDownload(attachment: Attachment) {
    const { data, error: signErr } = await supabase.storage.from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET).createSignedUrl(attachment.storagePath, 300)
    if (signErr || !data) {
      window.alert('Não consegui gerar o link de download agora.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleRename(attachment: Attachment) {
    const nextName = window.prompt('Novo nome do arquivo', attachment.displayName)
    if (!nextName || !nextName.trim() || nextName === attachment.displayName) return

    const { error: renameErr } = await supabase
      .from('routine_client_attachments')
      .update({ display_name: nextName.trim(), updated_at: new Date().toISOString() })
      .eq('id', attachment.id)

    if (renameErr) {
      window.alert('Não consegui renomear esse arquivo agora.')
      return
    }
    setAttachments(current => current.map(item => (item.id === attachment.id ? { ...item, displayName: nextName.trim() } : item)))
  }

  async function handleDelete(attachment: Attachment) {
    if (!window.confirm(`Excluir "${attachment.displayName}"?`)) return

    const { error: storageErr } = await supabase.storage.from(ROUTINE_CLIENT_ATTACHMENTS_BUCKET).remove([attachment.storagePath])
    if (storageErr) {
      window.alert('Não consegui excluir esse arquivo agora.')
      return
    }
    await supabase.from('routine_client_attachments').delete().eq('id', attachment.id)
    setAttachments(current => current.filter(item => item.id !== attachment.id))
    onCountChange(-1)
  }

  return (
    <div className="clientes-nucleo-modal-backdrop" onClick={onClose}>
      <div className="attachments-modal" onClick={event => event.stopPropagation()}>
        <div className="clientes-nucleo-modal-head">
          <h2>Anexos · {clientName}</h2>
          <button type="button" aria-label="Fechar" onClick={onClose}>
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="attachments-layout">
          <div className="attachments-folders">
            {CATEGORIES.map(category => {
              const count = attachments.filter(item => item.category === category.key).length
              return (
                <button
                  key={category.key}
                  type="button"
                  className={activeCategory === category.key ? 'attachments-folder active' : 'attachments-folder'}
                  onClick={() => setActiveCategory(category.key)}
                >
                  <span className="attachments-folder-icon">
                    <Folder size={16} aria-hidden />
                  </span>
                  <span className="attachments-folder-text">
                    <strong>{category.label}</strong>
                    <em>{category.description}</em>
                  </span>
                  <b>{count}</b>
                </button>
              )
            })}
          </div>

          <div className="attachments-panel">
            <div className="attachments-panel-head">
              <div>
                <strong>{activeCategoryInfo.label}</strong>
                <span className="disparos-muted">{activeCategoryInfo.description}</span>
              </div>
              <label className="clientes-nucleo-btn primary attachments-upload-btn">
                <Upload size={14} aria-hidden />
                {uploading ? 'Enviando…' : 'Anexar'}
                <input type="file" multiple onChange={handleUpload} disabled={uploading} hidden />
              </label>
            </div>

            {error && <p className="clientes-nucleo-modal-error">{error}</p>}

            {loading ? (
              <div className="admin-home-empty">Carregando…</div>
            ) : categoryAttachments.length === 0 ? (
              <div className="admin-home-empty">Nenhum arquivo nessa pasta ainda.</div>
            ) : (
              <div className="attachments-file-list">
                {categoryAttachments.map(attachment => (
                  <div key={attachment.id} className="attachments-file-row">
                    <div className="attachments-file-info">
                      <strong>{attachment.displayName}</strong>
                      <span className="disparos-muted">
                        {formatFileSize(attachment.fileSize)} · {formatDate(attachment.updatedAt)}
                      </span>
                    </div>
                    <div className="clientes-nucleo-row-actions">
                      <button type="button" aria-label={`Baixar ${attachment.displayName}`} onClick={() => handleDownload(attachment)}>
                        <Download size={14} aria-hidden />
                      </button>
                      <button type="button" aria-label={`Renomear ${attachment.displayName}`} onClick={() => handleRename(attachment)}>
                        <Pencil size={14} aria-hidden />
                      </button>
                      <button type="button" aria-label={`Excluir ${attachment.displayName}`} onClick={() => handleDelete(attachment)}>
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {legacyDocuments.length > 0 && (
              <div className="attachments-legacy">
                <strong>Documentos antigos</strong>
                <p>Arquivos do cadastro anterior. Continuam disponíveis, mas os próximos anexos entram nas pastas acima.</p>
                <div className="attachments-legacy-list">
                  {legacyDocuments.map((document, index) => (
                    <a key={document.id ?? index} href={document.url} download={document.name} className="attachments-legacy-chip">
                      {document.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
