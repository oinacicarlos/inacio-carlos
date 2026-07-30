import ContractGeneratorClient from "./gerador-contrato-client"
import ToolUsagePaywall from "@/components/tool-usage-paywall"
import { getToolPageAccess } from "@/lib/tool-usage/page-access"

export const metadata = {
  title: "Gerador de Contrato | Tropa",
  description: "Crie um contrato simples para serviço, venda, parceria ou parcelamento em poucos passos.",
}

export default async function ContractGeneratorPage() {
  const { blocked, trackUsage, isAuthenticated } = await getToolPageAccess("gerador-contrato")

  if (blocked) {
    return <ToolUsagePaywall toolTitle="o Gerador de Contratos" />
  }

  return <ContractGeneratorClient trackUsage={trackUsage} isAuthenticated={isAuthenticated} />
}
