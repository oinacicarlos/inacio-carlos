// Verificação manual da assinatura do webhook do Stripe.
// Este projeto não usa o SDK oficial `stripe` (a integração de checkout já
// existente também chama a REST API direto via fetch), então a verificação
// é feita aqui com Web Crypto — funciona tanto em Node quanto no runtime de
// edge do Cloudflare (deploy via OpenNext), diferente de `node:crypto`.

const MAX_TIMESTAMP_TOLERANCE_SECONDS = 300 // 5 minutos, mesmo padrão do SDK oficial

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

// Verifica o header `Stripe-Signature` (`t=<timestamp>,v1=<assinatura>[,v0=...]`)
// contra o corpo bruto da requisição. Retorna false para qualquer assinatura
// ausente, malformada, expirada ou que não bata — nunca lança exceção, pra
// forçar o chamador a tratar tudo como "não confiável" por padrão.
export async function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false

  const parts = new Map(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=")
      return [key, value] as const
    }),
  )

  const timestamp = parts.get("t")
  const signature = parts.get("v1")

  if (!timestamp || !signature) return false

  const timestampSeconds = Number(timestamp)
  if (!Number.isFinite(timestampSeconds)) return false

  const ageSeconds = Math.abs(Date.now() / 1000 - timestampSeconds)
  if (ageSeconds > MAX_TIMESTAMP_TOLERANCE_SECONDS) return false

  const expectedSignature = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`)
  return timingSafeEqual(expectedSignature, signature)
}
