'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Screen = 'intro' | 'form' | 'success'
type DiagnosticResult = {
  perfil: string
  analise: string
  proximoPasso: string
}
type TextQuestion = {
  id: string
  label: string
  type: 'text' | 'email' | 'tel'
  placeholder: string
  autoComplete?: string
  inputMode?: 'email' | 'tel' | 'text'
}
type ChoiceQuestion = {
  id: string
  label: string
  type: 'choice'
  options: string[]
}
type Question = TextQuestion | ChoiceQuestion

const QUESTIONS: Question[] = [
  {
    id: 'name',
    label: 'Qual seu nome?',
    type: 'text',
    placeholder: 'Digite seu nome',
    autoComplete: 'name',
  },
  {
    id: 'email',
    label: 'Qual seu melhor e-mail?',
    type: 'email',
    placeholder: 'seuemail@empresa.com',
    autoComplete: 'email',
    inputMode: 'email',
  },
  {
    id: 'whatsapp',
    label: 'Qual seu WhatsApp?',
    type: 'tel',
    placeholder: '(00) 00000-0000',
    autoComplete: 'tel',
    inputMode: 'tel',
  },
  {
    id: 'company',
    label: 'Qual o nome da sua empresa?',
    type: 'text',
    placeholder: 'Nome da empresa',
    autoComplete: 'organization',
  },
  {
    id: 'salesSource',
    label: 'De onde vem a maioria das suas vendas?',
    type: 'choice',
    options: [
      'Instagram',
      'WhatsApp ou indicação',
      'Loja física',
      'Site, Marketplace ou Google Meu Negócio',
    ],
  },
  {
    id: 'digitalMarketing',
    label: 'Você já investe em marketing digital?',
    type: 'choice',
    options: [
      'Sim',
      'Não',
      'Tentei e não tive resultado',
      'Invisto, mas estou insatisfeito',
    ],
  },
  {
    id: 'salesTeam',
    label: 'Você tem quantos vendedores ou atendentes?',
    type: 'choice',
    options: ['Nenhum', '1', 'Mais de 5', 'Mais de 10'],
  },
  {
    id: 'mainProblem',
    label: 'Qual o principal problema hoje?',
    type: 'choice',
    options: [
      'Poucos leads',
      'Muitos leads e poucas vendas',
      'Muitos seguidores que não compram',
      'Não sei',
    ],
  },
  {
    id: 'salesProcess',
    label: 'Sua empresa tem um processo comercial?',
    type: 'choice',
    options: ['Sim', 'Não', 'Mais ou menos', 'Não sei o que é isso'],
  },
  {
    id: 'currentGoal',
    label: 'O que você gostaria de resolver agora?',
    type: 'choice',
    options: [
      'Atrair mais pessoas',
      'Melhorar minha estrutura',
      'Treinar meu time de vendas',
      'Quero criar uma estrutura completa',
    ],
  },
]

function buildDiagnostic(answers: Record<string, string>): DiagnosticResult {
  const { salesSource, digitalMarketing, salesTeam, mainProblem, salesProcess, currentGoal } = answers

  const hasTeam = salesTeam === 'Mais de 5' || salesTeam === 'Mais de 10'
  const noProcess = salesProcess === 'Não' || salesProcess === 'Não sei o que é isso'
  const partialProcess = salesProcess === 'Mais ou menos'
  const investsMarketing = digitalMarketing === 'Sim'
  const unhappyMarketing = digitalMarketing === 'Invisto, mas estou insatisfeito'
  const failedMarketing = digitalMarketing === 'Tentei e não tive resultado'
  const noMarketing = digitalMarketing === 'Não'
  const fromInstagram = salesSource === 'Instagram'
  const fromWhatsapp = salesSource === 'WhatsApp ou indicação'
  const fromPhysical = salesSource === 'Loja física'

  // Muitos leads mas não converte, time presente
  if ((mainProblem === 'Muitos leads e poucas vendas') && hasTeam) {
    return {
      perfil: 'Você tem tráfego, mas perde na conversão.',
      analise: `Sua empresa gera leads${investsMarketing || unhappyMarketing ? ' e já investe em marketing' : ''}, mas o time não está fechando. Com ${salesTeam} vendedores e processo ${partialProcess ? 'pela metade' : 'ainda não definido'}, o problema não é oportunidade. É execução comercial.`,
      proximoPasso: 'Estruturar o processo de abordagem, follow-up e fechamento. Os leads já existem. O que falta é o sistema para convertê-los.',
    }
  }

  // Muitos seguidores que não compram, Instagram
  if (mainProblem === 'Muitos seguidores que não compram' && fromInstagram) {
    return {
      perfil: 'Você tem audiência, mas não tem conversão.',
      analise: `Seu Instagram gera atenção, mas atenção não paga boleto. ${noProcess ? 'Sem um processo de vendas definido' : 'Com processo incompleto'}, os seguidores ficam no like e não viram clientes. Isso não é problema de alcance, é problema de funil.`,
      proximoPasso: 'Criar uma oferta clara, um caminho de compra simples e um processo de atendimento que transforme seguidor em comprador.',
    }
  }

  // Investe mas está insatisfeito, dinheiro saindo sem retorno
  if (unhappyMarketing && mainProblem === 'Muitos leads e poucas vendas') {
    return {
      perfil: 'O dinheiro está saindo, mas não está voltando.',
      analise: 'Você investe em marketing, tem equipe de vendas e gera leads. Mas algo no meio quebra. Esse é o cenário mais caro: investimento ativo com retorno abaixo do esperado.',
      proximoPasso: 'Auditar o processo comercial do início ao fim: de onde vem o lead, como ele é atendido, por que não fecha. O problema está nessa etapa.',
    }
  }

  // Investe mas insatisfeito sem clareza do problema
  if (unhappyMarketing && mainProblem === 'Não sei') {
    return {
      perfil: 'Você investe sem saber onde o dinheiro some.',
      analise: 'Há investimento em marketing mas sem clareza do problema real. Gastar mais sem entender o gargalo vai amplificar o problema, não resolver.',
      proximoPasso: 'Antes de qualquer ação, mapear o funil completo: o que entra, o que converte, o que se perde. Só então definir onde investir.',
    }
  }

  // Loja física sem digital
  if (fromPhysical && (noMarketing || failedMarketing)) {
    return {
      perfil: 'Sua loja física não tem braço digital.',
      analise: `Suas vendas dependem do movimento físico: quem passa, quem já te conhece. Isso tem um teto. ${failedMarketing ? 'Você já tentou o digital mas sem resultado, o que indica que a estratégia estava errada, não o canal.' : 'Sem presença digital estruturada, você está invisível para quem ainda não te conhece.'}`,
      proximoPasso: 'Construir presença digital que gere fluxo real de novos clientes. Não apenas postar, mas criar um sistema de aquisição que complemente a loja.',
    }
  }

  // Depende de indicação sem processo
  if (fromWhatsapp && (noMarketing || failedMarketing) && noProcess) {
    return {
      perfil: 'Você depende da indicação. Isso tem limite.',
      analise: 'Vendas por WhatsApp e indicação funcionam, até o ponto em que você quer crescer além do seu círculo. Sem marketing e sem processo comercial, o crescimento fica amarrado à rede que você já tem.',
      proximoPasso: 'Montar uma estrutura de aquisição que não dependa de quem já te conhece. Sua próxima venda não pode depender de um favor.',
    }
  }

  // Quer treinar time mas não tem processo
  if (currentGoal === 'Treinar meu time de vendas' && hasTeam && noProcess) {
    return {
      perfil: 'Time presente, resultado inconsistente.',
      analise: `Você tem ${salesTeam} vendedores, mas sem processo definido cada um vende do seu jeito, o que cria resultados imprevisíveis. Treinamento sem processo é motivação temporária.`,
      proximoPasso: 'Primeiro o processo, depois o treinamento. Definir como vender antes de treinar o time a vender mais.',
    }
  }

  // Tem tudo e quer escalar
  if (salesProcess === 'Sim' && hasTeam && (investsMarketing || unhappyMarketing)) {
    return {
      perfil: 'Você está no ponto certo para escalar.',
      analise: 'Você tem time, processo e investimento em marketing. Esse é o perfil de quem está pronto para crescimento estruturado, não mais experimental.',
      proximoPasso: 'Definir metas, métricas e um sistema de gestão comercial que sustente o crescimento sem depender só de você.',
    }
  }

  // Sem nada, início de jornada
  if (noProcess && !hasTeam && (noMarketing || failedMarketing) && mainProblem === 'Não sei') {
    return {
      perfil: 'Você está no começo. E esse é o momento certo.',
      analise: 'Sem processo, sem equipe e sem marketing ativo, o negócio ainda funciona no modo manual. Cada venda depende de esforço direto seu. Isso tem um custo alto e um teto baixo.',
      proximoPasso: 'Construir a base: oferta clara, processo simples de vendas e um canal de aquisição que funcione mesmo quando você não está olhando.',
    }
  }

  // Fallback
  return {
    perfil: 'Seu negócio tem potencial, mas falta estrutura.',
    analise: `Com ${fromInstagram ? 'presença no Instagram' : fromWhatsapp ? 'vendas por indicação' : fromPhysical ? 'loja física' : 'presença online'} e ${noMarketing ? 'marketing ainda informal' : 'investimento em marketing'}, você tem base para crescer. O que falta é um sistema que torne isso previsível e escalável.`,
    proximoPasso: 'Estruturar o processo comercial e definir um canal de aquisição claro. Crescimento consistente vem de sistema, não de sorte.',
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function isValidBrazilianPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  const localNumber = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits
  const areaCode = Number(localNumber.slice(0, 2))
  const hasValidLength = localNumber.length === 10 || localNumber.length === 11
  const hasValidAreaCode = areaCode >= 11 && areaCode <= 99
  const isRepeatedNumber = /^(\d)\1+$/.test(localNumber)

  return hasValidLength && hasValidAreaCode && !isRepeatedNumber
}

function validateQuestion(question: Question, answer: string) {
  const value = answer.trim()

  if (!value) {
    return 'Responda esta pergunta para continuar.'
  }

  if (question.id === 'name' && value.length < 2) {
    return 'Digite um nome válido.'
  }

  if (question.type === 'email' && !EMAIL_PATTERN.test(value)) {
    return 'Digite um e-mail válido.'
  }

  if (question.type === 'tel' && !isValidBrazilianPhone(value)) {
    return 'Digite um WhatsApp válido com DDD.'
  }

  if (question.id === 'company' && value.length < 2) {
    return 'Digite o nome da empresa.'
  }

  return ''
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [animKey, setAnimKey] = useState(0)
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion.id] ?? ''
  const questionInputId = `question-${currentQuestion.id}`

  useEffect(() => {
    if (screen === 'form' && currentQuestion.type !== 'choice') {
      inputRef.current?.focus()
    }
  }, [screen, currentQuestionIndex, currentQuestion.type])

  const startApplication = () => {
    setError('')
    setCurrentQuestionIndex(0)
    setScreen('form')
  }

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers(previousAnswers => ({
      ...previousAnswers,
      [questionId]: value,
    }))
    if (error) setError('')
  }

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    advanceQuestion()
  }

  const submitLead = async (finalAnswers: Record<string, string>) => {
    const diagnosticNotes = [
      `Origem de vendas: ${finalAnswers.salesSource ?? ''}`,
      `Marketing digital: ${finalAnswers.digitalMarketing ?? ''}`,
      `Vendedores: ${finalAnswers.salesTeam ?? ''}`,
      `Problema principal: ${finalAnswers.mainProblem ?? ''}`,
      `Processo comercial: ${finalAnswers.salesProcess ?? ''}`,
      `Objetivo: ${finalAnswers.currentGoal ?? ''}`,
    ].join('\n')

    await supabase.from('crm_leads').insert({
      name: finalAnswers.name ?? '',
      email: finalAnswers.email ?? '',
      phone: finalAnswers.whatsapp ?? '',
      company: finalAnswers.company ?? '',
      source: 'Diagnóstico',
      stage: 'Novos',
      notes: diagnosticNotes,
    })
  }

  const advanceQuestion = (overrideAnswer?: string) => {
    const answer = overrideAnswer !== undefined ? overrideAnswer : currentAnswer
    const validationError = validateQuestion(currentQuestion, answer)

    if (validationError) {
      setError(validationError)
      return
    }

    setError('')

    if (currentQuestionIndex === QUESTIONS.length - 1) {
      const finalAnswers = { ...answers, [currentQuestion.id]: answer }
      void submitLead(finalAnswers)
      setDiagnostic(buildDiagnostic(finalAnswers))
      setScreen('success')
      return
    }

    setDirection('forward')
    setAnimKey(k => k + 1)
    setCurrentQuestionIndex(currentQuestionIndex + 1)
  }

  const goBack = () => {
    setError('')

    if (currentQuestionIndex === 0) {
      setScreen('intro')
      return
    }

    setDirection('backward')
    setAnimKey(k => k + 1)
    setCurrentQuestionIndex(currentQuestionIndex - 1)
  }

  const renderQuestionInput = () => {
    if (currentQuestion.type === 'choice') {
      return (
        <div className="choice-options" role="radiogroup" aria-labelledby="question-title">
          {currentQuestion.options.map(option => (
            <button
              className={currentAnswer === option ? 'choice-option selected' : 'choice-option'}
              key={option}
              onClick={() => {
                updateAnswer(currentQuestion.id, option)
                setTimeout(() => advanceQuestion(option), 160)
              }}
              role="radio"
              aria-checked={currentAnswer === option}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )
    }

    return (
      <input
        id={questionInputId}
        ref={inputRef}
        value={currentAnswer}
        onChange={event => updateAnswer(currentQuestion.id, event.target.value)}
        placeholder={currentQuestion.placeholder}
        autoComplete={currentQuestion.autoComplete}
        inputMode={currentQuestion.inputMode}
        type={currentQuestion.type}
        aria-describedby={error ? 'form-error' : undefined}
        aria-invalid={Boolean(error)}
      />
    )
  }

  return (
    <main className="application-page" data-screen={screen}>
      <AnimatedBackground />

      {screen === 'intro' && (
        <>
          {/* HERO */}
          <section className="hero-screen" aria-labelledby="hero-title">
            <FloatingPlatforms />
            <span className="hero-badge">Diagnóstico gratuito · 3 minutos</span>
            <h1 id="hero-title">
              Faço a sua empresa vender mais, de forma <strong>simples e fácil.</strong>
            </h1>
            <p className="hero-sub">
              Esse é um diagnóstico 100% gratuito para te ajudar a
              identificar os gargalos da sua empresa!
            </p>
            <div className="hero-actions">
              <button className="primary-action" onClick={startApplication} type="button">
                <span className="primary-action-label">Diagnóstico</span>
              </button>
              <a className="hero-secondary" href="#goals">Saber mais</a>
            </div>
          </section>

          {/* SEÇÃO 2 — Uma análise da sua empresa para você que busca */}
          <section id="goals" className="goals-section" aria-labelledby="goals-title">
            <h2 id="goals-title" className="goals-title">
              Uma análise da sua empresa para você que busca:
            </h2>
            <div className="goals-grid">
              <article className="goal-card">
                <span className="goal-card-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9.5" />
                    <circle cx="12" cy="12" r="5.5" />
                    <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                  </svg>
                </span>
                <h3 className="goal-card-title">Leads</h3>
                <p className="goal-card-desc">
                  Mais pessoas chegando até a sua empresa todos os dias.
                  Estruturo aquisição constante: tráfego, conteúdo e
                  presença que atraem clientes em vez de só seguidores.
                </p>
              </article>
              <article className="goal-card">
                <span className="goal-card-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 17 9 11 13 15 21 7" />
                    <polyline points="15 7 21 7 21 13" />
                  </svg>
                </span>
                <h3 className="goal-card-title">Conversões</h3>
                <p className="goal-card-desc">
                  Já entram contatos, mas poucos viram cliente?
                  Reorganizo o seu processo comercial pra transformar
                  conversa em venda, sem depender de improviso.
                </p>
              </article>
              <article className="goal-card">
                <span className="goal-card-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 3 2.5 8 12 13 21.5 8 12 3" />
                    <polyline points="2.5 13 12 18 21.5 13" />
                    <polyline points="2.5 18 12 23 21.5 18" />
                  </svg>
                </span>
                <h3 className="goal-card-title">Estrutura</h3>
                <p className="goal-card-desc">
                  Sem site, Instagram profissional ou presença digital
                  organizada? Construo a base do zero pra sua empresa
                  existir online com identidade e direção.
                </p>
              </article>
            </div>
          </section>

          {/* SEÇÃO 3 — Quem sou */}
          <section className="about-section" aria-labelledby="about-title">
            <div className="about-photo-wrap">
              <span className="about-photo-accent" aria-hidden="true" />
              <img
                src="/inacio.svg"
                alt="Inácio Carlos"
                className="about-photo"
                loading="lazy"
              />
            </div>
            <div className="about-text">
              <p className="lp-eyebrow about-eyebrow">Quem sou</p>
              <h2 id="about-title" className="about-name">Inácio Carlos</h2>
              <div className="about-bio">
                <p>
                  Me chamo Inácio Carlos, tenho 22 anos, nasci no Rio de Janeiro,
                  sempre sonhei em trabalhar com comunicação, desde os 8 anos
                  trabalho com a internet, criando, vendendo e estudando uma
                  estratégia nova a cada dia.
                </p>
                <p>
                  Gerei mais de 2 bilhões de visualizações orgânicas nas redes
                  sociais, movimentei mais de R$5 milhões em vinculação de mídia
                  paga, atendi mais de 150 empresas no mundo inteiro, fali 3
                  empresas aos 22 anos e hoje meu objetivo é ajudar empresários
                  que não conseguem ter resultados através da minha metodologia.
                </p>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4 — Valor / Pricing */}
          <section className="pricing-section" aria-labelledby="pricing-title">
            <p className="lp-eyebrow">O valor</p>
            <h2 id="pricing-title" className="pricing-title">
              Quanto é o valor para ter um diagnóstico completo meu?
            </h2>
            <p className="pricing-sub">
              Para ter um diagnóstico completo o valor é R$ 500, mas
              hoje você terá uma condição especial.
            </p>

            <div className="pricing-comparison">
              <div className="pricing-side pricing-side--old">
                <span className="pricing-side-label">Valor padrão</span>
                <span className="pricing-side-amount pricing-side-amount--old">
                  R$ 500
                </span>
              </div>

              <div className="pricing-arrow" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              </div>

              <div className="pricing-side pricing-side--current">
                <span className="pricing-side-label">Hoje, pra você</span>
                <span className="pricing-side-amount pricing-side-amount--free">
                  Grátis
                </span>
              </div>
            </div>

            <p className="pricing-disclaimer">
              Você receberá um diagnóstico após preencher o formulário e
              caso você esteja pronto, entraremos em contato para você
              receber sua consultoria gratuita de 40 minutos comigo!
            </p>
          </section>

          {/* SEÇÃO 5 — FAQ */}
          <section className="faq-section" aria-labelledby="faq-title">
            <p className="lp-eyebrow">Perguntas frequentes</p>
            <h2 id="faq-title" className="faq-title">
              O que você precisa saber.
            </h2>

            <ul className="faq-list">
              {[
                {
                  q: 'Quem recebe a consultoria gratuita?',
                  a: (
                    <>
                      Todos recebem o diagnóstico. Alguns recebem apenas o
                      diagnóstico após a conclusão do preenchimento das perguntas,
                      outros serão chamados para agendar uma call 100% gratuita.
                      Isso porque alguns podem não estar prontos ainda para
                      receber um diagnóstico mais profundo.
                    </>
                  ),
                },
                {
                  q: 'Como faço para contratar os serviços de marketing?',
                  a: (
                    <>
                      Para contratar os serviços de gestão de tráfego, trainer
                      sales, social media e outros,{' '}
                      <a
                        className="faq-link"
                        href="https://wa.me/5511999999999"
                        target="_blank"
                        rel="noreferrer"
                      >
                        clique aqui
                      </a>{' '}
                      e entre em contato diretamente com o atendimento.
                    </>
                  ),
                },
                {
                  q: 'Se eu não for chamado para a call, tem outra forma de receber treinamento gratuito?',
                  a: (
                    <>
                      Sim. Eu produzo conteúdos informativos e educativos
                      ensinando gratuitamente todos que querem aprender a
                      vender mais, crescer nas redes sociais e ter resultados
                      na internet.
                    </>
                  ),
                },
                {
                  q: 'O diagnóstico é realmente gratuito ou tem alguma pegadinha?',
                  a: (
                    <>
                      O diagnóstico é 100% gratuito. Mas se no final do
                      diagnóstico ou da call você tiver interesse em contratar
                      os nossos serviços, vamos oferecer as nossas soluções.
                    </>
                  ),
                },
                {
                  q: 'Quais os cursos e treinamentos disponíveis para comprar?',
                  a: (
                    <>
                      Ainda nenhum. Queremos ajudar o máximo de pessoas
                      possível antes de vender qualquer coisa. Por isso,
                      aproveite enquanto não vendemos produtos, mas sim
                      soluções para você aplicar e ter resultados.
                    </>
                  ),
                },
              ].map((item, i) => {
                const isOpen = openFaq === i
                const panelId = `faq-panel-${i}`
                return (
                  <li
                    key={i}
                    className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}
                  >
                    <button
                      type="button"
                      className="faq-question"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                    >
                      <span className="faq-question-text">{item.q}</span>
                      <span className="faq-chevron" aria-hidden="true">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </button>
                    <div
                      id={panelId}
                      className="faq-answer-wrap"
                      role="region"
                    >
                      <p className="faq-answer">{item.a}</p>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="faq-cta">
              <button className="primary-action" onClick={startApplication} type="button">
                <span className="primary-action-label">Diagnóstico</span>
              </button>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="lp-footer">
            <div className="lp-footer-bottom">
              <span className="lp-footer-copy">© 2026 Ionia · Todos os direitos reservados</span>
            </div>
          </footer>
        </>
      )}

      {screen === 'form' && (
        <section className="question-screen" aria-labelledby="question-title">
          <div className="question-animate" data-direction={direction} key={animKey}>
            <form
              className="question-form"
              onSubmit={submitQuestion}
              onKeyDown={e => {
                if (e.key === 'Enter' && currentQuestion.type === 'choice' && currentAnswer) {
                  e.preventDefault()
                  advanceQuestion()
                }
              }}
              noValidate
            >
              <div className="question-heading">
                <span className="question-number" aria-hidden="true">
                  {currentQuestionIndex + 1} →
                </span>
                {currentQuestion.type === 'choice' ? (
                  <h2 id="question-title">{currentQuestion.label}</h2>
                ) : (
                  <label id="question-title" htmlFor={questionInputId}>
                    {currentQuestion.label}
                  </label>
                )}
              </div>

              {renderQuestionInput()}

              {error && (
                <p className="form-error" id="form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="form-actions">
                <button className="ok-action" type="submit">OK</button>
                {currentQuestion.type !== 'choice' && (
                  <span className="enter-hint" aria-hidden="true">pressione <strong>Enter ↵</strong></span>
                )}
              </div>
            </form>

            <button className="back-action" onClick={goBack} type="button">
              ↑ {currentQuestionIndex === 0 ? 'Início' : 'Voltar'}
            </button>
          </div>
        </section>
      )}

      {screen === 'success' && diagnostic && (
        <section className="success-screen" aria-labelledby="success-title">
          <div className="diagnostic-result">
            <span className="diagnostic-label">Seu diagnóstico</span>
            <h1 id="success-title" className="diagnostic-perfil">{diagnostic.perfil}</h1>
            <p className="diagnostic-analise">{diagnostic.analise}</p>
            <div className="diagnostic-next">
              <span className="diagnostic-next-label">Próximo passo</span>
              <p>{diagnostic.proximoPasso}</p>
            </div>
          </div>
          <p className="diagnostic-contact">
            Nossos especialistas entrarão em contato em breve para aprofundar este diagnóstico.
          </p>
        </section>
      )}
    </main>
  )
}

function BrandMark() {
  return (
    <a className="brand-mark" href="/" aria-label="Inácio Carlos">
      <strong>Inácio</strong> Carlos
    </a>
  )
}

const FLOATING_PLATFORMS = [
  { src: '/logos/instagram.svg', label: 'Instagram',  pos: 'p1' },
  { src: '/logos/meta.png',      label: 'Meta Ads',   pos: 'p2' },
  { src: '/logos/whatsapp.webp', label: 'WhatsApp',   pos: 'p3' },
  { src: '/logos/facebook.png',  label: 'Facebook',   pos: 'p4' },
  { src: '/logos/linkedin.png',  label: 'LinkedIn',   pos: 'p5' },
  { src: '/logos/google.png',    label: 'Google Ads', pos: 'p6' },
] as const

function FloatingPlatforms() {
  return (
    <div className="floating-platforms" aria-hidden="true">
      {FLOATING_PLATFORMS.map(p => (
        <span
          key={p.label}
          className={`floating-platform floating-platform--${p.pos}`}
          title={p.label}
        >
          <img src={p.src} alt="" loading="lazy" />
        </span>
      ))}
    </div>
  )
}

function ChannelIcon({ name }: { name: string }) {
  const stroke = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'instagram':
      return (
        <svg {...stroke}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...stroke}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...stroke}>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg {...stroke}>
          <path d="M15 2v10.5a4.5 4.5 0 1 1-4.5-4.5" />
          <path d="M15 2c0 2.5 2 4.5 4.5 4.5" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg {...stroke}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...stroke}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...stroke}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <polyline points="22 6 12 13 2 6" />
        </svg>
      )
    case 'script':
      return (
        <svg {...stroke}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="14" y2="17" />
        </svg>
      )
    case 'call':
      return (
        <svg {...stroke}>
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
      )
    case 'slides':
      return (
        <svg {...stroke}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )
    case 'meta-ads':
      return (
        <svg {...stroke}>
          <path d="M2 12c0-3 2-5.5 4.8-5.5 2.2 0 3.7 1.6 5.2 4.5 1.5 2.9 3 4.5 5.2 4.5 2.8 0 4.8-2.5 4.8-5.5s-2-5.5-4.8-5.5" />
          <path d="M22 12c0 3-2 5.5-4.8 5.5-2.2 0-3.7-1.6-5.2-4.5-1.5-2.9-3-4.5-5.2-4.5C4 8.5 2 11 2 14" />
        </svg>
      )
    case 'google-ads':
      return (
        <svg {...stroke}>
          <path d="M9 3 2 15a3 3 0 0 0 5.2 3l7-12A3 3 0 0 0 9 3z" />
          <circle cx="17.5" cy="17.5" r="3.5" />
          <path d="M14.6 6 19 13.5" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...stroke}>
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <line x1="7.5" y1="10" x2="7.5" y2="17" />
          <circle cx="7.5" cy="6.8" r="1" fill="currentColor" stroke="none" />
          <path d="M11.5 17v-3.5a2.5 2.5 0 0 1 5 0V17" />
          <line x1="11.5" y1="10" x2="11.5" y2="17" />
        </svg>
      )
    default:
      return null
  }
}

function AnimatedBackground() {
  return (
    <div className="animated-grid" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  )
}
