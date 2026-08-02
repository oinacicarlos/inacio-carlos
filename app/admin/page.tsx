import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <main className="admin-entry-page">
      <section className="admin-entry-shell" aria-labelledby="admin-entry-title">
        <div className="admin-entry-brand">Tropa</div>
        <header className="admin-entry-header">
          <span>Login admin</span>
          <h1 id="admin-entry-title">Escolha o módulo de atendimento.</h1>
          <p>Selecione Offline para o painel atual ou Online para acompanhar os clientes que já usam o Hub.</p>
        </header>

        <div className="admin-entry-grid" aria-label="Módulos principais do admin">
          <Link className="admin-entry-card" href="/clientes">
            <span className="admin-entry-card-kicker">Módulo atual</span>
            <strong>Offline</strong>
            <p>Clientes, PFX, solicitações e onboarding no painel administrativo atual.</p>
            <em>Abrir Offline</em>
          </Link>

          <Link className="admin-entry-card is-online" href="/clientes/online">
            <span className="admin-entry-card-kicker">Novo sistema</span>
            <strong>Online</strong>
            <p>Clientes do Hub, planos, solicitações, compras, onboarding e uso das ferramentas.</p>
            <em>Abrir Online</em>
          </Link>
        </div>
      </section>
    </main>
  )
}
