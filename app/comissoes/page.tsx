import { Percent } from 'lucide-react'
import { ModuleComingSoon } from '@/components/module-coming-soon'

export const dynamic = 'force-dynamic'

export default function ComissoesPage() {
  return (
    <ModuleComingSoon
      icon={Percent}
      pillarLabel="Marketing"
      title="Comissões"
      description="O cálculo de comissões sobre venda fechada e plano ativado ainda está sendo construído."
    />
  )
}
