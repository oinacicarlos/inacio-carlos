import TerminationSimulatorClient from "./simulador-rescisao-client"

export const metadata = {
  title: "Simulador de Rescisão | ContaFacil",
  description: "Estime as principais verbas de uma rescisão trabalhista de forma simples.",
}

export default function TerminationSimulatorPage() {
  return <TerminationSimulatorClient />
}
