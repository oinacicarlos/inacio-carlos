'use client'

import { FormEvent, useEffect, useState } from 'react'
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

function isCheckoutPlan(value: string | null): value is 'bronze' | 'prata' {
  return value === 'bronze' || value === 'prata'
}

// Se o usuário chegou no login vindo de um clique em Bronze/Prata (não
// estava autenticado ainda), retoma a contratação depois de entrar em vez
// de simplesmente mandar pro destino padrão. Se veio de uma ferramenta
// (?redirect=/ferramentas/...), volta pra lá. Sem nenhum dos dois, cai no
// comportamento de sempre.
async function goToDestinationOrResumeCheckout(
  navigate: (path: string) => void,
  checkoutPlan: string | null,
  destination: string,
) {
  if (isCheckoutPlan(checkoutPlan)) {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: checkoutPlan }),
      })
      const data = (await response.json()) as { url?: string }

      if (response.ok && data.url) {
        window.location.href = data.url
        return
      }
    } catch {
      // segue pro destino normalmente se a retomada do checkout falhar
    }
  }

  navigate(destination)
}

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkoutPlan = searchParams.get('checkout')
  const rawRedirect = searchParams.get('redirect') ?? searchParams.get('next')
  const destination = safeRedirectPath(rawRedirect, '/admin')
  // O link pro cadastro só carrega o redirect quando ele veio de verdade da
  // URL (ex.: alguém mandado de uma ferramenta) — sem isso, um cadastro novo
  // não deve herdar a rota administrativa que é o destino padrão só do login admin.
  const signupHref = rawRedirect ? `/cadastro?redirect=${encodeURIComponent(safeRedirectPath(rawRedirect, '/hub'))}` : '/cadastro'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data, error: sessionError }) => {
        if (sessionError) {
          await clearInvalidLocalSession(sessionError)
          return
        }

        if (data.session) {
          void goToDestinationOrResumeCheckout(router.replace, checkoutPlan, destination)
        }
      })
      .catch(clearInvalidLocalSession)
  }, [router, checkoutPlan, destination])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Informe e-mail e senha para acessar.')
      return
    }

    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        if (isInvalidRefreshTokenError(signInError)) {
          await clearInvalidLocalSession(signInError)
        }
        setError('E-mail ou senha inválidos.')
        return
      }

      await goToDestinationOrResumeCheckout(router.push, checkoutPlan, destination)
    } catch (loginError) {
      await clearInvalidLocalSession(loginError)
      setError('E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: buildAuthCallbackUrl(window.location.origin, destination),
        },
      })

      if (googleError) {
        if (isInvalidRefreshTokenError(googleError)) {
          await clearInvalidLocalSession(googleError)
        }
        setError('Não foi possível entrar com Google.')
      }
    } catch (googleError) {
      await clearInvalidLocalSession(googleError)
      setError('Não foi possível entrar com Google.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel login-hub-panel" aria-label="Acesso ao hub admin">
        <div className="admin-login-content login-hub-card">
          <header className="admin-login-header login-hub-header">
            <h1>Acesse o hub</h1>
            <p>Entre para acompanhar clientes, rotinas e oportunidades em um só lugar.</p>
          </header>

          <form className="admin-login-form login-hub-form" onSubmit={handleLogin} noValidate>
            <label className="admin-login-field login-hub-field">
              <span>E-mail</span>
              <div className="login-hub-input-wrap">
                <MailIcon />
                <input
                  type="email"
                  placeholder="voce@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={event => {
                    setEmail(event.target.value)
                    if (error) setError('')
                  }}
                />
              </div>
            </label>

            <label className="admin-login-field login-hub-field">
              <span>Senha</span>
              <div className="login-hub-input-wrap">
                <LockIcon />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={event => {
                    setPassword(event.target.value)
                    if (error) setError('')
                  }}
                />
                <button
                  type="button"
                  className="login-hub-password-toggle"
                  onClick={() => setShowPassword(current => !current)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </label>

            <div className="login-hub-forgot-row">
              <a className="login-hub-forgot-link" href="/redefinir-senha">Esqueci minha senha</a>
            </div>

            {error && <p className="admin-login-error">{error}</p>}

            <button className="admin-primary-button" type="submit" disabled={loading}>
              <span>{loading ? 'Acessando...' : 'Acessar hub'}</span>
            </button>
          </form>

          <div className="login-hub-divider"><span>ou</span></div>

          <div className="admin-social-auth" aria-label="Entrar com Google">
            <button type="button" onClick={handleGoogleLogin} disabled={loading}>
              <GoogleIcon />
              Entrar com Google
            </button>
          </div>

          <p className="admin-login-terms">
            Ainda não tem conta? <a href={signupHref}>Criar conta grátis</a>
          </p>
        </div>
      </section>
    </main>
  )
}

function MailIcon() {
  return (
    <svg className="login-hub-input-icon" aria-hidden viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="m3.5 7 8.5 6.5L20.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="login-hub-input-icon" aria-hidden viewBox="0 0 24 24" fill="none">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg aria-hidden viewBox="0 0 24 24" fill="none">
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c5 0 9 4 10 7-.4 1.1-1.2 2.4-2.3 3.6M6.5 6.6C4.4 8 2.9 10 2 12c1 3 5 7 10 7 1.4 0 2.7-.3 3.9-.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.9 10a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none">
      <path d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7s-9-4-10-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
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
