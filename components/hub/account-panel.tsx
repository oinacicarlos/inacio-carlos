"use client"

import { FormEvent, useState } from "react"
import { KeyRound, Mail, Save, ShieldCheck, UserRound } from "lucide-react"

type AccountPanelProps = {
  clientName: string
  userEmail: string
  userPhone: string
  onProfileUpdated: (profile: { name: string; phone: string }) => void
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message && error.message !== "{}") return error.message
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string" && error.message !== "{}") {
    return error.message
  }
  return fallback
}

function getInitial(name: string, email: string) {
  const source = name.trim() || email.trim()
  return source.charAt(0).toUpperCase() || "C"
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

function formatBrazilWhatsapp(value: string) {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 2) return digits ? `(${digits}` : ""
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function AccountPanel({
  clientName,
  userEmail,
  userPhone,
  onProfileUpdated,
}: AccountPanelProps) {
  const [name, setName] = useState(clientName)
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
      }

      const response = await fetch("/api/hub/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      })

      const data = (await response.json().catch(() => null)) as
        | { name?: string; phone?: string; error?: string }
        | null

      if (!response.ok || !data) {
        throw new Error(data?.error || "Não foi possível atualizar seu perfil.")
      }

      const savedName = data.name?.trim() || profilePayload.name
      const savedPhone = data.phone?.trim() || ""

      setName(savedName)
      setPhone(savedPhone)
      onProfileUpdated({
        name: savedName,
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
      const response = await fetch("/api/auth/email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent("/hub?tab=conta")}`,
        }),
      })

      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Não foi possível solicitar a troca de e-mail.")
      }

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

      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Não foi possível enviar o link de alteração de senha.")
      }

      setPasswordMessage("Enviamos o link de alteração de senha para seu e-mail.")
    } catch (passwordError) {
      setError(getErrorMessage(passwordError, "Não foi possível enviar o link de senha."))
    } finally {
      setSendingPassword(false)
    }
  }

  const initial = getInitial(name, userEmail === "—" ? email : userEmail)

  return (
    <article className="client-account-panel">
      <header className="client-account-page-head">
        <div>
          <h2>Meu perfil</h2>
          <p>ATUALIZE SEUS DADOS DE CONTATO E SEGURANÇA.</p>
        </div>
        <span className="client-account-status-badge">
          <span aria-hidden="true" />
          Conta ativa
        </span>
      </header>

      <div className="client-account-layout">
        <form className="client-account-card client-account-profile-card" onSubmit={handleProfileSubmit}>
          <div className="client-account-card-head">
            <span className="client-account-icon" aria-hidden="true">
              <UserRound size={20} strokeWidth={2.2} />
            </span>
            <strong>Perfil principal</strong>
          </div>

          <div className="client-account-identity">
            <span className="client-account-avatar" aria-hidden="true">
              {initial}
            </span>
            <div>
              <strong>{name.trim() || "Cliente"}</strong>
              <span>Conta pessoal</span>
            </div>
          </div>

          <label className="client-account-field">
            <span>Nome</span>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label className="client-account-field">
            <span>WhatsApp</span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(formatBrazilWhatsapp(event.target.value))}
              placeholder="(00) 00000-0000"
            />
          </label>

          <button className="client-account-primary-button" type="submit" disabled={savingProfile}>
            <Save size={15} strokeWidth={2.4} aria-hidden="true" />
            {savingProfile ? "Salvando..." : "Salvar perfil"}
          </button>

          {profileMessage && <p className="client-account-success">{profileMessage}</p>}
        </form>

        <div className="client-account-stack">
          <section className="client-account-card client-account-security-card">
            <div className="client-account-card-head">
              <span className="client-account-icon" aria-hidden="true">
                <ShieldCheck size={20} strokeWidth={2.2} />
              </span>
              <div>
                <strong>Segurança da conta</strong>
                <p>Gerencie acesso e recuperação da sua conta.</p>
              </div>
            </div>

            <div className="client-account-security-list">
              <form className="client-account-security-row" onSubmit={handleEmailSubmit}>
                <span className="client-account-row-icon" aria-hidden="true">
                  <Mail size={20} strokeWidth={2.2} />
                </span>
                <label className="client-account-security-copy">
                  <span>E-mail de acesso</span>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="E-mail de acesso" />
                </label>
                <button className="client-account-secondary-button" type="submit" disabled={savingEmail}>
                  {savingEmail ? "Enviando..." : "Solicitar troca de e-mail"}
                </button>
              </form>

              <div className="client-account-security-row">
                <span className="client-account-row-icon" aria-hidden="true">
                  <KeyRound size={20} strokeWidth={2.2} />
                </span>
                <div className="client-account-security-copy">
                  <span>Senha</span>
                  <p>A alteração acontece por um link enviado para o e-mail da conta.</p>
                </div>
                <button className="client-account-secondary-button" type="button" onClick={() => void handlePasswordReset()} disabled={sendingPassword}>
                  {sendingPassword ? "Enviando..." : "Enviar link de alteração"}
                </button>
              </div>
            </div>

            {emailMessage && <p className="client-account-success">{emailMessage}</p>}
            {passwordMessage && <p className="client-account-success">{passwordMessage}</p>}
          </section>
        </div>
      </div>

      {error && <p className="client-requests-error">{error}</p>}
    </article>
  )
}
