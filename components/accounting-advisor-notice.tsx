"use client"

import { useEffect, useState } from "react"

const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo"
const BUSINESS_START_MINUTES = 8 * 60
const BUSINESS_END_MINUTES = 16 * 60 + 30
const WEEKDAYS = new Set(["Mon", "Tue", "Wed", "Thu", "Fri"])

type AdvisorNoticeProps = {
  availableHref: string
  unavailableHref: string
}

function isAdvisorAvailable(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SAO_PAULO_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const weekday = parts.find((part) => part.type === "weekday")?.value
  const hour = Number(parts.find((part) => part.type === "hour")?.value)
  const minute = Number(parts.find((part) => part.type === "minute")?.value)

  if (!weekday || Number.isNaN(hour) || Number.isNaN(minute) || !WEEKDAYS.has(weekday)) {
    return false
  }

  const currentMinutes = hour * 60 + minute
  return currentMinutes >= BUSINESS_START_MINUTES && currentMinutes < BUSINESS_END_MINUTES
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="19" height="19" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 3.2c-7 0-12.7 5.6-12.7 12.6 0 2.4.7 4.7 1.9 6.7L3.9 29l6.7-1.8c1.7.9 3.5 1.3 5.4 1.3 7 0 12.7-5.6 12.7-12.6S23 3.2 16 3.2Zm0 23.1c-1.7 0-3.3-.4-4.8-1.2l-.4-.2-4 1.1 1.1-3.9-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.8 0-5.8 4.6-10.5 10.2-10.5s10.2 4.7 10.2 10.5S21.6 26.3 16 26.3Zm5.8-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2c-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2.1-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.8 5.1.8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4Z"
      />
    </svg>
  )
}

export function AccountingAdvisorNotice({ availableHref, unavailableHref }: AdvisorNoticeProps) {
  const [available, setAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    function refreshAvailability() {
      setAvailable(isAdvisorAvailable())
    }

    refreshAvailability()
    const intervalId = window.setInterval(refreshAvailability, 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  if (available === null) return null

  const href = available ? availableHref : unavailableHref

  return (
    <aside className="accounting-advisor-notice" aria-label="Aviso de atendimento da Tropa">
      <a className="accounting-advisor-notice-link" href={href} target="_blank" rel="noreferrer">
        <span
          className={`accounting-advisor-notice-icon${available ? " is-available" : ""}`}
          aria-hidden="true"
        >
          <WhatsAppIcon />
        </span>

        <span className="accounting-advisor-notice-copy">
          <strong>{available ? "Um assessor está disponível" : "Fale com um assessor da Tropa"}</strong>
          <span>
            {available
              ? "Atendimento rápido pelo WhatsApp agora."
              : "Envie sua mensagem e retornamos no próximo horário útil."}
          </span>
        </span>
      </a>
    </aside>
  )
}
