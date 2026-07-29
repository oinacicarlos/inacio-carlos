// Criptografia da senha gov.br informada na triagem de onboarding.
// Mesma decisão já tomada em lib/stripe/webhook.ts: Web Crypto (crypto.subtle)
// em vez de node:crypto, pra funcionar tanto em Node quanto no runtime de
// edge do Cloudflare (deploy via OpenNext). A chave nunca fica no banco —
// só em ONBOARDING_ENCRYPTION_KEY, variável de ambiente do servidor.

const IV_LENGTH_BYTES = 12 // padrão recomendado pro AES-GCM

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function importKey(base64Key: string): Promise<CryptoKey> {
  const rawKey = base64ToUint8Array(base64Key)
  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
}

export type EncryptedSecret = {
  ciphertext: string
  iv: string
}

// Retorna null (em vez de lançar) quando a chave não está configurada, pra
// o chamador decidir o que fazer — nesse caso a rota de triagem simplesmente
// não grava a senha, em vez de responder 500 sem explicação.
export async function encryptSecret(plaintext: string): Promise<EncryptedSecret | null> {
  const keyBase64 = process.env.ONBOARDING_ENCRYPTION_KEY
  if (!keyBase64) return null

  const key = await importKey(keyBase64)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES))

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext),
  )

  return {
    ciphertext: uint8ArrayToBase64(new Uint8Array(ciphertextBuffer)),
    iv: uint8ArrayToBase64(iv),
  }
}

export async function decryptSecret(ciphertext: string, iv: string): Promise<string> {
  const keyBase64 = process.env.ONBOARDING_ENCRYPTION_KEY
  if (!keyBase64) {
    throw new Error("ONBOARDING_ENCRYPTION_KEY não configurada.")
  }

  const key = await importKey(keyBase64)
  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToUint8Array(iv) },
    key,
    base64ToUint8Array(ciphertext),
  )

  return new TextDecoder().decode(plaintextBuffer)
}
