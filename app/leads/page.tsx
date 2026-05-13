'use client'

import { useState } from 'react'
import type { GooglePlaceLead } from '@/src/lib/apifyClient'

const NICHO_SUGESTOES = [
  'clínicas estéticas',
  'academias de ginástica',
  'restaurantes',
  'escritórios de advocacia',
  'consultórios odontológicos',
  'imobiliárias',
  'lojas de roupas',
  'oficinas mecânicas',
  'salões de beleza',
]

export default function LeadsPage() {
  const [nicho, setNicho] = useState('')
  const [cidade, setCidade] = useState('')
  const [maxItems, setMaxItems] = useState(20)
  const [leads, setLeads] = useState<GooglePlaceLead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastQuery, setLastQuery] = useState('')

  const search = async () => {
    if (!nicho.trim() || !cidade.trim()) return

    setLoading(true)
    setError('')
    setLeads([])

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, cidade, maxItems }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido')
      setLeads(data.results)
      setLastQuery(data.query)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao buscar leads')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const header = ['Nome', 'Telefone', 'Website', 'Endereço', 'Nota', 'Avaliações', 'Categoria']
    const rows = leads.map(lead => [
      lead.title,
      lead.phone ?? '',
      lead.website ?? '',
      lead.address ?? '',
      lead.totalScore != null ? String(lead.totalScore) : '',
      lead.reviewsCount != null ? String(lead.reviewsCount) : '',
      lead.categoryName ?? '',
    ])
    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `leads-${nicho}-${cidade}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="leads-page">
      <div className="shell">
        <header className="page-header">
          <a className="back-link" href="/">
            Voltar ao site
          </a>
          <p className="eyebrow">Apify + Google Maps</p>
          <div className="page-title-row">
            <div>
              <h1>Prospecção de leads</h1>
              <p className="page-copy">
                Busque empresas por nicho e cidade para exportar contatos
                qualificados.
              </p>
            </div>
            {leads.length > 0 && (
              <button className="button secondary small" onClick={exportCSV}>
                Exportar CSV
              </button>
            )}
          </div>
        </header>

        <section className="search-panel" aria-label="Busca de leads">
          <div className="form-grid">
            <label className="field">
              <span>Nicho / tipo de negócio</span>
              <input
                placeholder="ex: clínicas estéticas, academias"
                value={nicho}
                onChange={event => setNicho(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && search()}
              />
            </label>
            <label className="field">
              <span>Cidade</span>
              <input
                placeholder="ex: São Paulo, Curitiba"
                value={cidade}
                onChange={event => setCidade(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && search()}
              />
            </label>
          </div>

          <div className="suggestions" aria-label="Sugestões de nicho">
            {NICHO_SUGESTOES.map(sugestao => (
              <button
                key={sugestao}
                className={nicho === sugestao ? 'chip active' : 'chip'}
                onClick={() => setNicho(sugestao)}
                type="button"
              >
                {sugestao}
              </button>
            ))}
          </div>

          <div className="actions-row">
            <button
              className="button primary"
              onClick={search}
              disabled={loading || !nicho.trim() || !cidade.trim()}
            >
              {loading ? 'Buscando...' : 'Buscar leads'}
            </button>

            <label className="select-field">
              <span>Máximo</span>
              <select value={maxItems} onChange={event => setMaxItems(Number(event.target.value))}>
                {[10, 20, 30, 50].map(value => (
                  <option key={value} value={value}>
                    {value} leads
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {error && <p className="alert error">{error}</p>}

        {loading && (
          <section className="status-panel" aria-live="polite">
            <span className="loader" aria-hidden />
            <h2>Consultando Google Maps</h2>
            <p>A busca pode levar até 2 minutos, dependendo do volume.</p>
          </section>
        )}

        {!loading && leads.length > 0 && (
          <section className="results-section" aria-label="Resultados">
            <div className="results-summary">
              <p>
                Busca: <strong>{lastQuery}</strong>
              </p>
              <span>{leads.length} leads encontrados</span>
            </div>

            <div className="lead-list">
              {leads.map((lead, index) => (
                <article className="lead-item" key={`${lead.title}-${index}`}>
                  <div className="lead-main">
                    <div className="lead-title-row">
                      <h2>{lead.title}</h2>
                      {lead.totalScore != null && (
                        <span className="score">
                          Nota {lead.totalScore}
                          {lead.reviewsCount ? ` (${lead.reviewsCount})` : ''}
                        </span>
                      )}
                    </div>
                    {lead.categoryName && <span className="tag">{lead.categoryName}</span>}
                    {lead.address && <p>{lead.address}</p>}
                  </div>

                  <div className="lead-actions">
                    {lead.phone && <a href={`tel:${lead.phone}`}>{lead.phone}</a>}
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer">
                        Site
                      </a>
                    )}
                    {lead.url && (
                      <a href={lead.url} target="_blank" rel="noopener noreferrer">
                        Maps
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!loading && leads.length === 0 && !error && (
          <section className="status-panel muted">
            <h2>Pronto para buscar</h2>
            <p>Informe um nicho e uma cidade para começar a prospectar.</p>
          </section>
        )}
      </div>
    </main>
  )
}
