"use client"

import { useState } from "react"

type IconName =
  | "cart"
  | "google"
  | "instagram"
  | "meta"
  | "phone"
  | "tiktok"
  | "whatsapp"
  | "youtube"

type Solution = {
  id: string
  label: string
  description: string
  icons: IconName[]
  resultTime: string
}

const SOLUTIONS: Solution[] = [
  {
    id: "trainer-sales",
    label: "Trainer Sales",
    description:
      "Acelere o contato comercial com rotinas mais diretas, ofertas claras e um processo objetivo para converter oportunidades em vendas reais.",
    icons: ["whatsapp", "phone", "cart"],
    resultTime: "Rápido",
  },
  {
    id: "trafego-pago",
    label: "Tráfego Pago",
    description:
      "Campanhas de performance com foco em aquisição, geração de leads qualificados, previsibilidade comercial e escala controlada.",
    icons: ["google", "meta", "tiktok"],
    resultTime: "Médio",
  },
  {
    id: "social-media",
    label: "Social Media",
    description:
      "Presença digital consistente para construir autoridade, fortalecer a marca e sustentar crescimento por meio de conteúdo estratégico.",
    icons: ["instagram", "youtube", "tiktok"],
    resultTime: "Longo",
  },
]

export default function SolutionsShowcaseSection() {
  const [activeId, setActiveId] = useState("trafego-pago")
  const active = SOLUTIONS.find((solution) => solution.id === activeId) ?? SOLUTIONS[1]

  return (
    <section className="solutions-showcase" aria-labelledby="solutions-title">
      <div className="landing-shell solutions-showcase__inner">
        <h2 className="solutions-showcase__title" id="solutions-title">
          <span>Para cada empresa</span>
          <span>uma solução diferente</span>
        </h2>

        <div className="solutions-tabs" role="tablist" aria-label="Soluções">
          {SOLUTIONS.map((solution) => (
            <button
              aria-selected={solution.id === active.id}
              className={`solutions-tabs__item${solution.id === active.id ? " solutions-tabs__item--active" : ""}`}
              data-solution={solution.id}
              key={solution.id}
              onClick={() => setActiveId(solution.id)}
              role="tab"
              type="button"
            >
              {solution.label}
            </button>
          ))}
        </div>

        <div className="solutions-showcase__content" data-solution={active.id} key={active.id}>
          <p className="solutions-showcase__description">{active.description}</p>

          <div className="solutions-orbit" aria-label={`Ícones de ${active.label}`}>
            {active.icons.map((icon) => (
              <span className="solutions-orbit__bubble" data-icon={icon} key={icon}>
                <span className="solutions-icon-mark" data-icon={icon}>
                  <SolutionIcon name={icon} />
                </span>
              </span>
            ))}
          </div>

          <div className="solutions-result">
            <p>Tempo para resultado</p>
            <strong>{active.resultTime}</strong>
            <a className="landing-button solutions-result__button" href="#">
              <span>Contratar</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function SolutionIcon({ name }: { name: IconName }) {
  if (name === "meta") {
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

  if (name === "google") {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label="Google Ads">
        <path d="M23.6 9.8 8.9 35.1a6.1 6.1 0 0 0 10.6 6.1l10.3-17.8Z" fill="currentColor" opacity=".95" />
        <path
          d="M25.9 9.8a6.1 6.1 0 0 1 8.3 2.2l10.2 17.6a6.1 6.1 0 1 1-10.6 6.1L23.6 18.2a6.1 6.1 0 0 1 2.3-8.4Z"
          fill="currentColor"
          opacity=".72"
        />
        <circle cx="14.2" cy="38.1" r="6.2" fill="currentColor" />
      </svg>
    )
  }

  if (name === "tiktok") {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label="TikTok">
        <path
          d="M28.4 9v20.4c0 6-4.6 10.6-10.7 10.6-5.1 0-9-3.4-9-8.1 0-5.6 5.4-9.5 11.2-8.2v5.9c-2.9-1-5.4.4-5.4 2.6 0 1.7 1.4 2.8 3.3 2.8 2.2 0 3.9-1.7 3.9-4.5V9h6.7Zm0 0c1.1 5.5 4.3 8.5 9.2 9.4v6.2c-4.1-.1-7.2-1.5-9.2-3.9Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (name === "instagram") {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label="Instagram">
        <rect x="11" y="11" width="26" height="26" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="24" cy="24" r="6.3" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="31.7" cy="16.7" r="2.3" fill="currentColor" />
      </svg>
    )
  }

  if (name === "youtube") {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label="YouTube">
        <path
          d="M42 18.1c0-3.2-2.3-5.8-5.1-6.2C32.5 11.3 24 11.3 24 11.3s-8.5 0-12.9.6C8.3 12.3 6 14.9 6 18.1c-.5 3.9-.5 7.9 0 11.8 0 3.2 2.3 5.8 5.1 6.2 4.4.6 12.9.6 12.9.6s8.5 0 12.9-.6c2.8-.4 5.1-3 5.1-6.2.5-3.9.5-7.9 0-11.8Z"
          fill="currentColor"
        />
        <path d="m21.2 29.4 9.5-5.4-9.5-5.4Z" fill="#3f147c" />
      </svg>
    )
  }

  if (name === "whatsapp") {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label="WhatsApp">
        <path
          d="M24 8.2c-8.4 0-15.2 6.5-15.2 14.6 0 2.7.8 5.2 2.2 7.4L9.2 40l10.2-2.5c1.5.4 3 .6 4.6.6 8.4 0 15.2-6.5 15.2-14.6S32.4 8.2 24 8.2Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <path
          d="M18.1 16.9c.5-.8 1.2-.8 1.8-.5l2 3c.3.4.3.9 0 1.3l-.9 1.2c1 2.1 2.6 3.6 5 4.8l1.2-1c.4-.3.9-.3 1.3 0l3 1.9c.6.4.7 1 .4 1.6-.7 1.4-2 2.2-3.6 2.1-4.6-.4-10.9-5.7-12.2-10.3-.4-1.5.3-3.1 2-4.1Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (name === "phone") {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label="Telefone">
        <path
          d="M16.2 9.8 21 19c.5.9.2 2-.5 2.6l-2.6 2.1c2.5 5 6.4 8.7 11.2 10.9l2.2-2.6c.7-.8 1.8-1 2.7-.5l8.4 4.8c1 .5 1.4 1.7 1 2.8-1.1 3-4.1 4.8-7.2 4.1C20.7 39.8 8.5 27.7 5 12.3c-.7-3.2 1.1-6.2 4.1-7.4 1.1-.4 2.3 0 2.8 1Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Carrinho de compra">
      <path
        d="M7.5 10.5h5.2l3.6 18.2a4.4 4.4 0 0 0 4.3 3.5h13.8a4.4 4.4 0 0 0 4.2-3.2l2.8-10.2H16.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <circle cx="21" cy="39" r="3.2" fill="currentColor" />
      <circle cx="35" cy="39" r="3.2" fill="currentColor" />
    </svg>
  )
}
