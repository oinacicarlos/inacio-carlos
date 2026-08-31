import { Phone } from 'lucide-react'
import { ModuleComingSoon } from '@/components/module-coming-soon'

export const dynamic = 'force-dynamic'

export default function CallSalesPage() {
  return (
    <ModuleComingSoon
      icon={Phone}
      pillarLabel="Marketing"
      title="Call Sales"
      description="O registro de ligações de vendas, vinculado a lead e cliente, ainda não existe."
    />
  )
}
