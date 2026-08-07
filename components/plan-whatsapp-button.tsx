"use client"

const PLAN_BUTTON_CONVERSION_SEND_TO = "AW-18367655896/yXkuCIyYu90cENjfsLZE"

type PlanWhatsAppButtonProps = {
  href: string
  className: string
  children: React.ReactNode
}

export function PlanWhatsAppButton({ href, className, children }: PlanWhatsAppButtonProps) {
  function handleClick() {
    window.gtag?.("event", "conversion", {
      send_to: PLAN_BUTTON_CONVERSION_SEND_TO,
      value: 1.0,
      currency: "BRL",
    })
  }

  return (
    <a className={className} href={href} target="_blank" rel="noreferrer" onClick={handleClick}>
      {children}
    </a>
  )
}
