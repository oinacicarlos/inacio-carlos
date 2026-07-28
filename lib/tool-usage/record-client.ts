export type RecordToolUsageResult = {
  ok: boolean
  limitReached?: boolean
}

// Gera a chave de idempotência uma única vez por montagem do componente.
// Evita depender de crypto.randomUUID() estar disponível globalmente
// durante a renderização no servidor (nem toda versão de Node expõe isso).
export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Chamada best-effort a partir do navegador. A validação real de limite
// acontece no servidor (app/api/tool-usage/route.ts) — esta função só avisa
// a ferramenta se a gravação foi aceita ou se o limite já tinha sido
// atingido nesse meio-tempo (ex.: mesmo plano usado em outra aba).
export async function recordToolUsage(tool: string, idempotencyKey: string): Promise<RecordToolUsageResult> {
  try {
    const response = await fetch("/api/tool-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, idempotencyKey }),
    })

    if (response.status === 403) {
      return { ok: false, limitReached: true }
    }

    return { ok: response.ok }
  } catch {
    return { ok: false }
  }
}
