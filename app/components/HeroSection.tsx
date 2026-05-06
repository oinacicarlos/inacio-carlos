export default function HeroSection() {
  return (
    <section className="landing-hero">
      <div className="landing-shell landing-hero__inner">
        <h1 className="landing-hero__title">
          <span className="landing-hero__title-accent">Não vendemos Marketing,</span>
          <span>geramos resultados reais.</span>
        </h1>

        <p className="landing-hero__subtitle">
          Não buscamos empresas que comprem nossos serviços, buscamos
          <br />
          empresas que visam resultados reais.
        </p>

        <div className="landing-hero__actions">
          <a href="#" className="landing-button landing-button--hero">
            <span>Ter resultados</span>
          </a>
          <a href="#" className="landing-link-button landing-link-button--hero">
            <span>Saber mais</span>
            <span aria-hidden>↓</span>
          </a>
        </div>
      </div>
    </section>
  )
}
