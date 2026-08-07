import { headers } from "next/headers"
import {
  ArrowRight,
  Calculator,
  ChartColumnIncreasing,
  Check,
  FileSignature,
  Medal,
  PieChart,
  Users,
  Wrench,
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

const accountingServices = [
  {
    title: "Assessoria Contábil",
    description:
      "Suporte contábil de verdade, com acompanhamento próximo e orientação estratégica em cada etapa do seu negócio.",
    icon: Calculator,
  },
  {
    title: "Contratos",
    description: "Auxiliamos na elaboração, revisão e organização de contratos e documentos essenciais do negócio.",
    icon: FileSignature,
  },
  {
    title: "Planejamento Tributário",
    description: "Analisamos enquadramentos e oportunidades para reduzir riscos e otimizar a carga tributária.",
    icon: PieChart,
  },
  {
    title: "Ferramentas Exclusivas",
    description:
      "Calculadoras e geradores de documentos para simular rescisão, contratação, precificação e montar contratos em minutos.",
    icon: Wrench,
  },
  {
    title: "Recursos Humanos",
    description: "Apoiamos rotinas de RH, admissões, folha, organização interna e suporte à gestão de pessoas.",
    icon: Users,
  },
  {
    title: "BPO Financeiro",
    description:
      "Organizamos o financeiro da empresa com controle de contas, fluxo de caixa e apoio à tomada de decisão.",
    icon: ChartColumnIncreasing,
  },
]

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
      "Até 3 notas fiscais por mês",
      "Até 1 funcionário",
      "Envio mensal de impostos",
      "Suporte 100% humanizado",
      "Atendimento por e-mail e WhatsApp",
    ],
  },
  {
    tier: "prata" as const,
    name: "Prata",
    price: "R$ 810,50",
    description: "Assessoria completa para empresas que estão crescendo e precisam de mais acompanhamento.",
    featured: true,
    features: [
      "Até 5 notas fiscais por mês",
      "Até 3 funcionários",
      "Envio mensal de impostos",
      "Estratégia tributária no Simples Nacional",
      "Suporte 100% humanizado",
      "Atendimento por e-mail e WhatsApp",
    ],
  },
  {
    tier: "ouro" as const,
    name: "Ouro",
    price: "R$ 1.621,00",
    description: "Gestão contábil estratégica para empresas que precisam de acompanhamento próximo e decisões mais seguras.",
    featured: false,
    features: [
      "Até 10 notas fiscais por mês",
      "Até 10 funcionários",
      "Envio mensal de impostos",
      "Estratégia tributária no Simples Nacional ou Híbrido",
      "Suporte 100% humanizado",
      "Atendimento por e-mail e WhatsApp",
      "1 consulta Serasa mensal",
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
            <a href="#servicos">Serviços</a>
            <a href="#planos">Planos</a>
            <a href="#ferramentas">Ferramentas</a>
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
            <span>Contabilidade Online para</span>
            <span>prestadores de serviço</span>
          </h1>
          <p className="accounting-hero-subtitle">
            Contabilidade focada em atendimento humanizado e visando resultado, você fatura e cuida da sua empresa
            enquanto a gente cuida do leão para você.
          </p>

          <div className="accounting-hero-actions">
            <a className="accounting-primary-button" href={PLAN_SIMULATOR_ANCHOR}>
              Começar
            </a>
          </div>
        </div>
      </section>

      <section className="accounting-plans" id="planos" aria-labelledby="accounting-plans-title">
        <div className="accounting-plans-inner">
          <h2 id="accounting-plans-title">Nossos Planos</h2>
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

      <section className="accounting-services" id="servicos" aria-labelledby="accounting-services-title">
        <div className="accounting-services-inner">
          <h2 id="accounting-services-title">Quais Serviços Oferecemos?</h2>
          <p className="accounting-services-subtitle">
            Esses são os principais serviços que você pode contratar com a gente!
          </p>

          <div className="accounting-services-grid">
            {accountingServices.map(({ title, description, icon: Icon }) => (
              <article className="accounting-service-card" key={title}>
                <div className="accounting-service-icon" aria-hidden="true">
                  <Icon size={34} strokeWidth={1.8} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="accounting-tools" id="ferramentas" aria-labelledby="accounting-tools-title">
        <div className="accounting-tools-inner">
          <h2 id="accounting-tools-title">
            <span>Ferramentas úteis para empreendedores</span>
          </h2>
          <p className="accounting-tools-subtitle">
            <span>Atalhos práticos para empreendedores</span>
            <span>tomarem decisões com mais segurança.</span>
          </p>

          <div className="accounting-tools-grid">
            {accountingTools.map(({ title, description, icon: Icon, slug }) => (
              <article className="accounting-tool-card" key={title}>
                <div className="accounting-tool-icon" aria-hidden="true">
                  <Icon size={54} strokeWidth={1.65} />
                </div>

                <div className="accounting-tool-content">
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <a className="accounting-tool-link" href={buildToolsEntryHref(isAuthenticated, resolvedSearchParams, slug)}>
                    Abrir ferramenta
                    <ArrowRight size={22} strokeWidth={2} aria-hidden="true" />
                  </a>
                </div>
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
              <a href="#servicos">Serviços</a>
              <a href="#planos">Planos</a>
              <a href="#ferramentas">Ferramentas</a>
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
