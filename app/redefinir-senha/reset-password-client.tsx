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

export default function ResetPasswordClient() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [hasRecoveryAccess, setHasRecoveryAccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const openedFromRecoveryLink =
      window.location.href.includes('type=recovery') ||
      window.location.hash.includes('access_token')

    supabase.auth
      .getSession()
      .then(async ({ data, error: sessionError }) => {
        if (!mounted) return

        if (sessionError) {
          await clearInvalidLocalSession(sessionError)
          setHasRecoveryAccess(false)
          setReady(true)
          return
        }

        setHasRecoveryAccess(openedFromRecoveryLink && Boolean(data.session))
        setReady(true)
      })
      .catch(async error => {
        await clearInvalidLocalSession(error)
        if (!mounted) return
        setHasRecoveryAccess(false)
        setReady(true)
      })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasRecoveryAccess(Boolean(session))
        setReady(true)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError('A nova senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setPassword('')
    setConfirmPassword('')
    setMessage('Senha redefinida com sucesso.')
    router.replace('/crm')
  }

  return (
    <main className="password-reset-page">
      <section className="password-reset-panel" aria-label="Redefinir senha">
        <a className="admin-auth-logo" href="/" aria-label="ContaFacil">
          <span>Conta</span>Facil
        </a>

        <header className="password-reset-header">
          <h1>Redefinir senha</h1>
          <p>Crie uma nova senha para voltar ao hub administrativo.</p>
        </header>

        {!ready ? (
          <p className="password-reset-note">Validando link...</p>
        ) : !hasRecoveryAccess ? (
          <p className="password-reset-note">
            Abra esta página pelo link enviado no e-mail de redefinição.
          </p>
        ) : (
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label className="admin-login-field">
              <span>Nova senha</span>
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="Digite a nova senha"
                autoComplete="new-password"
              />
            </label>

            <label className="admin-login-field">
              <span>Confirmar senha</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                placeholder="Confirme a nova senha"
                autoComplete="new-password"
              />
            </label>

            {error && <p className="admin-login-error">{error}</p>}
            {message && <p className="password-reset-success">{message}</p>}

            <button className="admin-primary-button" type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
