'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { safeRedirectPath } from '@/lib/safe-redirect'

// Página intermediária, fora de qualquer rota protegida por middleware.
// O link de confirmação de e-mail (ou o retorno do login com Google) chega
// aqui com os dados da sessão na URL (hash ou código). O SDK do Supabase
// processa isso automaticamente no cliente assim que carrega — só precisa
// de um instante antes de navegar pro destino final, senão o middleware de
// rotas como /hub redirecionaria pro /login sem ver a sessão ainda.
export default function AuthCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectPath(searchParams.get('redirect'), '/hub')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    let timeoutId: ReturnType<typeof setTimeout>

    const finish = () => {
      if (!active) return
      active = false
      clearTimeout(timeoutId)
      listener.subscription.unsubscribe()
      router.replace(redirectTo)
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish()
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish()
    })

    timeoutId = setTimeout(() => {
      if (!active) return
      active = false
      listener.subscription.unsubscribe()
      setFailed(true)
    }, 6000)

    return () => {
      active = false
      clearTimeout(timeoutId)
      listener.subscription.unsubscribe()
    }
  }, [redirectTo, router])

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel" aria-label="Confirmando acesso">
        <div className="admin-login-content">
          <a className="admin-auth-logo" href="/" aria-label="Tropa">
            <span>Tropa</span>
          </a>

          <header className="admin-login-header">
            {failed ? (
              <>
                <h1>Não conseguimos confirmar seu acesso</h1>
                <p>O link pode ter expirado ou já ter sido usado. Tente entrar novamente ou crie uma nova conta.</p>
              </>
            ) : (
              <>
                <h1>Confirmando seu acesso...</h1>
                <p>Só um instante, você já vai ser redirecionado.</p>
              </>
            )}
          </header>

          {failed ? (
            <p className="admin-login-terms">
              <a href="/login">Ir para o login</a>
            </p>
          ) : null}
        </div>
      </section>
    </main>
  )
}
