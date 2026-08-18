import AbrirEmpresaFlow from "@/components/abrir-empresa-flow"

// Fluxo real de abertura (pede senha do gov.br pro MEI) — sem promoção
// pública (nav, hero, blog) e fora do sitemap de propósito, é exatamente o
// tipo de página que a política de Documentos e Serviços Governamentais do
// Google Ads restringe. Só é descoberta por quem já tem o link (clientes,
// WhatsApp, hub) ou vem da página de vendas em /abrir-empresa.
export const metadata = {
  title: "Começar abertura de empresa | Tropa",
  description: "Escolha o enquadramento ideal e comece a abertura da sua empresa.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AbrirEmpresaPage() {
  return <AbrirEmpresaFlow />
}
