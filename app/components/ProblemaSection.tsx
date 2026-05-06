const PROBLEMS = [
  'Investindo em anúncios sem retorno claro',
  'Marketing complexo que ninguém consegue executar',
  'Agências que vendem processo, não resultado',
  'Time comercial sem método de vendas definido',
  'Redes sociais que crescem, mas não vendem',
]

const SOLUTIONS = [
  'Estrutura de vendas completa e replicável',
  'Processo simples que qualquer time executa',
  'Foco em resultado — não em horas entregues',
  'Time comercial com método infalível',
  'Conteúdo que cresce e converte ao mesmo tempo',
]

export default function ProblemaSection() {
  return (
    <section className="section">
      <div className="shell">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="badge badge-dark" style={{ marginBottom: 20 }}>
            <span className="badge-dot" style={{ background: 'var(--brand)' }} aria-hidden />
            O diagnóstico é brutal
          </div>
          <h2 className="heading" style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 0.92,
            color: 'var(--white)',
          }}>
            Você não precisa de mais marketing.<br />
            <span style={{ color: 'rgba(245,245,247,0.28)' }}>Você precisa de uma estrutura que vende.</span>
          </h2>
        </div>

        <div className="split split-center">
          {/* Problema */}
          <div className="problem-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '2px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>✗</div>
              <span className="heading" style={{ fontSize: 16, fontWeight: 700, color: 'rgba(245,245,247,0.5)', letterSpacing: '-0.02em' }}>
                O que você tem hoje
              </span>
            </div>
            {PROBLEMS.map(p => (
              <div key={p} className="list-item">
                <div className="list-icon list-icon-x">✗</div>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(245,245,247,0.4)', letterSpacing: '-0.01em' }}>{p}</span>
              </div>
            ))}
          </div>

          {/* Solução */}
          <div className="solution-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(0,0,0,0.15)',
                border: '2px solid rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>✓</div>
              <span className="heading" style={{ fontSize: 16, fontWeight: 700, color: 'rgba(0,0,0,0.7)', letterSpacing: '-0.02em' }}>
                O que a Ionia entrega
              </span>
            </div>
            {SOLUTIONS.map(s => (
              <div key={s} className="list-item">
                <div className="list-icon list-icon-ok">✓</div>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.01em' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
