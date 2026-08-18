import {
  Check,
  Clock,
  FileSignature,
  Headset,
  Mail,
  Medal,
  MessageCircle,
  Search,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react"
import { ToolShell } from "@/components/tool-shell"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"
import { PlanWhatsAppButton } from "@/components/plan-whatsapp-button"
import { TROPA_WHATSAPP_LINK } from "@/lib/contact-links"
import { pricingPlans, buildPlanWhatsAppLink } from "@/lib/pricing-plans"

export const metadata = {
  title: "Trocar de Contador | Tropa",
  description:
    "Troque de contador com assessor exclusivo, migração em até 2 dias úteis e análise 100% gratuita. Sem burocracia, sem enrolação.",
}

function buildWhatsAppLink(message: string) {
  return `${TROPA_WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
}

const HERO_WHATSAPP_LINK = buildWhatsAppLink(
  "Oi, quero trocar de contador e gostaria de saber mais sobre a contabilidade da Tropa",
)
const ANALISE_WHATSAPP_LINK = buildWhatsAppLink(
  "Oi, quero uma análise gratuita antes de trocar de contador",
)
const ASSESSOR_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero falar com um assessor exclusivo da Tropa")
const EQUIPE_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero saber mais sobre o atendimento da Tropa")
const CONTRAST_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero um atendimento que resolve de verdade, sem robô")
const FINAL_WHATSAPP_LINK = buildWhatsAppLink("Oi, quero trocar de contador para a Tropa")

const advisorHighlights = [
  { label: "Conhece sua empresa de verdade", icon: UserCheck },
  { label: "Resposta direto com uma pessoa", icon: MessageCircle },
  { label: "Sem robô, sem fila, sem ticket", icon: ShieldCheck },
]

const attendanceChannels = [
  {
    key: "whatsapp" as const,
    title: "Atendimento no WhatsApp",
    description: "Assessor exclusivo te atende direto, sem bot no meio, de forma ágil e humana.",
    icon: MessageCircle,
    image: "/images/support/whatsapp.jpg",
    imageAlt: "Pessoa usando o celular para conversar em um aplicativo de mensagens em uma mesa de escritório",
  },
  {
    key: "email" as const,
    title: "Atendimento no E-mail",
    description: "Suas solicitações e rotinas recebem resposta em até 2 horas úteis, sempre com atenção de verdade.",
    icon: Mail,
    image: "/images/support/email.jpg",
    imageAlt: "Notebook aberto sobre uma mesa em um ambiente de trabalho iluminado",
  },
]

const contrastNegative = [
  "Você fala com quem estiver disponível, não com quem conhece sua empresa",
  "Perguntas simples caem em bot ou fila de atendimento",
  "A resposta demora dias, às vezes semanas",
  "Você descobre o problema só quando já virou multa",
]

const contrastPositive = [
  "Um assessor exclusivo que já conhece a sua empresa",
  "Atendimento humano de verdade, sem robô no meio",
  "Resposta em até 2 horas úteis",
  "Seu assessor avisa antes de virar problema",
]

const differentiators = [
  {
    title: "Assessor exclusivo de verdade",
    tag: "Atendimento",
    description:
      "Um assessor que já conhece sua empresa cuida de dúvidas, solicitações, orientação e atualização durante toda a troca. Nada de sistema de tickets genérico.",
    icon: UserCheck,
  },
  {
    title: "Migração em até 2 dias úteis",
    tag: "Velocidade",
    description: "Organizamos a transição rápido, sem meses de espera e sem deixar sua empresa exposta no caminho.",
    icon: Clock,
  },
  {
    title: "Documentação do seu jeito",
    tag: "Flexibilidade",
    description:
      "Se for melhor pra você, buscamos a documentação direto com o seu contador atual. Se preferir enviar você mesmo, também funciona.",
    icon: FileSignature,
  },
  {
    title: "Análise e levantamento gratuitos",
    tag: "Sem compromisso",
    description: "Antes de decidir qualquer coisa, você entende de graça a real situação fiscal da sua empresa.",
    icon: Search,
  },
] satisfies Array<{ title: string; tag: string; description: string; icon: typeof UserCheck }>

const switchSteps = [
  {
    number: "01",
    title: "Fale com a gente",
    description: "Conte a situação da sua empresa e o que te motivou a querer trocar de contador.",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Análise gratuita",
    description: "Analisamos sua situação fiscal atual sem custo e sem compromisso.",
    icon: Search,
  },
  {
    number: "03",
    title: "Documentos, do seu jeito",
    description:
      "Buscamos com seu contador atual ou você envia direto: certificado digital e contrato social. O resto depende da sua empresa, e seu assessor te avisa se faltar algo.",
    icon: FileSignature,
  },
  {
    number: "04",
    title: "Migração em até 2 dias úteis",
    description: "Organizamos a transição rápido, pra sua empresa continuar em dia o tempo todo.",
    icon: Clock,
  },
  {
    number: "05",
    title: "Assessor exclusivo, todo santo dia",
    description: "Dúvidas, solicitações, orientações e atualizações com um assessor que é só seu.",
    icon: UserCheck,
  },
] satisfies Array<{ number: string; title: string; description: string; icon: typeof UserCheck }>

// Depoimentos provisórios para dar forma à seção — recomendo substituir por
// depoimentos reais de clientes que trocaram de contador antes de publicar,
// para não misturar prova social genuína com texto de exemplo.
const testimonials = [
  {
    name: "Renata Souza",
    role: "Designer de interiores",
    quote:
      "Já tinha ouvido falar que trocar de contador dava dor de cabeça, mas na Tropa foi o contrário: em menos de 2 dias já estava tudo migrado e funcionando.",
  },
  {
    name: "Eduardo Lima",
    role: "Fisioterapeuta, MEI",
    quote:
      "O que mais pesou na decisão foi o atendimento. Meu contador antigo demorava dias pra responder; com a Tropa é questão de horas.",
  },
  {
    name: "Vanessa Cardoso",
    role: "Consultora de RH",
    quote:
      "Mandei só o contrato social e o certificado digital, e o assessor cuidou do resto direto com o meu contador anterior. Não precisei correr atrás de nada.",
  },
  {
    name: "Rodrigo Almeida",
    role: "Dono de estúdio de fotografia",
    quote:
      "Pedi uma análise antes de decidir e não me cobraram nada por isso. Isso me deu segurança pra fechar com a Tropa.",
  },
  {
    name: "Isabela Torres",
    role: "Advogada autônoma",
    quote: "Tenho um assessor que realmente conhece a minha empresa. Não fico explicando a mesma coisa toda vez que mando mensagem.",
  },
  {
    name: "Gustavo Pereira",
    role: "Prestador de serviços de TI",
    quote: "Estava com receio de ficar sem contabilidade durante a troca, mas em nenhum momento fiquei exposto ou sem suporte.",
  },
  {
    name: "Carla Nogueira",
    role: "Nutricionista",
    quote: "O diferencial não foi preço, foi atenção mesmo. Sinto que tenho alguém acompanhando de verdade, não só um sistema.",
  },
  {
    name: "Felipe Rangel",
    role: "Sócio de agência de marketing",
    quote: "A migração foi rápida e sem burocracia. Em menos de uma semana eu já nem lembrava que tinha trocado de contador.",
  },
]

const faqs = [
  {
    question: "Vou ficar sem contabilidade durante a troca?",
    answer:
      "Não. Organizamos a transição para que sua empresa continue com as obrigações em dia durante todo o processo, sem período de exposição.",
  },
  {
    question: "Preciso avisar meu contador atual?",
    answer:
      "Não necessariamente. Se for mais fácil pra você, a Tropa entra em contato diretamente com o seu contador atual para buscar a documentação. Se preferir avisar você mesmo e enviar os documentos direto, também funciona. O processo se adapta ao que for melhor pra você.",
  },
  {
    question: "Quanto tempo demora a troca?",
    answer: "Em até 2 dias úteis, a partir do momento em que a documentação necessária está com a gente.",
  },
  {
    question: "Quais documentos preciso separar?",
    answer:
      "Na maioria dos casos, apenas o certificado digital e o contrato social da empresa. Documentos adicionais podem ser necessários dependendo do tipo e da situação da sua empresa. Seu assessor te avisa exatamente o que falta, caso haja algo mais.",
  },
  {
    question: "A análise inicial tem algum custo?",
    answer:
      "Não. A análise e o levantamento da situação da sua empresa são 100% gratuitos e sem compromisso. Você decide depois de entender o que vamos fazer.",
  },
  {
    question: "E se eu tiver pendências com o contador anterior?",
    answer:
      "Fazemos o levantamento e te orientamos sobre a melhor forma de resolver antes ou durante a migração, sem deixar sua empresa exposta.",
  },
]

export default function TrocarDeContadorPage() {
  return (
    <ToolShell>
      <section className="accounting-hero" aria-labelledby="trocar-hero-title">
        <div className="accounting-hero-copy">
          <div className="accounting-hero-proof">
            <div className="accounting-hero-avatars" aria-hidden="true">
              <span className="accounting-hero-avatar">C</span>
              <span className="accounting-hero-avatar">M</span>
              <span className="accounting-hero-avatar">R</span>
            </div>
            <span>+ de 2000 clientes atendidos</span>
          </div>

          <h1 id="trocar-hero-title">
            <span>Trocar de contador</span>
            <span>nunca foi tão simples</span>
          </h1>
          <p className="accounting-hero-subtitle">
            Assessor exclusivo cuida de toda a migração pra você, sem burocracia e sem enrolação, com um
            atendimento que faz a diferença de verdade.
          </p>

          <div className="accounting-hero-actions">
            <a className="accounting-primary-button" href={HERO_WHATSAPP_LINK} target="_blank" rel="noreferrer">
              Quero trocar de contador
            </a>
            <a className="accounting-secondary-button" href={ANALISE_WHATSAPP_LINK} target="_blank" rel="noreferrer">
              Pedir análise gratuita
            </a>
          </div>

          <div className="accounting-hero-trust">
            <span className="accounting-hero-trust-item">
              <Clock size={16} strokeWidth={2.2} aria-hidden="true" />
              Migração em até 2 dias úteis
            </span>
            <span className="accounting-hero-trust-divider" aria-hidden="true" />
            <span className="accounting-hero-trust-item">
              <UserCheck size={16} strokeWidth={2.2} aria-hidden="true" />
              Assessor exclusivo
            </span>
            <span className="accounting-hero-trust-divider" aria-hidden="true" />
            <span className="accounting-hero-trust-item">
              <ShieldCheck size={16} strokeWidth={2.2} aria-hidden="true" />
              Análise 100% gratuita
            </span>
          </div>
        </div>
      </section>

      <section className="accounting-advisor-section" aria-labelledby="trocar-advisor-title">
        <div className="accounting-advisor-inner">
          <div className="accounting-advisor-photo">
            <img
              src="/images/support/whatsapp.jpg"
              alt="Empreendedor conversando com um assessor pelo WhatsApp"
              loading="lazy"
            />
          </div>

          <div className="accounting-advisor-copy">
            <h2 id="trocar-advisor-title">Um assessor exclusivo, não uma fila de atendimento</h2>
            <p className="accounting-advisor-subtitle">
              Na Tropa você não fala com quem estiver disponível no momento. Você tem um assessor que já conhece
              a sua empresa, do início ao fim da troca, e continua depois. Não te vemos como um número, queremos
              qualidade do início ao fim.
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

      <section className="accounting-support" aria-labelledby="trocar-support-title">
        <div className="accounting-support-inner">
          <span className="accounting-support-badge">
            <Headset size={17} strokeWidth={2.2} aria-hidden="true" />
            Atendimento humano e rápido
          </span>

          <h2 id="trocar-support-title">Atendimento rápido, humano, sem robô no meio</h2>
          <p className="accounting-support-subtitle">
            A maioria das contabilidades coloca você numa fila de chatbot ou demora dias pra responder. Aqui a
            prioridade é te atender rápido e por gente de verdade, todos os dias úteis.
          </p>

          <div className="accounting-support-grid">
            {attendanceChannels.map(({ key, title, description, icon: Icon, image, imageAlt }) => (
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

          <a className="accounting-support-main-cta" href={EQUIPE_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            <UserCheck size={18} strokeWidth={2.2} aria-hidden="true" />
            Falar com a equipe
          </a>

          <p className="accounting-support-trust">
            <ShieldCheck size={16} strokeWidth={2} aria-hidden="true" />
            Não é sobre ser mais barato. É sobre nunca mais ficar esperando resposta.
          </p>
        </div>
      </section>

      <section className="accounting-contrast" aria-labelledby="trocar-contrast-title">
        <div className="accounting-contrast-inner">
          <span className="accounting-contrast-badge">Sem robô, sem fila</span>

          <h2 id="trocar-contrast-title">Cansado de esperar resposta da sua contabilidade?</h2>
          <p className="accounting-contrast-subtitle">
            Se você já passou por isso, sabe exatamente do que estamos falando.
          </p>

          <div className="accounting-contrast-grid">
            <div className="accounting-contrast-column is-negative">
              <div className="accounting-contrast-column-head">
                <span aria-hidden="true">
                  <X size={18} strokeWidth={2.4} />
                </span>
                <h3>Como costuma ser</h3>
              </div>
              <ul className="accounting-contrast-list">
                {contrastNegative.map(item => (
                  <li key={item}>
                    <X size={16} strokeWidth={2.4} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="accounting-contrast-column is-positive">
              <div className="accounting-contrast-column-head">
                <span aria-hidden="true">
                  <Check size={18} strokeWidth={2.6} />
                </span>
                <h3>Como é na Tropa</h3>
              </div>
              <ul className="accounting-contrast-list">
                {contrastPositive.map(item => (
                  <li key={item}>
                    <Check size={16} strokeWidth={2.6} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a className="accounting-contrast-cta" href={CONTRAST_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            <MessageCircle size={20} strokeWidth={2.2} aria-hidden="true" />
            Quero um atendimento assim
          </a>

          <p className="accounting-contrast-trust">
            <ShieldCheck size={16} strokeWidth={2.1} aria-hidden="true" />
            Não é sobre ser mais barato. É sobre nunca mais ficar sem resposta.
          </p>
        </div>
      </section>

      <section className="accounting-solutions" aria-labelledby="trocar-differentiators-title">
        <div className="accounting-solutions-inner">
          <span className="accounting-solutions-badge">
            <span className="accounting-solutions-badge-dot" aria-hidden="true" />
            Por que trocar com a Tropa
          </span>

          <h2 id="trocar-differentiators-title">O que muda de verdade quando você troca pra Tropa</h2>
          <p className="accounting-solutions-subtitle">
            Não é sobre ser mais barato. É sobre ter alguém que realmente cuida da sua empresa durante e depois da
            troca.
          </p>

          <div className="accounting-solutions-grid is-quad">
            {differentiators.map(({ title, tag, description, icon: Icon }) => (
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

      <section className="accounting-switch" aria-labelledby="trocar-steps-title">
        <div className="accounting-switch-inner">
          <span className="accounting-switch-badge">
            <UserCheck size={17} strokeWidth={2.2} aria-hidden="true" />
            Como funciona
          </span>

          <h2 id="trocar-steps-title">O passo a passo da troca de contador</h2>
          <p className="accounting-switch-subtitle">
            Do primeiro contato até o dia em que sua empresa já está com a Tropa, sem burocracia no meio do
            caminho.
          </p>

          <div className="accounting-switch-steps">
            {switchSteps.map(({ number, title, description, icon: Icon }) => (
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

          <a className="accounting-switch-cta" href={HERO_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            <MessageCircle size={22} strokeWidth={2.2} aria-hidden="true" />
            Falar com um especialista
          </a>

          <p className="accounting-switch-trust">
            <ShieldCheck size={16} strokeWidth={2.1} aria-hidden="true" />
            Atendimento humano, seguro e sem burocracia.
          </p>
        </div>
      </section>

      <section className="accounting-testimonials" aria-labelledby="trocar-testimonials-title">
        <div className="accounting-testimonials-inner">
          <h2 id="trocar-testimonials-title">Quem trocou de contador pra Tropa</h2>
          <p className="accounting-testimonials-subtitle">
            Histórias reais de quem trocou de contador e passou a ter um atendimento à altura da própria empresa.
          </p>

          <TestimonialsCarousel testimonials={testimonials} />

          <a className="accounting-testimonials-cta" href={FINAL_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            Quero trocar de contador também
          </a>
        </div>
      </section>

      <section className="accounting-plans" id="planos" aria-labelledby="trocar-plans-title">
        <div className="accounting-plans-inner">
          <h2 id="trocar-plans-title">Conheça os nossos planos completos</h2>
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

      <section className="accounting-faq" aria-labelledby="trocar-faq-title">
        <div className="accounting-faq-inner">
          <div className="accounting-faq-head">
            <h2 id="trocar-faq-title">Dúvidas sobre trocar de contador</h2>
            <p>Respostas rápidas pra quem está pensando em trocar de contador pra Tropa.</p>
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
