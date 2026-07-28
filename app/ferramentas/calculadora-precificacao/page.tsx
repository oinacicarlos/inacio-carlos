import PricingCalculatorClient from "./calculadora-precificacao-client"
import ToolUsagePaywall from "@/components/tool-usage-paywall"
import { getToolPageAccess } from "@/lib/tool-usage/page-access"

export const metadata = {
  title: "Calculadora de Precificação | ContaFacil",
  description: "Descubra quanto cobrar com base nos seus custos, no valor do seu tempo e na margem de lucro que você quer.",
}

export default async function PricingCalculatorPage() {
  const { blocked, trackUsage, isAuthenticated } = await getToolPageAccess("calculadora-precificacao")

  if (blocked) {
    return <ToolUsagePaywall toolTitle="a Calculadora de Precificação" />
  }

  return <PricingCalculatorClient trackUsage={trackUsage} isAuthenticated={isAuthenticated} />
}
