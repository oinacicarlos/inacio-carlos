export const TOOL_SLUGS = [
  "gerador-contrato",
  "simulador-rescisao",
  "simulador-contratacao",
  "calculadora-precificacao",
] as const

export type ToolSlug = (typeof TOOL_SLUGS)[number]

export function isToolSlug(value: unknown): value is ToolSlug {
  return typeof value === "string" && (TOOL_SLUGS as readonly string[]).includes(value)
}
