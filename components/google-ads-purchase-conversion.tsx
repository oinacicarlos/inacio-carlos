"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

const GOOGLE_ADS_PURCHASE_CONVERSION = "AW-18367655896/vaVjCOaqz9scENjfsLZE"
const DEDUPE_KEY_PREFIX = "tropa:google-ads-purchase-conversion:"

type CheckoutSessionResponse = {
  session_id?: string
  payment_status?: string | null
  amount_total?: number | null
  currency?: string | null
}

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params: {
        send_to: string
        value: number
        currency: string
        transaction_id: string
      },
    ) => void
  }
}

function isCheckoutSuccess(searchParams: URLSearchParams) {
  return searchParams.get("checkout") === "success" || searchParams.get("compra") === "success"
}

function hasTrackedConversion(key: string) {
  try {
    return window.localStorage.getItem(key) === "sent"
  } catch {
    return false
  }
}

function markConversionAsTracked(key: string) {
  try {
    window.localStorage.setItem(key, "sent")
  } catch {
    // Se o navegador bloquear storage, o transaction_id ainda ajuda o Google a deduplicar.
  }
}

export function GoogleAdsPurchaseConversion() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const sessionId = params.get("session_id")

    if (!sessionId || !isCheckoutSuccess(params)) return

    const checkoutSessionId = sessionId
    const dedupeKey = `${DEDUPE_KEY_PREFIX}${checkoutSessionId}`
    if (hasTrackedConversion(dedupeKey)) return

    let cancelled = false

    async function confirmAndTrackPurchase() {
      try {
        const response = await fetch(`/api/stripe/checkout-session?session_id=${encodeURIComponent(checkoutSessionId)}`, {
          method: "GET",
        })
        const data = (await response.json().catch(() => null)) as CheckoutSessionResponse | null

        if (
          cancelled ||
          !response.ok ||
          data?.session_id !== checkoutSessionId ||
          data.payment_status !== "paid" ||
          typeof data.amount_total !== "number" ||
          !data.currency ||
          typeof window.gtag !== "function"
        ) {
          return
        }

        window.gtag("event", "conversion", {
          send_to: GOOGLE_ADS_PURCHASE_CONVERSION,
          value: data.amount_total / 100,
          currency: data.currency.toUpperCase(),
          transaction_id: data.session_id,
        })
        markConversionAsTracked(dedupeKey)
      } catch {
        // Conversão é best-effort: nunca bloqueia o fluxo do cliente.
      }
    }

    void confirmAndTrackPurchase()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  return null
}
