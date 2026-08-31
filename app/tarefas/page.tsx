import { CheckSquare } from 'lucide-react'
import { ModuleComingSoon } from '@/components/module-coming-soon'

export const dynamic = 'force-dynamic'

export default function TarefasPage() {
  return (
    <ModuleComingSoon
      icon={CheckSquare}
      pillarLabel="Processos"
      title="Tarefas"
      description="O controle de tarefas por cliente e por competência ainda está sendo construído."
    />
  )
}
