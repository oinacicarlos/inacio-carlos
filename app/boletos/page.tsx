import { Receipt } from 'lucide-react'
import { ModuleComingSoon } from '@/components/module-coming-soon'

export const dynamic = 'force-dynamic'

export default function BoletosPage() {
  return (
    <ModuleComingSoon
      icon={Receipt}
      pillarLabel="Processos"
      title="Boletos"
      description="A emissão e a cobrança de boletos estão sendo reconstruídas, ligadas direto ao cadastro de clientes."
    />
  )
}
