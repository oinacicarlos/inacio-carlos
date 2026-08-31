'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'
import { Home, Globe } from 'lucide-react'
import { PILLARS, type Pillar, type PillarId } from '@/lib/admin-pillars'

type AdminPillarContextValue = {
  pillarId: PillarId
  pillar: Pillar
  setPillarId: (id: PillarId) => void
}

const AdminPillarContext = createContext<AdminPillarContextValue | null>(null)

export function useAdminPillar() {
  const context = useContext(AdminPillarContext)
  if (!context) {
    throw new Error('useAdminPillar deve ser usado dentro de <AdminShell>.')
  }
  return context
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [pillarId, setPillarIdState] = useState<PillarId>('processos')
  const pillar = PILLARS.find(item => item.id === pillarId) ?? PILLARS[1]

  const setPillarId = (id: PillarId) => {
    setPillarIdState(id)
    if (pathname !== '/admin') {
      router.push('/admin')
    }
  }

  const contextValue = useMemo(() => ({ pillarId, pillar, setPillarId }), [pillarId, pillar, pathname])

  return (
    <AdminPillarContext.Provider value={contextValue}>
      <main className="admin-home-page">
        <div className="admin-home-shell">
          <aside className="admin-home-rail" aria-label={`Navegação de ${pillar.label}`}>
            <div className="admin-home-rail-head">
              <h2>{pillar.label}</h2>
            </div>

            <span className="admin-home-nav-label">Navegação</span>
            <div className="admin-home-nav">
              <Link
                href="/admin"
                className={pathname === '/admin' ? 'admin-home-nav-item active' : 'admin-home-nav-item'}
                aria-current={pathname === '/admin' ? 'page' : undefined}
              >
                <Home size={16} aria-hidden />
                Visão geral
              </Link>
              {pillar.modules.map(item => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={active ? 'admin-home-nav-item active' : 'admin-home-nav-item'}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={16} aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="admin-home-rail-foot">
              <Link href="/clientes/online" className="admin-home-online-link">
                <Globe size={14} aria-hidden />
                Painel online
              </Link>
            </div>
          </aside>

          <div className="admin-home-content">
            <nav className="admin-home-pillars" aria-label="Frentes da operação">
              {PILLARS.map(item => {
                const Icon = item.icon
                const active = item.id === pillarId
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={active ? 'admin-home-pillar-card active' : 'admin-home-pillar-card'}
                    onClick={() => setPillarId(item.id)}
                    aria-pressed={active}
                  >
                    <span className="admin-home-pillar-icon">
                      <Icon size={20} aria-hidden />
                    </span>
                    <span className="admin-home-pillar-body">
                      <strong>{item.label}</strong>
                      <span>{item.tagline}</span>
                    </span>
                  </button>
                )
              })}
            </nav>

            {children}
          </div>
        </div>
      </main>
    </AdminPillarContext.Provider>
  )
}
