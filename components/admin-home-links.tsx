'use client'

import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ExternalLink, FolderPlus, Link2, Pencil, Plus, Trash2, X } from 'lucide-react'

type LinkCategory = { id: string; name: string }
type LinkItem = { id: string; categoryId: string | null; name: string; url: string }

const EMPTY_LINK_FORM = { name: '', url: '', categoryId: '' }

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
}

function normalizeUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export default function AdminHomeLinks() {
  const [categories, setCategories] = useState<LinkCategory[]>([])
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [linkForm, setLinkForm] = useState(EMPTY_LINK_FORM)
  const [linkSaving, setLinkSaving] = useState(false)
  const [linkError, setLinkError] = useState('')

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categorySaving, setCategorySaving] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const [categoriesRes, linksRes] = await Promise.all([
      supabase.from('links_categories').select('id,name').order('created_at', { ascending: true }),
      supabase.from('links').select('id,category_id,name,url').order('created_at', { ascending: true }),
    ])

    if (categoriesRes.error || linksRes.error) {
      setLoadError('Não consegui carregar os links agora.')
      setLoading(false)
      return
    }

    setCategories((categoriesRes.data ?? []).map(row => ({ id: row.id, name: row.name })))
    setLinks((linksRes.data ?? []).map(row => ({ id: row.id, categoryId: row.category_id, name: row.name, url: row.url })))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function openCreateLink(categoryId: string | null = null) {
    setEditingLinkId(null)
    setLinkForm({ ...EMPTY_LINK_FORM, categoryId: categoryId ?? '' })
    setLinkError('')
    setLinkModalOpen(true)
  }

  function openEditLink(link: LinkItem) {
    setEditingLinkId(link.id)
    setLinkForm({ name: link.name, url: link.url, categoryId: link.categoryId ?? '' })
    setLinkError('')
    setLinkModalOpen(true)
  }

  async function handleSubmitLink(event: FormEvent) {
    event.preventDefault()
    const url = normalizeUrl(linkForm.url)
    if (!linkForm.name.trim() || !url) {
      setLinkError('Preencha nome e link.')
      return
    }

    setLinkSaving(true)
    setLinkError('')

    const payload = {
      name: linkForm.name.trim(),
      url,
      category_id: linkForm.categoryId || null,
      updated_at: new Date().toISOString(),
    }

    if (editingLinkId) {
      const { data, error } = await supabase.from('links').update(payload).eq('id', editingLinkId).select('id,category_id,name,url').single()
      setLinkSaving(false)
      if (error || !data) {
        setLinkError('Não consegui salvar as alterações.')
        return
      }
      setLinks(current =>
        current.map(link => (link.id === editingLinkId ? { id: data.id, categoryId: data.category_id, name: data.name, url: data.url } : link)),
      )
      setLinkModalOpen(false)
      return
    }

    const { data, error } = await supabase.from('links').insert(payload).select('id,category_id,name,url').single()
    setLinkSaving(false)
    if (error || !data) {
      setLinkError('Não consegui salvar esse link.')
      return
    }
    setLinks(current => [...current, { id: data.id, categoryId: data.category_id, name: data.name, url: data.url }])
    setLinkModalOpen(false)
  }

  async function handleDeleteLink(link: LinkItem) {
    if (!window.confirm(`Excluir o link "${link.name}"?`)) return
    const { error } = await supabase.from('links').delete().eq('id', link.id)
    if (error) {
      window.alert('Não consegui excluir esse link agora.')
      return
    }
    setLinks(current => current.filter(item => item.id !== link.id))
  }

  function openCreateCategory() {
    setEditingCategoryId(null)
    setCategoryName('')
    setCategoryError('')
    setCategoryModalOpen(true)
  }

  function openEditCategory(category: LinkCategory) {
    setEditingCategoryId(category.id)
    setCategoryName(category.name)
    setCategoryError('')
    setCategoryModalOpen(true)
  }

  async function handleSubmitCategory(event: FormEvent) {
    event.preventDefault()
    if (!categoryName.trim()) {
      setCategoryError('Dê um nome para a categoria.')
      return
    }

    setCategorySaving(true)
    setCategoryError('')

    if (editingCategoryId) {
      const { data, error } = await supabase
        .from('links_categories')
        .update({ name: categoryName.trim() })
        .eq('id', editingCategoryId)
        .select('id,name')
        .single()
      setCategorySaving(false)
      if (error || !data) {
        setCategoryError('Não consegui salvar essa categoria.')
        return
      }
      setCategories(current => current.map(category => (category.id === editingCategoryId ? { id: data.id, name: data.name } : category)))
      setCategoryModalOpen(false)
      return
    }

    const { data, error } = await supabase.from('links_categories').insert({ name: categoryName.trim() }).select('id,name').single()
    setCategorySaving(false)
    if (error || !data) {
      setCategoryError('Não consegui criar essa categoria.')
      return
    }
    setCategories(current => [...current, { id: data.id, name: data.name }])
    setCategoryModalOpen(false)
  }

  async function handleDeleteCategory(category: LinkCategory) {
    if (!window.confirm(`Excluir a categoria "${category.name}"? Os links dela continuam, só ficam sem categoria.`)) return
    const { error } = await supabase.from('links_categories').delete().eq('id', category.id)
    if (error) {
      window.alert('Não consegui excluir essa categoria agora.')
      return
    }
    setCategories(current => current.filter(item => item.id !== category.id))
    setLinks(current => current.map(link => (link.categoryId === category.id ? { ...link, categoryId: null } : link)))
  }

  const uncategorized = links.filter(link => !link.categoryId || !categories.some(category => category.id === link.categoryId))

  return (
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
        <div>
          <h1>Links</h1>
          <p>Seus links úteis, organizados por categoria (opcional).</p>
        </div>
        <div className="clientes-nucleo-actions">
          <button type="button" className="clientes-nucleo-btn ghost" onClick={openCreateCategory}>
            <FolderPlus size={15} aria-hidden />
            Nova categoria
          </button>
          <button type="button" className="clientes-nucleo-btn primary" onClick={() => openCreateLink()}>
            <Plus size={15} aria-hidden />
            Novo link
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-home-empty">Carregando links…</div>
      ) : loadError ? (
        <div className="admin-home-empty">{loadError}</div>
      ) : links.length === 0 && categories.length === 0 ? (
        <div className="admin-home-empty">Nenhum link cadastrado ainda.</div>
      ) : (
        <div className="links-groups">
          {categories.map(category => {
            const categoryLinks = links.filter(link => link.categoryId === category.id)
            return (
              <div key={category.id} className="links-category">
                <div className="links-category-head">
                  <h3>{category.name}</h3>
                  <div className="clientes-nucleo-row-actions">
                    <button type="button" aria-label={`Renomear ${category.name}`} onClick={() => openEditCategory(category)}>
                      <Pencil size={14} aria-hidden />
                    </button>
                    <button type="button" aria-label={`Excluir ${category.name}`} onClick={() => handleDeleteCategory(category)}>
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </div>
                </div>
                {categoryLinks.length === 0 ? (
                  <p className="routine-department-empty">Nenhum link nessa categoria ainda.</p>
                ) : (
                  <div className="links-list">
                    {categoryLinks.map(link => (
                      <div key={link.id} className="links-row">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="links-row-link">
                          <Link2 size={15} aria-hidden />
                          <span className="links-row-name">{link.name}</span>
                          <span className="links-row-url">{displayUrl(link.url)}</span>
                          <ExternalLink size={13} aria-hidden className="links-row-external" />
                        </a>
                        <div className="clientes-nucleo-row-actions">
                          <button type="button" aria-label={`Editar ${link.name}`} onClick={() => openEditLink(link)}>
                            <Pencil size={14} aria-hidden />
                          </button>
                          <button type="button" aria-label={`Excluir ${link.name}`} onClick={() => handleDeleteLink(link)}>
                            <Trash2 size={14} aria-hidden />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {uncategorized.length > 0 && (
            <div className="links-category">
              <div className="links-category-head">
                <h3>Sem categoria</h3>
              </div>
              <div className="links-list">
                {uncategorized.map(link => (
                  <div key={link.id} className="links-row">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="links-row-link">
                      <Link2 size={15} aria-hidden />
                      <span className="links-row-name">{link.name}</span>
                      <span className="links-row-url">{displayUrl(link.url)}</span>
                      <ExternalLink size={13} aria-hidden className="links-row-external" />
                    </a>
                    <div className="clientes-nucleo-row-actions">
                      <button type="button" aria-label={`Editar ${link.name}`} onClick={() => openEditLink(link)}>
                        <Pencil size={14} aria-hidden />
                      </button>
                      <button type="button" aria-label={`Excluir ${link.name}`} onClick={() => handleDeleteLink(link)}>
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {linkModalOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !linkSaving && setLinkModalOpen(false)}>
          <form className="clientes-nucleo-modal" onClick={event => event.stopPropagation()} onSubmit={handleSubmitLink}>
            <div className="clientes-nucleo-modal-head">
              <h2>{editingLinkId ? 'Editar link' : 'Novo link'}</h2>
              <button type="button" aria-label="Fechar" onClick={() => setLinkModalOpen(false)}>
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="clientes-nucleo-modal-grid">
              <label className="span-2">
                Nome
                <input type="text" value={linkForm.name} onChange={event => setLinkForm(current => ({ ...current, name: event.target.value }))} required />
              </label>
              <label className="span-2">
                Link
                <input
                  type="text"
                  placeholder="exemplo.com/pagina"
                  value={linkForm.url}
                  onChange={event => setLinkForm(current => ({ ...current, url: event.target.value }))}
                  required
                />
              </label>
              <label className="span-2">
                Categoria
                <select value={linkForm.categoryId} onChange={event => setLinkForm(current => ({ ...current, categoryId: event.target.value }))}>
                  <option value="">Sem categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {linkError && <p className="clientes-nucleo-modal-error">{linkError}</p>}
            <div className="clientes-nucleo-modal-foot">
              <button type="button" className="clientes-nucleo-btn ghost" onClick={() => setLinkModalOpen(false)} disabled={linkSaving}>
                Cancelar
              </button>
              <button type="submit" className="clientes-nucleo-btn primary" disabled={linkSaving}>
                {linkSaving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {categoryModalOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !categorySaving && setCategoryModalOpen(false)}>
          <form className="clientes-nucleo-modal links-category-modal" onClick={event => event.stopPropagation()} onSubmit={handleSubmitCategory}>
            <div className="clientes-nucleo-modal-head">
              <h2>{editingCategoryId ? 'Renomear categoria' : 'Nova categoria'}</h2>
              <button type="button" aria-label="Fechar" onClick={() => setCategoryModalOpen(false)}>
                <X size={18} aria-hidden />
              </button>
            </div>
            <label className="routine-email-field">
              Nome da categoria
              <input type="text" value={categoryName} onChange={event => setCategoryName(event.target.value)} placeholder="Ex: Inscrição Estadual" required />
            </label>
            {categoryError && <p className="clientes-nucleo-modal-error">{categoryError}</p>}
            <div className="clientes-nucleo-modal-foot">
              <button type="button" className="clientes-nucleo-btn ghost" onClick={() => setCategoryModalOpen(false)} disabled={categorySaving}>
                Cancelar
              </button>
              <button type="submit" className="clientes-nucleo-btn primary" disabled={categorySaving}>
                {categorySaving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
