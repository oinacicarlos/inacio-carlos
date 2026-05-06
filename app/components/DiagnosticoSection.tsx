import DiagnosticForm from './DiagnosticForm'

export default function DiagnosticoSection() {
  return (
    <section id="diagnostico" style={{ background: 'var(--brand)', position: 'relative', overflow: 'hidden', paddingBlock: 100 }}>
      <div className="dot-pattern" aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <div className="shell" style={{ position: 'relative' }}>
        <div className="split split-center">
          {/* Left — copy */}
          <div>
            <div className="badge" style={{ marginBottom: 24, background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.6)' }}>
              <span className="badge-dot" style={{ background: '#000' }} aria-hidden />
              Diagnóstico gratuito
            </div>

            <h2 className="heading" style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.045em',
              lineHeight: 0.9,
              color: '#000',
              marginBottom: 24,
            }}>
              Descubra o que está<br />
              <span style={{ WebkitTextStroke: '2.5px #000', color: 'transparent' }}>
                destruindo
              </span>
              <br />suas vendas.
            </h2>

            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(0,0,0,0.55)', maxWidth: '42ch', marginBottom: 40, letterSpacing: '-0.015em' }}>
              Aplicamos um diagnóstico completo para entender como funciona todo o fluxo de Marketing, Comercial, Vendas e Atendimento.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'Análise completa do fluxo de vendas atual',
                'Identificação dos gargalos que matam a conversão',
                'Recomendação da estrutura ideal para o seu negócio',
                'Plano de ação personalizado sem enrolação',
              ].map(item => (
                <div key={item} className="list-item">
                  <div className="list-icon" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.25)', color: '#000', fontSize: 10 }}>✓</div>
                  <span style={{ fontSize: 14, letterSpacing: '-0.012em', color: 'rgba(0,0,0,0.6)', lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(0,0,0,0.18)',
            borderRadius: 16,
            boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.25)',
            padding: '40px 36px',
          }}>
            <h3 className="heading" style={{ fontSize: 20, fontWeight: 800, color: '#000', marginBottom: 6, letterSpacing: '-0.03em' }}>
              Diagnóstico gratuito
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', marginBottom: 28, letterSpacing: '-0.01em' }}>
              Preencha abaixo. Inácio responde em até 24h.
            </p>
            <DiagnosticForm />
          </div>
        </div>
      </div>
    </section>
  )
}
