"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

const GOOGLE_ADS_PURCHASE_CONVERSION = "AW-18367655896/vaVjCOaqz9scENjfsLZE"
// TEMP-BRONZE-CONVERSION-DEBUG (2026-08-04): prefixo versionado para destravar
// sessões de teste que possam ter sido marcadas como "sent" indevidamente
// antes do disparo real do gtag. Reverter para o prefixo sem ":v2" depois do
// teste (ou manter — chaves antigas simplesmente ficam órfãs no localStorage).
const DEDUPE_KEY_PREFIX = "tropa:google-ads-purchase-conversion:v2:"

// Depois do redirect do Stripe, o script inline que define `window.gtag`
// (app/layout.tsx) normalmente já rodou antes deste efeito. Mas para não
// depender dessa ordem, espera um pouco antes de desistir.
const GTAG_WAIT_MAX_ATTEMPTS = 10
const GTAG_WAIT_INTERVAL_MS = 300

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function waitForGtag(isCancelled: () => boolean): Promise<boolean> {
  for (let attempt = 0; attempt < GTAG_WAIT_MAX_ATTEMPTS; attempt++) {
    if (isCancelled()) return false
    if (typeof window.gtag === "function") return true
    await wait(GTAG_WAIT_INTERVAL_MS)
  }
  return typeof window.gtag === "function"
}

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

  // TEMP-BRONZE-CONVERSION-DEBUG (2026-08-04): confirma que o componente é
  // montado em produção. Remover junto com os demais logs deste arquivo.
  useEffect(() => {
    console.info("[google-ads-conversion] mounted")
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const sessionId = params.get("session_id")

    // TEMP-BRONZE-CONVERSION-DEBUG (2026-08-04)
    console.info("[google-ads-conversion] params", {
      checkout: params.get("checkout"),
      compra: params.get("compra"),
      hasSessionId: Boolean(sessionId),
      sessionIdFirst8: sessionId ? sessionId.slice(0, 8) : null,
    })

    if (!sessionId || !isCheckoutSuccess(params)) return

    const checkoutSessionId = sessionId
    const dedupeKey = `${DEDUPE_KEY_PREFIX}${checkoutSessionId}`
    if (hasTrackedConversion(dedupeKey)) return

    let cancelled = false

    async function confirmAndTrackPurchase() {
      try {
        // TEMP-BRONZE-CONVERSION-DEBUG (2026-08-04)
        console.info("[google-ads-conversion] validating session")

        const response = await fetch(`/api/stripe/checkout-session?session_id=${encodeURIComponent(checkoutSessionId)}`, {
          method: "GET",
        })
        const data = (await response.json().catch(() => null)) as CheckoutSessionResponse | null

        // TEMP-BRONZE-CONVERSION-DEBUG (2026-08-04): nunca inclui STRIPE_SECRET_KEY.
        console.info("[google-ads-conversion] checkout-session response", {
          httpStatus: response.status,
          paymentStatus: data?.payment_status ?? null,
          amountTotal: data?.amount_total ?? null,
          currency: data?.currency ?? null,
        })

        if (
          cancelled ||
          !response.ok ||
          data?.session_id !== checkoutSessionId ||
          data.payment_status !== "paid" ||
          typeof data.amount_total !== "number" ||
          !data.currency
        ) {
          return
        }

        const gtagReady = await waitForGtag(() => cancelled)
        if (cancelled) return

        const gtag = window.gtag

        if (!gtagReady || typeof gtag !== "function") {
          // TEMP-BRONZE-CONVERSION-DEBUG (2026-08-04)
          console.info("[google-ads-conversion] gtag unavailable after wait", {
            attempts: GTAG_WAIT_MAX_ATTEMPTS,
            intervalMs: GTAG_WAIT_INTERVAL_MS,
          })
          return
        }

        // TEMP-BRONZE-CONVERSION-DEBUG (2026-08-04)
        console.info("[google-ads-conversion] before gtag", {
          gtagType: typeof gtag,
          sendTo: GOOGLE_ADS_PURCHASE_CONVERSION,
          value: data.amount_total / 100,
          currency: data.currency.toUpperCase(),
          transactionIdLast8: data.session_id.slice(-8),
        })

        gtag("event", "conversion", {
          send_to: GOOGLE_ADS_PURCHASE_CONVERSION,
          value: data.amount_total / 100,
          currency: data.currency.toUpperCase(),
          transaction_id: data.session_id,
        })

        // TEMP-BRONZE-CONVERSION-DEBUG (2026-08-04)
        console.info("[google-ads-conversion] conversion dispatched")

        // Dedupe só é gravado depois do gtag ter sido chamado com sucesso.
        markConversionAsTracked(dedupeKey)
      } catch (error) {
        // TEMP-BRONZE-CONVERSION-DEBUG (2026-08-04)
        console.info("[google-ads-conversion] error", error instanceof Error ? error.message : String(error))
      }
    }

    void confirmAndTrackPurchase()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  return null
}
