"use client"

import { FormEvent, useState } from "react"
import { Building2, KeyRound, Mail, Phone, Save, UserRound } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type AccountPanelProps = {
  clientName: string
  companyName: string | null
  userEmail: string
  userPhone: string
  onProfileUpdated: (profile: { name: string; companyName: string | null; phone: string }) => void
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message && error.message !== "{}") return error.message
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string" && error.message !== "{}") {
    return error.message
  }
  return fallback
}

export default function AccountPanel({
  clientName,
  companyName,
  userEmail,
  userPhone,
  onProfileUpdated,
}: AccountPanelProps) {
  const [name, setName] = useState(clientName)
  const [company, setCompany] = useState(companyName ?? "")
  const [phone, setPhone] = useState(userPhone)
  const [email, setEmail] = useState(userEmail === "—" ? "" : userEmail)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [sendingPassword, setSendingPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [error, setError] = useState("")

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setProfileMessage("")

    if (!name.trim()) {
      setError("Informe seu nome para salvar o perfil.")
      return
    }

    setSavingProfile(true)

    try {
      const profilePayload = {
        name: name.trim(),
        phone: phone.trim(),
        company_name: company.trim(),
      }

      const response = await fetch("/api/hub/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      })

      const data = (await response.json().catch(() => null)) as
        | { name?: string; company_name?: string; phone?: string; error?: string }
        | null

      if (!response.ok || !data) {
        throw new Error(data?.error || "Não foi possível atualizar seu perfil.")
      }

      const savedName = data.name?.trim() || profilePayload.name
      const savedCompany = data.company_name?.trim() || ""
      const savedPhone = data.phone?.trim() || ""

      setName(savedName)
      setCompany(savedCompany)
      setPhone(savedPhone)
      onProfileUpdated({
        name: savedName,
        companyName: savedCompany || null,
        phone: savedPhone,
      })
      setProfileMessage("Perfil atualizado.")
    } catch (profileError) {
      setError(getErrorMessage(profileError, "Não foi possível atualizar seu perfil."))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setEmailMessage("")

    if (!email.trim()) {
      setError("Informe o novo e-mail.")
      return
    }

    if (email.trim() === userEmail) {
      setEmailMessage("Esse já é o e-mail atual da sua conta.")
      return
    }

    setSavingEmail(true)

    try {
      const { error: emailError } = await supabase.auth.updateUser({ email: email.trim() })
      if (emailError) throw emailError
      setEmailMessage("Enviamos um link de confirmação para concluir a troca do e-mail.")
    } catch (emailError) {
      setError(getErrorMessage(emailError, "Não foi possível solicitar a troca de e-mail."))
    } finally {
      setSavingEmail(false)
    }
  }

  async function handlePasswordReset() {
    setError("")
    setPasswordMessage("")
    setSendingPassword(true)

    try {
      const targetEmail = userEmail === "—" ? email.trim() : userEmail

      if (!targetEmail) {
        throw new Error("Informe um e-mail antes de solicitar a troca de senha.")
      }

      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          redirectTo: `${window.location.origin}/redefinir-senha`,
        }),
      })

      const data = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível enviar o link de alteração de senha.")
      }

      setPasswordMessage("Enviamos o link de alteração de senha para seu e-mail.")
    } catch (passwordError) {
      setError(getErrorMessage(passwordError, "Não foi possível enviar o link de senha."))
    } finally {
      setSendingPassword(false)
    }
  }

  return (
    <article className="client-hub-panel client-account-panel">
      <div className="client-hub-section-head client-account-head">
        <div>
          <h2>Meu perfil</h2>
          <p>Atualize seus dados de contato e segurança.</p>
        </div>
        <span className="client-account-status">Conta ativa</span>
      </div>

      <div className="client-account-layout">
        <form className="client-account-card client-account-form" onSubmit={handleProfileSubmit}>
          <div className="client-account-card-head">
            <UserRound size={18} strokeWidth={2.2} aria-hidden="true" />
            <strong>Dados principais</strong>
          </div>

          <label className="client-requests-field">
            <span>Nome</span>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label className="client-requests-field">
            <span>Empresa</span>
            <input
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Nome da empresa, se houver"
            />
          </label>

          <label className="client-requests-field">
            <span>WhatsApp</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(00) 00000-0000"
            />
          </label>

          <button className="client-requests-new-button" type="submit" disabled={savingProfile}>
            <Save size={15} strokeWidth={2.4} aria-hidden="true" />
            {savingProfile ? "Salvando..." : "Salvar perfil"}
          </button>

          {profileMessage && <p className="client-account-success">{profileMessage}</p>}
        </form>

        <div className="client-account-stack">
          <form className="client-account-card client-account-form" onSubmit={handleEmailSubmit}>
            <div className="client-account-card-head">
              <Mail size={18} strokeWidth={2.2} aria-hidden="true" />
              <strong>E-mail de acesso</strong>
            </div>

            <label className="client-requests-field">
              <span>E-mail</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>

            <button className="client-requests-back-button" type="submit" disabled={savingEmail}>
              {savingEmail ? "Enviando..." : "Solicitar troca de e-mail"}
            </button>

            {emailMessage && <p className="client-account-success">{emailMessage}</p>}
          </form>

          <section className="client-account-card">
            <div className="client-account-card-head">
              <KeyRound size={18} strokeWidth={2.2} aria-hidden="true" />
              <strong>Senha</strong>
            </div>
            <p className="client-account-note">
              Por segurança, a alteração de senha acontece por um link enviado para o e-mail da conta.
            </p>
            <button className="client-requests-back-button" type="button" onClick={() => void handlePasswordReset()} disabled={sendingPassword}>
              {sendingPassword ? "Enviando..." : "Enviar link de alteração"}
            </button>
            {passwordMessage && <p className="client-account-success">{passwordMessage}</p>}
          </section>

          <section className="client-account-card client-account-contact-card">
            <div className="client-account-card-head">
              <Phone size={18} strokeWidth={2.2} aria-hidden="true" />
              <strong>Contato preferencial</strong>
            </div>
            <p className="client-account-note">
              O WhatsApp ajuda a equipe da Tropa a avisar sobre documentos, vencimentos e pendências importantes.
            </p>
            <div className="client-account-card-head">
              <Building2 size={18} strokeWidth={2.2} aria-hidden="true" />
              <strong>{company.trim() || "Empresa não informada"}</strong>
            </div>
          </section>
        </div>
      </div>

      {error && <p className="client-requests-error">{error}</p>}
    </article>
  )
}
