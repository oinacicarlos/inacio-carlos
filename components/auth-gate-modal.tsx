'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { buildAuthCallbackUrl } from '@/lib/safe-redirect'

type Mode = 'login' | 'signup'

type AuthGateModalProps = {
  open: boolean
  onClose: () => void
  onAuthenticated: () => void
  redirectTo: string
  defaultMode?: Mode
}

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

export default function AuthGateModal({ open, onClose, onAuthenticated, redirectTo, defaultMode = 'signup' }: AuthGateModalProps) {
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  useEffect(() => {
    if (!open) return
    setMode(defaultMode)
    setError('')
    setConfirmationSent(false)
  }, [open, defaultMode])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const clearErrorOnChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value)
    if (error) setError('')
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Informe e-mail e senha para entrar.')
      return
    }

    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)

    if (signInError) {
      if (isInvalidRefreshTokenError(signInError)) await clearInvalidLocalSession(signInError)
      setError('E-mail ou senha inválidos.')
      return
    }

    onAuthenticated()
  }

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Preencha nome, e-mail e senha para continuar.')
      return
    }

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não são iguais.')
      return
    }

    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: buildAuthCallbackUrl(window.location.origin, redirectTo),
      },
    })
    setLoading(false)

    if (signUpError) {
      if (isInvalidRefreshTokenError(signUpError)) await clearInvalidLocalSession(signUpError)
      setError(translateSignUpError(signUpError.message))
      return
    }

    if (data.session) {
      onAuthenticated()
      return
    }

    setConfirmationSent(true)
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: buildAuthCallbackUrl(window.location.origin, redirectTo) },
    })
    setLoading(false)

    if (googleError) {
      if (isInvalidRefreshTokenError(googleError)) await clearInvalidLocalSession(googleError)
      setError(`Não foi possível ${mode === 'login' ? 'entrar' : 'criar a conta'} com Google.`)
    }
  }

  return (
    <div className="auth-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={event => event.stopPropagation()}
      >
        <button className="auth-modal-close" type="button" onClick={onClose} aria-label="Fechar">
          <X size={18} strokeWidth={2.2} aria-hidden="true" />
        </button>

        {confirmationSent ? (
          <>
            <h2 id="auth-modal-title">Confira seu e-mail</h2>
            <p className="auth-modal-subtitle">
              Enviamos um link de confirmação para <strong>{email.trim()}</strong>. Clique nele para ativar sua
              conta grátis e ver o resultado.
            </p>
            <button className="auth-modal-text-action" type="button" onClick={() => setConfirmationSent(false)}>
              Voltar
            </button>
          </>
        ) : (
          <>
            <div className="auth-modal-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                className={mode === 'signup' ? 'is-active' : ''}
                onClick={() => {
                  setMode('signup')
                  setError('')
                }}
              >
                Criar conta grátis
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                className={mode === 'login' ? 'is-active' : ''}
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
              >
                Já tenho conta
              </button>
            </div>

            <h2 id="auth-modal-title">{mode === 'signup' ? 'Crie sua conta grátis para ver o resultado' : 'Entre para ver o resultado'}</h2>

            {mode === 'signup' ? (
              <form className="auth-modal-form" onSubmit={handleSignUp} noValidate>
                <label className="auth-modal-field">
                  <span>Nome</span>
                  <input type="text" placeholder="Seu nome" autoComplete="name" value={name} onChange={clearErrorOnChange(setName)} />
                </label>
                <label className="auth-modal-field">
                  <span>E-mail</span>
                  <input type="email" placeholder="voce@empresa.com" autoComplete="email" value={email} onChange={clearErrorOnChange(setEmail)} />
                </label>
                <label className="auth-modal-field">
                  <span>Senha</span>
                  <input
                    type="password"
                    placeholder="Pelo menos 6 caracteres"
                    autoComplete="new-password"
                    value={password}
                    onChange={clearErrorOnChange(setPassword)}
                  />
                </label>
                <label className="auth-modal-field">
                  <span>Confirmar senha</span>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={clearErrorOnChange(setConfirmPassword)}
                  />
                </label>

                {error && <p className="auth-modal-error">{error}</p>}

                <button className="auth-modal-primary-button" type="submit" disabled={loading}>
                  {loading ? 'Criando conta...' : 'Criar conta grátis'}
                </button>
              </form>
            ) : (
              <form className="auth-modal-form" onSubmit={handleLogin} noValidate>
                <label className="auth-modal-field">
                  <span>E-mail</span>
                  <input type="email" placeholder="voce@empresa.com" autoComplete="email" value={email} onChange={clearErrorOnChange(setEmail)} />
                </label>
                <label className="auth-modal-field">
                  <span>Senha</span>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={clearErrorOnChange(setPassword)}
                  />
                </label>

                {error && <p className="auth-modal-error">{error}</p>}

                <button className="auth-modal-primary-button" type="submit" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            )}

            <div className="auth-modal-divider">
              <span>ou</span>
            </div>

            <button className="auth-modal-google-button" type="button" onClick={handleGoogle} disabled={loading}>
              <GoogleIcon />
              {mode === 'signup' ? 'Continuar com Google' : 'Entrar com Google'}
            </button>

            <p className="auth-modal-note">Sem cartão de crédito — só e-mail e senha.</p>
          </>
        )}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="18" height="18">
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
