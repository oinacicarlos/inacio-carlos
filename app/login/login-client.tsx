'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/crm')
      }
    })
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
      setError('E-mail ou senha inválidos.')
      return
    }

    router.push('/crm')
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel" aria-label="Acesso ao hub admin">
        <div className="admin-login-content">
          <header className="admin-login-header">
            <h1>Acesse sua conta</h1>
            <p>
              Ainda não tem acesso? <a href="mailto:contatoinaciocarlos@gmail.com">Solicitar</a>
            </p>
          </header>

          <form className="admin-login-form" onSubmit={handleLogin} noValidate>
            <label className="admin-login-field">
              <span>Entre com seu email</span>
              <input
                type="email"
                placeholder="me@example.com"
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
                Entre com sua senha
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

          <div className="admin-social-auth" aria-label="Entrar com provedores externos">
            <button type="button">
              <GithubIcon />
              Entrar com GitHub
            </button>
            <button type="button">
              <AppleIcon />
              Entrar com Apple
            </button>
            <button type="button">
              <GoogleIcon />
              Entrar com Google
            </button>
          </div>

          <p className="admin-login-terms">
            Ao acessar, você concorda com os <a href="#">Termos de Serviço</a> e{' '}
            <a href="#">Política de Privacidade</a>.
          </p>
        </div>
      </section>

      <aside className="admin-login-media" aria-label="Paisagem com casa no campo" />
    </main>
  )
}

function GithubIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.58.11.79-.25.79-.56v-2.03c-3.23.7-3.91-1.39-3.91-1.39-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.58-.29-5.29-1.29-5.29-5.74 0-1.27.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.17 1.19A10.9 10.9 0 0 1 12 6.02c.98 0 1.97.13 2.89.39 2.2-1.5 3.16-1.19 3.16-1.19.63 1.6.23 2.78.11 3.07.74.81 1.19 1.84 1.19 3.11 0 4.46-2.72 5.44-5.31 5.73.42.37.79 1.08.79 2.18v3.23c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M16.53 12.65c-.02-2.38 1.95-3.52 2.04-3.57-1.11-1.62-2.83-1.84-3.44-1.86-1.47-.15-2.86.86-3.6.86-.75 0-1.91-.84-3.14-.82-1.62.02-3.11.94-3.95 2.39-1.69 2.94-.43 7.29 1.22 9.67.81 1.17 1.77 2.49 3.04 2.44 1.22-.05 1.68-.79 3.15-.79 1.47 0 1.88.79 3.17.76 1.31-.02 2.14-1.19 2.94-2.37.93-1.36 1.31-2.68 1.33-2.75-.03-.01-2.55-.98-2.58-3.96ZM14.17 5.67c.67-.81 1.12-1.94 1-3.06-.96.04-2.12.64-2.81 1.45-.62.72-1.16 1.87-1.02 2.97 1.07.08 2.16-.55 2.83-1.36Z"
      />
    </svg>
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
