import Link from 'next/link'
import { ChevronRight, Globe, Monitor } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <main className="admin-entry-page">
      <section className="admin-entry-shell" aria-labelledby="admin-entry-title">
        <span className="admin-entry-badge">ADMIN</span>

        <header className="admin-entry-header">
          <h1 id="admin-entry-title">Escolha o módulo de atendimento</h1>
          <p>Selecione o ambiente que deseja acessar para continuar.</p>
        </header>

        <div className="admin-entry-options" aria-label="Módulos principais do admin">
          <Link className="admin-entry-option" href="/clientes">
            <span className="admin-entry-option-icon" aria-hidden>
              <Monitor size={21} />
            </span>
            <span className="admin-entry-option-body">
              <strong>Offline</strong>
              <span className="admin-entry-option-desc">Painel administrativo atual</span>
            </span>
            <ChevronRight className="admin-entry-option-arrow" size={19} aria-hidden />
          </Link>

          <Link className="admin-entry-option" href="/clientes/online">
            <span className="admin-entry-option-icon" aria-hidden>
              <Globe size={21} />
            </span>
            <span className="admin-entry-option-body">
              <strong>Online</strong>
              <span className="admin-entry-option-desc">Hub e ferramentas</span>
            </span>
            <ChevronRight className="admin-entry-option-arrow" size={19} aria-hidden />
          </Link>
        </div>

        <p className="admin-entry-footnote">Você pode trocar de módulo a qualquer momento.</p>
      </section>
    </main>
  )
}
