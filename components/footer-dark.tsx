import {
  Building2,
  ChevronRight,
  Copyright,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"
import {
  COMPANY_ADDRESS_LINE,
  COMPANY_ADDRESS_ZIP,
  COMPANY_CNPJ,
  COMPANY_EMAIL,
  COMPANY_LEGAL_NAME,
  CRC_REGISTRATION,
} from "@/lib/company-info"

type FooterDarkTool = {
  title: string
  href: string
}

type FooterDarkProps = {
  // "" quando renderizado na própria home (âncoras tipo "#planos"); "/" nas
  // demais páginas, pra virar "/#planos" e navegar de volta pra home.
  basePath?: string
  tools: FooterDarkTool[]
  plansHref: string
}

// Rodapé escuro compartilhado pela home e pelas páginas institucionais —
// mesma marcação/classes em ambos os lugares pra manter o rodapé idêntico
// em todo o site.
export function FooterDark({ basePath = "", tools, plansHref }: FooterDarkProps) {
  return (
    <footer className="footer-dark" aria-label="Rodapé Tropa">
      <div className="footer-dark-inner">
        <div className="footer-dark-top">
          <div className="footer-dark-brand">
            <a className="footer-dark-logo" href="/" aria-label="Tropa">
              <BrandLogo variant="white" />
            </a>
            <p className="footer-dark-description">
              Assessoria empresarial para prestadores de serviço e empreendedores que querem crescer com
              organização.
            </p>
          </div>

          <nav className="footer-dark-nav" aria-label="Links do rodapé">
            <div className="footer-dark-col">
              <h2 className="footer-dark-col-title">
                <span className="footer-dark-col-dot" aria-hidden="true" />
                Menu
              </h2>
              <a className="footer-dark-link" href={`${basePath}#ofertas`}>
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Serviços
              </a>
              <a className="footer-dark-link" href={`${basePath}#atendimento`}>
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Atendimento
              </a>
              <a className="footer-dark-link" href={`${basePath}#solucoes`}>
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Soluções
              </a>
              <a className="footer-dark-link" href={`${basePath}#planos`}>
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Planos
              </a>
              <a className="footer-dark-link" href="/blog">
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Blog
              </a>
              <a className="footer-dark-link" href={`${basePath}#duvidas`}>
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Dúvidas
              </a>
              <a className="footer-dark-link" href="/login">
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Login
              </a>
            </div>

            <div className="footer-dark-col">
              <h2 className="footer-dark-col-title">
                <span className="footer-dark-col-dot" aria-hidden="true" />
                Ferramentas
              </h2>
              {tools.map(({ title, href }) => (
                <a className="footer-dark-link" href={href} key={title}>
                  <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  {title}
                </a>
              ))}
            </div>

            <div className="footer-dark-col">
              <h2 className="footer-dark-col-title">
                <span className="footer-dark-col-dot" aria-hidden="true" />
                Institucional
              </h2>
              <a className="footer-dark-link" href="/sobre">
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Sobre Nós
              </a>
              <a className="footer-dark-link" href="/contato">
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Contato
              </a>
              <a className="footer-dark-link" href="/politica-de-privacidade">
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Política de Privacidade
              </a>
              <a className="footer-dark-link" href="/termos-de-uso">
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                Termos de Uso
              </a>
            </div>

            <div className="footer-dark-col">
              <h2 className="footer-dark-col-title">
                <span className="footer-dark-col-dot" aria-hidden="true" />
                Contato
              </h2>
              <a className="footer-dark-contact-link" href={TROPA_WHATSAPP_LINK} target="_blank" rel="noreferrer">
                <span className="footer-dark-contact-icon" aria-hidden="true">
                  <MessageCircle size={16} strokeWidth={2.2} />
                </span>
                WhatsApp
              </a>
              <a className="footer-dark-contact-link" href={`mailto:${COMPANY_EMAIL}`}>
                <span className="footer-dark-contact-icon" aria-hidden="true">
                  <Mail size={16} strokeWidth={2.2} />
                </span>
                {COMPANY_EMAIL}
              </a>
            </div>
          </nav>
        </div>

        <span className="footer-dark-divider" aria-hidden="true" />

        <div className="footer-dark-legal">
          <div className="footer-dark-legal-item">
            <span className="footer-dark-legal-icon" aria-hidden="true">
              <Building2 size={16} strokeWidth={2} />
            </span>
            <p>
              {COMPANY_LEGAL_NAME} — CNPJ {COMPANY_CNPJ}
            </p>
          </div>

          <div className="footer-dark-legal-item">
            <span className="footer-dark-legal-icon" aria-hidden="true">
              <MapPin size={16} strokeWidth={2} />
            </span>
            <p>
              {COMPANY_ADDRESS_LINE} — {COMPANY_ADDRESS_ZIP}
            </p>
          </div>

          <div className="footer-dark-legal-item">
            <span className="footer-dark-legal-icon" aria-hidden="true">
              <ShieldCheck size={16} strokeWidth={2} />
            </span>
            <p>
              A Tropa é uma empresa privada de contabilidade e assessoria empresarial, sem qualquer vínculo
              oficial com órgãos públicos ou governamentais. Não somos um órgão do governo e não emitimos,
              vendemos ou intermediamos documentos públicos — todo o suporte para abertura, alteração ou
              regularização de empresas é prestado como serviço de assessoria contábil privada.
            </p>
          </div>

          <div className="footer-dark-legal-item">
            <span className="footer-dark-legal-icon" aria-hidden="true">
              <UserCheck size={16} strokeWidth={2} />
            </span>
            <p className="footer-dark-legal-highlight">Responsável técnico: {CRC_REGISTRATION}.</p>
          </div>
        </div>

        <div className="footer-dark-bottom">
          <span className="footer-dark-copyright">
            <Copyright size={14} strokeWidth={2} aria-hidden="true" />© 2026 {COMPANY_LEGAL_NAME}. Todos os
            direitos reservados.
          </span>
          <div className="footer-dark-bottom-links">
            <a href="/politica-de-privacidade">Política de Privacidade</a>
            <a href="/termos-de-uso">Termos de Uso</a>
            <a href={plansHref}>Ver Planos</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
