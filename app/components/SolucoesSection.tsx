'use client'

import { useState } from 'react'

const SOLUTIONS = [
  {
    id: 'trafego',
    label: 'Tráfego Pago',
    target: 'Para nichos com bom desempenho no Meta Ads',
    tiers: [
      {
        name: 'Ebook & Curso',
        desc: 'Como vender mais com anúncios online. Para quem quer aprender antes de contratar.',
        prices: ['Ebook — R$ 47,90', 'Curso completo — R$ 497,00'],
        cta: 'Quero o ebook',
        highlight: false,
      },
      {
        name: 'Consultoria 3 meses',
        desc: 'Estruturação e implementação completa para vender mais com anúncios pagos.',
        prices: ['R$ 6.000,00 à vista', 'ou 3× R$ 2.000,00'],
        cta: 'Quero a consultoria',
        highlight: true,
      },
      {
        name: 'Assessoria Mensal',
        desc: 'Gestão de tráfego pago contínua. Nós operamos, você colhe os resultados.',
        prices: ['R$ 2.000,00/mês', 'Contrato mín. 6 meses'],
        cta: 'Quero a assessoria',
        highlight: false,
      },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    target: 'Para infoprodutores e prestadores de serviço',
    tiers: [
      {
        name: 'Ebook & Curso',
        desc: 'Como crescer nas redes sociais e transformar seguidores em clientes.',
        prices: ['Ebook — R$ 47,90', 'Curso completo — R$ 497,00'],
        cta: 'Quero o ebook',
        highlight: false,
      },
      {
        name: 'Consultoria 3 meses',
        desc: 'Estruturação e implementação para crescer e vender usando redes sociais.',
        prices: ['R$ 6.000,00 à vista', 'ou 3× R$ 2.000,00'],
        cta: 'Quero a consultoria',
        highlight: true,
      },
      {
        name: 'Assessoria Mensal',
        desc: 'Gestão de mídias sociais contínua. Estratégia, produção e publicação.',
        prices: ['R$ 2.000,00/mês', 'Contrato mín. 6 meses'],
        cta: 'Quero a assessoria',
        highlight: false,
      },
    ],
  },
  {
    id: 'sales',
    label: 'Sales Trainer',
    target: 'Para qualquer empresa com time comercial',
    tiers: [
      {
        name: 'Ebook & Curso',
        desc: 'Como vender com um processo comercial infalível. Do lead ao fechamento.',
        prices: ['Ebook — R$ 97,00', 'Curso completo — R$ 997,00'],
        cta: 'Quero o ebook',
        highlight: false,
      },
      {
        name: 'Consultoria 3 meses',
        desc: 'Estruturação para o time comercial ter resultados melhores e mais rápido.',
        prices: ['R$ 9.000,00 à vista', 'ou 3× R$ 3.000,00'],
        cta: 'Quero a consultoria',
        highlight: true,
      },
      {
        name: 'Assessoria Mensal',
        desc: 'Assessoria contínua de vendas para times comerciais com metas e acompanhamento.',
        prices: ['R$ 3.000,00/mês', 'Contrato mín. 6 meses'],
        cta: 'Quero a assessoria',
        highlight: false,
      },
    ],
  },
]

export default function SolucoesSection() {
  const [active, setActive] = useState(0)
  const sol = SOLUTIONS[active]

  return (
    <section id="solucoes" className="section section-divider">
      <div className="shell">
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div className="badge badge-dark" style={{ marginBottom: 20 }}>
            <span className="badge-dot" style={{ background: 'var(--brand)' }} aria-hidden />
            1 Solução · 3 Entregas
          </div>
          <h2 className="heading" style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 0.92,
            color: 'var(--white)',
            marginBottom: 40,
          }}>
            Escolha como quer<br />
            <span style={{ color: 'rgba(245,245,247,0.28)' }}>começar a vender mais</span>
          </h2>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {SOLUTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={`sol-tab${active === i ? ' active' : ''}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target */}
        <p style={{
          fontSize: 13,
          color: 'rgba(245,245,247,0.38)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 32,
        }}>
          → {sol.target}
        </p>

        {/* Tier cards */}
        <div className="grid-3">
          {sol.tiers.map((tier) => (
            <div key={tier.name} className={`tier-card${tier.highlight ? ' highlight' : ''}`}>
              {tier.highlight && (
                <div style={{
                  display: 'inline-block',
                  background: 'var(--yellow)',
                  color: '#000',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: 100,
                  marginBottom: 16,
                  fontFamily: 'var(--font-heading)',
                }}>
                  Mais vendido
                </div>
              )}

              <h3 className="heading" style={{
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: tier.highlight ? '#fff' : 'var(--white)',
                marginBottom: 12,
              }}>
                {tier.name}
              </h3>

              <p style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: tier.highlight ? 'rgba(255,255,255,0.72)' : 'rgba(245,245,247,0.42)',
                letterSpacing: '-0.01em',
                marginBottom: 24,
                minHeight: 64,
              }}>
                {tier.desc}
              </p>

              <div style={{ marginBottom: 24 }}>
                {tier.prices.map((p, i) => (
                  <p key={p} style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: i === 0 ? 22 : 13,
                    fontWeight: i === 0 ? 800 : 500,
                    letterSpacing: i === 0 ? '-0.04em' : '-0.01em',
                    color: i === 0
                      ? (tier.highlight ? '#fff' : 'var(--white)')
                      : (tier.highlight ? 'rgba(255,255,255,0.5)' : 'rgba(245,245,247,0.35)'),
                    lineHeight: i === 0 ? 1.1 : 1.6,
                    marginTop: i === 1 ? 4 : 0,
                  }}>
                    {p}
                  </p>
                ))}
              </div>

              <a
                href="#diagnostico"
                className={`btn btn-sm${tier.highlight ? ' btn-black' : ' btn-ghost'}`}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
