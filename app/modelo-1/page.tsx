import type { Metadata } from "next"
import styles from "./page.module.css"

const whatsappUrl =
  "https://wa.me/5512981219913"

const featuredProperties = [
  {
    title: "Casa Atlântica",
    location: "Jurerê Internacional, SC",
    price: "R$ 6.400.000",
    details: "520 m² · 5 suítes · piscina",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=86",
  },
  {
    title: "Apartamento Jardim",
    location: "Jardins, São Paulo",
    price: "R$ 18.000/mês",
    details: "210 m² · 3 suítes · mobiliado",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=86",
  },
  {
    title: "Villa Reserva",
    location: "Angra dos Reis, RJ",
    price: "R$ 9.800.000",
    details: "700 m² · marina · vista mar",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=86",
  },
]

const categories = [
  {
    title: "Casas de praia",
    text: "Casas próximas ao mar para morar, descansar ou investir com qualidade.",
    cta: "Ver opções",
    image:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=86",
  },
  {
    title: "Apartamentos",
    text: "Unidades bem localizadas para compra, venda e locação.",
    cta: "Explorar",
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=86",
  },
  {
    title: "Condomínios",
    text: "Imóveis com segurança, lazer e estrutura para toda a família.",
    cta: "Conhecer",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=86",
  },
  {
    title: "Imóveis para investimento",
    text: "Oportunidades com boa localização, liquidez e potencial de valorização.",
    cta: "Avaliar",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=86",
  },
]

const testimonials = [
  {
    quote:
      "A Maresias Casas entendeu exatamente o que buscávamos. Visitamos menos imóveis e decidimos com muito mais segurança.",
    author: "Marina A.",
    role: "Compradora",
  },
  {
    quote:
      "O atendimento foi direto, elegante e muito eficiente. A apresentação do imóvel valorizou o que realmente importava.",
    author: "Eduardo M.",
    role: "Proprietário",
  },
  {
    quote:
      "A negociação foi conduzida com clareza. Recebi visitas qualificadas e tive uma experiência muito mais tranquila.",
    author: "Renata S.",
    role: "Locadora",
  },
]

export const metadata: Metadata = {
  title: "Maresias Casas | Modelo 1",
  description: "Landing page visual premium para imobiliária.",
}

export default function Modelo1Page() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/modelo-1" aria-label="Maresias Casas">
          <span>MC</span>
          Maresias Casas
        </a>
        <nav className={styles.nav} aria-label="Navegação principal">
          <a href="#imoveis">Imóveis</a>
          <a href="#categorias">Categorias</a>
          <a href="#proprietarios">Proprietários</a>
          <a href="#contato">Contato</a>
        </nav>
        <a className={styles.headerAction} href={whatsappUrl} target="_blank" rel="noreferrer">
          Falar com consultor
        </a>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroImage} aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=88"
            alt=""
          />
        </div>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Imobiliária premium</p>
          <h1>
            <span className={styles.desktopTitle}>
              Imóveis selecionados
              <br />
              para morar, investir
              <br />
              e viver melhor.
            </span>
            <span className={styles.mobileTitle}>
              Imóveis selecionados
              <br />
              para morar,
              <br />
              investir e
              <br />
              viver melhor.
            </span>
          </h1>
          <p>
            Casas, apartamentos e propriedades exclusivas para compra, venda e locação,
            com atendimento especializado e apresentação profissional.
          </p>
          <div className={styles.heroActions}>
            <a href="#imoveis">Ver imóveis</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              Falar com consultor
            </a>
          </div>
        </div>
      </section>

      <section className={styles.search} aria-label="Busca de imóveis">
        <div className={styles.searchGrid}>
          <label>
            <span>Finalidade</span>
            <select defaultValue="Comprar">
              <option>Comprar</option>
              <option>Alugar</option>
              <option>Temporada</option>
            </select>
          </label>
          <label>
            <span>Tipo</span>
            <select defaultValue="Apartamento">
              <option>Apartamento</option>
              <option>Casa</option>
              <option>Cobertura</option>
              <option>Terreno</option>
            </select>
          </label>
          <label>
            <span>Localização</span>
            <select defaultValue="Maresias">
              <option value="Maresias">Maresias</option>
              <option value="SaoSebastiao">São Sebastião</option>
              <option value="LitoralNorte">Litoral Norte/SP</option>
              <option value="SP">São Paulo</option>
            </select>
          </label>
          <label>
            <span>Faixa de preço</span>
            <select defaultValue="R$ 2M a R$ 5M">
              <option>Até R$ 2M</option>
              <option>R$ 2M a R$ 5M</option>
              <option>Acima de R$ 5M</option>
            </select>
          </label>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            Buscar
          </a>
        </div>
      </section>

      <section className={styles.section} id="imoveis">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Destaques</p>
          <h2>Imóveis em destaque para diferentes momentos de vida.</h2>
          <p className={styles.sectionLead}>
            Uma seleção com imóveis bem localizados, apresentação profissional e
            informações claras para facilitar sua escolha.
          </p>
        </div>
        <div className={styles.propertyGrid}>
          {featuredProperties.map((property) => (
            <article className={styles.propertyCard} key={property.title}>
              <img src={property.image} alt={property.title} />
              <div>
                <span>{property.location}</span>
                <h3>{property.title}</h3>
                <p>{property.details}</p>
                <strong>{property.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="categorias">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Categorias</p>
          <h2>Comece pelo estilo de imóvel que combina com você.</h2>
          <p className={styles.sectionLead}>
            Escolha entre casas, apartamentos, condomínios e oportunidades de investimento
            com atendimento feito para o seu perfil.
          </p>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <article className={styles.categoryCard} key={category.title}>
              <img src={category.image} alt={category.title} />
              <div>
                <h3>{category.title}</h3>
                <p>{category.text}</p>
                <span>{category.cta}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.institutional}>
        <div>
          <p className={styles.eyebrow}>A Maresias Casas</p>
          <h2>Atendimento especializado para compra, venda e locação.</h2>
        </div>
        <p>
          A Maresias Casas une leitura de mercado, apresentação profissional e
          negociação segura para conectar compradores, locatários e proprietários aos
          imóveis certos, com visitas qualificadas e informações bem organizadas.
        </p>
      </section>

      <section className={styles.owners} id="proprietarios">
        <div className={styles.ownerMedia}>
          <img
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=86"
            alt="Ambiente interno de imóvel premium"
          />
        </div>
        <div className={styles.ownerCopy}>
          <p className={styles.eyebrow}>Para proprietários</p>
          <h2>Valorize seu imóvel com uma apresentação mais profissional.</h2>
          <p>
            Organizamos fotos, informações e divulgação para conectar seu imóvel a
            compradores e locatários mais qualificados.
          </p>
          <ul className={styles.benefitList}>
            <li>Avaliação inicial</li>
            <li>Apresentação visual</li>
            <li>Divulgação estratégica</li>
            <li>Atendimento aos interessados</li>
          </ul>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            Avaliar meu imóvel
          </a>
        </div>
      </section>

      <section className={styles.testimonials}>
        <div className={`${styles.sectionHeader} ${styles.centerHeader}`}>
          <p className={styles.eyebrow}>Depoimentos</p>
          <h2>Experiências mais simples para comprar, vender ou alugar.</h2>
          <p className={styles.sectionLead}>
            Clientes e proprietários que encontraram um atendimento mais claro, seguro
            e organizado para negociar seus imóveis.
          </p>
        </div>
        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial) => (
            <article key={testimonial.author}>
              <p>“{testimonial.quote}”</p>
              <strong>{testimonial.author}</strong>
              <span>{testimonial.role}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} id="contato">
        <p className={styles.eyebrow}>Atendimento especializado</p>
        <h2>Receba uma seleção de imóveis alinhada ao que você procura.</h2>
        <a href={whatsappUrl} target="_blank" rel="noreferrer">
          Falar com um consultor
        </a>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>Maresias Casas</strong>
          <p>Juliano Junior Gebin · CRECI 122561 · @maresiascasas</p>
        </div>
        <div>
          <span>imovellitoral1@gmail.com</span>
          <span>(12) 98121-9913</span>
          <span>Maresias · São Sebastião · Litoral Norte/SP</span>
        </div>
      </footer>
    </main>
  )
}
