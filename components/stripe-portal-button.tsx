"use client"

import { useState } from "react"

type StripePortalButtonProps = {
  children: React.ReactNode
  className?: string
  wrapperClassName?: string
}

export function StripePortalButton({
  children,
  className = "client-requests-new-button",
  wrapperClassName,
}: StripePortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleClick() {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" })
      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Não foi possível abrir o gerenciamento da assinatura.")
      }

      window.location.href = data.url
    } catch (err) {
      setIsLoading(false)
      setError(err instanceof Error ? err.message : "Não foi possível abrir o gerenciamento da assinatura.")
    }
  }

  return (
    <div className={wrapperClassName}>
      <button className={className} type="button" onClick={handleClick} disabled={isLoading}>
        {isLoading ? "Abrindo..." : children}
      </button>
      {error && <p className="client-requests-error">{error}</p>}
    </div>
  )
}
