'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

type Campaign = {
  id: string
  name: string
  template_name: string
  status: string
  test_group: string | null
  total_contacts: number
  total_sent: number
  total_delivered: number
  total_read: number
  total_optout: number
  total_replied: number
  total_interested: number
  created_at: string
}

type RecipientDetail = {
  id: string
  name: string
  phone: string
  status: string
  error_message: string | null
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  ready: 'Pronta',
  processing: 'Processando',
  paused: 'Pausada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  failed: 'Falhou',
}

const STATUS_CHIP_CLASS: Record<string, string> = {
  completed: 'ok',
  processing: 'blue',
  ready: 'blue',
  failed: 'danger',
  cancelled: 'danger',
  draft: 'muted',
  paused: 'muted',
}

function formatRate(numerator: number, denominator: number) {
  if (!denominator) return '—'
  return `${((numerator / denominator) * 100).toFixed(1)}%`
}

export default function WhatsappReports({ onBack }: { onBack: () => void }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState('')
  const [detailsById, setDetailsById] = useState<Record<string, RecipientDetail[]>>({})
  const [detailsLoading, setDetailsLoading] = useState('')

  async function loadCampaigns() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/whatsapp/campaigns')
      const data = await response.json()
      if (!response.ok || !data.ok || !Array.isArray(data.campaigns)) {
        setError('Não consegui carregar os relatórios.')
        return
      }
      setCampaigns(data.campaigns)
    } catch {
      setError('Não consegui carregar os relatórios agora.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  async function toggleDetails(campaignId: string) {
    if (expandedId === campaignId) {
      setExpandedId('')
      return
    }

    setExpandedId(campaignId)
    if (detailsById[campaignId]) return

    setDetailsLoading(campaignId)
    try {
      const response = await fetch(`/api/whatsapp/campaigns/${campaignId}`)
      const data = await response.json()
      if (response.ok && data.ok && Array.isArray(data.recipients)) {
        setDetailsById(current => ({ ...current, [campaignId]: data.recipients }))
      }
    } finally {
      setDetailsLoading('')
    }
  }

  const groups = useMemo(() => {
    const map = new Map<string, Campaign[]>()
    for (const campaign of campaigns) {
      const key = campaign.test_group?.trim() || 'Sem grupo de teste'
      const list = map.get(key) ?? []
      list.push(campaign)
      map.set(key, list)
    }
    return Array.from(map.entries())
  }, [campaigns])

  return (
    <div className="disparos-panel">
      <button type="button" className="module-soon-back disparos-back" onClick={onBack}>
        <ArrowLeft size={15} aria-hidden />
        Voltar
      </button>

      <div className="disparos-report-head">
        <div>
          <h2>Relatórios de disparo</h2>
          <p className="disparos-panel-hint">Compare campanhas pra ver qual abordagem trouxe mais resposta.</p>
        </div>
        <button type="button" className="clientes-nucleo-btn ghost" onClick={() => void loadCampaigns()} disabled={loading}>
          <RefreshCw size={14} aria-hidden />
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {error && <p className="clientes-nucleo-modal-error">{error}</p>}

      {loading && campaigns.length === 0 ? (
        <p className="routine-department-empty">Carregando campanhas…</p>
      ) : campaigns.length === 0 ? (
        <p className="routine-department-empty">Assim que você criar um disparo em grupo, ele aparece aqui pra comparar.</p>
      ) : (
        <div className="disparos-report-groups">
          {groups.map(([groupName, groupCampaigns]) => (
            <div key={groupName} className="disparos-report-group">
              <h3>{groupName}</h3>
              <div className="disparos-report-cards">
                {groupCampaigns.map(campaign => (
                  <div key={campaign.id} className="links-category">
                    <div className="disparos-report-card-head">
                      <strong>{campaign.name}</strong>
                      <span className={`clientes-nucleo-chip ${STATUS_CHIP_CLASS[campaign.status] ?? 'muted'}`}>
                        {STATUS_LABELS[campaign.status] ?? campaign.status}
                      </span>
                    </div>
                    <span className="disparos-report-meta">
                      {campaign.template_name} · {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="disparos-report-stats">
                      <div><span>Enviados</span><strong>{campaign.total_sent}</strong></div>
                      <div><span>Entregues</span><strong>{campaign.total_delivered}</strong><small>{formatRate(campaign.total_delivered, campaign.total_sent)}</small></div>
                      <div><span>Lidos</span><strong>{campaign.total_read}</strong><small>{formatRate(campaign.total_read, campaign.total_sent)}</small></div>
                      <div><span>Responderam</span><strong>{campaign.total_replied}</strong><small>{formatRate(campaign.total_replied, campaign.total_sent)}</small></div>
                      <div className="is-highlight"><span>Interessados</span><strong>{campaign.total_interested}</strong><small>{formatRate(campaign.total_interested, campaign.total_sent)}</small></div>
                      <div><span>Opt-out</span><strong>{campaign.total_optout}</strong><small>{formatRate(campaign.total_optout, campaign.total_contacts)}</small></div>
                    </div>

                    <button type="button" className="disparos-report-details-toggle" onClick={() => void toggleDetails(campaign.id)}>
                      {expandedId === campaign.id ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />}
                      {expandedId === campaign.id ? 'Esconder destinatários' : 'Ver destinatários'}
                    </button>

                    {expandedId === campaign.id && (
                      <div className="disparos-report-details">
                        {detailsLoading === campaign.id ? (
                          <p className="routine-department-empty">Carregando destinatários…</p>
                        ) : !detailsById[campaign.id]?.length ? (
                          <p className="routine-department-empty">Nenhum destinatário encontrado.</p>
                        ) : (
                          detailsById[campaign.id].map(recipient => (
                            <div key={recipient.id} className="disparos-report-detail-row">
                              <div>
                                <strong>{recipient.name}</strong>
                                <span>{recipient.phone}</span>
                              </div>
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
                              {recipient.error_message && <small>{recipient.error_message}</small>}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
