import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"
import { getAllArticles } from "@/lib/blog/articles"

const STATIC_ROUTES = [
  "",
  "/diagnostico",
  "/blog",
  "/ferramentas/gerador-contrato",
  "/ferramentas/simulador-rescisao",
  "/ferramentas/simulador-contratacao",
  "/ferramentas/calculadora-precificacao",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(path => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }))

  const articleEntries: MetadataRoute.Sitemap = getAllArticles().map(article => ({
    url: `${SITE_URL}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "yearly",
    priority: 0.6,
  }))

  return [...staticEntries, ...articleEntries]
}
