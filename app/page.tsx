import { headers } from "next/headers"
import {
  ArrowRight,
  Building2,
  Calculator,
  Calendar,
  ChartColumnIncreasing,
  CircleHelp,
  Compass,
  FileSignature,
  Headset,
  Mail,
  MessageCircle,
  Percent,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  User,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  AccountingOfferingsAccordion,
  type AccountingOfferingIcon,
} from "@/components/accounting-offerings-accordion"
import { PricingPlansSection } from "@/components/pricing-plans-section"
import { AccountingAdvisorNotice } from "@/components/accounting-advisor-notice"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"
import { FooterDark } from "@/components/footer-dark"
import { HeaderMain } from "@/components/header-main"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"
import { pricingPlans, buildPlanWhatsAppLink } from "@/lib/pricing-plans"
import { COMPANY_EMAIL, CRC_REGISTRATION } from "@/lib/company-info"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { ToolSlug } from "@/lib/tool-usage/tools"

const HUB_TOOLS_PATH = "/hub?tab=ferramentas"
const PLAN_SIMULATOR_ANCHOR = "#simulador-planos"
const MARKETING_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const
const SITE_URL = "https://tropacontabilidade.com"

function buildOfferingWhatsAppLink(title: string) {
  const message = `Oi, quero saber mais sobre ${title} para a minha empresa`
  return `${TROPA_WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
}

function buildWhatsAppLink(message: string) {
  return `${TROPA_WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
}

const TEAM_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero falar com a equipe da Tropa")
const ADVISOR_AVAILABLE_WHATSAPP_LINK = buildWhatsAppLink("Oi, vi que um assessor está disponível e quero atendimento")
const ADVISOR_UNAVAILABLE_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero falar com um assessor da Tropa")

const businessOfferings = [
  {
    title: "Análise Tributária",
    description: "Buscamos oportunidades legais para reduzir impostos e melhorar a eficiência tributária da sua empresa.",
    icon: "percent",
  },
  {
    title: "Assessor Exclusivo",
    description:
      "Tenha um assessor exclusivo no whatsapp para tirar suas dúvidas, agilizar solicitações de segunda a sábado de 8:00 as 17:00.",
    icon: "headset",
  },
  {
    title: "Departamento Pessoal",
    description: "Cuidamos das obrigações fiscais e trabalhistas para sua empresa operar com segurança.",
    icon: "users",
  },
  {
    title: "Soluções Gerais",
    description: "Quando surgir um problema, ajudamos você a encontrar o melhor caminho para resolver.",
    icon: "handshake",
  },
] satisfies Array<{ title: string; description: string; icon: AccountingOfferingIcon }>

const supportChannels = [
  {
    key: "whatsapp" as const,
    title: "Atendimento no WhatsApp",
    description: "Você terá acesso a um assessor exclusivo para te atender no WhatsApp, de forma ágil, simples e sem complicação.",
    icon: MessageCircle,
    image: "/images/support/whatsapp.jpg",
    linkLabel: "Escolher WhatsApp",
    href: TEAM_WHATSAPP_LINK,
  },
  {
    key: "email" as const,
    title: "Atendimento no E-mail",
    description: "Envie suas solicitações e rotinas e nosso time responde em até 2 horas úteis, com atenção e agilidade.",
    icon: Mail,
    image: "/images/support/email.jpg",
    linkLabel: "Escolher E-mail",
    href: `mailto:${COMPANY_EMAIL}`,
  },
]

const businessSolutions = [
  {
    title: "Legalização Completa",
    tag: "Abrir e regularizar",
    description: "Abertura, alteração contratual e análise de processo com mais agilidade.",
    icon: Building2,
  },
  {
    title: "Departamento Pessoal",
    tag: "Equipe e rotina",
    description: "Admissão, férias, faltas e rotinas trabalhistas com apoio próximo.",
    icon: Users,
  },
  {
    title: "Suporte Fiscal",
    tag: "Impostos e notas",
    description: "Emissão de notas e soluções para reduzir a carga tributária da empresa.",
    icon: Percent,
  },
  {
    title: "Suporte Contábil",
    tag: "Controle e organização",
    description: "Balanço, lançamentos e acompanhamento para manter sua operação organizada.",
    icon: Calculator,
  },
  {
    title: "Consultoria Empresarial",
    tag: "Decisão e estratégia",
    description: "Acompanhamento para apoiar escolhas e desafios do seu negócio.",
    icon: Compass,
  },
  {
    title: "Plano de Negócio",
    tag: "Crescimento",
    description: "Direcionamento para estruturar metas e alcançar o próximo passo da empresa.",
    icon: TrendingUp,
  },
]

const accountantSwitchSteps = [
  {
    number: "01",
    title: "Fale com a gente",
    description: "Você fala com um dos nossos especialistas e conta um pouco sobre sua empresa e o que precisa melhorar.",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Análise e proposta",
    description: "Analisamos sua situação atual e apresentamos a melhor solução para sua empresa, sem compromisso.",
    icon: FileSignature,
  },
  {
    number: "03",
    title: "Cuidamos da troca",
    description: "Organizamos a transição junto ao contador anterior para você não precisar se preocupar com nada.",
    icon: Users,
  },
  {
    number: "04",
    title: "Transição segura",
    description: "Cuidamos para que suas obrigações continuem em dia, com o mínimo de risco e interrupção para o seu negócio.",
    icon: ShieldCheck,
  },
  {
    number: "05",
    title: "Acompanhamento contínuo",
    description: "Você passa a contar com um time próximo, disponível e comprometido com o crescimento da sua empresa.",
    icon: Headset,
  },
] satisfies Array<{ number: string; title: string; description: string; icon: LucideIcon }>

// Depoimentos provisórios (modelo para aprovação) — nomes e histórias
// fictícios, só pra dar forma realista à seção. Substituir pelos
// depoimentos reais de clientes assim que o cliente enviar, antes de
// publicar, para não misturar prova social genuína com texto de exemplo.
const testimonials = [
  {
    name: "Marcelo Andrade",
    role: "Sócio de gráfica industrial",
    quote:
      "A folha de pagamento já pesava demais no Simples. Fizeram as contas, mostraram que o Lucro Real compensava e, só no primeiro ano, a economia de impostos pagou a migração toda.",
  },
  {
    name: "Fernanda Bittencourt",
    role: "Sócia de rede de clínicas estéticas",
    quote:
      "Uma ex-funcionária abriu uma reclamação trabalhista pedindo verbas que já tinham sido pagas. Como o departamento pessoal mantinha admissão e rescisão certinhas, vencemos o processo sem pagar nada a mais.",
  },
  {
    name: "Ricardo Salgado",
    role: "Diretor de empresa de logística",
    quote:
      "Migramos do Simples para o Lucro Real depois que me apresentaram a análise com números. A carga tributária caiu bem mais do que eu esperava pro tamanho da nossa operação.",
  },
  {
    name: "Patrícia Guimarães",
    role: "Proprietária de escola de idiomas",
    quote:
      "Fomos processados por horas extras não pagas. Com o controle de ponto e a folha organizados pela equipe desde o início, conseguimos comprovar tudo e a Justiça do Trabalho negou o pedido.",
  },
  {
    name: "André Monteiro",
    role: "Sócio de empresa de tecnologia",
    quote:
      "Achava que sair do Simples só ia complicar a rotina. Cuidaram de toda a apuração do Lucro Real e hoje pagamos bem menos imposto do que se tivéssemos ficado onde estávamos.",
  },
  {
    name: "Juliana Ferreira",
    role: "Sócia de rede de salões de beleza",
    quote:
      "Demitimos um funcionário e ele tentou reverter na Justiça alegando erro na rescisão. Estava tudo calculado certinho desde o desligamento, e a causa foi arquivada.",
  },
  {
    name: "Camila Duarte",
    role: "Sócia de agência de marketing",
    quote:
      "Descobrimos que estávamos pagando mais imposto do que precisávamos no Simples. A revisão tributária encontrou uma forma de pagar bem menos sem mudar nada na operação.",
  },
  {
    name: "Rafael Nunes",
    role: "Sócio de escritório de arquitetura",
    quote:
      "Trocar de contador com uma equipe já formada parecia arriscado, mas organizaram a migração em poucos dias, sem deixar nenhuma obrigação atrasada.",
  },
  {
    name: "Diego Ramos",
    role: "Sócio de empresa de manutenção predial",
    quote:
      "O assessor responde no WhatsApp em minutos, mesmo em assuntos mais complexos como enquadramento tributário e departamento pessoal.",
  },
  {
    name: "Marcos Vinícius",
    role: "Sócio de empresa de comércio varejista",
    quote:
      "Contratamos vários funcionários em pouco tempo, e cuidaram de toda a admissão e da folha certinho. Isso evitou dor de cabeça trabalhista lá na frente.",
  },
]

const HERO_OPEN_COMPANY_WHATSAPP_LINK = `${TROPA_WHATSAPP_LINK}?text=${encodeURIComponent(
  "Oi, quero abrir uma empresa e gostaria de saber mais sobre a contabilidade da Tropa",
)}`

const HERO_SWITCH_ACCOUNTANT_WHATSAPP_LINK = `${TROPA_WHATSAPP_LINK}?text=${encodeURIComponent(
  "Oi, quero trocar de contador e gostaria de saber mais sobre a contabilidade da Tropa",
)}`

type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>

function firstParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function buildHubToolPath(tool: ToolSlug) {
  return `${HUB_TOOLS_PATH}&tool=${encodeURIComponent(tool)}`
}

function buildToolsEntryHref(
  isAuthenticated: boolean,
  searchParams: Record<string, string | string[] | undefined>,
  tool: ToolSlug,
) {
  const hubToolPath = buildHubToolPath(tool)

  if (isAuthenticated) {
    return hubToolPath
  }

  const params = new URLSearchParams()
  params.set("redirect", hubToolPath)

  MARKETING_PARAMS.forEach((name) => {
    const value = firstParamValue(searchParams[name])
    if (value) params.set(name, value)
  })

  return `/cadastro?${params.toString()}`
}


const accountingTools = [
  {
    title: "Gerador de Contrato",
    description: "Monte contratos empresariais com mais agilidade e organização.",
    icon: FileSignature,
    slug: "gerador-contrato",
  },
  {
    title: "Simulador de Rescisão",
    description: "Estime valores de rescisão trabalhista de forma rápida.",
    icon: Calculator,
    slug: "simulador-rescisao",
  },
  {
    title: "Simulador de Contratação",
    description: "Descubra o custo médio de um funcionário antes de contratar.",
    icon: Users,
    slug: "simulador-contratacao",
  },
  {
    title: "Calculadora de Precificação",
    description: "Descubra quanto cobrar por um serviço com base em tempo, custo e ganho desejado.",
    icon: ChartColumnIncreasing,
    slug: "calculadora-precificacao",
  },
] satisfies Array<{ title: string; description: string; icon: LucideIcon; slug: ToolSlug }>

const accountingFaqs = [
  {
    question: "Tem fidelidade ou posso cancelar quando quiser?",
    answer:
      "Sem fidelidade. Você pode cancelar quando quiser, direto pelo hub ou falando com a nossa equipe de atendimento.",
  },
  {
    question: "Posso trocar de contador mesmo com a empresa ativa?",
    answer:
      "Pode. A transição é feita com análise da situação atual, conferência das obrigações e organização dos acessos para evitar interrupções na rotina da empresa.",
  },
  {
    question: "Como é o atendimento e o suporte?",
    answer:
      "Em qualquer caso, desde solicitações, atendimento, suporte e ajuda com a plataforma, o contato é feito via e-mail ou WhatsApp. O tempo de resposta é de até 2 horas úteis em dias comerciais.",
  },
  {
    question: "E se eu precisar emitir um número maior de Notas Fiscais?",
    answer:
      "Cobramos uma taxa pelo serviço de emissão acima do que já está incluso no seu plano — nossa equipe cuida da classificação e organização de cada nota. Para nota fiscal de produto (DANFE), também oferecemos esse serviço. Consulte o nosso canal de atendimento.",
  },
  {
    question: "A Tropa atende empresas do Lucro Presumido ou do Lucro Real?",
    answer:
      "Sim, atendemos e oferecemos um atendimento diferenciado para clientes desse porte. Caso esse seja o seu caso, clique aqui e fale com um especialista.",
  },
]

export default async function HomePage({ searchParams }: { searchParams?: HomeSearchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthenticated = Boolean(user)
  const nonce = (await headers()).get("x-nonce") ?? undefined

  // Schema.org pra deixar explícito pra crawlers/IA (inclusive o revisor de
  // anúncios do Google) que a Tropa é uma contabilidade privada — não um
  // órgão público. Ver aviso equivalente no rodapé, em texto visível.
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name: "Tropa",
    url: SITE_URL,
    description:
      "A Tropa é um escritório de contabilidade e assessoria empresarial privado, sem qualquer vínculo oficial com órgãos públicos ou governamentais. Presta serviços de contabilidade, abertura e regularização de empresas para o setor privado.",
    areaServed: "BR",
    identifier: CRC_REGISTRATION,
  }

  return (
    <main className="accounting-landing accounting-landing--home">
      <script
        suppressHydrationWarning
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HeaderMain />

      <section className="accounting-hero" aria-labelledby="accounting-hero-title">
        <span className="accounting-hero-blend" aria-hidden="true" />
        <div className="accounting-hero-copy">
          <div className="accounting-hero-proof">
            <div className="accounting-hero-avatars" aria-hidden="true">
              <span className="accounting-hero-avatar">C</span>
              <span className="accounting-hero-avatar">M</span>
              <span className="accounting-hero-avatar">R</span>
            </div>
            <span>+ de 2010 clientes atendidos</span>
          </div>

          <h1 id="accounting-hero-title">
            <span>Contabilidade on-line com</span>
            <span>atendimento <span className="accounting-hero-title-accent">humanizado.</span></span>
          </h1>
          <p className="accounting-hero-subtitle">
            Tenha um assessor exclusivo para cuidar das rotinas da sua empresa e tirar suas dúvidas.
          </p>

          <div className="accounting-hero-actions">
            <a className="accounting-primary-button" href={HERO_OPEN_COMPANY_WHATSAPP_LINK} target="_blank" rel="noreferrer">
              Abrir Empresa
            </a>
            <a className="accounting-secondary-button" href={HERO_SWITCH_ACCOUNTANT_WHATSAPP_LINK} target="_blank" rel="noreferrer">
              Trocar de Contador
            </a>
          </div>

          <div className="accounting-hero-trust">
            <span className="accounting-hero-trust-item">
              <User size={16} strokeWidth={2.2} aria-hidden="true" />
              Assessor Exclusivo
            </span>
            <span className="accounting-hero-trust-divider" aria-hidden="true" />
            <span className="accounting-hero-trust-item">
              <Search size={16} strokeWidth={2.2} aria-hidden="true" />
              Análise Tributária
            </span>
            <span className="accounting-hero-trust-divider" aria-hidden="true" />
            <span className="accounting-hero-trust-item">
              <ShieldCheck size={16} strokeWidth={2.2} aria-hidden="true" />
              Sem fidelidade
            </span>
          </div>
        </div>
      </section>

      <section className="accounting-offerings" id="ofertas" aria-labelledby="accounting-offerings-title">
        <div className="accounting-offerings-inner">
          <h2 id="accounting-offerings-title">O que oferecemos para o seu negócio?</h2>
          <p className="accounting-offerings-subtitle">
            Tudo isso com um time que acompanha de perto o seu negócio, sem burocracia e sem enrolação.
          </p>

          <AccountingOfferingsAccordion
            items={businessOfferings.map(({ title, description, icon }) => ({
              title,
              description,
              icon,
              href: buildOfferingWhatsAppLink(title),
            }))}
          />
        </div>
      </section>

      <section className="accounting-support" id="atendimento" aria-labelledby="accounting-support-title">
        <div className="accounting-support-inner">
          <span className="accounting-support-badge">
            <Headset size={16} strokeWidth={2.2} aria-hidden="true" />
            Atendimento humano e rápido
          </span>

          <h2 id="accounting-support-title">
            Como funciona nosso <span className="accounting-support-title-accent">atendimento</span>?
          </h2>
          <p className="accounting-support-subtitle">
            Escolha o canal que preferir e receba um atendimento rápido, sem burocracia e com pessoas prontas para te
            ajudar.
          </p>

          <div className="accounting-support-grid">
            {supportChannels.map(({ key, title, description, icon: Icon, image, linkLabel, href }) => {
              const [firstWord, ...restWords] = title.split(" ")
              const lastWord = restWords[restWords.length - 1]
              const middleWords = restWords.slice(0, -1).join(" ")

              return (
                <a
                  className={`accounting-support-card accounting-support-card--${key}`}
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img className="accounting-support-card-image" src={image} alt="" loading="lazy" />
                  <span className="accounting-support-card-overlay" aria-hidden="true" />

                  <div className="accounting-support-card-content">
                    <span className={`accounting-support-icon accounting-support-icon--${key}`} aria-hidden="true">
                      <Icon size={key === "whatsapp" ? 26 : 25} strokeWidth={2} />
                    </span>

                    <h3>
                      {firstWord}
                      <br />
                      {middleWords ? `${middleWords} ` : ""}
                      <span className="accounting-support-card-accent">{lastWord}</span>
                    </h3>

                    <span className="accounting-support-card-rule" aria-hidden="true" />

                    <p>{description}</p>

                    <span className="accounting-support-card-link">
                      {linkLabel}
                      <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
                    </span>
                  </div>
                </a>
              )
            })}
          </div>

          <a className="accounting-support-main-cta" href={TEAM_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            <Users size={18} strokeWidth={2.2} aria-hidden="true" />
            Falar com a equipe
          </a>

          <p className="accounting-support-trust">
            <ShieldCheck size={16} strokeWidth={2} aria-hidden="true" />
            Atendimento humano, seguro e sem burocracia.
          </p>
        </div>
      </section>

      <section className="advisor-section" aria-labelledby="advisor-title">
        <div className="advisor-inner">
          <div className="advisor-intro">
            <span className="advisor-badge">
              <UserCheck size={16} strokeWidth={2.2} aria-hidden="true" />
              Assessor exclusivo
            </span>

            <h2 id="advisor-title" className="advisor-title">
              Assessor exclusivo para <span className="advisor-title-accent">cuidar</span> da sua rotina
            </h2>

            <p className="advisor-description">
              Você conta com um assessor da Tropa para orientar, acompanhar e apoiar nas demandas diárias do seu
              negócio todos os dias úteis, cuidando de dúvidas, prazos e próximos passos para você não perder tempo
              com burocracia.
            </p>
          </div>

          <div className="advisor-media">
            <div className="advisor-photo">
              <img
                src="/images/support/whatsapp.jpg"
                alt="Empreendedor conversando com um assessor pelo WhatsApp"
                loading="lazy"
              />
              <span className="advisor-photo-overlay" aria-hidden="true" />

              <div className="advisor-card advisor-card--assessor">
                <span className="advisor-card-avatar" aria-hidden="true">
                  <UserCheck size={18} strokeWidth={2.4} />
                </span>
                <span className="advisor-card-text">
                  <strong className="advisor-card-name">Seu assessor</strong>
                  <span className="advisor-card-status">
                    <span className="advisor-card-status-dot" aria-hidden="true" />
                    Online agora
                  </span>
                </span>
              </div>

              <div className="advisor-card advisor-card--appointment">
                <span className="advisor-card-icon" aria-hidden="true">
                  <Calendar size={17} strokeWidth={2.2} />
                </span>
                <span className="advisor-card-text">
                  <span className="advisor-card-label">Próximo compromisso</span>
                  <strong className="advisor-card-appointment-title">Revisão de pendências</strong>
                  <span className="advisor-card-appointment-time">Amanhã, 10h30</span>
                </span>
              </div>
            </div>
          </div>

          <div className="advisor-details">
            <div className="advisor-benefits" aria-label="Benefícios do assessor exclusivo">
              {[
                { label: "Especialista dedicado", icon: UserCheck },
                { label: "Atendimento próximo", icon: MessageCircle },
                { label: "Orientação prática", icon: ShieldCheck },
              ].map(({ label, icon: Icon }) => (
                <div className="advisor-benefit" key={label}>
                  <span className="advisor-benefit-icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={2.2} />
                  </span>
                  <strong className="advisor-benefit-label">{label}</strong>
                </div>
              ))}
            </div>

            <a className="advisor-cta" href={TEAM_WHATSAPP_LINK} target="_blank" rel="noreferrer">
              <UserCheck size={20} strokeWidth={2.2} aria-hidden="true" />
              Falar com um assessor
            </a>

            <p className="advisor-trust">
              <ShieldCheck size={16} strokeWidth={2.1} aria-hidden="true" />
              Atendimento humano, seguro e sem burocracia.
            </p>
          </div>
        </div>
      </section>

      <section className="solutions-section" id="solucoes" aria-labelledby="solutions-title">
        <div className="solutions-inner">
          <span className="solutions-badge">
            <span className="solutions-badge-dot" aria-hidden="true" />
            Soluções organizadas por área
          </span>

          <h2 id="solutions-title" className="solutions-title">
            Quais as soluções que <span className="solutions-title-accent">oferecemos?</span>
          </h2>
          <p className="solutions-subtitle">
            Organizamos nossos serviços por área para você entender rapidamente como ajudamos sua empresa a abrir,
            operar e crescer com segurança.
          </p>

          <div className="solutions-grid">
            {businessSolutions.map(({ title, tag, description, icon: Icon }) => (
              <article className="solutions-card" key={title}>
                <div className="solutions-heading">
                  <span className="solutions-icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <div className="solutions-heading-text">
                    <h3>{title}</h3>
                    <span className="solutions-tag">{tag}</span>
                  </div>
                </div>
                <p>{description}</p>
              </article>
            ))}
          </div>

          <a className="solutions-cta" href={TEAM_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            <Users size={18} strokeWidth={2.2} aria-hidden="true" />
            Falar com a equipe
          </a>

          <p className="solutions-trust">
            <ShieldCheck size={16} strokeWidth={2.1} aria-hidden="true" />
            Atendimento humano, seguro e sem burocracia.
          </p>
        </div>
      </section>

      <section className="switch-section" aria-labelledby="switch-title">
        <div className="switch-inner">
          <span className="switch-badge">
            <UserCheck size={17} strokeWidth={2.2} aria-hidden="true" />
            Trocar de contador
          </span>

          <h2 id="switch-title" className="switch-title">
            Trocar de contador é <span className="switch-title-accent">simples e seguro</span>
          </h2>
          <p className="switch-subtitle">
            Veja como funciona o processo para você trocar de contador e ter o suporte que sua empresa realmente
            precisa.
          </p>

          <div className="switch-steps">
            <span className="switch-steps-line" aria-hidden="true" />
            {accountantSwitchSteps.map(({ number, title, description, icon: Icon }) => (
              <article className="switch-card" key={number}>
                <span className="switch-number">{number}</span>
                <span className="switch-icon" aria-hidden="true">
                  <Icon size={24} strokeWidth={2.2} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>

          <a className="switch-cta" href={HERO_SWITCH_ACCOUNTANT_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            <MessageCircle size={22} strokeWidth={2.2} aria-hidden="true" />
            Falar com um especialista
          </a>

          <p className="switch-trust">
            <ShieldCheck size={16} strokeWidth={2.1} aria-hidden="true" />
            Atendimento humano, seguro e sem burocracia.
          </p>
        </div>
      </section>

      <section className="testimonials-dark-section" id="depoimentos" aria-labelledby="testimonials-dark-title">
        <div className="testimonials-dark-inner">
          <span className="testimonials-dark-badge">
            <Star size={13} strokeWidth={2.2} fill="currentColor" aria-hidden="true" />
            Clientes satisfeitos
          </span>

          <h2 id="testimonials-dark-title" className="testimonials-dark-title">
            O que nossos clientes dizem
          </h2>
          <p className="testimonials-dark-subtitle">
            Histórias reais de quem já organizou a contabilidade e passou a pagar só o imposto que devia.
          </p>

          <TestimonialsCarousel testimonials={testimonials} variant="dark" />

          <a
            className="testimonials-dark-cta"
            href={buildWhatsAppLink("Oi, vi os depoimentos de clientes da Tropa e quero saber mais")}
            target="_blank"
            rel="noreferrer"
          >
            Quero ser o próximo caso de sucesso
            <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </a>

          <p className="testimonials-dark-trust">
            <ShieldCheck size={15} strokeWidth={2.1} aria-hidden="true" />+ de 2010 clientes atendidos
          </p>
        </div>
      </section>

      <section className="plans-section" id="planos" aria-labelledby="plans-title">
        <div className="plans-inner">
          <span className="plans-badge">Planos</span>

          <h2 id="plans-title" className="plans-title">
            Conheça os nossos planos completos
          </h2>
          <p className="plans-subtitle">Escolha o plano ideal para o momento do seu negócio.</p>

          <PricingPlansSection
            plans={pricingPlans.map(({ tier, name, description, featured, features }) => ({
              tier,
              name,
              description,
              featured,
              features,
              href: buildPlanWhatsAppLink(TROPA_WHATSAPP_LINK, name),
            }))}
          />
        </div>
      </section>

      <section className="faq-dark-section" id="duvidas" aria-labelledby="faq-dark-title">
        <div className="faq-dark-inner">
          <span className="faq-dark-badge">
            <CircleHelp size={16} strokeWidth={2.2} aria-hidden="true" />
            Dúvidas frequentes
          </span>

          <h2 id="faq-dark-title" className="faq-dark-title">
            Dúvidas frequentes
          </h2>
          <p className="faq-dark-subtitle">
            Respostas rápidas para entender como funciona o atendimento contábil da Tropa.
          </p>

          <div className="faq-dark-list">
            {accountingFaqs.map(({ question, answer }) => (
              <details className="faq-dark-item" key={question} name="faq-dark-accordion">
                <summary className="faq-dark-summary">
                  <span className="faq-dark-question">{question}</span>
                  <span className="faq-dark-toggle" aria-hidden="true" />
                </summary>
                <div className="faq-dark-panel">
                  <p className="faq-dark-answer">{answer}</p>
                </div>
              </details>
            ))}
          </div>

          <a className="faq-dark-cta" href={TEAM_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            <UserCheck size={20} strokeWidth={2.2} aria-hidden="true" />
            Falar com um assessor
            <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </a>

          <p className="faq-dark-trust">
            <ShieldCheck size={15} strokeWidth={2.1} aria-hidden="true" />
            Atendimento humano, seguro e sem burocracia.
          </p>
        </div>
      </section>

      <FooterDark
        tools={accountingTools.map(({ title, slug }) => ({
          title,
          href: buildToolsEntryHref(isAuthenticated, resolvedSearchParams, slug),
        }))}
        plansHref={PLAN_SIMULATOR_ANCHOR}
      />

      <AccountingAdvisorNotice
        availableHref={ADVISOR_AVAILABLE_WHATSAPP_LINK}
        unavailableHref={ADVISOR_UNAVAILABLE_WHATSAPP_LINK}
      />
    </main>
  )
}
