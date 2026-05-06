export default function SobreSection() {
  return (
    <section id="sobre" className="section section-divider">
      <div className="shell">
        <div className="split split-center">
          {/* Photo placeholder */}
          <div style={{ position: 'relative' }}>
            <div style={{
              aspectRatio: '3/4',
              maxWidth: 360,
              borderRadius: 16,
              background: 'var(--sur-2)',
              border: '2px solid rgba(255,255,255,0.07)',
              boxShadow: '8px 8px 0px 0px var(--brand)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(103,0,255,0.1) 0%, transparent 60%)',
              }} aria-hidden />
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand)', opacity: 0.3 }} />
              <p style={{ fontSize: 12, color: 'rgba(245,245,247,0.25)', letterSpacing: '-0.01em' }}>foto em breve</p>
            </div>

            {/* Floating badge */}
            <div style={{
              position: 'absolute', bottom: 24, right: -16,
              background: 'var(--yellow)',
              border: '2px solid #000',
              boxShadow: '3px 3px 0px 0px #000',
              borderRadius: 10,
              padding: '10px 16px',
            }}>
              <p className="heading" style={{ fontSize: 11, fontWeight: 800, color: '#000', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                +5 anos
              </p>
              <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.6)', fontWeight: 600, letterSpacing: '-0.01em' }}>de mercado digital</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="badge badge-dark" style={{ marginBottom: 24 }}>
              <span className="badge-dot" style={{ background: 'var(--brand)' }} aria-hidden />
              Sobre
            </div>

            <h2 className="heading" style={{
              fontSize: 'clamp(32px, 4.5vw, 52px)',
              fontWeight: 800,
              letterSpacing: '-0.045em',
              lineHeight: 0.92,
              color: 'var(--white)',
              marginBottom: 28,
            }}>
              Inácio Carlos
            </h2>

            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(245,245,247,0.5)', letterSpacing: '-0.015em', marginBottom: 18 }}>
              Sou um marketeiro que busco ser mais que um guru que fatura milhões. Quero ajudar empresas a crescerem de verdade — com estrutura, método e resultado mensurável.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(245,245,247,0.5)', letterSpacing: '-0.015em', marginBottom: 36 }}>
              A Ionia nasceu da frustração com o mercado de marketing cheio de promessas vazias. Nosso diferencial é simples: <strong style={{ color: 'var(--white)', fontWeight: 600 }}>não vendemos marketing, vendemos uma estrutura completa de vendas que vende de verdade.</strong>
            </p>

            <blockquote style={{
              borderLeft: '3px solid var(--brand)',
              paddingLeft: 20,
              marginBottom: 36,
            }}>
              <p className="heading" style={{
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: 'rgba(245,245,247,0.22)',
                lineHeight: 1.2,
              }}>
                &ldquo;Não vendemos marketing. Vendemos crescimento.&rdquo;
              </p>
            </blockquote>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Tráfego Pago', 'Social Media', 'Sales Trainer', 'Diagnóstico'].map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
