"use client"

import { useState } from "react"

type StripeProductButtonProps = {
  product:
    | "certificado_pj_a1"
    | "certificado_pf_a1"
    | "abertura_empresa"
    | "alteracao_cnpj"
    | "serasa_pf"
    | "serasa_pj"
    | "nota_fiscal_servico"
    | "nota_fiscal_produto"
  children: React.ReactNode
  className?: string
}

export function StripeProductButton({ product, children, className }: StripeProductButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/checkout-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product }),
      })

      if (response.status === 401) {
        // Compra de produto avulso costuma vir de gente nova — manda pro
        // cadastro (que já tem link pra login, se a pessoa já tiver conta)
        // em vez de assumir que ela já é cliente.
        window.location.href = `/cadastro?redirect=${encodeURIComponent(`/hub?tab=ferramentas&product=${product}`)}`
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
    <button className={className ?? "accounting-plan-button"} type="button" onClick={handleClick} disabled={isLoading}>
      {isLoading ? "Redirecionando..." : children}
    </button>
  )
}
