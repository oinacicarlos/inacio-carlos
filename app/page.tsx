import { headers } from "next/headers"
import {
  Building2,
  Calculator,
  ChartColumnIncreasing,
  Check,
  Compass,
  FileSignature,
  Headset,
  HeartHandshake,
  Mail,
  Medal,
  MessageCircle,
  Percent,
  ShieldCheck,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { PlanWhatsAppButton } from "@/components/plan-whatsapp-button"
import { BlogCard } from "@/components/blog/blog-card"
import { getRecentArticles } from "@/lib/blog/articles"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { ToolSlug } from "@/lib/tool-usage/tools"

const HUB_TOOLS_PATH = "/hub?tab=ferramentas"
const PLAN_SIMULATOR_ANCHOR = "#simulador-planos"
const MARKETING_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const
const SITE_URL = "https://tropacontabilidade.com"
const CRC_REGISTRATION = "CRC RJ-110749/O-8"

function buildPlanWhatsAppLink(planName: string) {
  const message = `Oi, estou precisando de uma contabilidade para a minha empresa e acho que o plano ${planName} é o ideal para mim, eu gostaria de ajuda para definir isso`
  return `${TROPA_WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
}

function buildOfferingWhatsAppLink(title: string) {
  const message = `Oi, quero saber mais sobre ${title} para a minha empresa`
  return `${TROPA_WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
}

function buildWhatsAppLink(message: string) {
  return `${TROPA_WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
}

const TEAM_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero falar com a equipe da Tropa")

const businessOfferings = [
  {
    title: "Análise Tributária",
    description: "Buscamos oportunidades legais para reduzir impostos e melhorar a eficiência tributária da sua empresa.",
    icon: Percent,
    image: "/images/offerings/analise-tributaria.jpg",
    imageAlt: "Profissional preenchendo documentos financeiros com calculadora sobre a mesa",
  },
  {
    title: "Atendimento Rápido",
    description: "Um time próximo para resolver suas demandas com rapidez e sem burocracia.",
    icon: Headset,
    image: "/images/offerings/atendimento-rapido.jpg",
    imageAlt: "Profissional de atendimento ao cliente usando headset em frente ao computador",
  },
  {
    title: "Segurança Legal",
    description: "Cuidamos das obrigações fiscais e trabalhistas para sua empresa operar com segurança.",
    icon: ShieldCheck,
    image: "/images/offerings/seguranca-legal.jpg",
    imageAlt: "Profissional assinando um documento contratual em mesa de escritório",
  },
  {
    title: "Soluções Gerais",
    description: "Quando surgir um problema, ajudamos você a encontrar o melhor caminho para resolver.",
    icon: HeartHandshake,
    image: "/images/offerings/solucoes-gerais.jpg",
    imageAlt: "Dois empreendedores sorrindo em frente a um notebook",
  },
]

const supportChannels = [
  {
    key: "whatsapp" as const,
    title: "Atendimento no WhatsApp",
    description: "Você terá acesso a um assessor exclusivo para te atender no WhatsApp, de forma ágil, simples e sem complicação.",
    icon: MessageCircle,
    image: "/images/support/whatsapp.jpg",
    imageAlt: "Pessoa usando o celular para conversar em um aplicativo de mensagens em uma mesa de escritório",
  },
  {
    key: "email" as const,
    title: "Atendimento no E-mail",
    description: "Envie suas solicitações e rotinas e nosso time responde em até 2 horas úteis, com atenção e agilidade.",
    icon: Mail,
    image: "/images/support/email.jpg",
    imageAlt: "Notebook aberto sobre uma mesa em um ambiente de trabalho iluminado",
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

// Cards de exibição da seção "Nossos Planos" — vitrine comercial da home,
// independente dos planos/preços de app/api/stripe/checkout e lib/plans.ts
// (esses seguem sendo a fonte de verdade pro checkout e pro hub de clientes
// já assinantes). Por isso o CTA aqui leva pro WhatsApp em vez de Stripe.
const pricingPlans = [
  {
    tier: "bronze" as const,
    name: "Bronze",
    price: "R$ 405,25",
    description: "Contabilidade essencial para quem está começando e precisa manter a empresa organizada.",
    featured: false,
    features: [
      "Contabilidade completa",
      "Apuração dos impostos",
      "Obrigações mensais e anuais",
      "Pró-labore de 1 sócio",
      "Folha de até 1 funcionário",
      "Acompanhamento para MEI",
      "Análise tributária inicial",
      "Suporte pelo WhatsApp",
      "Suporte pelo E-mail",
      "Assessor Exclusivo",
      "Migração do contador anterior sem burocracia",
      "Sem fidelidade",
    ],
  },
  {
    tier: "prata" as const,
    name: "Prata",
    price: "R$ 810,50",
    description: "Assessoria completa para empresas que estão crescendo e precisam de mais acompanhamento.",
    featured: true,
    features: [
      "Contabilidade completa",
      "Apuração dos impostos",
      "Obrigações mensais e anuais",
      "Pró-labore de até 3 sócios",
      "Folha de até 5 funcionários",
      "Acompanhamento para Simples Nacional",
      "Análise tributária inicial",
      "Suporte pelo WhatsApp",
      "Suporte pelo E-mail",
      "Assessor Exclusivo",
      "Migração do contador anterior sem burocracia",
      "Sem fidelidade",
    ],
  },
  {
    tier: "ouro" as const,
    name: "Ouro",
    price: "R$ 1.621,00",
    description: "Gestão contábil estratégica para empresas que precisam de acompanhamento próximo e decisões mais seguras.",
    featured: false,
    features: [
      "Contabilidade completa",
      "Apuração dos impostos",
      "Obrigações mensais e anuais",
      "Pró-labore de até 5 sócios",
      "Folha de até 10 funcionários",
      "Acompanhamento para Simples Nacional",
      "Análise tributária inicial",
      "Suporte pelo WhatsApp",
      "Suporte pelo E-mail",
      "Assessor Exclusivo",
      "Migração do contador anterior sem burocracia",
      "Sem fidelidade",
    ],
  },
]

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
      "Em qualquer caso, desde solicitações, atendimento, suporte e ajuda com a plataforma, o contato é feito sempre via e-mail ou WhatsApp. Em todo caso, o tempo de resposta é de 2 horas úteis em dias comerciais.",
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
  const recentArticles = getRecentArticles(3)
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
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <header className="accounting-header accounting-header--home" aria-label="Cabeçalho Tropa">
        <div className="accounting-header-inner">
          <a className="accounting-logo" href="/" aria-label="Tropa">
            <BrandLogo variant="white" />
          </a>

          <nav className="accounting-nav" aria-label="Navegação principal">
            <a href="#planos">Planos</a>
            <a href="#duvidas">Dúvidas</a>
            <a href="/blog">Blog</a>
          </nav>

          <div className="accounting-header-actions">
            <a className="accounting-login" href="/login">
              Entrar
            </a>
            <a className="accounting-header-cta" href={PLAN_SIMULATOR_ANCHOR}>
              Abrir Empresa
            </a>
          </div>
        </div>
      </header>

      <section className="accounting-hero" aria-labelledby="accounting-hero-title">
        <div className="accounting-hero-copy">
          <div className="accounting-hero-proof">
            <div className="accounting-hero-avatars" aria-hidden="true">
              <span className="accounting-hero-avatar">C</span>
              <span className="accounting-hero-avatar">M</span>
              <span className="accounting-hero-avatar">R</span>
            </div>
            <span>+ de 2000 clientes atendidos</span>
          </div>

          <h1 id="accounting-hero-title">
            <span>Contabilidade que gera lucro</span>
            <span>e não te deixa na mão!</span>
          </h1>
          <p className="accounting-hero-subtitle">
            Contabilidade focada em atendimento rápido, humanizado e que busca gerar lucro para a sua empresa
          </p>

          <div className="accounting-hero-actions">
            <a className="accounting-primary-button" href={HERO_OPEN_COMPANY_WHATSAPP_LINK} target="_blank" rel="noreferrer">
              Abrir Empresa
            </a>
            <a className="accounting-secondary-button" href={HERO_SWITCH_ACCOUNTANT_WHATSAPP_LINK} target="_blank" rel="noreferrer">
              Trocar de Contador
            </a>
          </div>
        </div>
      </section>

      <section className="accounting-offerings" aria-labelledby="accounting-offerings-title">
        <div className="accounting-offerings-inner">
          <h2 id="accounting-offerings-title">O que oferecemos para o seu negócio?</h2>
          <p className="accounting-offerings-subtitle">
            Tudo isso com um time que acompanha de perto o seu negócio, sem burocracia e sem enrolação.
          </p>

          <div className="accounting-offerings-grid">
            {businessOfferings.map(({ title, description, icon: Icon, image, imageAlt }) => (
              <article className="accounting-offering-card" key={title}>
                <div className="accounting-offering-photo">
                  <img src={image} alt={imageAlt} loading="lazy" />
                </div>
                <div className="accounting-offering-content">
                  <div className="accounting-offering-heading">
                    <span className="accounting-offering-icon" aria-hidden="true">
                      <Icon size={19} strokeWidth={2} />
                    </span>
                    <h3>{title}</h3>
                  </div>
                  <p>{description}</p>
                  <a
                    className="accounting-offering-cta"
                    href={buildOfferingWhatsAppLink(title)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Saber Mais
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="accounting-support" aria-labelledby="accounting-support-title">
        <div className="accounting-support-inner">
          <span className="accounting-support-badge">
            <Headset size={17} strokeWidth={2.2} aria-hidden="true" />
            Atendimento humano e rápido
          </span>

          <h2 id="accounting-support-title">Como funciona nosso atendimento?</h2>
          <p className="accounting-support-subtitle">
            Escolha o canal que preferir e receba um atendimento rápido, sem burocracia e com pessoas prontas para te
            ajudar.
          </p>

          <div className="accounting-support-grid">
            {supportChannels.map(({ key, title, description, icon: Icon, image, imageAlt }) => (
              <article className="accounting-support-card" key={key}>
                <div className="accounting-support-photo">
                  <img src={image} alt={imageAlt} loading="lazy" />
                </div>
                <div className="accounting-support-content">
                  <div className="accounting-support-heading">
                    <span className={`accounting-support-icon accounting-support-icon--${key}`} aria-hidden="true">
                      <Icon size={20} strokeWidth={2} />
                    </span>
                    <h3>{title}</h3>
                  </div>
                  <p>{description}</p>
                </div>
              </article>
            ))}
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

      <section className="accounting-solutions" aria-labelledby="accounting-solutions-title">
        <div className="accounting-solutions-inner">
          <span className="accounting-solutions-badge">
            <span className="accounting-solutions-badge-dot" aria-hidden="true" />
            Soluções organizadas por área
          </span>

          <h2 id="accounting-solutions-title">Quais as soluções que oferecemos?</h2>
          <p className="accounting-solutions-subtitle">
            Organizamos nossos serviços por área para você entender rapidamente como ajudamos sua empresa a abrir,
            operar e crescer com segurança.
          </p>

          <div className="accounting-solutions-grid">
            {businessSolutions.map(({ title, tag, description, icon: Icon }) => (
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

          <a className="accounting-solutions-cta" href={TEAM_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            Falar com a equipe
          </a>
        </div>
      </section>

      <section className="accounting-plans" id="planos" aria-labelledby="accounting-plans-title">
        <div className="accounting-plans-inner">
          <h2 id="accounting-plans-title">Conheça os nossos planos completos</h2>
          <p className="accounting-plans-subtitle">Escolha o plano ideal para o momento do seu negócio.</p>

          <div className="accounting-pricing-grid" id="simulador-planos">
            {pricingPlans.map(({ tier, name, price, description, featured, features }) => (
              <article className={`accounting-pricing-card${featured ? " is-featured" : ""}`} key={tier}>
                {featured && <span className="accounting-pricing-badge">Mais escolhido</span>}

                <div className={`accounting-pricing-icon accounting-pricing-icon--${tier}`} aria-hidden="true">
                  <Medal size={24} strokeWidth={2} />
                </div>

                <h3>{name}</h3>

                <div className="accounting-pricing-price">
                  <span>{price}</span>
                  <em>/mês</em>
                </div>

                <p className="accounting-pricing-desc">{description}</p>

                <ul className="accounting-pricing-benefits">
                  {features.map((feature) => (
                    <li key={feature}>
                      <Check size={16} strokeWidth={2.6} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <PlanWhatsAppButton
                  className={`accounting-plan-button${featured ? " is-primary" : ""}`}
                  href={buildPlanWhatsAppLink(name)}
                >
                  Contratar agora
                </PlanWhatsAppButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="accounting-blog" id="blog" aria-labelledby="accounting-blog-title">
        <div className="accounting-tools-inner">
          <h2 id="accounting-blog-title">Artigos recentes</h2>
          <p className="accounting-tools-subtitle">
            <span>Guias práticos sobre precificação, contratos, rescisão e MEI</span>
            <span>pra você tomar decisão com mais segurança.</span>
          </p>

          <div className="blog-grid">
            {recentArticles.map(article => (
              <BlogCard article={article} key={article.slug} />
            ))}
          </div>

          <a className="accounting-secondary-button accounting-blog-cta" href="/blog">
            Ver todos os artigos
          </a>
        </div>
      </section>

      <section className="accounting-faq" id="duvidas" aria-labelledby="accounting-faq-title">
        <div className="accounting-faq-inner">
          <div className="accounting-faq-head">
            <h2 id="accounting-faq-title">Dúvidas frequentes</h2>
            <p>Respostas rápidas para entender como funciona o atendimento contábil da Tropa.</p>
          </div>

          <div className="accounting-faq-list">
            {accountingFaqs.map(({ question, answer }) => (
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
              <a href="#planos">Planos</a>
              <a href="/blog">Blog</a>
              <a href="#duvidas">Dúvidas</a>
              <a href="/login">Login</a>
            </div>

            <div>
              <h2>Ferramentas</h2>
              {accountingTools.map(({ title, slug }) => (
                <a href={buildToolsEntryHref(isAuthenticated, resolvedSearchParams, slug)} key={slug}>
                  {title}
                </a>
              ))}
            </div>

            <div>
              <h2>Contato</h2>
              <a href={TROPA_WHATSAPP_LINK} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </nav>
        </div>

        <div className="accounting-footer-disclaimer">
          <p>
            A Tropa é uma empresa privada de contabilidade e assessoria empresarial, sem qualquer vínculo oficial
            com órgãos públicos ou governamentais. Não somos um órgão do governo e não emitimos, vendemos ou
            intermediamos documentos públicos — todo o suporte para abertura, alteração ou regularização de
            empresas é prestado como serviço de assessoria contábil privada.
          </p>
          <p>Responsável técnico: {CRC_REGISTRATION}.</p>
        </div>

        <div className="accounting-footer-bottom">
          <span>© 2026 Tropa. Todos os direitos reservados.</span>
          <a href={PLAN_SIMULATOR_ANCHOR}>Ver Planos</a>
        </div>
      </footer>
    </main>
  )
}
