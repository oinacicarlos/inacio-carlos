'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function isInvalidRefreshTokenError(error: unknown) {
  return error instanceof Error && error.message.toLowerCase().includes('refresh token')
}

async function clearInvalidLocalSession(error: unknown) {
  if (!isInvalidRefreshTokenError(error)) return
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
}

export default function LoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data, error: sessionError }) => {
        if (sessionError) {
          await clearInvalidLocalSession(sessionError)
          return
        }

        if (data.session) {
          router.replace('/crm')
        }
      })
      .catch(clearInvalidLocalSession)
  }, [router])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Informe e-mail e senha para acessar.')
      return
    }

    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)

    if (signInError) {
      if (isInvalidRefreshTokenError(signInError)) {
        await clearInvalidLocalSession(signInError)
      }
      setError('E-mail ou senha inválidos.')
      return
    }

    router.push('/crm')
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/crm`,
      },
    })
    setLoading(false)

    if (googleError) {
      if (isInvalidRefreshTokenError(googleError)) {
        await clearInvalidLocalSession(googleError)
      }
      setError('Não foi possível entrar com Google.')
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel" aria-label="Acesso ao hub admin">
        <div className="admin-login-content">
          <a className="admin-auth-logo" href="/" aria-label="ContaFacil">
            <span>Conta</span>Facil
          </a>

          <header className="admin-login-header">
            <h1>Acesse o hub</h1>
            <p>Entre para acompanhar clientes, rotinas e oportunidades em um só lugar.</p>
          </header>

          <form className="admin-login-form" onSubmit={handleLogin} noValidate>
            <label className="admin-login-field">
              <span>E-mail</span>
              <input
                type="email"
                placeholder="voce@empresa.com"
                autoComplete="email"
                value={email}
                onChange={event => {
                  setEmail(event.target.value)
                  if (error) setError('')
                }}
              />
            </label>

            <label className="admin-login-field">
              <span>
                Senha
                <span className="admin-info-dot" aria-hidden>
                  i
                </span>
              </span>
              <input
                type="password"
                placeholder="••••••••••••"
                autoComplete="current-password"
                value={password}
                onChange={event => {
                  setPassword(event.target.value)
                  if (error) setError('')
                }}
              />
            </label>

            {error && <p className="admin-login-error">{error}</p>}

            <button className="admin-primary-button" type="submit" disabled={loading}>
              <span>{loading ? 'Acessando...' : 'Acessar hub'}</span>
            </button>
          </form>

          <div className="admin-social-auth" aria-label="Entrar com Google">
            <button type="button" onClick={handleGoogleLogin} disabled={loading}>
              <GoogleIcon />
              Entrar com Google
            </button>
          </div>

          <p className="admin-login-terms">
            Ainda não tem acesso? <a href="mailto:contatoinaciocarlos@gmail.com">Solicitar entrada</a>
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
