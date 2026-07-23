import PricingCalculatorClient from "./calculadora-precificacao-client"

export const metadata = {
  title: "Calculadora de Precificação | ContaFacil",
  description: "Descubra quanto cobrar por um serviço com base em tempo, custo e ganho desejado.",
}

export default function PricingCalculatorPage() {
  return <PricingCalculatorClient />
}
