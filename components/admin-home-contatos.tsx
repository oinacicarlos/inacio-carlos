'use client'

import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { FolderPlus, Pencil, Phone, Plus, Trash2, X } from 'lucide-react'

type ContactCategory = { id: string; name: string }
type ContactItem = { id: string; categoryId: string | null; name: string; phone: string }

const EMPTY_CONTACT_FORM = { name: '', phone: '', categoryId: '' }

export default function AdminHomeContatos() {
  const [categories, setCategories] = useState<ContactCategory[]>([])
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [editingContactId, setEditingContactId] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT_FORM)
  const [contactSaving, setContactSaving] = useState(false)
  const [contactError, setContactError] = useState('')

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categorySaving, setCategorySaving] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const [categoriesRes, contactsRes] = await Promise.all([
      supabase.from('contacts_categories').select('id,name').order('created_at', { ascending: true }),
      supabase.from('contacts').select('id,category_id,name,phone').order('created_at', { ascending: true }),
    ])

    if (categoriesRes.error || contactsRes.error) {
      setLoadError('Não consegui carregar os contatos agora.')
      setLoading(false)
      return
    }

    setCategories((categoriesRes.data ?? []).map(row => ({ id: row.id, name: row.name })))
    setContacts((contactsRes.data ?? []).map(row => ({ id: row.id, categoryId: row.category_id, name: row.name, phone: row.phone })))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function openCreateContact(categoryId: string | null = null) {
    setEditingContactId(null)
    setContactForm({ ...EMPTY_CONTACT_FORM, categoryId: categoryId ?? '' })
    setContactError('')
    setContactModalOpen(true)
  }

  function openEditContact(contact: ContactItem) {
    setEditingContactId(contact.id)
    setContactForm({ name: contact.name, phone: contact.phone, categoryId: contact.categoryId ?? '' })
    setContactError('')
    setContactModalOpen(true)
  }

  async function handleSubmitContact(event: FormEvent) {
    event.preventDefault()
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      setContactError('Preencha nome e número.')
      return
    }

    setContactSaving(true)
    setContactError('')

    const payload = {
      name: contactForm.name.trim(),
      phone: contactForm.phone.trim(),
      category_id: contactForm.categoryId || null,
      updated_at: new Date().toISOString(),
    }

    if (editingContactId) {
      const { data, error } = await supabase.from('contacts').update(payload).eq('id', editingContactId).select('id,category_id,name,phone').single()
      setContactSaving(false)
      if (error || !data) {
        setContactError('Não consegui salvar as alterações.')
        return
      }
      setContacts(current =>
        current.map(contact =>
          contact.id === editingContactId ? { id: data.id, categoryId: data.category_id, name: data.name, phone: data.phone } : contact,
        ),
      )
      setContactModalOpen(false)
      return
    }

    const { data, error } = await supabase.from('contacts').insert(payload).select('id,category_id,name,phone').single()
    setContactSaving(false)
    if (error || !data) {
      setContactError('Não consegui salvar esse contato.')
      return
    }
    setContacts(current => [...current, { id: data.id, categoryId: data.category_id, name: data.name, phone: data.phone }])
    setContactModalOpen(false)
  }

  async function handleDeleteContact(contact: ContactItem) {
    if (!window.confirm(`Excluir o contato "${contact.name}"?`)) return
    const { error } = await supabase.from('contacts').delete().eq('id', contact.id)
    if (error) {
      window.alert('Não consegui excluir esse contato agora.')
      return
    }
    setContacts(current => current.filter(item => item.id !== contact.id))
  }

  function openCreateCategory() {
    setEditingCategoryId(null)
    setCategoryName('')
    setCategoryError('')
    setCategoryModalOpen(true)
  }

  function openEditCategory(category: ContactCategory) {
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
        .from('contacts_categories')
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

    const { data, error } = await supabase.from('contacts_categories').insert({ name: categoryName.trim() }).select('id,name').single()
    setCategorySaving(false)
    if (error || !data) {
      setCategoryError('Não consegui criar essa categoria.')
      return
    }
    setCategories(current => [...current, { id: data.id, name: data.name }])
    setCategoryModalOpen(false)
  }

  async function handleDeleteCategory(category: ContactCategory) {
    if (!window.confirm(`Excluir a categoria "${category.name}"? Os contatos dela continuam, só ficam sem categoria.`)) return
    const { error } = await supabase.from('contacts_categories').delete().eq('id', category.id)
    if (error) {
      window.alert('Não consegui excluir essa categoria agora.')
      return
    }
    setCategories(current => current.filter(item => item.id !== category.id))
    setContacts(current => current.map(contact => (contact.categoryId === category.id ? { ...contact, categoryId: null } : contact)))
  }

  const uncategorized = contacts.filter(contact => !contact.categoryId || !categories.some(category => category.id === contact.categoryId))

  function renderContactRow(contact: ContactItem) {
    return (
      <div key={contact.id} className="links-row">
        <div className="links-row-link">
          <Phone size={15} aria-hidden />
          <span className="links-row-name">{contact.name}</span>
          <span className="links-row-url">{contact.phone}</span>
        </div>
        <div className="clientes-nucleo-row-actions">
          <button type="button" aria-label={`Editar ${contact.name}`} onClick={() => openEditContact(contact)}>
            <Pencil size={14} aria-hidden />
          </button>
          <button type="button" aria-label={`Excluir ${contact.name}`} onClick={() => handleDeleteContact(contact)}>
            <Trash2 size={14} aria-hidden />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
        <div>
          <h1>Contatos</h1>
          <p>Profissionais pra indicar aos clientes quando precisar.</p>
        </div>
        <div className="clientes-nucleo-actions">
          <button type="button" className="clientes-nucleo-btn ghost" onClick={openCreateCategory}>
            <FolderPlus size={15} aria-hidden />
            Nova categoria
          </button>
          <button type="button" className="clientes-nucleo-btn primary" onClick={() => openCreateContact()}>
            <Plus size={15} aria-hidden />
            Novo contato
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-home-empty">Carregando contatos…</div>
      ) : loadError ? (
        <div className="admin-home-empty">{loadError}</div>
      ) : contacts.length === 0 && categories.length === 0 ? (
        <div className="admin-home-empty">Nenhum contato cadastrado ainda.</div>
      ) : (
        <div className="links-groups">
          {categories.map(category => {
            const categoryContacts = contacts.filter(contact => contact.categoryId === category.id)
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
                {categoryContacts.length === 0 ? (
                  <p className="routine-department-empty">Nenhum contato nessa categoria ainda.</p>
                ) : (
                  <div className="links-list">{categoryContacts.map(renderContactRow)}</div>
                )}
              </div>
            )
          })}

          {uncategorized.length > 0 && (
            <div className="links-category">
              <div className="links-category-head">
                <h3>Sem categoria</h3>
              </div>
              <div className="links-list">{uncategorized.map(renderContactRow)}</div>
            </div>
          )}
        </div>
      )}

      {contactModalOpen && (
        <div className="clientes-nucleo-modal-backdrop" onClick={() => !contactSaving && setContactModalOpen(false)}>
          <form className="clientes-nucleo-modal" onClick={event => event.stopPropagation()} onSubmit={handleSubmitContact}>
            <div className="clientes-nucleo-modal-head">
              <h2>{editingContactId ? 'Editar contato' : 'Novo contato'}</h2>
              <button type="button" aria-label="Fechar" onClick={() => setContactModalOpen(false)}>
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="clientes-nucleo-modal-grid">
              <label className="span-2">
                Nome
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={event => setContactForm(current => ({ ...current, name: event.target.value }))}
                  required
                />
              </label>
              <label className="span-2">
                Número
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={contactForm.phone}
                  onChange={event => setContactForm(current => ({ ...current, phone: event.target.value }))}
                  required
                />
              </label>
              <label className="span-2">
                Categoria
                <select value={contactForm.categoryId} onChange={event => setContactForm(current => ({ ...current, categoryId: event.target.value }))}>
                  <option value="">Sem categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {contactError && <p className="clientes-nucleo-modal-error">{contactError}</p>}
            <div className="clientes-nucleo-modal-foot">
              <button type="button" className="clientes-nucleo-btn ghost" onClick={() => setContactModalOpen(false)} disabled={contactSaving}>
                Cancelar
              </button>
              <button type="submit" className="clientes-nucleo-btn primary" disabled={contactSaving}>
                {contactSaving ? 'Salvando…' : 'Salvar'}
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
              <input
                type="text"
                value={categoryName}
                onChange={event => setCategoryName(event.target.value)}
                placeholder="Ex: Advogados"
                required
              />
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
