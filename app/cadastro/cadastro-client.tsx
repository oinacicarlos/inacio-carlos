'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { safeRedirectPath, buildAuthCallbackUrl } from '@/lib/safe-redirect'

function isInvalidRefreshTokenError(error: unknown) {
  return error instanceof Error && error.message.toLowerCase().includes('refresh token')
}

async function clearInvalidLocalSession(error: unknown) {
  if (!isInvalidRefreshTokenError(error)) return
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
}

function translateSignUpError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return 'Já existe uma conta com esse e-mail. Tente entrar em vez de criar uma nova.'
  }

  if (normalized.includes('password')) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }

  if (normalized.includes('email')) {
    return 'Informe um e-mail válido.'
  }

  return 'Não foi possível criar sua conta agora. Tente novamente em instantes.'
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function formatBrazilWhatsapp(value: string) {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 2) return digits ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function CadastroClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect') ?? searchParams.get('next')
  const redirectTo = safeRedirectPath(rawRedirect, '/hub')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          router.replace(redirectTo)
        }
      })
      .catch(() => undefined)
  }, [redirectTo, router])

  const clearErrorOnChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value)
    if (error) setError('')
  }

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhone(formatBrazilWhatsapp(event.target.value))
    if (error) setError('')
  }

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const phoneDigits = onlyDigits(phone)

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Preencha nome, e-mail, WhatsApp e senha para continuar.')
      return
    }

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (phoneDigits.length < 10) {
      setError('Informe um WhatsApp válido com DDD.')
      return
    }

    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim(), phone: phone.trim(), whatsapp: phone.trim() },
        emailRedirectTo: buildAuthCallbackUrl(window.location.origin, redirectTo),
      },
    })
    setLoading(false)

    if (signUpError) {
      if (isInvalidRefreshTokenError(signUpError)) {
        await clearInvalidLocalSession(signUpError)
      }
      setError(translateSignUpError(signUpError.message))
      return
    }

    if (data.session) {
      // Confirmação de e-mail desativada no projeto: já entra direto.
      router.push(redirectTo)
      return
    }

    // Confirmação de e-mail ativada: a conta existe, mas só fica utilizável
    // depois que a pessoa clicar no link enviado por e-mail.
    setConfirmationSent(true)
  }

  const handleGoogleSignUp = async () => {
    setError('')
    setLoading(true)
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildAuthCallbackUrl(window.location.origin, redirectTo),
      },
    })
    setLoading(false)

    if (googleError) {
      if (isInvalidRefreshTokenError(googleError)) {
        await clearInvalidLocalSession(googleError)
      }
      setError('Não foi possível criar a conta com Google.')
    }
  }

  const loginHref = `/login?redirect=${encodeURIComponent(redirectTo)}`

  if (confirmationSent) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-panel" aria-label="Confirme seu e-mail">
          <div className="admin-login-content">
            <a className="admin-auth-logo" href="/" aria-label="Tropa">
              <span>Tropa</span>
            </a>

            <header className="admin-login-header">
              <h1>Confira seu e-mail</h1>
              <p>
                Enviamos um link de confirmação para <strong>{email.trim()}</strong>. Clique nele para ativar sua
                conta grátis e começar a usar as ferramentas.
              </p>
            </header>

            <p className="admin-login-terms">
              Já confirmou? <a href={loginHref}>Entrar</a>
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel" aria-label="Criar conta grátis">
        <div className="admin-login-content">
          <a className="admin-auth-logo" href="/" aria-label="Tropa">
            <span>Tropa</span>
          </a>

          <header className="admin-login-header">
            <h1>Crie sua conta grátis</h1>
            <p>Use as ferramentas da Tropa até 3 vezes por mês em cada uma, sem custo.</p>
          </header>

          <form className="admin-login-form" onSubmit={handleSignUp} noValidate>
            <label className="admin-login-field">
              <span>Nome</span>
              <input
                type="text"
                placeholder="Seu nome"
                autoComplete="name"
                value={name}
                onChange={clearErrorOnChange(setName)}
              />
            </label>

            <label className="admin-login-field">
              <span>E-mail</span>
              <input
                type="email"
                placeholder="voce@email.com"
                autoComplete="email"
                value={email}
                onChange={clearErrorOnChange(setEmail)}
              />
            </label>

            <label className="admin-login-field">
              <span>WhatsApp</span>
              <input
                type="tel"
                inputMode="tel"
                placeholder="(21) 99999-9999"
                autoComplete="tel"
                value={phone}
                onChange={handlePhoneChange}
              />
            </label>

            <label className="admin-login-field">
              <span>Senha</span>
              <input
                type="password"
                placeholder="Pelo menos 6 caracteres"
                autoComplete="new-password"
                value={password}
                onChange={clearErrorOnChange(setPassword)}
              />
            </label>

            {error && <p className="admin-login-error">{error}</p>}

            <button className="admin-primary-button" type="submit" disabled={loading}>
              <span>{loading ? 'Criando conta...' : 'Criar conta grátis'}</span>
            </button>
          </form>

          <div className="admin-social-auth" aria-label="Criar conta com Google">
            <button type="button" onClick={handleGoogleSignUp} disabled={loading}>
              <GoogleIcon />
              Continuar com Google
            </button>
          </div>

          <p className="admin-login-terms">
            Já tem conta? <a href={loginHref}>Entrar</a>
          </p>
        </div>
      </section>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.37a4.59 4.59 0 0 1-1.99 3.01v2.5h3.22c1.88-1.73 3-4.28 3-7.5Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.22-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.75-5.59-4.11H3.08v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.91A6.01 6.01 0 0 1 6.1 12c0-.66.11-1.31.31-1.91V7.51H3.08A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.49l3.33-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.79.5 3.82 1.5l2.86-2.86C16.95 3.01 14.69 2 12 2a10 10 0 0 0-8.92 5.51l3.33 2.58C7.2 7.73 9.4 5.98 12 5.98Z"
      />
    </svg>
  )
}
