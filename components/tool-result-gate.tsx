'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import AuthGateModal from '@/components/auth-gate-modal'

type ToolResultGateProps = {
  unlocked: boolean
  redirectTo: string
  message?: string
  children: React.ReactNode
}

// Envolve o resultado (ou a prévia gerada) de uma ferramenta. Enquanto o
// visitante não tem conta, o conteúdo real fica borrado e sem interação —
// ele já preencheu tudo e viu que o cálculo está pronto, só falta criar
// conta grátis (ou entrar) pra revelar o valor.
export default function ToolResultGate({ unlocked, redirectTo, message, children }: ToolResultGateProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('signup')

  if (unlocked) {
    return <>{children}</>
  }

  const openModal = (mode: 'login' | 'signup') => {
    setModalMode(mode)
    setModalOpen(true)
  }

  const handleAuthenticated = () => {
    setModalOpen(false)
    router.refresh()
  }

  return (
    <div className="tool-result-gate">
      <div className="tool-result-gate-blurred" aria-hidden="true">
        {children}
      </div>

      <div className="tool-result-gate-overlay">
        <span className="tool-result-gate-overlay-icon" aria-hidden="true">
          <Lock size={20} strokeWidth={2.2} />
        </span>
        <p>{message ?? 'Seu resultado já está pronto. Crie uma conta grátis para ver.'}</p>
        <div className="tool-result-gate-overlay-actions">
          <button className="pricing-tool-next-action" type="button" onClick={() => openModal('signup')}>
            Criar conta grátis
          </button>
        </div>
        <button className="tool-result-gate-login-link" type="button" onClick={() => openModal('login')}>
          Já tenho conta
        </button>
      </div>

      <AuthGateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAuthenticated={handleAuthenticated}
        redirectTo={redirectTo}
        defaultMode={modalMode}
      />
    </div>
  )
}
