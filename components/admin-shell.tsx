'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Home, Globe } from 'lucide-react'
import { PILLARS, type Pillar, type PillarId } from '@/lib/admin-pillars'

type RailView = 'pillars' | 'modules'

function getPillarIdFromPathname(pathname: string): PillarId | null {
  for (const candidate of PILLARS) {
    const matches = candidate.modules.some(item => pathname === item.href || pathname.startsWith(`${item.href}/`))
    if (matches) return candidate.id
  }
  return null
}

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
  const [pillarId, setPillarIdState] = useState<PillarId>(() => getPillarIdFromPathname(pathname) ?? 'processos')
  const [railView, setRailView] = useState<RailView>('modules')
  const pillar = PILLARS.find(item => item.id === pillarId) ?? PILLARS[1]

  useEffect(() => {
    const matched = getPillarIdFromPathname(pathname)
    if (matched) {
      setPillarIdState(current => (current === matched ? current : matched))
      setRailView('modules')
    }
  }, [pathname])

  const setPillarId = (id: PillarId) => {
    setPillarIdState(id)
    setRailView('modules')
    if (pathname !== '/admin') {
      router.push('/admin')
    }
  }

  const contextValue = useMemo(() => ({ pillarId, pillar, setPillarId }), [pillarId, pillar, pathname])

  return (
    <AdminPillarContext.Provider value={contextValue}>
      <main className="admin-home-page">
        <div className="admin-home-shell">
          <aside className="admin-home-rail" aria-label="Navegação principal">
            <Link href="/admin" className="admin-home-rail-icon" aria-label="Visão geral" data-tip="Visão geral">
              <Home size={20} aria-hidden />
            </Link>

            {railView === 'pillars' ? (
              <div className="admin-home-rail-group" role="tablist" aria-label="Módulos principais">
                {PILLARS.map(item => {
                  const Icon = item.icon
                  const active = item.id === pillarId
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={active ? 'admin-home-rail-icon active' : 'admin-home-rail-icon'}
                      onClick={() => setPillarId(item.id)}
                      aria-pressed={active}
                      data-tip={item.label}
                    >
                      <Icon size={20} aria-hidden />
                    </button>
                  )
                })}
              </div>
            ) : (
              <>
                <div className="admin-home-rail-back-group">
                  <button
                    type="button"
                    className="admin-home-rail-icon is-back"
                    onClick={() => setRailView('pillars')}
                    aria-label="Voltar para os módulos principais"
                    data-tip="Voltar"
                  >
                    <ArrowLeft size={18} aria-hidden />
                  </button>
                </div>
                <div className="admin-home-rail-group" role="tablist" aria-label={`Módulos de ${pillar.label}`}>
                  {pillar.modules.map(item => {
                    const Icon = item.icon
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={active ? 'admin-home-rail-icon active' : 'admin-home-rail-icon'}
                        aria-current={active ? 'page' : undefined}
                        data-tip={item.label}
                      >
                        <Icon size={20} aria-hidden />
                      </Link>
                    )
                  })}
                </div>
              </>
            )}

            <div className="admin-home-rail-foot">
              <Link href="/clientes/online" className="admin-home-rail-icon" aria-label="Painel online" data-tip="Painel online">
                <Globe size={18} aria-hidden />
              </Link>
            </div>
          </aside>

          <div className="admin-home-content">
            {children}
          </div>
        </div>
      </main>
    </AdminPillarContext.Provider>
  )
}
