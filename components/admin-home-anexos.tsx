'use client'

import { type ChangeEvent, type FormEvent, useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Download, Eye, File, FileSpreadsheet, FileText, Image as ImageIcon, Pencil, Plus, ShieldCheck, Trash2, Upload, X } from 'lucide-react'

const ANEXOS_BUCKET = 'anexos-gerais'
const ANEXOS_FILE_LIMIT_BYTES = 20 * 1024 * 1024
const ANEXOS_ACCEPT =
  '.pdf,.jpg,.jpeg,.png,.pfx,.p12,.xls,.xlsx,.doc,.docx,.csv,application/pdf,image/jpeg,image/png,application/x-pkcs12,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv'

type AnexoItem = {
  id: string
  name: string
  fileName: string
  storagePath: string
  mimeType: string | null
  fileSize: number
  createdAt: string
}

function mapRow(row: Record<string, unknown>): AnexoItem {
  return {
    id: String(row.id),
    name: (row.name as string) ?? '',
    fileName: (row.file_name as string) ?? '',
    storagePath: (row.storage_path as string) ?? '',
    mimeType: (row.mime_type as string) ?? null,
    fileSize: Number(row.file_size ?? 0),
    createdAt: (row.created_at as string) ?? '',
  }
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]+/g, '-')
}

function formatFileSize(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileKind(fileName: string, mimeType: string | null) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (extension === 'pdf' || mimeType === 'application/pdf') return { label: 'PDF', icon: FileText, preview: 'pdf' as const }
  if (['jpg', 'jpeg', 'png'].includes(extension) || mimeType?.startsWith('image/'))
    return { label: 'Imagem', icon: ImageIcon, preview: 'image' as const }
  if (['xls', 'xlsx', 'csv'].includes(extension)) return { label: extension === 'csv' ? 'CSV' : 'Excel', icon: FileSpreadsheet, preview: null }
  if (['doc', 'docx'].includes(extension)) return { label: 'Word', icon: FileText, preview: null }
  if (['pfx', 'p12'].includes(extension)) return { label: 'PFX', icon: ShieldCheck, preview: null }
  return { label: 'Arquivo', icon: File, preview: null }
}

function formatDate(value: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('pt-BR')
}

export default function AdminHomeAnexos() {
  const [anexos, setAnexos] = useState<AnexoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const [previewAnexo, setPreviewAnexo] = useState<AnexoItem | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const { data, error } = await supabase.from('anexos').select('*').order('created_at', { ascending: false })
    if (error) {
      setLoadError('Não consegui carregar os anexos agora.')
      setLoading(false)
      return
    }
    setAnexos((data ?? []).map(mapRow))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function openUploadModal() {
    setUploadName('')
    setUploadFile(null)
    setUploadError('')
    setUploadModalOpen(true)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > ANEXOS_FILE_LIMIT_BYTES) {
      setUploadError('O arquivo precisa ter até 20 MB.')
      event.target.value = ''
      return
    }
    setUploadError('')
    setUploadFile(file)
    if (!uploadName.trim()) {
      setUploadName(file.name.replace(/\.[^/.]+$/, ''))
    }
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault()
    if (!uploadName.trim() || !uploadFile) {
      setUploadError('Preencha o nome e escolha um arquivo.')
      return
    }

    setUploading(true)
    setUploadError('')

    const path = `${Date.now()}-${genId()}-${sanitizeFileName(uploadFile.name)}`
    const { error: uploadErr } = await supabase.storage.from(ANEXOS_BUCKET).upload(path, uploadFile)
    if (uploadErr) {
      setUploading(false)
      setUploadError('Não consegui enviar esse arquivo.')
      return
    }

    const { data, error } = await supabase
      .from('anexos')
      .insert({
        name: uploadName.trim(),
        file_name: uploadFile.name,
        storage_path: path,
        mime_type: uploadFile.type || null,
        file_size: uploadFile.size,
      })
      .select('*')
      .single()

    setUploading(false)

    if (error || !data) {
      setUploadError('Arquivo enviado, mas não consegui salvar o registro.')
      return
    }

    setAnexos(current => [mapRow(data), ...current])
    setUploadModalOpen(false)
  }

  async function handleDownload(anexo: AnexoItem) {
    const { data, error } = await supabase.storage.from(ANEXOS_BUCKET).createSignedUrl(anexo.storagePath, 300)
    if (error || !data) {
      window.alert('Não consegui gerar o link de download agora.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function openPreview(anexo: AnexoItem) {
    setPreviewAnexo(anexo)
    setPreviewUrl('')
    setPreviewError('')
    setPreviewLoading(true)

    const { data, error } = await supabase.storage.from(ANEXOS_BUCKET).createSignedUrl(anexo.storagePath, 300)
    setPreviewLoading(false)
    if (error || !data) {
      setPreviewError('Não consegui carregar esse arquivo agora.')
      return
    }
    setPreviewUrl(data.signedUrl)
  }

  function closePreview() {
    setPreviewAnexo(null)
    setPreviewUrl('')
    setPreviewError('')
  }

  function openEditModal(anexo: AnexoItem) {
    setEditingId(anexo.id)
    setEditName(anexo.name)
    setEditError('')
    setEditModalOpen(true)
  }

  async function handleRename(event: FormEvent) {
    event.preventDefault()
    if (!editName.trim() || !editingId) {
      setEditError('Informe um nome.')
      return
    }
    setEditSaving(true)
    setEditError('')

    const { data, error } = await supabase
      .from('anexos')
      .update({ name: editName.trim(), updated_at: new Date().toISOString() })
      .eq('id', editingId)
      .select('*')
      .single()

    setEditSaving(false)
    if (error || !data) {
      setEditError('Não consegui salvar esse nome.')
      return
    }
    setAnexos(current => current.map(item => (item.id === editingId ? mapRow(data) : item)))
    setEditModalOpen(false)
  }

  async function handleDelete(anexo: AnexoItem) {
    if (!window.confirm(`Excluir "${anexo.name}"?`)) return
    const { error: storageError } = await supabase.storage.from(ANEXOS_BUCKET).remove([anexo.storagePath])
    if (storageError) {
      window.alert('Não consegui excluir esse arquivo agora.')
      return
    }
    await supabase.from('anexos').delete().eq('id', anexo.id)
    setAnexos(current => current.filter(item => item.id !== anexo.id))
  }

  return (
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
        <div>
          <h1>Anexos</h1>
          <p>Documentos e arquivos importantes, num só lugar.</p>
        </div>
        <div className="clientes-nucleo-actions">
          <button type="button" className="clientes-nucleo-btn primary" onClick={openUploadModal}>
            <Plus size={15} aria-hidden />
            Novo anexo
          </button>
        </div>
      </div>

      <div className="clientes-nucleo-table-wrap">
        {loading ? (
          <div className="admin-home-empty">Carregando anexos…</div>
        ) : loadError ? (
          <div className="admin-home-empty">{loadError}</div>
        ) : anexos.length === 0 ? (
          <div className="admin-home-empty">Nenhum anexo enviado ainda.</div>
        ) : (
          <table className="clientes-nucleo-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Tamanho</th>
                <th>Enviado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {anexos.map(anexo => {
                const kind = getFileKind(anexo.fileName, anexo.mimeType)
                const Icon = kind.icon
                return (
                  <tr key={anexo.id}>
                    <td>
                      <div className="clientes-nucleo-name-cell">
                        <span className="links-row-link" style={{ padding: 0 }}>
                          <Icon size={16} aria-hidden />
                        </span>
                        {anexo.name}
                      </div>
                    </td>
                    <td>
                      <span className="clientes-nucleo-chip neutral">{kind.label}</span>
                    </td>
                    <td>{formatFileSize(anexo.fileSize)}</td>
                    <td>{formatDate(anexo.createdAt)}</td>
                    <td>
                      <div className="clientes-nucleo-row-actions">
                        {kind.preview && (
                          <button type="button" aria-label={`Visualizar ${anexo.name}`} onClick={() => openPreview(anexo)}>
                            <Eye size={15} aria-hidden />
                          </button>
                        )}
                        <button type="button" aria-label={`Baixar ${anexo.name}`} onClick={() => handleDownload(anexo)}>
                          <Download size={15} aria-hidden />
                        </button>
                        <button type="button" aria-label={`Renomear ${anexo.name}`} onClick={() => openEditModal(anexo)}>
                          <Pencil size={15} aria-hidden />
                        </button>
                        <button type="button" aria-label={`Excluir ${anexo.name}`} onClick={() => handleDelete(anexo)}>
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

      {uploadModalOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !uploading && setUploadModalOpen(false)}>
          <form className="clientes-nucleo-modal" onClick={event => event.stopPropagation()} onSubmit={handleUpload}>
            <div className="clientes-nucleo-modal-head">
              <h2>Novo anexo</h2>
              <button type="button" aria-label="Fechar" onClick={() => setUploadModalOpen(false)}>
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="clientes-nucleo-modal-grid">
              <label className="span-2">
                Nome
                <input type="text" value={uploadName} onChange={event => setUploadName(event.target.value)} required />
              </label>
              <label className="span-2">
                Arquivo
                <div className="pfx-file-field">
                  <label className="clientes-nucleo-btn ghost pfx-file-btn">
                    <Upload size={15} aria-hidden />
                    {uploadFile ? 'Trocar arquivo' : 'Selecionar arquivo'}
                    <input type="file" accept={ANEXOS_ACCEPT} onChange={handleFileChange} hidden />
                  </label>
                  {uploadFile && (
                    <span className="pfx-file-name">
                      {uploadFile.name} · {formatFileSize(uploadFile.size)}
                    </span>
                  )}
                </div>
                <span className="disparos-muted">PDF, JPEG, PNG, PFX, Excel, Word ou CSV — até 20 MB.</span>
              </label>
            </div>
            {uploadError && <p className="clientes-nucleo-modal-error">{uploadError}</p>}
            <div className="clientes-nucleo-modal-foot">
              <button type="button" className="clientes-nucleo-btn ghost" onClick={() => setUploadModalOpen(false)} disabled={uploading}>
                Cancelar
              </button>
              <button type="submit" className="clientes-nucleo-btn primary" disabled={uploading}>
                {uploading ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editModalOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !editSaving && setEditModalOpen(false)}>
          <form className="clientes-nucleo-modal links-category-modal" onClick={event => event.stopPropagation()} onSubmit={handleRename}>
            <div className="clientes-nucleo-modal-head">
              <h2>Renomear anexo</h2>
              <button type="button" aria-label="Fechar" onClick={() => setEditModalOpen(false)}>
                <X size={18} aria-hidden />
              </button>
            </div>
            <label className="routine-email-field">
              Nome
              <input type="text" value={editName} onChange={event => setEditName(event.target.value)} required />
            </label>
            {editError && <p className="clientes-nucleo-modal-error">{editError}</p>}
            <div className="clientes-nucleo-modal-foot">
              <button type="button" className="clientes-nucleo-btn ghost" onClick={() => setEditModalOpen(false)} disabled={editSaving}>
                Cancelar
              </button>
              <button type="submit" className="clientes-nucleo-btn primary" disabled={editSaving}>
                {editSaving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {previewAnexo && (
        <div className="clientes-nucleo-modal-backdrop" onClick={closePreview}>
          <div className="anexos-preview-modal" onClick={event => event.stopPropagation()}>
            <div className="clientes-nucleo-modal-head">
              <h2>{previewAnexo.name}</h2>
              <button type="button" aria-label="Fechar" onClick={closePreview}>
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="anexos-preview-body">
              {previewLoading ? (
                <div className="admin-home-empty">Carregando…</div>
              ) : previewError ? (
                <div className="admin-home-empty">{previewError}</div>
              ) : getFileKind(previewAnexo.fileName, previewAnexo.mimeType).preview === 'image' ? (
                <img src={previewUrl} alt={previewAnexo.name} className="anexos-preview-image" />
              ) : (
                <iframe src={previewUrl} title={previewAnexo.name} className="anexos-preview-frame" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
