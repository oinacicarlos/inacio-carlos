import TerminationSimulatorClient from "./simulador-rescisao-client"
import ToolUsagePaywall from "@/components/tool-usage-paywall"
import { getToolPageAccess } from "@/lib/tool-usage/page-access"

export const metadata = {
  title: "Simulador de Rescisão | ContaFacil",
  description: "Estime as principais verbas de uma rescisão trabalhista de forma simples.",
}

export default async function TerminationSimulatorPage() {
  const { blocked, trackUsage, isAuthenticated } = await getToolPageAccess("simulador-rescisao")

  if (blocked) {
    return <ToolUsagePaywall toolTitle="o Simulador de Rescisão" />
  }

  return <TerminationSimulatorClient trackUsage={trackUsage} isAuthenticated={isAuthenticated} />
}
