import { Target } from 'lucide-react'
import { ModuleComingSoon } from '@/components/module-coming-soon'

export const dynamic = 'force-dynamic'

export default function PipelinePage() {
  return (
    <ModuleComingSoon
      icon={Target}
      pillarLabel="Marketing"
      title="CRM"
      description="O pipeline de vendas — do lead ao cliente fechado — ainda está sendo desenhado."
    />
  )
}
