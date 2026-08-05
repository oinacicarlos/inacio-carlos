"use client"

import { FormEvent, useState } from "react"
import { Award, Building2, FileCheck2, ShieldAlert, Users } from "lucide-react"
import { ToolShell } from "@/components/tool-shell"
import { StripeProductButton } from "@/components/stripe-product-button"
import { supabase } from "@/lib/supabaseClient"

type Step = "choose" | "mei" | "presumido" | "presumido-success"

export default function AbrirEmpresaFlow() {
  const [step, setStep] = useState<Step>("choose")

  return (
    <ToolShell mainClassName="abrir-empresa-page">
      <section className="abrir-empresa-section" aria-labelledby="abrir-empresa-title">
        {step === "choose" && <ChooseRegime onPickMei={() => setStep("mei")} onPickPresumido={() => setStep("presumido")} />}
        {step === "mei" && <MeiFlow onBack={() => setStep("choose")} />}
        {step === "presumido" && (
          <PresumidoRealForm onBack={() => setStep("choose")} onSuccess={() => setStep("presumido-success")} />
        )}
        {step === "presumido-success" && <PresumidoRealSuccess />}
      </section>
    </ToolShell>
  )
}

function ChooseRegime({ onPickMei, onPickPresumido }: { onPickMei: () => void; onPickPresumido: () => void }) {
  return (
    <>
      <div className="abrir-empresa-hero">
        <p className="abrir-empresa-eyebrow">Abrir Empresa</p>
        <h1 id="abrir-empresa-title">Qual enquadramento combina com o seu negócio?</h1>
        <p className="abrir-empresa-hero-sub">
          Escolha uma opção abaixo. A gente já direciona você para o processo certo — automatizado para MEI e Simples
          Nacional, ou para falar direto com a nossa equipe se for Lucro Presumido ou Real.
        </p>
      </div>

      <div className="abrir-empresa-cards">
        <article className="abrir-empresa-card">
          <span className="abrir-empresa-card-icon" aria-hidden="true">
            <Award size={26} strokeWidth={1.8} />
          </span>
          <h2>MEI</h2>
          <span className="abrir-empresa-card-badge abrir-empresa-card-badge--free">Grátis</span>
          <p>Ideal para quem está começando sozinho, faturando até o limite do MEI e sem funcionários.</p>
          <ul>
            <li>CNH ou identidade</li>
            <li>Comprovante de residência</li>
            <li>Senha gov.br</li>
          </ul>
          <button type="button" className="abrir-empresa-card-cta" onClick={onPickMei}>
            Quero abrir minha empresa (MEI)
          </button>
        </article>

        <article className="abrir-empresa-card is-featured">
          <span className="abrir-empresa-card-badge-top">Mais escolhido</span>
          <span className="abrir-empresa-card-icon" aria-hidden="true">
            <Building2 size={26} strokeWidth={1.8} />
          </span>
          <h2>Simples Nacional</h2>
          <span className="abrir-empresa-card-badge">R$ 1.460,50</span>
          <p>Pra quem vai faturar acima do limite do MEI, ter sócios ou já nasce como ME.</p>
          <ul>
            <li>Documentos pessoais e do imóvel</li>
            <li>Razão social, sócios e nome fantasia</li>
            <li>Cuidamos do protocolo junto à Junta Comercial</li>
          </ul>
          <StripeProductButton product="abertura_empresa" className="abrir-empresa-card-cta is-primary">
            Abrir minha empresa
          </StripeProductButton>
        </article>

        <article className="abrir-empresa-card">
          <span className="abrir-empresa-card-icon" aria-hidden="true">
            <Users size={26} strokeWidth={1.8} />
          </span>
          <h2>Lucro Presumido ou Real</h2>
          <span className="abrir-empresa-card-badge abrir-empresa-card-badge--contact">Fale com a equipe</span>
          <p>Empresas de maior porte, com apuração mais complexa — atendimento consultivo e sob medida.</p>
          <ul>
            <li>Análise do seu caso com um especialista</li>
            <li>Sem automação: contato direto com o time</li>
          </ul>
          <button type="button" className="abrir-empresa-card-cta" onClick={onPickPresumido}>
            Falar com a equipe
          </button>
        </article>
      </div>
    </>
  )
}

function MeiFlow({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleContinue() {
    setLoading(true)
    setError("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = `/cadastro?redirect=${encodeURIComponent("/hub?tab=processo&start=mei")}`
      return
    }

    try {
      const response = await fetch("/api/onboarding/start-mei", { method: "POST" })
      if (!response.ok) {
        throw new Error("Não foi possível iniciar a abertura do seu MEI.")
      }
      window.location.href = "/hub?tab=processo"
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível iniciar a abertura do seu MEI.")
      setLoading(false)
    }
  }

  return (
    <div className="abrir-empresa-panel">
      <button type="button" className="abrir-empresa-back" onClick={onBack}>
        ← Voltar
      </button>

      <h2>Abertura de empresa (MEI)</h2>
      <p className="abrir-empresa-panel-sub">Cadastro gratuito. Depois de continuar, você preenche a triagem no seu hub e envia:</p>

      <ul className="abrir-empresa-doc-list">
        <li>
          <FileCheck2 size={16} strokeWidth={2} aria-hidden="true" /> CNH ou identidade (RG)
        </li>
        <li>
          <FileCheck2 size={16} strokeWidth={2} aria-hidden="true" /> Comprovante de residência
        </li>
        <li>
          <FileCheck2 size={16} strokeWidth={2} aria-hidden="true" /> Senha do gov.br
        </li>
      </ul>

      <div className="abrir-empresa-warning">
        <ShieldAlert size={18} strokeWidth={2} aria-hidden="true" />
        <p>
          Antes de enviar sua senha, desative a verificação em duas etapas na sua conta gov.br. Isso é necessário para
          conseguirmos dar entrada no seu pedido junto ao Portal do Empreendedor — você pode reativar assim que o processo terminar.
        </p>
      </div>

      {error && <p className="abrir-empresa-error">{error}</p>}

      <button type="button" className="abrir-empresa-card-cta is-primary" onClick={handleContinue} disabled={loading}>
        {loading ? "Redirecionando..." : "Continuar"}
      </button>
    </div>
  )
}

function PresumidoRealForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/onboarding/contato-presumido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, whatsapp, email, company_description: companyDescription }),
      })

      const data = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Não foi possível enviar seu contato.")
      }

      onSuccess()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível enviar seu contato.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="abrir-empresa-panel">
      <button type="button" className="abrir-empresa-back" onClick={onBack}>
        ← Voltar
      </button>

      <h2>Lucro Presumido ou Real</h2>
      <p className="abrir-empresa-panel-sub">
        Esse enquadramento exige uma análise específica do seu caso. Deixe seus dados que nossa equipe entra em contato.
      </p>

      <form className="abrir-empresa-form" onSubmit={handleSubmit}>
        <label className="abrir-empresa-field">
          <span>Nome</span>
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>

        <label className="abrir-empresa-field">
          <span>WhatsApp</span>
          <input type="tel" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} required />
        </label>

        <label className="abrir-empresa-field">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>

        <label className="abrir-empresa-field">
          <span>O que a empresa faz (opcional)</span>
          <textarea value={companyDescription} onChange={(event) => setCompanyDescription(event.target.value)} rows={4} />
        </label>

        {error && <p className="abrir-empresa-error">{error}</p>}

        <button type="submit" className="abrir-empresa-card-cta is-primary" disabled={loading}>
          {loading ? "Enviando..." : "Enviar contato"}
        </button>
      </form>
    </div>
  )
}

function PresumidoRealSuccess() {
  return (
    <div className="abrir-empresa-panel">
      <h2>Recebemos seu contato</h2>
      <p className="abrir-empresa-panel-sub">
        Nossa equipe vai analisar o seu caso e entrar em contato pelo WhatsApp ou e-mail informado em breve.
      </p>
      <a href="/" className="abrir-empresa-card-cta is-primary">
        Voltar para o início
      </a>
    </div>
  )
}
