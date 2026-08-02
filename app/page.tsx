import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  ChartColumnIncreasing,
  FileSignature,
  Megaphone,
  PieChart,
  Users,
  type LucideIcon,
} from "lucide-react"
import PlanCalculator from "@/components/plan-calculator"
import { BlogCard } from "@/components/blog/blog-card"
import { getRecentArticles } from "@/lib/blog/articles"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { ToolSlug } from "@/lib/tool-usage/tools"

const HUB_TOOLS_PATH = "/hub?tab=ferramentas"
const PLAN_SIMULATOR_ANCHOR = "#simulador-planos"
const MARKETING_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const

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
    title: "Abertura e Legalização",
    description: "Cuidamos da abertura de empresas, regularizações e processos para manter o negócio em conformidade.",
    icon: Building2,
  },
  {
    title: "Certificado Digital",
    description:
      "Emitimos e renovamos certificados digitais com agilidade e suporte completo para pessoas físicas e empresas.",
    icon: BadgeCheck,
  },
  {
    title: "Contratos",
    description: "Auxiliamos na elaboração, revisão e organização de contratos e documentos essenciais do negócio.",
    icon: FileSignature,
  },
  {
    title: "Assessoria Contábil",
    description: "Oferecemos suporte contábil consultivo com acompanhamento próximo e orientação estratégica.",
    icon: Calculator,
  },
  {
    title: "Planejamento Tributário",
    description: "Analisamos enquadramentos e oportunidades para reduzir riscos e otimizar a carga tributária.",
    icon: PieChart,
  },
  {
    title: "Marketing e Vendas",
    description:
      "Criamos estratégias de tráfego pago, social media e campanhas para atrair clientes e gerar crescimento.",
    icon: Megaphone,
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
    question: "A abertura do CNPJ é gratuita?",
    answer:
      "Sim, a abertura é 100% gratuita, mas apenas se for para MEI. Para abrir uma empresa que não seja MEI, consulte o nosso canal de atendimento.",
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
      "Trabalhamos com taxas por emissão de nota fiscal de serviço. Em caso de nota fiscal de produto (DANFE), também oferecemos esse serviço. Consulte o nosso canal de atendimento.",
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

  return (
    <main className="accounting-landing">
      <header className="accounting-header" aria-label="Cabeçalho Tropa">
        <a className="accounting-logo" href="/" aria-label="Tropa">
          <Building2 size={22} strokeWidth={2.2} aria-hidden="true" />
          <span>Tropa</span>
        </a>

        <nav className="accounting-nav" aria-label="Navegação principal">
          <a href="#servicos" className="is-active">Serviços</a>
          <a href="#planos">Planos</a>
          <a href="#ferramentas">Ferramentas</a>
          <a href="/blog">Blog</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>

        <div className="accounting-header-actions">
          <a className="accounting-login" href="/login">
            Login
          </a>
          <a className="accounting-header-cta" href="/abrir-cnpj">
            <span>Abrir CNPJ</span>
            <span aria-hidden="true">›</span>
          </a>
        </div>
      </header>

      <section className="accounting-hero" aria-labelledby="accounting-hero-title">
        <div className="accounting-hero-copy">
          <h1 id="accounting-hero-title">
            <span>Contabilidade para prestadores de serviço</span>
          </h1>
          <p className="accounting-hero-subtitle">
            <span>Abra seu CNPJ, emita notas fiscais e organize seus impostos com uma plataforma fácil de usar</span>
            <span>e especialistas de verdade acompanhando você.</span>
          </p>

          <div className="accounting-hero-actions">
            <a className="accounting-primary-button" href="/abrir-cnpj">
              Abrir CNPJ
            </a>
            <a className="accounting-secondary-button" href={PLAN_SIMULATOR_ANCHOR}>
              Trocar Contador
            </a>
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

      <section className="accounting-plans" id="planos" aria-labelledby="accounting-plans-title">
        <div className="accounting-plans-inner">
          <h2 id="accounting-plans-title">Nossos Planos</h2>
          <p className="accounting-plans-subtitle">Escolha o plano ideal para o momento do seu negócio.</p>

          <div id="simulador-planos">
            <PlanCalculator />
          </div>
        </div>
      </section>

      <section className="accounting-tools" id="ferramentas" aria-labelledby="accounting-tools-title">
        <div className="accounting-tools-inner">
          <h2 id="accounting-tools-title">
            <span>Ferramentas úteis para empreendedores</span>
          </h2>
          <p className="accounting-tools-subtitle">
            <span>Atalhos práticos para MEIs e empresas do Simples Nacional</span>
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
              <Building2 size={22} strokeWidth={2.2} aria-hidden="true" />
              <span>Tropa</span>
            </a>
            <p>Assessoria empresarial para prestadores de serviço, MEIs e empresas que querem crescer com organização.</p>
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

        <div className="accounting-footer-bottom">
          <span>© 2026 Tropa. Todos os direitos reservados.</span>
          <a href="/abrir-cnpj">Abrir CNPJ</a>
        </div>
      </footer>
    </main>
  )
}
