const NAV = [
  { label: 'Start', href: '#' },
  { label: 'Soluções', href: '#' },
  { label: 'Diagnóstico', href: '#' },
  { label: 'Conteúdos', href: '#' },
]

export default function Header() {
  return (
    <header className="landing-header">
      <div className="landing-shell landing-header__inner">
        <a href="#" className="landing-brand">
          Ionia Business
        </a>

        <nav className="landing-nav" aria-label="Navegação principal">
          {NAV.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`landing-nav__link${index === 0 ? " landing-nav__link--active" : ""}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="landing-header__actions">
          <a href="#" className="landing-login">
            Log in
          </a>
          <a href="#" className="landing-button landing-button--small landing-button--header">
            <span>Começar</span>
          </a>
        </div>
      </div>
    </header>
  )
}
