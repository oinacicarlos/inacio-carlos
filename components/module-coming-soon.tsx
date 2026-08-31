import Link from 'next/link'
import { ArrowLeft, type LucideIcon } from 'lucide-react'

export function ModuleComingSoon({
  icon: Icon,
  pillarLabel,
  title,
  description,
}: {
  icon: LucideIcon
  pillarLabel: string
  title: string
  description: string
}) {
  return (
    <main className="module-soon-page">
      <div className="module-soon-card">
        <Link href="/admin" className="module-soon-back">
          <ArrowLeft size={15} aria-hidden />
          Núcleo Tropa
        </Link>

        <span className="module-soon-icon">
          <Icon size={26} aria-hidden />
        </span>
        <span className="module-soon-eyebrow">{pillarLabel}</span>
        <h1>{title}</h1>
        <span className="module-soon-badge">Em produção</span>
        <p>{description}</p>
      </div>
    </main>
  )
}
