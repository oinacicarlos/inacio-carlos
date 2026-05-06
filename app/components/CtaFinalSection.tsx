export default function CtaFinalSection() {
  return (
    <section className="section section-divider" style={{ textAlign: 'center' }}>
      <div className="shell">
        <div className="badge badge-dark" style={{ marginBottom: 28 }}>
          <span className="badge-dot" style={{ background: 'var(--yellow)' }} aria-hidden />
          Pronto para começar?
        </div>

        <h2 className="heading" style={{
          fontSize: 'clamp(36px, 6.5vw, 80px)',
          fontWeight: 800,
          letterSpacing: '-0.048em',
          lineHeight: 0.88,
          marginBottom: 24,
        }}>
          <span style={{ color: 'var(--white)' }}>Pare de depender</span><br />
          <span style={{ WebkitTextStroke: '2px rgba(245,245,247,0.5)', color: 'transparent' }}>
            da sorte para vender.
          </span>
        </h2>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 19px)',
          lineHeight: 1.55,
          color: 'rgba(245,245,247,0.4)',
          maxWidth: '50ch',
          margin: '0 auto 44px',
          letterSpacing: '-0.018em',
        }}>
          Não vendemos marketing. Vendemos uma estrutura completa de vendas que vende de verdade.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#diagnostico" className="btn btn-brand" style={{ fontSize: 16 }}>
            Quero meu diagnóstico gratuito
          </a>
          <a href="#solucoes" className="btn btn-ghost">
            Ver soluções
          </a>
        </div>

        <div style={{ marginTop: 36, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {['Diagnóstico gratuito', 'Resposta em 24h', 'Sem compromisso'].map((item, i) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>}
              <span style={{ fontSize: 13, color: 'rgba(245,245,247,0.28)', letterSpacing: '-0.01em' }}>{item}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
