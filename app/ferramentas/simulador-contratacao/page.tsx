import HiringSimulatorClient from "./simulador-contratacao-client"

export const metadata = {
  title: "Simulador de Contratação | ContaFacil",
  description: "Estime o custo mensal para contratar um funcionário.",
}

export default function HiringSimulatorPage() {
  return <HiringSimulatorClient />
}
