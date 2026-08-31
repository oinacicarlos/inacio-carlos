'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ArrowRight, CalendarDays, ShieldCheck, Users } from 'lucide-react'
import { useAdminPillar } from '@/components/admin-shell'
import type { PillarId, UpcomingItem } from '@/lib/admin-pillars'

type PfxUpcomingRow = {
  clientName: string
  validityDate: string
  status: 'expired' | 'soon'
  daysUntil: number
}

type ProcessosSnapshot = {
  loading: boolean
  totalClients: number
  activeClients: number
  competenceMonthLabel: string
  competencePending: number
  competenceTotal: number
  pfxExpired: number
  pfxSoon: number
  pfxUpcoming: PfxUpcomingRow[]
}

const INITIAL_PROCESSOS_SNAPSHOT: ProcessosSnapshot = {
  loading: true,
  totalClients: 0,
  activeClients: 0,
  competenceMonthLabel: '',
  competencePending: 0,
  competenceTotal: 0,
  pfxExpired: 0,
  pfxSoon: 0,
  pfxUpcoming: [],
}

const EMPTY_MESSAGES: Record<PillarId, string> = {
  marketing: 'Sem pendências por aqui no momento.',
  processos: 'Nenhuma pendência encontrada nos dados atuais.',
  utilitarios: 'Os utilitários ainda estão em produção — assim que Links e Anexos existirem, os pendentes aparecem aqui.',
}

function getDaysUntil(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateStr}T00:00:00`)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function getPfxStatus(dateStr: string | null): 'expired' | 'soon' | 'valid' | 'missing' {
  if (!dateStr) return 'missing'
  const days = getDaysUntil(dateStr)
  if (days < 0) return 'expired'
  if (days <= 30) return 'soon'
  return 'valid'
}

function capitalize(text: string) {
  return text.length > 0 ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

function buildProcessosUpcoming(snapshot: ProcessosSnapshot): UpcomingItem[] {
  const rows: UpcomingItem[] = []

  rows.push({
    icon: Users,
    tone: 'neutral',
    title: 'Clientes ativos',
    subtitle: `${snapshot.totalClients} cadastrados no total`,
    when: '',
    badge: `${snapshot.activeClients} ativos`,
  })

  rows.push({
    icon: CalendarDays,
    tone: snapshot.competencePending > 0 ? 'warn' : 'info',
    title: `Competências de ${snapshot.competenceMonthLabel}`,
    subtitle:
      snapshot.competenceTotal > 0
        ? `${snapshot.competencePending} pendente(s) de ${snapshot.competenceTotal} rotina(s)`
        : 'Nenhuma competência lançada ainda neste mês',
    when: '',
    badge: snapshot.competencePending > 0 ? `${snapshot.competencePending} pendentes` : 'Em dia',
  })

  for (const item of snapshot.pfxUpcoming) {
    const days = Math.abs(item.daysUntil)
    rows.push({
      icon: ShieldCheck,
      tone: item.status === 'expired' ? 'danger' : 'warn',
      title: item.status === 'expired' ? 'PFX vencido' : 'PFX vence em breve',
      subtitle: item.clientName || 'Cliente sem nome cadastrado',
      when: new Date(`${item.validityDate}T00:00:00`).toLocaleDateString('pt-BR'),
      badge:
        item.status === 'expired'
          ? `Vencido há ${days} dia${days === 1 ? '' : 's'}`
          : item.daysUntil === 0
            ? 'Hoje'
            : `Em ${item.daysUntil} dia${item.daysUntil === 1 ? '' : 's'}`,
    })
  }

  if (snapshot.pfxExpired === 0 && snapshot.pfxSoon === 0) {
    rows.push({
      icon: ShieldCheck,
      tone: 'info',
      title: 'PFX em dia',
      subtitle: 'Nenhum certificado vencido ou vencendo nos próximos 30 dias',
      when: '',
      badge: 'Tudo certo',
    })
  }

  return rows
}

export default function AdminHome() {
  const { pillar } = useAdminPillar()
  const [processos, setProcessos] = useState<ProcessosSnapshot>(INITIAL_PROCESSOS_SNAPSHOT)

  useEffect(() => {
    let cancelled = false

    async function loadProcessosSnapshot() {
      const now = new Date()
      const monthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().slice(0, 10)

      const [clientsRes, pfxRes, competencesRes] = await Promise.all([
        supabase.from('routine_clients').select('status'),
        supabase.from('pfx_clients').select('client_name, validity_date').order('validity_date', { ascending: true }),
        supabase.from('routine_competences').select('id').eq('competence_month', monthStart),
      ])

      const clientRows = clientsRes.data ?? []
      const totalClients = clientRows.length
      const activeClients = clientRows.filter((row: { status: string }) => row.status === 'Ativo').length

      const pfxRows = pfxRes.data ?? []
      let pfxExpired = 0
      let pfxSoon = 0
      const pfxUpcoming: PfxUpcomingRow[] = []
      for (const row of pfxRows as Array<{ client_name: string; validity_date: string | null }>) {
        const status = getPfxStatus(row.validity_date)
        if (status === 'expired') pfxExpired += 1
        if (status === 'soon') pfxSoon += 1
        if ((status === 'expired' || status === 'soon') && row.validity_date && pfxUpcoming.length < 3) {
          pfxUpcoming.push({
            clientName: row.client_name,
            validityDate: row.validity_date,
            status,
            daysUntil: getDaysUntil(row.validity_date),
          })
        }
      }

      const competenceIds = (competencesRes.data ?? []).map((row: { id: string }) => row.id)
      let competencePending = 0
      let competenceTotal = 0
      if (competenceIds.length > 0) {
        const { data: items } = await supabase.from('routine_items').select('status').in('competence_id', competenceIds)
        const itemRows = items ?? []
        competenceTotal = itemRows.length
        competencePending = itemRows.filter((row: { status: string }) => row.status === 'Pendente').length
      }

      if (cancelled) return

      setProcessos({
        loading: false,
        totalClients,
        activeClients,
        competenceMonthLabel: capitalize(now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })),
        competencePending,
        competenceTotal,
        pfxExpired,
        pfxSoon,
        pfxUpcoming,
      })
    }

    loadProcessosSnapshot().catch(() => {
      if (!cancelled) setProcessos(current => ({ ...current, loading: false }))
    })

    return () => {
      cancelled = true
    }
  }, [])

  const isProcessos = pillar.id === 'processos'
  const upcoming = isProcessos ? buildProcessosUpcoming(processos) : pillar.upcoming
  const isLoadingUpcoming = isProcessos && processos.loading

  return (
    <>
      <section className="admin-home-section">
        <div className="admin-home-section-head">
          <h3>Atalhos do dia</h3>
          <p>Ações rápidas para o que você mais usa.</p>
        </div>
        <div className="admin-home-shortcuts">
          {pillar.shortcuts.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={item.status === 'soon' ? 'admin-home-shortcut soon' : 'admin-home-shortcut'}
              >
                <Icon size={20} aria-hidden />
                <span>{item.label}</span>
                {item.status === 'soon' ? (
                  <span className="admin-home-tag inline">Em produção</span>
                ) : (
                  <ArrowRight size={15} className="admin-home-shortcut-arrow" aria-hidden />
                )}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="admin-home-section">
        <div className="admin-home-section-head">
          <h3>Vencimentos e próximos passos</h3>
          <p>Fique por dentro do que exige atenção.</p>
        </div>

        {isLoadingUpcoming ? (
          <div className="admin-home-empty">Carregando clientes, competências e PFX…</div>
        ) : upcoming.length === 0 ? (
          <div className="admin-home-empty">{EMPTY_MESSAGES[pillar.id]}</div>
        ) : (
          <div className="admin-home-upcoming">
            {upcoming.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="admin-home-upcoming-row">
                  <span className={`admin-home-upcoming-icon tone-${item.tone}`}>
                    <Icon size={16} aria-hidden />
                  </span>
                  <span className="admin-home-upcoming-text">
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </span>
                  {item.when && (
                    <span className="admin-home-upcoming-when">
                      <CalendarDays size={13} aria-hidden />
                      {item.when}
                    </span>
                  )}
                  <span className={`admin-home-badge tone-${item.tone}`}>{item.badge}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
