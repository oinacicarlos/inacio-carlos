import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/hub", "/admin", "/clientes", "/contabilidade", "/pfx", "/boletos", "/solicitacoes-clientes", "/onboarding-clientes", "/api", "/auth"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
