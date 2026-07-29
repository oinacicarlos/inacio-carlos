"use client"

import { FormEvent, useEffect, useState } from "react"
import { BadgeCheck, ExternalLink, ShieldCheck, Upload } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { StripeProductButton } from "@/components/stripe-product-button"
import type { ProductSlug } from "@/lib/stripe/products"
import {
  ABERTURA_STATUS_LABELS,
  ALLOWED_DOCUMENT_TYPES,
  CERTIFICADO_STATUS_LABELS,
  CERTIFICADO_WHATSAPP_LINK,
  DOCUMENT_BUCKET,
  DOCUMENT_FIELDS,
  MAX_DOCUMENT_SIZE_BYTES,
  SOLUTI_VIDEO_LINK,
  type OnboardingIntake,
} from "@/lib/onboarding/constants"

type LoadState = "loading" | "products" | "form"

export default function OnboardingPanel() {
  const [state, setState] = useState<LoadState>("loading")
  const [purchasedProducts, setPurchasedProducts] = useState<ProductSlug[]>([])
  const [intake, setIntake] = useState<OnboardingIntake | null>(null)

  async function reload() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setState("products")
      return
    }

    const [{ data: purchases }, { data: intakeRow }] = await Promise.all([
      supabase.from("product_purchases").select("product"),
      supabase
        .from("onboarding_intakes")
        .select(
          "id, cpf, wants_certificado, wants_abertura_empresa, segmento, descricao_cnpj, has_certidao_casamento, has_comprovante_bombeiro, doc_identidade_path, doc_certidao_casamento_path, doc_comprovante_residencia_path, doc_iptu_path, doc_comprovante_bombeiro_path, certificado_status, abertura_status, created_at, updated_at",
        )
        .maybeSingle(),
    ])

    const products = ((purchases as { product: ProductSlug }[] | null) ?? []).map((row) => row.product)
    setPurchasedProducts(products)
    setIntake((intakeRow as OnboardingIntake | null) ?? null)
    setState(products.length > 0 ? "form" : "products")
  }

  useEffect(() => {
    void reload()
  }, [])

  if (state === "loading") {
    return (
      <article className="client-hub-panel">
        <p className="client-hub-empty-state">Carregando...</p>
      </article>
    )
  }

  if (state === "products") {
    return <ProductCatalog purchasedProducts={purchasedProducts} />
  }

  return <IntakeForm intake={intake} purchasedProducts={purchasedProducts} onSaved={reload} />
}

function ProductCatalog({ purchasedProducts }: { purchasedProducts: ProductSlug[] }) {
  return (
    <article className="client-hub-panel">
      <div className="client-hub-section-head">
        <div>
          <h2>Meu processo</h2>
          <p>Certificado digital e abertura de empresa, do jeito mais simples de resolver.</p>
        </div>
      </div>

      <div className="onboarding-product-grid">
        <div className="onboarding-product-card">
          <ShieldCheck size={26} strokeWidth={2} aria-hidden="true" />
          <h3>Certificado Digital PJ A1</h3>
          <p>Necessário pra assinar documentos e acessar sistemas do governo em nome da empresa.</p>
          <strong className="onboarding-product-price">R$ 240,00</strong>
          {purchasedProducts.includes("certificado_pj_a1") ? (
            <span className="onboarding-product-owned">Já contratado</span>
          ) : (
            <StripeProductButton product="certificado_pj_a1" className="accounting-plan-button">
              Comprar certificado
            </StripeProductButton>
          )}
        </div>

        <div className="onboarding-product-card">
          <BadgeCheck size={26} strokeWidth={2} aria-hidden="true" />
          <h3>Abertura de empresa</h3>
          <p>Legalização completa do CNPJ, com acompanhamento até o registro na Junta Comercial.</p>
          <strong className="onboarding-product-price">R$ 1.460,50</strong>
          <span className="onboarding-product-price-breakdown">R$ 810,50 mão de obra + R$ 650,00 taxa da Junta Comercial</span>
          {purchasedProducts.includes("abertura_empresa") ? (
            <span className="onboarding-product-owned">Já contratado</span>
          ) : (
            <StripeProductButton product="abertura_empresa" className="accounting-plan-button">
              Comprar abertura de empresa
            </StripeProductButton>
          )}
        </div>
      </div>
    </article>
  )
}

function IntakeForm({
  intake,
  purchasedProducts,
  onSaved,
}: {
  intake: OnboardingIntake | null
  purchasedProducts: ProductSlug[]
  onSaved: () => void
}) {
  const wantsCertificado = intake?.wants_certificado ?? purchasedProducts.includes("certificado_pj_a1")
  const wantsAbertura = intake?.wants_abertura_empresa ?? purchasedProducts.includes("abertura_empresa")

  const [cpf, setCpf] = useState(intake?.cpf ?? "")
  const [senhaGov, setSenhaGov] = useState("")
  const [segmento, setSegmento] = useState(intake?.segmento ?? "")
  const [descricaoCnpj, setDescricaoCnpj] = useState(intake?.descricao_cnpj ?? "")
  const [hasCertidao, setHasCertidao] = useState<boolean | null>(intake?.has_certidao_casamento ?? null)
  const [hasBombeiro, setHasBombeiro] = useState<boolean | null>(intake?.has_comprovante_bombeiro ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/onboarding/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf,
          senha_gov: senhaGov || undefined,
          segmento: wantsAbertura ? segmento : undefined,
          descricao_cnpj: wantsAbertura ? descricaoCnpj : undefined,
          has_certidao_casamento: wantsAbertura ? hasCertidao : undefined,
          has_comprovante_bombeiro: wantsAbertura ? hasBombeiro : undefined,
        }),
      })

      const data = (await response.json()) as { ok?: boolean; error?: string }

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Não foi possível salvar a triagem.")
      }

      setSenhaGov("")
      setMessage("Dados salvos com sucesso.")
      onSaved()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível salvar a triagem.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="client-hub-panel">
      <div className="client-hub-section-head">
        <div>
          <h2>Meu processo</h2>
          <p>Complete seus dados para darmos sequência.</p>
        </div>
      </div>

      <div className="onboarding-status-row">
        {wantsCertificado && (
          <div className="onboarding-status-pill">
            <span>Certificado digital</span>
            <strong>{CERTIFICADO_STATUS_LABELS[intake?.certificado_status ?? "nao_iniciado"]}</strong>
          </div>
        )}
        {wantsAbertura && (
          <div className="onboarding-status-pill">
            <span>Abertura de empresa</span>
            <strong>{ABERTURA_STATUS_LABELS[intake?.abertura_status ?? "nao_iniciado"]}</strong>
          </div>
        )}
      </div>

      {wantsCertificado && (
        <div className="onboarding-certificado-steps">
          <h3>Passo a passo do Certificado Digital</h3>
          <ol>
            <li>
              Acesse e preencha as informações desse link:{" "}
              <a href={SOLUTI_VIDEO_LINK} target="_blank" rel="noreferrer">
                {SOLUTI_VIDEO_LINK} <ExternalLink size={13} strokeWidth={2.2} aria-hidden="true" />
              </a>
            </li>
            <li>Depois de preencher, você entra na sala virtual de espera para ser atendido.</li>
            <li>Na hora do atendimento, confirme suas informações (CPF, data de nascimento etc.).</li>
            <li>No final da videoconferência, tire um print da SENHA PARA EMISSÃO e envie pelo WhatsApp abaixo.</li>
          </ol>
          <p className="onboarding-certificado-hours">Atendimento disponível de 8h às 16h30.</p>
          <a className="onboarding-whatsapp-button" href={CERTIFICADO_WHATSAPP_LINK} target="_blank" rel="noreferrer">
            Enviar print da senha de emissão
          </a>
        </div>
      )}

      <form className="onboarding-intake-form" onSubmit={handleSubmit}>
        <div className="onboarding-form-grid">
          <label className="client-requests-field">
            <span>CPF</span>
            <input type="text" value={cpf} onChange={(event) => setCpf(event.target.value)} placeholder="000.000.000-00" />
          </label>

          <label className="client-requests-field">
            <span>Senha gov.br</span>
            <input
              type="password"
              value={senhaGov}
              onChange={(event) => setSenhaGov(event.target.value)}
              placeholder={intake ? "•••••••• (preenchida)" : "Digite sua senha gov.br"}
            />
            <em className="onboarding-field-note">Armazenada de forma criptografada — só a equipe autorizada acessa quando necessário.</em>
          </label>
        </div>

        {wantsAbertura && (
          <>
            <label className="client-requests-field">
              <span>Segmento de atuação</span>
              <input
                type="text"
                value={segmento}
                onChange={(event) => setSegmento(event.target.value)}
                placeholder="Ex.: consultoria, comércio de roupas, serviços de TI..."
              />
            </label>

            <label className="client-requests-field">
              <span>O que você quer para esse CNPJ</span>
              <textarea
                value={descricaoCnpj}
                onChange={(event) => setDescricaoCnpj(event.target.value)}
                placeholder="Descreva o que a empresa vai fazer e o que você espera desse CNPJ"
                rows={4}
              />
            </label>

            <div className="onboarding-document-grid">
              {DOCUMENT_FIELDS.map((doc) => (
                <DocumentUploadField
                  key={doc.field}
                  label={doc.label}
                  currentPath={intake?.[doc.field] ?? null}
                  intakeId={intake?.id ?? null}
                  field={doc.field}
                  optional={doc.optionalFlag}
                  hasDocument={doc.optionalFlag === "has_certidao_casamento" ? hasCertidao : doc.optionalFlag === "has_comprovante_bombeiro" ? hasBombeiro : null}
                  onToggleHasDocument={
                    doc.optionalFlag === "has_certidao_casamento"
                      ? setHasCertidao
                      : doc.optionalFlag === "has_comprovante_bombeiro"
                        ? setHasBombeiro
                        : undefined
                  }
                  onUploaded={onSaved}
                />
              ))}
            </div>
            {hasBombeiro === false && (
              <p className="onboarding-field-note">Sem o comprovante do bombeiro, pode ser necessário pagar uma taxa depois.</p>
            )}
          </>
        )}

        {error && <p className="client-requests-error">{error}</p>}
        {message && <p className="onboarding-save-message">{message}</p>}

        <div className="client-requests-form-actions">
          <button type="submit" className="client-requests-new-button" disabled={saving}>
            {saving ? "Salvando..." : "Salvar dados"}
          </button>
        </div>
      </form>
    </article>
  )
}

function DocumentUploadField({
  label,
  field,
  currentPath,
  intakeId,
  optional,
  hasDocument,
  onToggleHasDocument,
  onUploaded,
}: {
  label: string
  field: string
  currentPath: string | null
  intakeId: string | null
  optional?: string
  hasDocument: boolean | null
  onToggleHasDocument?: (value: boolean) => void
  onUploaded: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const skipUpload = optional && hasDocument === false

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setError("")

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      setError("Formato não suportado. Envie PDF, PNG, JPEG ou WEBP.")
      return
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setError("O arquivo deve ter até 10 MB.")
      return
    }

    setUploading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !intakeId) {
      setError("Salve a triagem antes de enviar documentos.")
      setUploading(false)
      return
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
    const path = `${user.id}/${field}-${Date.now()}-${safeName}`

    const { error: uploadError } = await supabase.storage.from(DOCUMENT_BUCKET).upload(path, file)
    if (uploadError) {
      setError("Não foi possível enviar o arquivo.")
      setUploading(false)
      return
    }

    const { error: updateError } = await supabase.from("onboarding_intakes").update({ [field]: path }).eq("id", intakeId)
    if (updateError) {
      setError("Arquivo enviado, mas não consegui salvar a referência. Tente de novo.")
      setUploading(false)
      return
    }

    setUploading(false)
    onUploaded()
  }

  return (
    <div className="onboarding-document-field">
      <span>{label}</span>

      {optional && (
        <label className="onboarding-document-toggle">
          <input
            type="checkbox"
            checked={hasDocument === false}
            onChange={(event) => onToggleHasDocument?.(!event.target.checked)}
          />
          Não possuo
        </label>
      )}

      {!skipUpload && (
        <label className={currentPath ? "onboarding-document-upload is-done" : "onboarding-document-upload"}>
          <Upload size={15} strokeWidth={2.2} aria-hidden="true" />
          {uploading ? "Enviando..." : currentPath ? "Documento enviado — trocar arquivo" : "Enviar arquivo"}
          <input type="file" accept={ALLOWED_DOCUMENT_TYPES.join(",")} onChange={handleFileChange} hidden />
        </label>
      )}

      {error && <p className="client-requests-error">{error}</p>}
    </div>
  )
}
