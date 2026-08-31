'use client'

import { useState } from 'react'
import { Mail, MessageCircle, User, Users2 } from 'lucide-react'
import EmailIndividual from '@/components/disparos/email-individual'
import EmailGroup from '@/components/disparos/email-group'
import WhatsappIndividual from '@/components/disparos/whatsapp-individual'
import WhatsappGroup from '@/components/disparos/whatsapp-group'

type Canal = 'email' | 'whatsapp'
type Destino = 'individual' | 'grupo'

export default function AdminHomeDisparos() {
  const [canal, setCanal] = useState<Canal | null>(null)
  const [destino, setDestino] = useState<Destino | null>(null)

  function reset() {
    setCanal(null)
    setDestino(null)
  }

  if (canal && destino) {
    if (canal === 'email' && destino === 'individual') return <EmailIndividual onBack={reset} />
    if (canal === 'email' && destino === 'grupo') return <EmailGroup onBack={reset} />
    if (canal === 'whatsapp' && destino === 'individual') return <WhatsappIndividual onBack={reset} />
    return <WhatsappGroup onBack={reset} />
  }

  return (
    <div className="clientes-nucleo-shell">
      <div className="clientes-nucleo-header">
        <div>
          <h1>Novo disparo</h1>
          <p>Escolha o canal e o destino para montar o envio.</p>
        </div>
      </div>

      {!canal ? (
        <div className="disparos-choice-grid">
          <button type="button" className="disparos-choice-card" onClick={() => setCanal('email')}>
            <span className="disparos-choice-icon">
              <Mail size={22} aria-hidden />
            </span>
            <strong>Email</strong>
            <span>Envio via Resend</span>
          </button>
          <button type="button" className="disparos-choice-card" onClick={() => setCanal('whatsapp')}>
            <span className="disparos-choice-icon">
              <MessageCircle size={22} aria-hidden />
            </span>
            <strong>WhatsApp</strong>
            <span>Envio via template aprovado</span>
          </button>
        </div>
      ) : (
        <>
          <button type="button" className="disparos-step-back" onClick={() => setCanal(null)}>
            ← Trocar canal
          </button>
          <div className="disparos-choice-grid">
            <button type="button" className="disparos-choice-card" onClick={() => setDestino('individual')}>
              <span className="disparos-choice-icon">
                <User size={22} aria-hidden />
              </span>
              <strong>Individual</strong>
              <span>Um destinatário só</span>
            </button>
            <button type="button" className="disparos-choice-card" onClick={() => setDestino('grupo')}>
              <span className="disparos-choice-icon">
                <Users2 size={22} aria-hidden />
              </span>
              <strong>Grupo</strong>
              <span>Vários destinatários de uma vez</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
