"use client"

type PlanWhatsAppButtonProps = {
  href: string
  className: string
  children: React.ReactNode
}

export function PlanWhatsAppButton({ href, className, children }: PlanWhatsAppButtonProps) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}
