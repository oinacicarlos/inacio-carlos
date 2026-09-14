'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'

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

function formatRate(numerator: number, denominator: number) {
  if (!denominator) return '—'
  return `${((numerator / denominator) * 100).toFixed(1)}%`
}

export default function WhatsappReports({ onBack }: { onBack: () => void }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

      <div className="disparazap-reports-heading">
        <div>
          <h2>Relatórios de disparo</h2>
          <p className="disparos-panel-hint">Compare campanhas pra ver qual abordagem trouxe mais resposta.</p>
        </div>
        <button type="button" className="disparazap-reports-refresh" onClick={() => void loadCampaigns()} disabled={loading}>
          <RefreshCw size={14} aria-hidden />
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {error && <p className="clientes-nucleo-modal-error">{error}</p>}

      {loading && campaigns.length === 0 ? (
        <div className="disparazap-inbox-empty">Carregando campanhas...</div>
      ) : campaigns.length === 0 ? (
        <div className="disparazap-inbox-empty">
          <strong>Nenhuma campanha ainda</strong>
          <span>Assim que você criar um disparo em grupo, ele aparece aqui pra comparar.</span>
        </div>
      ) : (
        <div className="disparazap-reports-groups">
          {groups.map(([groupName, groupCampaigns]) => (
            <div key={groupName} className="disparazap-reports-group">
              <h3>{groupName}</h3>
              <div className="disparazap-reports-cards">
                {groupCampaigns.map(campaign => (
                  <div key={campaign.id} className="disparazap-reports-card">
                    <header>
                      <strong>{campaign.name}</strong>
                      <span className={`disparazap-reports-status is-${campaign.status}`}>{campaign.status}</span>
                    </header>
                    <span className="disparazap-reports-template">
                      {campaign.template_name} · {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="disparazap-reports-stats">
                      <div><span>Enviados</span><strong>{campaign.total_sent}</strong></div>
                      <div><span>Entregues</span><strong>{campaign.total_delivered}</strong><small>{formatRate(campaign.total_delivered, campaign.total_sent)}</small></div>
                      <div><span>Lidos</span><strong>{campaign.total_read}</strong><small>{formatRate(campaign.total_read, campaign.total_sent)}</small></div>
                      <div><span>Responderam</span><strong>{campaign.total_replied}</strong><small>{formatRate(campaign.total_replied, campaign.total_sent)}</small></div>
                      <div className="is-highlight"><span>Interessados</span><strong>{campaign.total_interested}</strong><small>{formatRate(campaign.total_interested, campaign.total_sent)}</small></div>
                      <div><span>Opt-out</span><strong>{campaign.total_optout}</strong><small>{formatRate(campaign.total_optout, campaign.total_contacts)}</small></div>
                    </div>
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
