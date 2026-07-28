import { ArrowRight } from "lucide-react"
import type { BlogArticle } from "@/lib/blog/types"
import { PILLAR_LABELS } from "@/lib/blog/types"
import { formatBlogDate } from "@/lib/blog/format"
import { BlogCover } from "@/components/blog/blog-cover"

export function BlogCard({ article }: { article: BlogArticle }) {
  return (
    <a className="blog-card" href={`/blog/${article.slug}`}>
      <BlogCover src={article.coverImage} alt={article.coverImageAlt} size="card" />
      <span className="blog-card-pillar">{PILLAR_LABELS[article.pillar]}</span>
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
      <div className="blog-card-footer">
        <span>
          {formatBlogDate(article.publishedAt)} · {article.readingTimeMinutes} min de leitura
        </span>
        <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
      </div>
    </a>
  )
}
