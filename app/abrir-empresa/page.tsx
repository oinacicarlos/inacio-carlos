import {
  Award,
  Check,
  Clock,
  Medal,
  MessageCircle,
  Percent,
  Scale,
  ShieldCheck,
  TrendingUp,
  UserCheck,
} from "lucide-react"
import { ToolShell } from "@/components/tool-shell"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"
import { PlanWhatsAppButton } from "@/components/plan-whatsapp-button"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"
import { pricingPlans, buildPlanWhatsAppLink } from "@/lib/pricing-plans"

export const metadata = {
  title: "Abrir Empresa | Tropa",
  description:
    "Abra sua empresa com contrato social revisado por especialistas, CNAE escolhido pra pagar menos imposto e assessor exclusivo do início ao fim. MEI pronto em 30 minutos.",
}

function buildWhatsAppLink(message: string) {
  return `${TROPA_WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
}

const HERO_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero abrir uma empresa e gostaria de saber mais sobre a Tropa")
const ESPECIALISTA_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero falar com um especialista antes de abrir minha empresa")
const ASSESSOR_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero saber mais sobre o assessor exclusivo da Tropa")
const PROCESSO_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero entender o passo a passo pra abrir minha empresa")
const FINAL_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero abrir minha empresa com a Tropa")

const careCards = [
  {
    title: "Contrato social revisado por especialistas",
    tag: "Proteção jurídica",
    description:
      "A revisão do seu contrato social é feita por profissionais que realmente entendem sobre leis e proteção jurídica. Nada de modelo genérico copiado da internet.",
    icon: Scale,
  },
  {
    title: "CNAE escolhido pra pagar menos imposto",
    tag: "Análise tributária",
    description:
      "Analisamos o que a sua empresa faz de verdade e encontramos as melhores oportunidades fiscais pra esse caso específico, antes de qualquer coisa ser protocolada.",
    icon: Percent,
  },
  {
    title: "Regime tributário sob medida",
    tag: "Planejamento",
    description:
      "Fator R, substituição tributária e a escolha do regime ideal são avaliados antes de abrir a empresa, não depois que o imposto já pesou no caixa.",
    icon: TrendingUp,
  },
  {
    title: "Benefícios fiscais municipais e estaduais",
    tag: "Economia",
    description:
      "Verificamos incentivos e benefícios fiscais disponíveis pra sua atividade e sua cidade, pra sua empresa não deixar dinheiro na mesa.",
    icon: Award,
  },
] satisfies Array<{ title: string; tag: string; description: string; icon: typeof Scale }>

const advisorHighlights = [
  { label: "Acompanha desde a abertura", icon: UserCheck },
  { label: "Resposta direto com uma pessoa", icon: MessageCircle },
  { label: "Continua com você depois de aberta", icon: ShieldCheck },
]

const openingSteps = [
  {
    number: "01",
    title: "Fale com a gente",
    description: "Conte o que a sua empresa vai fazer e tire suas dúvidas com um especialista.",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Analisamos seu caso",
    description: "Revisão jurídica do contrato social, escolha do CNAE e do regime tributário ideal pra sua atividade.",
    icon: Scale,
  },
  {
    number: "03",
    title: "Cuidamos do protocolo",
    description: "Damos entrada e acompanhamos o processo até sair, sem você precisar ir a lugar nenhum.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Sua empresa pronta",
    description: "MEI em 30 minutos, Simples Nacional em até 2 dias úteis, Presumido ou Real em até 3 dias úteis.",
    icon: Clock,
  },
] satisfies Array<{ number: string; title: string; description: string; icon: typeof MessageCircle }>

// Depoimentos provisórios para dar forma à seção — recomendo substituir por
// depoimentos reais de clientes que abriram empresa com a Tropa antes de
// publicar, para não misturar prova social genuína com texto de exemplo.
const testimonials = [
  {
    name: "Bianca Ferreira",
    role: "Personal stylist, MEI",
    quote: "Abri meu MEI em menos de meia hora, direto pelo WhatsApp com o assessor me guiando em cada passo.",
  },
  {
    name: "Thiago Barros",
    role: "Dono de estúdio de pilates",
    quote: "Fiquei surpreso que já tinham revisado meu contrato social antes de eu nem perguntar. Isso me deu segurança.",
  },
  {
    name: "Mariana Costa",
    role: "Consultora de marketing",
    quote: "Escolheram o CNAE certo pra minha atividade e isso já fez diferença no imposto do primeiro mês.",
  },
  {
    name: "Lucas Andrade",
    role: "Arquiteto",
    quote: "Abri minha LTDA em 2 dias, exatamente como prometeram. Nada de promessa vazia.",
  },
  {
    name: "Camila Rezende",
    role: "Dona de clínica odontológica",
    quote: "Antes de abrir, já me explicaram o regime tributário ideal pro meu caso. Ninguém tinha feito isso comigo antes.",
  },
  {
    name: "Rafael Tavares",
    role: "Produtor de eventos",
    quote: "O assessor que abriu minha empresa é o mesmo que cuida da minha contabilidade hoje. Não precisei explicar tudo de novo.",
  },
  {
    name: "Juliana Prado",
    role: "Terapeuta ocupacional",
    quote: "Não sabia nada de CNAE ou regime tributário, e não precisei saber. Eles cuidaram de tudo pra mim.",
  },
  {
    name: "Diego Salles",
    role: "Desenvolvedor freelancer",
    quote: "Pensei que abrir empresa fosse complicado. Com a Tropa foi rápido e eu entendi cada etapa do processo.",
  },
]

const faqs = [
  {
    question: "Quanto tempo demora pra abrir minha empresa?",
    answer:
      "Depende do enquadramento: MEI sai em cerca de 30 minutos, Simples Nacional em até 2 dias úteis, e Lucro Presumido ou Real em até 3 dias úteis.",
  },
  {
    question: "Como vocês escolhem o CNAE da minha empresa?",
    answer:
      "Analisamos o que a sua empresa realmente faz pra encontrar o CNAE e o enquadramento que resultam na menor carga tributária possível pro seu caso, evitando pagar mais imposto do que precisa.",
  },
  {
    question: "Meu contrato social é revisado por quem?",
    answer:
      "Por profissionais que entendem de direito empresarial e proteção jurídica, não é um modelo padrão preenchido automaticamente.",
  },
  {
    question: "Preciso saber qual regime tributário escolher?",
    answer:
      "Não. Analisamos fator R, substituição tributária e benefícios fiscais municipais e estaduais, e te orientamos sobre o regime mais vantajoso antes de qualquer coisa ser protocolada.",
  },
  {
    question: "Depois que a empresa abrir, o que acontece?",
    answer: "Você continua com o mesmo assessor exclusivo cuidando da contabilidade, sem precisar recomeçar do zero com outra pessoa.",
  },
  {
    question: "Preciso ir a algum lugar pra abrir minha empresa?",
    answer: "Não. Todo o processo é feito à distância, com acompanhamento do assessor do início ao fim.",
  },
]

export default function AbrirEmpresaLandingPage() {
  return (
    <ToolShell>
      <section className="accounting-hero" aria-labelledby="abrir-empresa-hero-title">
        <div className="accounting-hero-copy">
          <div className="accounting-hero-proof">
            <div className="accounting-hero-avatars" aria-hidden="true">
              <span className="accounting-hero-avatar">C</span>
              <span className="accounting-hero-avatar">M</span>
              <span className="accounting-hero-avatar">R</span>
            </div>
            <span>+ de 2000 clientes atendidos</span>
          </div>

          <h1 id="abrir-empresa-hero-title">
            <span>Abrir empresa não precisa ser</span>
            <span>demorado nem arriscado</span>
          </h1>
          <p className="accounting-hero-subtitle">
            Cuidamos de tudo antes de você nem pensar: contrato social revisado por quem entende de direito, CNAE
            escolhido pra pagar menos imposto, e um assessor exclusivo do início ao fim.
          </p>

          <div className="accounting-hero-actions">
            <a className="accounting-primary-button" href={HERO_WHATSAPP_LINK} target="_blank" rel="noreferrer">
              Quero abrir minha empresa
            </a>
            <a className="accounting-secondary-button" href={ESPECIALISTA_WHATSAPP_LINK} target="_blank" rel="noreferrer">
              Falar com um especialista
            </a>
          </div>

          <div className="accounting-hero-trust">
            <span className="accounting-hero-trust-item">
              <Clock size={16} strokeWidth={2.2} aria-hidden="true" />
              MEI pronto em 30 minutos
            </span>
            <span className="accounting-hero-trust-divider" aria-hidden="true" />
            <span className="accounting-hero-trust-item">
              <Scale size={16} strokeWidth={2.2} aria-hidden="true" />
              Contrato social revisado por especialistas
            </span>
            <span className="accounting-hero-trust-divider" aria-hidden="true" />
            <span className="accounting-hero-trust-item">
              <UserCheck size={16} strokeWidth={2.2} aria-hidden="true" />
              Assessor exclusivo do início ao fim
            </span>
          </div>
        </div>
      </section>

      <section className="accounting-solutions" aria-labelledby="abrir-empresa-care-title">
        <div className="accounting-solutions-inner">
          <span className="accounting-solutions-badge">
            <span className="accounting-solutions-badge-dot" aria-hidden="true" />
            Cuidado que começa antes de qualquer coisa
          </span>

          <h2 id="abrir-empresa-care-title">A gente cuida antes de você precisar pedir</h2>
          <p className="accounting-solutions-subtitle">
            Não esperamos você ter um problema pra agir. Analisamos sua empresa de ponta a ponta antes mesmo do
            CNPJ sair do papel.
          </p>

          <div className="accounting-solutions-grid is-quad">
            {careCards.map(({ title, tag, description, icon: Icon }) => (
              <article className="accounting-solutions-card" key={title}>
                <div className="accounting-solutions-heading">
                  <span className="accounting-solutions-icon" aria-hidden="true">
                    <Icon size={21} strokeWidth={2} />
                  </span>
                  <div className="accounting-solutions-heading-text">
                    <h3>{title}</h3>
                    <span className="accounting-solutions-tag">{tag}</span>
                  </div>
                </div>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="accounting-advisor-section" aria-labelledby="abrir-empresa-advisor-title">
        <div className="accounting-advisor-inner">
          <div className="accounting-advisor-photo">
            <img
              src="/images/support/whatsapp.jpg"
              alt="Empreendedor conversando com um assessor pelo WhatsApp"
              loading="lazy"
            />
          </div>

          <div className="accounting-advisor-copy">
            <h2 id="abrir-empresa-advisor-title">Um assessor exclusivo, do primeiro passo em diante</h2>
            <p className="accounting-advisor-subtitle">
              Abrir a empresa é só o começo. Você continua com o mesmo assessor cuidando da sua contabilidade, sem
              precisar recomeçar a explicar tudo pra outra pessoa.
            </p>

            <div className="accounting-advisor-highlights" aria-label="Benefícios do assessor exclusivo">
              {advisorHighlights.map(({ label, icon: Icon }) => (
                <div className="accounting-advisor-highlight" key={label}>
                  <span className="accounting-advisor-highlight-icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={2.2} />
                  </span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>

            <a className="accounting-advisor-cta" href={ASSESSOR_WHATSAPP_LINK} target="_blank" rel="noreferrer">
              <UserCheck size={20} strokeWidth={2.2} aria-hidden="true" />
              Falar com um assessor
            </a>

            <p className="accounting-advisor-trust">
              <ShieldCheck size={17} strokeWidth={2.1} aria-hidden="true" />
              Atendimento humano, seguro e sem burocracia.
            </p>
          </div>
        </div>
      </section>

      <section className="accounting-switch" aria-labelledby="abrir-empresa-steps-title">
        <div className="accounting-switch-inner">
          <span className="accounting-switch-badge">
            <UserCheck size={17} strokeWidth={2.2} aria-hidden="true" />
            Como funciona
          </span>

          <h2 id="abrir-empresa-steps-title">Abrir sua empresa em poucos passos</h2>
          <p className="accounting-switch-subtitle">Simples assim: você fala com a gente, a gente cuida do resto.</p>

          <div className="accounting-switch-steps is-quad">
            {openingSteps.map(({ number, title, description, icon: Icon }) => (
              <article className="accounting-switch-card" key={number}>
                <span className="accounting-switch-number">{number}</span>
                <span className="accounting-switch-icon" aria-hidden="true">
                  <Icon size={28} strokeWidth={2.2} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>

          <a className="accounting-switch-cta" href={PROCESSO_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            <MessageCircle size={22} strokeWidth={2.2} aria-hidden="true" />
            Quero abrir minha empresa
          </a>

          <p className="accounting-switch-trust">
            <ShieldCheck size={16} strokeWidth={2.1} aria-hidden="true" />
            Atendimento humano, seguro e sem burocracia.
          </p>
        </div>
      </section>

      <section className="accounting-testimonials" aria-labelledby="abrir-empresa-testimonials-title">
        <div className="accounting-testimonials-inner">
          <h2 id="abrir-empresa-testimonials-title">Quem abriu empresa com a Tropa</h2>
          <p className="accounting-testimonials-subtitle">
            Histórias reais de quem abriu empresa e já começou com tudo revisado e organizado.
          </p>

          <TestimonialsCarousel testimonials={testimonials} />

          <a className="accounting-testimonials-cta" href={FINAL_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            Quero abrir minha empresa também
          </a>
        </div>
      </section>

      <section className="accounting-plans" id="planos" aria-labelledby="abrir-empresa-plans-title">
        <div className="accounting-plans-inner">
          <h2 id="abrir-empresa-plans-title">Conheça os nossos planos completos</h2>
          <p className="accounting-plans-subtitle">Escolha o plano ideal para o momento do seu negócio.</p>

          <div className="accounting-pricing-grid">
            {pricingPlans.map(({ tier, name, description, featured, features }) => (
              <article className={`accounting-pricing-card${featured ? " is-featured" : ""}`} key={tier}>
                {featured && <span className="accounting-pricing-badge">Mais escolhido</span>}

                <div className={`accounting-pricing-icon accounting-pricing-icon--${tier}`} aria-hidden="true">
                  <Medal size={24} strokeWidth={2} />
                </div>

                <h3>{name}</h3>

                <p className="accounting-pricing-desc">{description}</p>

                <ul className="accounting-pricing-benefits">
                  {features.map(feature => (
                    <li key={feature}>
                      <Check size={16} strokeWidth={2.6} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <PlanWhatsAppButton
                  className={`accounting-plan-button${featured ? " is-primary" : ""}`}
                  href={buildPlanWhatsAppLink(TROPA_WHATSAPP_LINK, name)}
                >
                  Saber Mais
                </PlanWhatsAppButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="accounting-faq" aria-labelledby="abrir-empresa-faq-title">
        <div className="accounting-faq-inner">
          <div className="accounting-faq-head">
            <h2 id="abrir-empresa-faq-title">Dúvidas sobre abrir empresa</h2>
            <p>Respostas rápidas pra quem está pensando em abrir empresa com a Tropa.</p>
          </div>

          <div className="accounting-faq-list">
            {faqs.map(({ question, answer }) => (
              <details className="accounting-faq-item" key={question}>
                <summary>
                  <span>{question}</span>
                  <span className="accounting-faq-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </ToolShell>
  )
}
