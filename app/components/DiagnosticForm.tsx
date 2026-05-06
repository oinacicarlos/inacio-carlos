'use client'

import { useState } from 'react'

export default function DiagnosticForm() {
  const [form, setForm] = useState({ name: '', email: '', company: '', pain: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ok, setOk] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())  e.name  = 'Informe seu nome'
    if (!form.email.trim()) e.email = 'Informe seu email'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.pain.trim())  e.pain  = 'Conta-nos sua principal dor'
    return e
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setOk(true)
  }

  if (ok) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(0,0,0,0.2)', border: '2px solid rgba(0,0,0,0.3)',
          boxShadow: '4px 4px 0 0 var(--yellow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 24, color: '#000',
        }}>✓</div>
        <h3 className="heading" style={{ fontSize: 22, fontWeight: 800, color: '#000', marginBottom: 10, letterSpacing: '-0.03em' }}>
          Diagnóstico enviado!
        </h3>
        <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.55)', letterSpacing: '-0.01em' }}>
          Inácio entra em contato em até 24h com a análise.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <input className="form-input" type="text" placeholder="Seu nome completo"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        {errors.name && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5, paddingLeft: 2 }}>{errors.name}</p>}
      </div>
      <div>
        <input className="form-input" type="email" placeholder="seu@email.com"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        {errors.email && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5, paddingLeft: 2 }}>{errors.email}</p>}
      </div>
      <div>
        <input className="form-input" type="text" placeholder="Nome da empresa (opcional)"
          value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
      </div>
      <div>
        <textarea className="form-input" placeholder="Qual sua principal dor em vendas hoje? Seja honesto." rows={4}
          value={form.pain} onChange={e => setForm({ ...form, pain: e.target.value })} />
        {errors.pain && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5, paddingLeft: 2 }}>{errors.pain}</p>}
      </div>
      <button type="submit" className="form-submit">
        Quero destruir o que não funciona →
      </button>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
        {['✓ Gratuito', '✓ 24h de resposta', '✓ Sem compromisso'].map(t => (
          <span key={t} style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', letterSpacing: '-0.01em' }}>{t}</span>
        ))}
      </div>
    </form>
  )
}
