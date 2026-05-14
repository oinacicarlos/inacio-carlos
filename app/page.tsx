'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Screen = 'intro' | 'form' | 'success'
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

  const advanceQuestion = () => {
    const validationError = validateQuestion(currentQuestion, currentAnswer)

    if (validationError) {
      setError(validationError)
      return
    }

    setError('')

    if (currentQuestionIndex === QUESTIONS.length - 1) {
      const finalAnswers = { ...answers, [currentQuestion.id]: currentAnswer }
      void submitLead(finalAnswers)
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
              onClick={() => updateAnswer(currentQuestion.id, option)}
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
      {screen !== 'form' && <BrandMark />}

      {screen === 'intro' && (
        <section className="hero-screen" aria-labelledby="hero-title">
          <h1 id="hero-title">
            Fazemos a sua empresa vender
            <br />
            mais, de forma <strong>simples e fácil.</strong>
          </h1>
          <div className="hero-copy">
            <p>
              A Ionia desenvolve soluções simples e eficientes para ajudar sua
              empresa a vender mais e crescer com mais clareza.
            </p>
            <p>
              Preencha o formulário abaixo para que nossos especialistas
              entendam os objetivos do seu negócio e indiquem o melhor caminho
              para aumentar seus resultados.
            </p>
          </div>
          <button className="primary-action" onClick={startApplication} type="button">
            Iniciar Aplicação
          </button>
        </section>
      )}

      {screen === 'form' && (
        <section className="question-screen" aria-labelledby="question-title">
          <div className="question-animate" data-direction={direction} key={animKey}>
            <form className="question-form" onSubmit={submitQuestion} noValidate>
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

      {screen === 'success' && (
        <section className="success-screen" aria-labelledby="success-title">
          <h1 id="success-title">Entraremos em contato!</h1>
          <p>
            Nossos especialistas estão analisando os seus dados e entrarão em
            contato com você em breve.
          </p>
          <div className="social-links" aria-label="Redes sociais">
            <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">
              YouTube
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">
              TikTok
            </a>
          </div>
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

function AnimatedBackground() {
  return (
    <div className="animated-grid" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  )
}
