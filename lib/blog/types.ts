export type BlogSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; title?: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }

export type BlogFaqItem = {
  question: string
  answer: string
}

export type BlogRelatedTool = {
  title: string
  href: string
  description: string
}

export type BlogPillar = "precificacao" | "rescisao" | "contratacao" | "contratos" | "mei"

export const PILLAR_LABELS: Record<BlogPillar, string> = {
  precificacao: "Precificação",
  rescisao: "Rescisão e direitos trabalhistas",
  contratacao: "Contratação de funcionários",
  contratos: "Contratos",
  mei: "MEI e contabilidade",
}

export type BlogArticle = {
  slug: string
  title: string
  // Título usado na tag <title> e no card — pode ser levemente diferente do
  // H1 pra caber melhor no resultado de busca (~60 caracteres).
  metaTitle?: string
  // ~150-160 caracteres, aparece como resumo no Google.
  metaDescription: string
  excerpt: string
  pillar: BlogPillar
  coverImage: string
  coverImageAlt: string
  publishedAt: string
  updatedAt: string
  readingTimeMinutes: number
  sections: BlogSection[]
  faq: BlogFaqItem[]
  relatedTool: BlogRelatedTool
  relatedSlugs: string[]
}
