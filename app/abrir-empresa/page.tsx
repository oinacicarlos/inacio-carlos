import AbrirEmpresaFlow from "@/components/abrir-empresa-flow"

// Sem promoção pública (nav, hero, blog) e fora do sitemap de propósito —
// é exatamente o tipo de página que a política de Documentos e Serviços
// Governamentais do Google Ads restringe. A página continua no ar pra quem
// já tem o link (clientes, WhatsApp), só não é mais descoberta por rastreador.
export const metadata = {
  title: "Abrir Empresa | Tropa",
  description: "Escolha o enquadramento ideal e comece a abertura da sua empresa.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AbrirEmpresaPage() {
  return <AbrirEmpresaFlow />
}
