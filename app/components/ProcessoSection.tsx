const STEPS = [
  { num: '01', title: 'Diagnóstico', desc: 'Mapeamos todo o fluxo de Marketing, Comercial, Vendas e Atendimento. Sem palpite — com dados reais.' },
  { num: '02', title: 'Estruturação', desc: 'Desenhamos a estrutura completa: canais, processos, mensagens e fluxos de conversão personalizados.' },
  { num: '03', title: 'Implementação', desc: 'Colocamos a mão na massa. Executamos o plano com acompanhamento semanal e ajustes em tempo real.' },
  { num: '04', title: 'Crescimento', desc: 'Com a estrutura funcionando, escalamos. Mais volume, mais conversão, menos dependência de sorte.' },
]

export default function ProcessoSection() {
  return (
    <section id="processo" className="section section-divider" style={{ background: 'var(--brand)', position: 'relative', overflow: 'hidden' }}>
      <div className="dot-pattern" aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <div className="shell" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="badge" style={{ marginBottom: 20, background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.6)' }}>
            <span className="badge-dot" style={{ background: '#000' }} aria-hidden />
            Como trabalhamos
          </div>
          <h2 className="heading" style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 0.92,
            color: '#000',
          }}>
            O método que destrói<br />
            <span style={{ WebkitTextStroke: '2.5px #000', color: 'transparent' }}>para reconstruir.</span>
          </h2>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, flexWrap: 'wrap' }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{
              flex: '1 1 200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '0 24px',
              borderLeft: i > 0 ? '2px dashed rgba(0,0,0,0.2)' : 'none',
            }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#000',
                border: '2px solid #000',
                boxShadow: `4px 4px 0px 0px var(--yellow)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--brand)',
                marginBottom: 20,
              }}>
                {step.num}
              </div>
              <h3 className="heading" style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#000',
                marginBottom: 10,
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: 'rgba(0,0,0,0.55)',
                letterSpacing: '-0.01em',
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 48, background: 'var(--dark)', borderTop: '2px solid rgba(103,0,255,0.3)', marginTop: 72 }} />
    </section>
  )
}
