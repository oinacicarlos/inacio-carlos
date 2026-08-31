import { Bell } from 'lucide-react'
import { ModuleComingSoon } from '@/components/module-coming-soon'

export const dynamic = 'force-dynamic'

export default function AvisosPage() {
  return (
    <ModuleComingSoon
      icon={Bell}
      pillarLabel="Processos"
      title="Avisos"
      description="Alertas automáticos de vencimento e renovação ainda não existem — é o próximo passo depois de Tarefas e Boletos."
    />
  )
}
