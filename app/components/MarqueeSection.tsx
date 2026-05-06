type Platform = "facebook" | "meta" | "google" | "instagram" | "tiktok"

const PLATFORMS: Platform[] = [
  "facebook",
  "meta",
  "google",
  "instagram",
  "tiktok",
]

export default function MarqueeSection() {
  const items = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS, ...PLATFORMS]

  return (
    <section className="landing-marquee" aria-label="Vendas aprovadas">
      <div className="landing-marquee__fade landing-marquee__fade--left" aria-hidden />
      <div className="landing-marquee__fade landing-marquee__fade--right" aria-hidden />

      <div className="landing-marquee__track">
        {items.map((platform, index) => (
          <article className="sales-card" data-platform={platform} key={`${platform}-${index}`}>
            <span className="sales-card__icon" data-platform={platform} aria-hidden>
              <PlatformIcon platform={platform} />
            </span>
            <span className="sales-card__copy">
              <strong>Venda aprovada</strong>
              <span>Pedido feito: R$997,00</span>
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "meta") {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label="Meta Ads">
        <path
          d="M9 31c2.3-8.8 6.3-16 11-16 3.4 0 5.8 3.7 8 7.5C30.4 18.8 32.8 15 37 15c5.2 0 8.3 5.9 8.3 11.6 0 5.1-2.4 8.4-6.1 8.4-3.2 0-5.8-2.4-9.6-8.7l-1.7-2.8-1.7 2.8c-4 6.4-6.8 8.7-10 8.7C11.7 35 7.8 33.8 9 31Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5.5"
        />
      </svg>
    )
  }

  if (platform === "google") {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label="Google Ads">
        <path
          d="M23.6 9.8 8.9 35.1a6.1 6.1 0 0 0 10.6 6.1l10.3-17.8Z"
          fill="currentColor"
          opacity=".95"
        />
        <path
          d="M25.9 9.8a6.1 6.1 0 0 1 8.3 2.2l10.2 17.6a6.1 6.1 0 1 1-10.6 6.1L23.6 18.2a6.1 6.1 0 0 1 2.3-8.4Z"
          fill="currentColor"
          opacity=".72"
        />
        <circle cx="14.2" cy="38.1" r="6.2" fill="currentColor" />
      </svg>
    )
  }

  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label="Instagram">
        <rect
          x="11"
          y="11"
          width="26"
          height="26"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <circle cx="24" cy="24" r="6.3" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="31.7" cy="16.7" r="2.3" fill="currentColor" />
      </svg>
    )
  }

  if (platform === "tiktok") {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label="TikTok">
        <path
          d="M28.4 9v20.4c0 6-4.6 10.6-10.7 10.6-5.1 0-9-3.4-9-8.1 0-5.6 5.4-9.5 11.2-8.2v5.9c-2.9-1-5.4.4-5.4 2.6 0 1.7 1.4 2.8 3.3 2.8 2.2 0 3.9-1.7 3.9-4.5V9h6.7Zm0 0c1.1 5.5 4.3 8.5 9.2 9.4v6.2c-4.1-.1-7.2-1.5-9.2-3.9Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Facebook">
      <path
        d="M26.4 39V25.9h4.4l.9-5.4h-5.3v-3.2c0-1.5.8-3 3.1-3h2.4V9.7s-2.2-.4-4.3-.4c-4.4 0-7.3 2.7-7.3 7.5v3.7h-4.9v5.4h4.9V39Z"
        fill="currentColor"
      />
    </svg>
  )
}
