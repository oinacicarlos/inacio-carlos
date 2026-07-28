// Só aceita caminhos internos relativos (começando com "/" e não "//"),
// pra nunca redirecionar pra um domínio externo a partir de um parâmetro de URL.
export function safeRedirectPath(value: string | null, fallback: string): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value
  }
  return fallback
}

// Toda confirmação de e-mail e login com Google precisa passar por
// /auth/callback antes do destino final — é lá que a sessão vinda da URL
// (hash ou código PKCE) é processada no cliente antes de navegar adiante.
// Sem isso, o middleware de rotas protegidas (ex.: /hub) redireciona pro
// /login antes do navegador ter a chance de processar a sessão.
export function buildAuthCallbackUrl(origin: string, redirectTo: string): string {
  return `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
}
