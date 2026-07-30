import { BookOpen } from "lucide-react"
import { ToolShell } from "@/components/tool-shell"
import { BlogCard } from "@/components/blog/blog-card"
import { getAllArticles } from "@/lib/blog/articles"

export const metadata = {
  title: "Blog | Tropa",
  description:
    "Guias práticos sobre precificação, contratação, rescisão, contratos e MEI para quem presta serviço ou tem uma pequena empresa.",
}

export default function BlogPage() {
  const articles = getAllArticles()

  return (
    <ToolShell mainClassName="blog-site">
      <section className="blog-hero" aria-labelledby="blog-hero-title">
        <span>
          <BookOpen size={18} strokeWidth={2.2} aria-hidden="true" />
          Blog Tropa
        </span>
        <h1 id="blog-hero-title">Guias práticos para quem presta serviço e tem CNPJ</h1>
        <p>Precificação, contratos, rescisão, contratação e tudo sobre manter o MEI em dia — sem juridiquês.</p>
      </section>

      <section className="blog-listing" aria-label="Todos os artigos">
        <div className="blog-grid">
          {articles.map(article => (
            <BlogCard article={article} key={article.slug} />
          ))}
        </div>
      </section>
    </ToolShell>
  )
}
