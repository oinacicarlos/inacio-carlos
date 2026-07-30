"use client"

import { FormEvent, useEffect, useState } from "react"
import { BadgeCheck, ExternalLink, FilePenLine, ShieldCheck, Sparkles, Upload } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { StripeProductButton } from "@/components/stripe-product-button"
import type { ProductSlug } from "@/lib/stripe/products"
import {
  ABERTURA_STATUS_LABELS,
  ALLOWED_DOCUMENT_TYPES,
  ALTERACAO_STATUS_LABELS,
  CERTIFICADO_STATUS_LABELS,
  CERTIFICADO_WHATSAPP_LINK,
  DOCUMENT_BUCKET,
  DOCUMENT_FIELDS,
  ESTADO_CIVIL_LABELS,
  MAX_DOCUMENT_SIZE_BYTES,
  MEI_STATUS_LABELS,
  REGIME_BENS_LABELS,
  SOLUTI_VIDEO_LINK,
  type DocumentField,
  type EstadoCivil,
  type OnboardingIntake,
  type RegimeBens,
} from "@/lib/onboarding/constants"

type LoadState = "loading" | "products" | "form"

const INTAKE_SELECT_COLUMNS =
  "id, cpf, wants_certificado, wants_abertura_empresa, wants_abertura_mei, wants_alteracao_cnpj, segmento, descricao_cnpj, estado_civil, regime_bens, razao_social, tem_nome_fantasia, nome_fantasia, quantidade_socios, cnpj_atual, descricao_alteracao, has_certidao_casamento, has_comprovante_bombeiro, doc_identidade_path, doc_certidao_casamento_path, doc_comprovante_residencia_path, doc_iptu_path, doc_comprovante_bombeiro_path, certificado_status, abertura_status, mei_status, alteracao_status, created_at, updated_at"

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
      supabase.from("onboarding_intakes").select(INTAKE_SELECT_COLUMNS).maybeSingle(),
    ])

    const products = ((purchases as { product: ProductSlug }[] | null) ?? []).map((row) => row.product)
    const loadedIntake = (intakeRow as OnboardingIntake | null) ?? null
    setPurchasedProducts(products)
    setIntake(loadedIntake)
    setState(products.length > 0 || loadedIntake?.wants_abertura_mei ? "form" : "products")
    return loadedIntake
  }

  async function startMei() {
    await fetch("/api/onboarding/start-mei", { method: "POST" })
    await reload()
  }

  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(window.location.search)
      const loadedIntake = await reload()

      // Suporte ao link "MEI grátis" de /abrir-cnpj: quem ainda não tinha
      // conta é mandado pro cadastro com ?start=mei no redirect; ao voltar
      // pro hub já logado, essa flag inicia a triagem automaticamente, sem
      // precisar clicar em nada de novo.
      if (params.get("start") === "mei" && !loadedIntake?.wants_abertura_mei) {
        await startMei()
      }

      if (params.has("start")) {
        params.delete("start")
        const newSearch = params.toString()
        window.history.replaceState(null, "", newSearch ? `?${newSearch}` : window.location.pathname)
      }
    }
    void init()
  }, [])

  if (state === "loading") {
    return (
      <article className="client-hub-panel">
        <p className="client-hub-empty-state">Carregando...</p>
      </article>
    )
  }

  if (state === "products") {
    return <ProductCatalog purchasedProducts={purchasedProducts} onStartMei={startMei} />
  }

  return <IntakeForm intake={intake} purchasedProducts={purchasedProducts} onSaved={reload} />
}

function ProductCatalog({
  purchasedProducts,
  onStartMei,
}: {
  purchasedProducts: ProductSlug[]
  onStartMei: () => void
}) {
  return (
    <article className="client-hub-panel">
      <div className="client-hub-section-head">
        <div>
          <h2>Meu processo</h2>
          <p>Abertura de MEI, certificado digital, abertura de empresa e alteração de CNPJ, do jeito mais simples de resolver.</p>
        </div>
      </div>

      <div className="onboarding-product-grid">
        <div className="onboarding-product-card">
          <Sparkles size={26} strokeWidth={2} aria-hidden="true" />
          <h3>Abertura de MEI</h3>
          <p>Cadastro como Microempreendedor Individual, sem custo nenhum.</p>
          <strong className="onboarding-product-price">Grátis</strong>
          <button type="button" className="accounting-plan-button" onClick={onStartMei}>
            Abrir meu MEI
          </button>
        </div>

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
          <h3>Abertura de empresa (Simples Nacional)</h3>
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

        <div className="onboarding-product-card">
          <FilePenLine size={26} strokeWidth={2} aria-hidden="true" />
          <h3>Alteração de CNPJ</h3>
          <p>Mudança de razão social, endereço, atividade ou sócios registrada oficialmente.</p>
          <strong className="onboarding-product-price">R$ 1.460,50</strong>
          {purchasedProducts.includes("alteracao_cnpj") ? (
            <span className="onboarding-product-owned">Já contratado</span>
          ) : (
            <StripeProductButton product="alteracao_cnpj" className="accounting-plan-button">
              Comprar alteração de CNPJ
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
  const wantsMei = intake?.wants_abertura_mei ?? false
  const wantsAlteracao = intake?.wants_alteracao_cnpj ?? purchasedProducts.includes("alteracao_cnpj")
  const needsSenhaGov = wantsMei || wantsAbertura

  const [cpf, setCpf] = useState(intake?.cpf ?? "")
  const [senhaGov, setSenhaGov] = useState("")
  const [segmento, setSegmento] = useState(intake?.segmento ?? "")
  const [descricaoCnpj, setDescricaoCnpj] = useState(intake?.descricao_cnpj ?? "")
  const [estadoCivil, setEstadoCivil] = useState<EstadoCivil>(intake?.estado_civil ?? "")
  const [regimeBens, setRegimeBens] = useState<RegimeBens>(intake?.regime_bens ?? "")
  const [razaoSocial, setRazaoSocial] = useState(intake?.razao_social ?? "")
  const [temNomeFantasia, setTemNomeFantasia] = useState<boolean | null>(intake?.tem_nome_fantasia ?? null)
  const [nomeFantasia, setNomeFantasia] = useState(intake?.nome_fantasia ?? "")
  const [quantidadeSocios, setQuantidadeSocios] = useState(
    intake?.quantidade_socios != null ? String(intake.quantidade_socios) : "",
  )
  const [cnpjAtual, setCnpjAtual] = useState(intake?.cnpj_atual ?? "")
  const [descricaoAlteracao, setDescricaoAlteracao] = useState(intake?.descricao_alteracao ?? "")
  const [hasCertidao, setHasCertidao] = useState<boolean | null>(intake?.has_certidao_casamento ?? null)
  const [hasBombeiro, setHasBombeiro] = useState<boolean | null>(intake?.has_comprovante_bombeiro ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const neededDocFields = new Set<DocumentField>()
  if (wantsMei) {
    neededDocFields.add("doc_identidade_path")
    neededDocFields.add("doc_comprovante_residencia_path")
  }
  if (wantsAbertura) {
    DOCUMENT_FIELDS.forEach((doc) => neededDocFields.add(doc.field))
  }
  if (wantsAlteracao) {
    neededDocFields.add("doc_identidade_path")
  }

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
          estado_civil: wantsAbertura ? estadoCivil : undefined,
          regime_bens: wantsAbertura && estadoCivil === "casado" ? regimeBens : undefined,
          razao_social: wantsAbertura ? razaoSocial : undefined,
          tem_nome_fantasia: wantsAbertura ? temNomeFantasia : undefined,
          nome_fantasia: wantsAbertura && temNomeFantasia ? nomeFantasia : undefined,
          quantidade_socios: wantsAbertura && quantidadeSocios ? Number(quantidadeSocios) : undefined,
          cnpj_atual: wantsAlteracao ? cnpjAtual : undefined,
          descricao_alteracao: wantsAlteracao ? descricaoAlteracao : undefined,
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
        {wantsMei && (
          <div className="onboarding-status-pill">
            <span>Abertura de MEI</span>
            <strong>{MEI_STATUS_LABELS[intake?.mei_status ?? "nao_iniciado"]}</strong>
          </div>
        )}
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
        {wantsAlteracao && (
          <div className="onboarding-status-pill">
            <span>Alteração de CNPJ</span>
            <strong>{ALTERACAO_STATUS_LABELS[intake?.alteracao_status ?? "nao_iniciado"]}</strong>
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

          {needsSenhaGov && (
            <label className="client-requests-field">
              <span>Senha gov.br</span>
              <input
                type="password"
                value={senhaGov}
                onChange={(event) => setSenhaGov(event.target.value)}
                placeholder={intake ? "•••••••• (preenchida)" : "Digite sua senha gov.br"}
              />
              <em className="onboarding-field-note">Armazenada de forma criptografada — só a equipe autorizada acessa quando necessário.</em>
              <em className="onboarding-field-note">
                Antes de enviar, desative a verificação em duas etapas da sua conta gov.br — isso é necessário para
                conseguirmos dar entrada de forma automática. Você pode reativar assim que o processo terminar.
              </em>
            </label>
          )}
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

            <label className="client-requests-field">
              <span>Razão social escolhida</span>
              <input
                type="text"
                value={razaoSocial}
                onChange={(event) => setRazaoSocial(event.target.value)}
                placeholder="Nome oficial da empresa"
              />
            </label>

            <label className="client-requests-field">
              <span>Estado civil</span>
              <select value={estadoCivil} onChange={(event) => setEstadoCivil(event.target.value as EstadoCivil)}>
                <option value="">Selecione</option>
                {Object.entries(ESTADO_CIVIL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            {estadoCivil === "casado" && (
              <label className="client-requests-field">
                <span>Regime de separação de bens</span>
                <select value={regimeBens} onChange={(event) => setRegimeBens(event.target.value as RegimeBens)}>
                  <option value="">Selecione</option>
                  {Object.entries(REGIME_BENS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="client-requests-field">
              <span>Quantos sócios a empresa terá</span>
              <input
                type="number"
                min={1}
                value={quantidadeSocios}
                onChange={(event) => setQuantidadeSocios(event.target.value)}
                placeholder="1 = empresa unipessoal"
              />
            </label>

            <div className="onboarding-document-toggle-block">
              <label className="onboarding-document-toggle">
                <input
                  type="checkbox"
                  checked={temNomeFantasia === true}
                  onChange={(event) => setTemNomeFantasia(event.target.checked)}
                />
                Vai usar nome fantasia
              </label>
              {temNomeFantasia && (
                <input
                  type="text"
                  value={nomeFantasia}
                  onChange={(event) => setNomeFantasia(event.target.value)}
                  placeholder="Nome fantasia"
                />
              )}
            </div>
          </>
        )}

        {wantsAlteracao && (
          <>
            <label className="client-requests-field">
              <span>CNPJ atual</span>
              <input
                type="text"
                value={cnpjAtual}
                onChange={(event) => setCnpjAtual(event.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </label>

            <label className="client-requests-field">
              <span>O que você quer alterar</span>
              <textarea
                value={descricaoAlteracao}
                onChange={(event) => setDescricaoAlteracao(event.target.value)}
                placeholder="Ex.: mudar razão social, endereço, atividade (CNAE), incluir ou remover sócio..."
                rows={4}
              />
            </label>
          </>
        )}

        {neededDocFields.size > 0 && (
          <div className="onboarding-document-grid">
            {DOCUMENT_FIELDS.filter((doc) => neededDocFields.has(doc.field)).map((doc) => (
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
        )}
        {hasBombeiro === false && (
          <p className="onboarding-field-note">Sem o comprovante do bombeiro, pode ser necessário pagar uma taxa depois.</p>
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
