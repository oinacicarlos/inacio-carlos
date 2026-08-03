import type { RequestCategory } from "@/lib/client-requests/constants"
import { isValidCnpj, isValidCpf } from "@/lib/br-documents"
import type { ProductSlug } from "@/lib/stripe/products"

export type ProductRequestSlug = Extract<
  ProductSlug,
  "serasa_pf" | "serasa_pj" | "nota_fiscal_servico" | "nota_fiscal_produto"
>

export type RequestIntakeField = {
  name: string
  label: string
  placeholder?: string
  type?: "text" | "textarea"
  required?: boolean
  document?: "cpf" | "cnpj" | "cpf_or_cnpj"
}

export type ProductRequestIntake = {
  product: ProductRequestSlug
  label: string
  category: RequestCategory
  title: string
  body: string
  fields: RequestIntakeField[]
}

export const PRODUCT_REQUEST_INTAKES: Record<ProductRequestSlug, ProductRequestIntake> = {
  serasa_pf: {
    product: "serasa_pf",
    label: "Consulta Serasa PF",
    category: "consulta_serasa",
    title: "Consulta Serasa PF",
    body: "Preciso realizar uma consulta Serasa de pessoa física:",
    fields: [
      { name: "cpf", label: "CPF", placeholder: "000.000.000-00", required: true, document: "cpf" },
      { name: "nome", label: "Nome completo", required: true },
    ],
  },
  serasa_pj: {
    product: "serasa_pj",
    label: "Consulta Serasa PJ",
    category: "consulta_serasa",
    title: "Consulta Serasa PJ",
    body: "Preciso realizar uma consulta Serasa de pessoa jurídica:",
    fields: [
      { name: "cnpj", label: "CNPJ", placeholder: "00.000.000/0001-00", required: true, document: "cnpj" },
      { name: "razaoSocial", label: "Razão social", required: true },
    ],
  },
  nota_fiscal_servico: {
    product: "nota_fiscal_servico",
    label: "Nota fiscal de serviço",
    category: "emissao_nota_fiscal",
    title: "Emissão de nota fiscal de serviço",
    body: "Preciso emitir uma nota fiscal de serviço com os dados abaixo:",
    fields: [
      { name: "tomador", label: "Nome/Razão social do tomador", required: true },
      {
        name: "documentoTomador",
        label: "CPF ou CNPJ do tomador",
        placeholder: "000.000.000-00 ou 00.000.000/0001-00",
        required: true,
        document: "cpf_or_cnpj",
      },
      { name: "emailTomador", label: "E-mail do tomador", required: true },
      { name: "descricaoServico", label: "Descrição do serviço", type: "textarea", required: true },
      { name: "valorNota", label: "Valor da nota", placeholder: "R$ 0,00", required: true },
      { name: "municipio", label: "Município da prestação", required: true },
    ],
  },
  nota_fiscal_produto: {
    product: "nota_fiscal_produto",
    label: "Nota fiscal de produto",
    category: "emissao_nota_fiscal",
    title: "Emissão de nota fiscal de produto",
    body: "Preciso emitir uma nota fiscal de produto com os dados abaixo:",
    fields: [
      { name: "comprador", label: "Nome/Razão social do comprador", required: true },
      {
        name: "documentoComprador",
        label: "CPF ou CNPJ do comprador",
        placeholder: "000.000.000-00 ou 00.000.000/0001-00",
        required: true,
        document: "cpf_or_cnpj",
      },
      { name: "produto", label: "Produto vendido", type: "textarea", required: true },
      { name: "valorProduto", label: "Valor do produto", placeholder: "R$ 0,00", required: true },
      { name: "enderecoEntrega", label: "Endereço de entrega", type: "textarea", required: true },
    ],
  },
}

export function isProductRequestSlug(value: unknown): value is ProductRequestSlug {
  return typeof value === "string" && value in PRODUCT_REQUEST_INTAKES
}

export function validateIntakeField(field: RequestIntakeField, value: string) {
  if (field.required && !value.trim()) {
    return `Preencha o campo "${field.label}".`
  }

  if (!value.trim()) return null

  if (field.document === "cpf" && !isValidCpf(value)) {
    return "Informe um CPF válido."
  }

  if (field.document === "cnpj" && !isValidCnpj(value)) {
    return "Informe um CNPJ válido."
  }

  if (field.document === "cpf_or_cnpj" && !isValidCpf(value) && !isValidCnpj(value)) {
    return "Informe um CPF ou CNPJ válido."
  }

  return null
}

export function buildStructuredDescription(
  intake: { body: string; fields?: RequestIntakeField[] },
  values: Record<string, string>,
  extra = "",
) {
  const structuredDescription = (intake.fields ?? [])
    .map((field) => {
      const value = values[field.name]?.trim()
      return value ? `${field.label}: ${value}` : null
    })
    .filter(Boolean)
    .join("\n")

  return [intake.body, structuredDescription, extra.trim()].filter(Boolean).join("\n\n")
}
