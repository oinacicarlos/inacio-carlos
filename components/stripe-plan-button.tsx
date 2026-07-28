"use client"

import { useState } from "react"

type StripePlanButtonProps = {
  featured?: boolean
  plan: "bronze" | "prata"
  children: React.ReactNode
}

export function StripePlanButton({ featured, plan, children }: StripePlanButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      })
      if (response.status === 401) {
        // Não autenticado: manda pro login e volta pra retomar a
        // contratação assim que entrar (StripePlanButton não decide sozinho
        // se pode comprar — quem decide é o servidor).
        window.location.href = `/login?checkout=${plan}`
        return
      }

      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Não foi possível iniciar o checkout.")
      }

      window.location.href = data.url
    } catch (error) {
      setIsLoading(false)
      window.alert(error instanceof Error ? error.message : "Não foi possível iniciar o checkout.")
    }
  }

  return (
    <button
      className={`accounting-plan-button${featured ? " is-primary" : ""}`}
      type="button"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? "Redirecionando..." : children}
    </button>
  )
}
