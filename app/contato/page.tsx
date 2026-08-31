import { Clock, Mail, MapPin, MessageCircle } from "lucide-react"
import { ToolShell } from "@/components/tool-shell"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"
import { COMPANY_ADDRESS_LINE, COMPANY_ADDRESS_ZIP, COMPANY_CNPJ, COMPANY_EMAIL, COMPANY_LEGAL_NAME } from "@/lib/company-info"

export const metadata = {
  title: "Contato | Tropa",
  description: "Fale com a Tropa Contabilidade por WhatsApp, e-mail ou confira nosso endereço.",
}

const contactChannels = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Atendimento rápido com um assessor dedicado.",
    href: TROPA_WHATSAPP_LINK,
    label: "Falar no WhatsApp",
    external: true,
  },
  {
    icon: Mail,
    title: "E-mail",
    description: "Para assuntos institucionais ou documentação.",
    href: `mailto:${COMPANY_EMAIL}`,
    label: COMPANY_EMAIL,
    external: false,
  },
]

export default function ContatoPage() {
  return (
    <ToolShell mainClassName="legal-page" variant="dark">
      <section className="legal-page-hero" aria-labelledby="legal-page-title">
        <h1 id="legal-page-title">Contato</h1>
        <p>Fale com a gente pelo canal que preferir.</p>
      </section>

      <section className="legal-page-content">
        <div className="contact-page-grid">
          {contactChannels.map(({ icon: Icon, title, description, href, label, external }) => (
            <a
              className="contact-page-card"
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              key={title}
            >
              <span className="contact-page-icon" aria-hidden="true">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="contact-page-card-title">{title}</span>
              <span className="contact-page-card-desc">{description}</span>
              <span className="contact-page-card-cta">{label}</span>
            </a>
          ))}
        </div>

        <div className="blog-article-body contact-page-details">
          <p className="contact-page-hours">
            <Clock size={16} strokeWidth={2} aria-hidden="true" /> Tempo de resposta de até 2 horas úteis em dias
            comerciais.
          </p>

          <h2>Endereço</h2>
          <p className="contact-page-address">
            <MapPin size={16} strokeWidth={2} aria-hidden="true" />
            <span>
              {COMPANY_ADDRESS_LINE}
              <br />
              {COMPANY_ADDRESS_ZIP}
            </span>
          </p>

          <h2>Dados da empresa</h2>
          <p>
            {COMPANY_LEGAL_NAME}
            <br />
            CNPJ {COMPANY_CNPJ}
          </p>
        </div>
      </section>
    </ToolShell>
  )
}
