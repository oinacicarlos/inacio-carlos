import type { Metadata } from "next"
import styles from "./page.module.css"

const whatsappHref =
  "https://wa.me/5511978460120?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20diagn%C3%B3stico%20com%20a%20Meliunas%20Consultoria."

const mailHref = "mailto:meliunasconsult@gmail.com"

const diagnosticCards = [
  "Organizar minha empresa",
  "Analisar riscos",
  "Melhorar o financeiro",
  "Revisar documentos",
]

const solutions = [
  {
    title: "Consultoria legal",
    text: "Orientação para decisões que envolvem contratos, estrutura societária, documentos e riscos empresariais.",
    variant: "primary",
  },
  {
    title: "Consultoria financeira",
    text: "Organização de informações financeiras para entender caixa, compromissos, prioridades e cenários.",
    variant: "compact",
  },
  {
    title: "Planejamento empresarial",
    text: "Direcionamento para estruturar próximos passos com mais previsibilidade e critério.",
    variant: "accent",
  },
  {
    title: "Suporte documental",
    text: "Revisão e organização de documentos importantes para apoiar decisões e reduzir fragilidades.",
    variant: "compact",
  },
  {
    title: "Organização de processos",
    text: "Ajuste de rotinas, responsabilidades e fluxos internos para tornar a gestão mais clara.",
    variant: "wide",
  },
]

const methodSteps = [
  {
    title: "Entendimento do cenário",
    text: "Mapeamento objetivo da situação atual, dúvidas, documentos, prioridades e pontos sensíveis.",
  },
  {
    title: "Análise legal e financeira",
    text: "Leitura integrada das informações para identificar riscos, lacunas e oportunidades de organização.",
  },
  {
    title: "Plano de orientação",
    text: "Entrega de uma direção clara com prioridades, próximos passos e recomendações práticas.",
  },
]

const testimonials = [
  {
    quote:
      "A Meliunas trouxe clareza para uma decisão que envolvia contrato, caixa e risco operacional.",
    author: "Diretora administrativa",
  },
  {
    quote:
      "O processo foi objetivo, discreto e muito bem organizado. Saímos sabendo exatamente o que fazer.",
    author: "Sócio executivo",
  },
  {
    quote:
      "A análise ajudou nossa equipe a separar urgências reais de problemas que pareciam maiores do que eram.",
    author: "Gestora financeira",
  },
]

export const metadata: Metadata = {
  title: "Meliunas Consultoria | Legal e Financeira",
  description: "Landing page visual premium para consultoria legal e financeira.",
}

function Header() {
  return (
    <header className={styles.header}>
      <a className={styles.logo} href="/modelo-2" aria-label="Meliunas Consultoria">
        <span className={styles.logoMark}>M</span>
        <span>Meliunas Consultoria</span>
      </a>

      <nav className={styles.nav} aria-label="Navegação principal">
        <a href="#solucoes">Soluções</a>
        <a href="#metodo">Método</a>
        <a href="#empresas">Empresas</a>
        <a href="#contato">Contato</a>
      </nav>

      <a
        className={`${styles.btn} ${styles.btnSecondary} ${styles.headerButton}`}
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
      >
        Falar no WhatsApp
      </a>
    </header>
  )
}

function ReportPanel() {
  return (
    <aside className={styles.reportPanel} aria-label="Painel visual de diagnóstico">
      <div className={styles.reportHeader}>
        <div>
          <span>Diagnóstico financeiro</span>
          <strong>Leitura executiva</strong>
        </div>
        <p>Em avaliação</p>
      </div>

      <div className={styles.reportLine} aria-hidden="true">
        <span />
      </div>

      <div className={styles.moneyGrid}>
        <div>
          <span>Caixa analisado</span>
          <strong>R$ 248 mil</strong>
        </div>
        <div>
          <span>Risco estimado</span>
          <strong>R$ 37 mil</strong>
        </div>
      </div>

      <div className={styles.reportItems}>
        <div>
          <span>Análise legal</span>
          <strong>Contratos e obrigações</strong>
        </div>
        <div>
          <span>Organização financeira</span>
          <strong>Margem, caixa e custos</strong>
        </div>
        <div>
          <span>Riscos identificados</span>
          <strong>3 alertas ativos</strong>
        </div>
        <div>
          <span>Próximos passos</span>
          <strong>Plano de contenção</strong>
        </div>
      </div>

      <div className={styles.reportFooter}>
        <span>Prioridade recomendada</span>
        <p>Organizar fluxo de caixa, revisar obrigações críticas e definir limites para decisões de alto impacto.</p>
      </div>
    </aside>
  )
}

export default function Modelo2Page() {
  return (
    <main className={styles.page}>
      <Header />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Consultoria legal e financeira</p>
          <h1>Clareza legal e financeira para decisões mais seguras.</h1>
          <p>
            Apoio consultivo para organizar informações, analisar riscos e orientar
            empresas e profissionais na tomada de decisão.
          </p>
          <div className={styles.heroActions}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href="#diagnostico">
              Solicitar diagnóstico
            </a>
            <a className={`${styles.btn} ${styles.btnSecondary}`} href="#solucoes">
              Conhecer soluções
            </a>
          </div>
        </div>

        <ReportPanel />
      </section>

      <section className={styles.diagnostic} id="diagnostico">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Diagnóstico inicial</p>
          <h2>Por onde podemos começar?</h2>
        </div>

        <div className={styles.diagnosticGrid}>
          {diagnosticCards.map((card, index) => (
            <a className={styles.diagnosticCard} href="#contato" key={card}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{card}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.solutions} id="solucoes">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Soluções</p>
          <h2>Estrutura para decisões empresariais com mais controle.</h2>
        </div>

        <div className={styles.bentoGrid}>
          {solutions.map((solution) => (
            <article
              className={`${styles.solutionBlock} ${styles[solution.variant]}`}
              key={solution.title}
            >
              <span />
              <div>
                <h3>{solution.title}</h3>
                <p>{solution.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.method} id="metodo">
        <div className={styles.methodIntro}>
          <p className={styles.eyebrow}>Método</p>
          <h2>Um processo direto para transformar dúvidas em orientação.</h2>
        </div>

        <div className={styles.timeline}>
          {methodSteps.map((step, index) => (
            <article className={styles.timelineItem} key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.institutional}>
        <div>
          <p className={styles.eyebrow}>Institucional</p>
          <h2>Consultoria para decisões que exigem cuidado.</h2>
        </div>

        <div className={styles.pillars}>
          <article>
            <strong>Clareza</strong>
            <p>Informações organizadas para reduzir ruído e apoiar uma leitura objetiva.</p>
          </article>
          <article>
            <strong>Segurança</strong>
            <p>Análise de riscos, documentos e impactos antes de decisões relevantes.</p>
          </article>
          <article>
            <strong>Organização</strong>
            <p>Prioridades, próximos passos e responsabilidades bem definidos.</p>
          </article>
        </div>
      </section>

      <section className={styles.business} id="empresas">
        <div>
          <p className={styles.eyebrow}>Empresas</p>
          <h2>Empresas precisam de informação organizada para decidir melhor.</h2>
        </div>
        <a className={`${styles.btn} ${styles.btnPrimary}`} href="#contato">
          Solicitar análise
        </a>
      </section>

      <section className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Depoimentos</p>
          <h2>Orientação compacta, séria e útil para momentos importantes.</h2>
        </div>

        <div className={styles.testimonialList}>
          {testimonials.map((testimonial) => (
            <article key={testimonial.author}>
              <p>“{testimonial.quote}”</p>
              <span>{testimonial.author}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} id="contato">
        <p className={styles.eyebrow}>Contato</p>
        <h2>Converse com a Meliunas Consultoria.</h2>
        <div className={styles.finalActions}>
          <a className={`${styles.btn} ${styles.btnPrimary}`} href={whatsappHref} target="_blank" rel="noreferrer">
            Falar no WhatsApp
          </a>
          <a className={`${styles.btn} ${styles.btnSecondary}`} href={mailHref}>
            Enviar e-mail
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>Meliunas Consultoria</strong>
          <span>Consultoria legal e financeira</span>
        </div>
        <div>
          <a href={mailHref}>meliunasconsult@gmail.com</a>
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            WhatsApp: 11 97846-0120
          </a>
        </div>
      </footer>
    </main>
  )
}
