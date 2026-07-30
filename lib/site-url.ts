// Domínio canônico do site, usado no sitemap, robots.txt e dados
// estruturados. Defina NEXT_PUBLIC_SITE_URL no ambiente de produção com o
// domínio real — esse valor aqui é só um fallback para desenvolvimento.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tropacontabilidade.com").replace(/\/$/, "")
