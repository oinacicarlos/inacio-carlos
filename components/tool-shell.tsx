import type { ReactNode } from "react"
import { Menu, X } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import ToolBackToHub from "@/components/tool-back-to-hub"
import { FooterDark } from "@/components/footer-dark"
import { HeaderMain } from "@/components/header-main"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"
import {
  COMPANY_ADDRESS_LINE,
  COMPANY_ADDRESS_ZIP,
  COMPANY_CNPJ,
  COMPANY_EMAIL,
  COMPANY_LEGAL_NAME,
  CRC_REGISTRATION,
} from "@/lib/company-info"

const darkFooterTools = [
  { title: "Gerador de Contrato", href: "/ferramentas/gerador-contrato" },
  { title: "Simulador de Rescisão", href: "/ferramentas/simulador-rescisao" },
  { title: "Simulador de Contratação", href: "/ferramentas/simulador-contratacao" },
  { title: "Calculadora de Precificação", href: "/ferramentas/calculadora-precificacao" },
]

type ToolShellProps = {
  children: ReactNode
  headerActions?: ReactNode
  mainClassName?: string
  variant?: "light" | "dark"
}

const defaultHeaderActions = (
  <>
    <a className="accounting-login" href="/login">
      Login
    </a>
    <a className="accounting-header-cta" href="/#planos">
      <span>Ver Planos</span>
      <span aria-hidden="true">›</span>
    </a>
  </>
)

// Cabeçalho e rodapé compartilhados por todas as ferramentas — mesmo
// cabeçalho da home, com o menu de âncoras, pra manter a sensação de estar
// no mesmo site ao entrar numa ferramenta.
export function ToolShell({ children, headerActions = defaultHeaderActions, mainClassName, variant = "light" }: ToolShellProps) {
  const isDark = variant === "dark"

  return (
    <main
      className={`accounting-landing${mainClassName ? ` ${mainClassName}` : ""}${isDark ? " accounting-landing--legal-dark" : ""}`}
    >
      <ToolBackToHub />

      {isDark ? (
        <HeaderMain basePath="/" className="accounting-header--legal-dark" />
      ) : (
        <header className="accounting-header accounting-header--home" aria-label="Cabeçalho Tropa">
          <div className="accounting-header-inner">
            <a className="accounting-logo" href="/" aria-label="Tropa">
              <BrandLogo variant="black" />
            </a>

            <input type="checkbox" id="accounting-mobile-nav-toggle" className="accounting-mobile-nav-checkbox" />

            <nav className="accounting-nav" aria-label="Navegação principal">
              <a href="/#ofertas">Serviços</a>
              <a href="/#atendimento">Atendimento</a>
              <a href="/#solucoes">Soluções</a>
              <a href="/#planos">Planos</a>
              <a href="/blog">Blog</a>
              <a href="/#duvidas">Dúvidas</a>
              <a className="accounting-nav-login" href="/login">
                Entrar
              </a>
            </nav>

            <div className="accounting-header-actions">
              {headerActions}
              <label
                className="accounting-mobile-nav-toggle"
                htmlFor="accounting-mobile-nav-toggle"
                aria-label="Abrir menu de navegação"
              >
                <Menu size={22} strokeWidth={2.2} className="accounting-mobile-nav-icon-open" aria-hidden="true" />
                <X size={22} strokeWidth={2.2} className="accounting-mobile-nav-icon-close" aria-hidden="true" />
              </label>
            </div>
          </div>
        </header>
      )}

      {children}

      {isDark ? (
        <FooterDark basePath="/" tools={darkFooterTools} plansHref="/#planos" />
      ) : (
        <footer className="accounting-footer" aria-label="Rodapé Tropa">
          <div className="accounting-footer-inner">
            <div className="accounting-footer-brand">
              <a className="accounting-logo" href="/" aria-label="Tropa">
                <BrandLogo variant="black" />
              </a>
              <p>Assessoria empresarial para prestadores de serviço e empreendedores que querem crescer com organização.</p>
            </div>

            <nav className="accounting-footer-nav" aria-label="Links do rodapé">
              <div>
                <h2>Menu</h2>
                <a href="/#ofertas">Serviços</a>
                <a href="/#atendimento">Atendimento</a>
                <a href="/#solucoes">Soluções</a>
                <a href="/#planos">Planos</a>
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
                <h2>Institucional</h2>
                <a href="/sobre">Sobre Nós</a>
                <a href="/contato">Contato</a>
                <a href="/politica-de-privacidade">Política de Privacidade</a>
                <a href="/termos-de-uso">Termos de Uso</a>
              </div>

              <div>
                <h2>Contato</h2>
                <a href={TROPA_WHATSAPP_LINK} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
                <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
              </div>
            </nav>
          </div>

          <div className="accounting-footer-disclaimer">
            <p>
              {COMPANY_LEGAL_NAME} — CNPJ {COMPANY_CNPJ}
              <br />
              {COMPANY_ADDRESS_LINE} — {COMPANY_ADDRESS_ZIP}
            </p>
            <p>Responsável técnico: {CRC_REGISTRATION}.</p>
          </div>

          <div className="accounting-footer-bottom">
            <span>© 2026 {COMPANY_LEGAL_NAME}. Todos os direitos reservados.</span>
            <div className="accounting-footer-bottom-links">
              <a href="/politica-de-privacidade">Política de Privacidade</a>
              <a href="/termos-de-uso">Termos de Uso</a>
              <a href="/#planos">Ver Planos</a>
            </div>
          </div>
        </footer>
      )}
    </main>
  )
}

export const paywallHeaderActions = (
  <a className="accounting-login" href="/hub">
    Meu hub
  </a>
)
