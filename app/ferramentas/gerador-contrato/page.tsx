import ContractGeneratorClient from "./gerador-contrato-client"

export const metadata = {
  title: "Gerador de Contrato | ContaFacil",
  description: "Crie um contrato simples para serviço, venda, parceria ou parcelamento em poucos passos.",
}

export default function ContractGeneratorPage() {
  return <ContractGeneratorClient />
}
