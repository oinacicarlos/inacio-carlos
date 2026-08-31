import { Menu, MoveUpRight, X } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"

const HEADER_OPEN_COMPANY_WHATSAPP_LINK = `${TROPA_WHATSAPP_LINK}?text=${encodeURIComponent(
  "Oi, quero abrir uma empresa e gostaria de saber mais sobre a contabilidade da Tropa",
)}`

type HeaderMainProps = {
  // "" quando renderizado na própria home (âncoras tipo "#planos"); "/" nas
  // demais páginas, pra virar "/#planos" e navegar de volta pra home.
  basePath?: string
  className?: string
}

// Cabeçalho compartilhado pela home e pelas páginas institucionais — mesma
// marcação/classes em ambos os lugares pra manter o cabeçalho idêntico em
// todo o site.
export function HeaderMain({ basePath = "", className }: HeaderMainProps) {
  return (
    <header
      className={`accounting-header accounting-header--home${className ? ` ${className}` : ""}`}
      aria-label="Cabeçalho Tropa"
    >
      <div className="accounting-header-inner">
        <a className="accounting-logo" href="/" aria-label="Tropa">
          <BrandLogo variant="white" />
        </a>

        <input type="checkbox" id="accounting-mobile-nav-toggle" className="accounting-mobile-nav-checkbox" />

        <nav className="accounting-nav" aria-label="Navegação principal">
          <a href="/">Home</a>
          <a href={`${basePath}#planos`}>Planos</a>
          <a href={`${basePath}#ofertas`}>Serviços</a>
          <a href="/sobre">Sobre</a>
          <a className="accounting-nav-login" href="/login">
            Login
          </a>
        </nav>

        <div className="accounting-header-actions">
          <a className="accounting-login" href="/login">
            Login
            <MoveUpRight size={15} strokeWidth={2.4} aria-hidden="true" />
          </a>
          <a
            className="accounting-header-cta"
            href={HEADER_OPEN_COMPANY_WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
          >
            Abrir empresa
          </a>
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
  )
}
