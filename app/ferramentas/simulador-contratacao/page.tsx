import HiringSimulatorClient from "./simulador-contratacao-client"
import ToolUsagePaywall from "@/components/tool-usage-paywall"
import { getToolPageAccess } from "@/lib/tool-usage/page-access"

export const metadata = {
  title: "Simulador de Contratação | Tropa",
  description: "Estime o custo mensal para contratar um funcionário.",
}

export default async function HiringSimulatorPage() {
  const { blocked, trackUsage, isAuthenticated } = await getToolPageAccess("simulador-contratacao")

  if (blocked) {
    return <ToolUsagePaywall toolTitle="o Simulador de Contratação" />
  }

  return <HiringSimulatorClient trackUsage={trackUsage} isAuthenticated={isAuthenticated} />
}
