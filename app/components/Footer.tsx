const NAV = [
  { label: 'Soluções',    href: '#solucoes' },
  { label: 'Processo',    href: '#processo' },
  { label: 'Sobre',       href: '#sobre' },
  { label: 'Diagnóstico', href: '#diagnostico' },
]

export default function Footer() {
  return (
    <footer style={{ borderTop: '2px solid rgba(255,255,255,0.07)', paddingBlock: 52, background: 'var(--surface)' }}>
      <div className="shell">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
          <div>
            <a href="#" className="heading" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--white)', display: 'block', marginBottom: 10 }}>
              IONIA
            </a>
            <p style={{ fontSize: 13, color: 'rgba(245,245,247,0.3)', maxWidth: '32ch', lineHeight: 1.6, letterSpacing: '-0.01em' }}>
              Não vendemos marketing. Vendemos uma estrutura completa de vendas que vende de verdade.
            </p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="heading" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,245,247,0.25)', marginBottom: 6 }}>
              Navegação
            </p>
            {NAV.map(n => <a key={n.label} href={n.href} className="footer-link">{n.label}</a>)}
          </nav>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="heading" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,245,247,0.25)', marginBottom: 6 }}>
              Redes Sociais
            </p>
            {[{ label: 'Instagram', href: '#' }, { label: 'LinkedIn', href: '#' }].map(s => (
              <a key={s.label} href={s.href} className="footer-link">{s.label}</a>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(245,245,247,0.2)', letterSpacing: '-0.01em' }}>
            © {new Date().getFullYear()} Ionia Consultoria de Marketing. Todos os direitos reservados.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(103,0,255,0.45)', letterSpacing: '-0.01em', fontWeight: 600 }}>
            O processo destrói para construir.
          </p>
        </div>
      </div>
    </footer>
  )
}
