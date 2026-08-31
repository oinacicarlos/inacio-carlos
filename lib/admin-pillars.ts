import {
  Users,
  CalendarDays,
  ShieldCheck,
  CheckSquare,
  Receipt,
  Bell,
  Send,
  Target,
  Phone,
  Percent,
  Link2,
  Paperclip,
  Megaphone,
  Layers,
  Wrench,
  Contact,
  UserPlus,
  CalendarPlus,
  Upload,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react'

export type ModuleStatus = 'built' | 'soon'

export type ModuleItem = {
  id: string
  label: string
  href: string
  status: ModuleStatus
  icon: LucideIcon
}

export type Shortcut = {
  label: string
  href: string
  status: ModuleStatus
  icon: LucideIcon
}

export type UpcomingTone = 'danger' | 'warn' | 'info' | 'neutral'

export type UpcomingItem = {
  icon: LucideIcon
  tone: UpcomingTone
  title: string
  subtitle: string
  when: string
  badge: string
}

export type PillarId = 'marketing' | 'processos' | 'utilitarios'

export type Pillar = {
  id: PillarId
  label: string
  tagline: string
  description: string
  icon: LucideIcon
  modules: ModuleItem[]
  shortcuts: Shortcut[]
  upcoming: UpcomingItem[]
}

export const PILLARS: Pillar[] = [
  {
    id: 'marketing',
    label: 'Marketing',
    tagline: 'Campanhas e comunicação',
    description: 'Capte, converse e acompanhe o que vira venda.',
    icon: Megaphone,
    modules: [
      { id: 'disparos', label: 'Disparos', href: '/admin/disparos', status: 'built', icon: Send },
      { id: 'inbox', label: 'Caixa de entrada', href: '/admin/inbox', status: 'built', icon: MessageCircle },
      { id: 'crm', label: 'CRM', href: '/pipeline', status: 'soon', icon: Target },
      { id: 'call-sales', label: 'Call Sales', href: '/call-sales', status: 'soon', icon: Phone },
      { id: 'comissoes', label: 'Comissões', href: '/comissoes', status: 'soon', icon: Percent },
    ],
    shortcuts: [
      { label: 'Novo disparo', href: '/admin/disparos', status: 'built', icon: Send },
      { label: 'Caixa de entrada', href: '/admin/inbox', status: 'built', icon: MessageCircle },
      { label: 'Novo lead', href: '/pipeline', status: 'soon', icon: UserPlus },
      { label: 'Registrar ligação', href: '/call-sales', status: 'soon', icon: Phone },
    ],
    upcoming: [
      { icon: Send, tone: 'info', title: 'Campanha agendada', subtitle: 'Disparo de cobrança do mês', when: 'Hoje, 10/09', badge: 'Hoje' },
      { icon: Target, tone: 'warn', title: 'Leads sem retorno', subtitle: '3 leads parados há mais de 5 dias', when: 'Em 1 dia', badge: 'Atenção' },
      { icon: Percent, tone: 'neutral', title: 'Fechamento de comissões', subtitle: 'Ciclo de agosto aguardando apuração', when: 'Em 4 dias', badge: 'Próxima semana' },
    ],
  },
  {
    id: 'processos',
    label: 'Processos',
    tagline: 'Operação e documentos',
    description: 'Gerencie clientes, documentos, prazos e comunicações.',
    icon: Layers,
    modules: [
      { id: 'clientes', label: 'Clientes', href: '/admin/clientes', status: 'built', icon: Users },
      { id: 'competencias', label: 'Competências', href: '/admin/competencias', status: 'built', icon: CalendarDays },
      { id: 'pfx', label: 'PFX', href: '/admin/pfx', status: 'built', icon: ShieldCheck },
      { id: 'tarefas', label: 'Tarefas', href: '/tarefas', status: 'soon', icon: CheckSquare },
      { id: 'boletos', label: 'Boletos', href: '/boletos', status: 'soon', icon: Receipt },
      { id: 'avisos', label: 'Avisos', href: '/avisos', status: 'soon', icon: Bell },
    ],
    shortcuts: [
      { label: 'Novo cliente', href: '/admin/clientes', status: 'built', icon: UserPlus },
      { label: 'Nova competência', href: '/admin/competencias', status: 'built', icon: CalendarPlus },
      { label: 'Upload PFX', href: '/admin/pfx', status: 'built', icon: Upload },
      { label: 'Criar aviso', href: '/avisos', status: 'soon', icon: Bell },
      { label: 'Novo boleto', href: '/boletos', status: 'soon', icon: Receipt },
      { label: 'Enviar mensagem', href: '/disparazap', status: 'built', icon: MessageCircle },
    ],
    upcoming: [],
  },
  {
    id: 'utilitarios',
    label: 'Utilitários',
    tagline: 'Ferramentas de suporte',
    description: 'O que apoia Marketing e Processos no dia a dia.',
    icon: Wrench,
    modules: [
      { id: 'links', label: 'Links', href: '/admin/links', status: 'built', icon: Link2 },
      { id: 'anexos', label: 'Anexos', href: '/admin/anexos', status: 'built', icon: Paperclip },
      { id: 'contatos', label: 'Contatos', href: '/admin/contatos', status: 'built', icon: Contact },
    ],
    shortcuts: [
      { label: 'Novo link', href: '/admin/links', status: 'built', icon: Link2 },
      { label: 'Enviar anexo', href: '/admin/anexos', status: 'built', icon: Paperclip },
      { label: 'Novo contato', href: '/admin/contatos', status: 'built', icon: Contact },
    ],
    upcoming: [],
  },
]
