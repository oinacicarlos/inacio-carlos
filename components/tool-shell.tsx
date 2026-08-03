import type { ReactNode } from "react"
import { BrandLogo } from "@/components/brand-logo"
import ToolBackToHub from "@/components/tool-back-to-hub"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"

type ToolShellProps = {
  children: ReactNode
  headerActions?: ReactNode
  mainClassName?: string
}

const defaultHeaderActions = (
  <>
    <a className="accounting-login" href="/login">
      Login
    </a>
    <a className="accounting-header-cta" href="/abrir-cnpj">
      <span>Abrir CNPJ</span>
      <span aria-hidden="true">›</span>
    </a>
  </>
)

// Cabeçalho e rodapé compartilhados por todas as ferramentas — mesmo
// cabeçalho da home, com o menu de âncoras, pra manter a sensação de estar
// no mesmo site ao entrar numa ferramenta.
export function ToolShell({ children, headerActions = defaultHeaderActions, mainClassName }: ToolShellProps) {
  return (
    <main className={`accounting-landing${mainClassName ? ` ${mainClassName}` : ""}`}>
      <ToolBackToHub />
      <header className="accounting-header" aria-label="Cabeçalho Tropa">
        <a className="accounting-logo" href="/" aria-label="Tropa">
          <BrandLogo variant="black" />
        </a>

        <nav className="accounting-nav" aria-label="Navegação principal">
          <a href="/#servicos">Serviços</a>
          <a href="/#planos">Planos</a>
          <a href="/#ferramentas" className="is-active">Ferramentas</a>
          <a href="/blog">Blog</a>
          <a href="/#duvidas">Dúvidas</a>
        </nav>

        <div className="accounting-header-actions">{headerActions}</div>
      </header>

      {children}

      <footer className="accounting-footer" aria-label="Rodapé Tropa">
        <div className="accounting-footer-inner">
          <div className="accounting-footer-brand">
            <a className="accounting-logo" href="/" aria-label="Tropa">
              <BrandLogo variant="black" />
            </a>
            <p>Assessoria empresarial para prestadores de serviço, MEIs e empresas que querem crescer com organização.</p>
          </div>

          <nav className="accounting-footer-nav" aria-label="Links do rodapé">
            <div>
              <h2>Menu</h2>
              <a href="/#servicos">Serviços</a>
              <a href="/#planos">Planos</a>
              <a href="/#ferramentas">Ferramentas</a>
              <a href="/blog">Blog</a>
              <a href="/#duvidas">Dúvidas</a>
              <a href="/login">Login</a>
            </div>

            <div>
              <h2>Ferramentas</h2>
              <a href="/ferramentas/gerador-contrato">Gerador de Contrato</a>
              <a href="/ferramentas/simulador-rescisao">Simulador de Rescisão</a>
              <a href="/ferramentas/simulador-contratacao">Simulador de Contratação</a>
              <a href="/ferramentas/calculadora-precificacao">Calculadora de Precificação</a>
            </div>

            <div>
              <h2>Contato</h2>
              <a href={TROPA_WHATSAPP_LINK} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </nav>
        </div>

        <div className="accounting-footer-bottom">
          <span>© 2026 Tropa. Todos os direitos reservados.</span>
          <a href="/abrir-cnpj">Abrir CNPJ</a>
        </div>
      </footer>
    </main>
  )
}

export const paywallHeaderActions = (
  <a className="accounting-login" href="/hub">
    Meu hub
  </a>
)
