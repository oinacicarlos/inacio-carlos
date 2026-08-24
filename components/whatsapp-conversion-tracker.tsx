"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const WHATSAPP_CONVERSION_SEND_TO = "AW-18367655896/yXkuCIyYu90cENjfsLZE"

const EXCLUDED_ROUTE_PREFIXES = [
  "/admin",
  "/api",
  "/auth",
  "/boletos",
  "/cadastro",
  "/clientes",
  "/contabilidade",
  "/hub",
  "/login",
  "/onboarding-clientes",
  "/pfx",
  "/redefinir-senha",
  "/solicitacoes-clientes",
]

type GtagWindow = Window & {
  gtag?: (
    command: "event",
    eventName: "conversion",
    params: {
      send_to: string
      value: number
      currency: string
    },
  ) => void
}

function isExcludedRoute(pathname: string) {
  return EXCLUDED_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isWhatsAppHref(href: string) {
  try {
    const url = new URL(href, window.location.href)
    const hostname = url.hostname.toLowerCase()

    return hostname === "wa.me" || hostname === "whatsapp.com" || hostname.endsWith(".whatsapp.com")
  } catch {
    return /(^|\/\/)(wa\.me|(?:[\w-]+\.)?whatsapp\.com)\b/i.test(href)
  }
}

function trackWhatsAppConversion() {
  ;(window as GtagWindow).gtag?.("event", "conversion", {
    send_to: WHATSAPP_CONVERSION_SEND_TO,
    value: 1.0,
    currency: "BRL",
  })
}

export function WhatsAppConversionTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (isExcludedRoute(pathname)) {
      return
    }

    function handleClick(event: MouseEvent) {
      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const link = target.closest<HTMLAnchorElement>("a[href]")

      if (!link) {
        return
      }

      const href = link.getAttribute("href")

      if (!href || !isWhatsAppHref(href)) {
        return
      }

      trackWhatsAppConversion()
    }

    document.addEventListener("click", handleClick, { capture: true })

    return () => {
      document.removeEventListener("click", handleClick, { capture: true })
    }
  }, [pathname])

  return null
}
